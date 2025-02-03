class CustomerDB {
    constructor() {
        this.customers = this.loadCustomers();
    }

    // Load customers from localStorage
    loadCustomers() {
        const stored = localStorage.getItem('customers');
        return stored ? JSON.parse(stored) : [];
    }

    // Save customers to localStorage
    saveCustomers() {
        localStorage.setItem('customers', JSON.stringify(this.customers));
    }

    // Create backup
    createBackup() {
        const backup = {
            date: new Date().toISOString(),
            customers: this.customers
        };
        const backups = JSON.parse(localStorage.getItem('customer_backups') || '[]');
        backups.push(backup);
        localStorage.setItem('customer_backups', JSON.stringify(backups));
    }

    // Restore from backup
    restoreFromBackup(backupDate) {
        const backups = JSON.parse(localStorage.getItem('customer_backups') || '[]');
        const backup = backups.find(b => b.date === backupDate);
        if (backup) {
            this.customers = backup.customers;
            this.saveCustomers();
            return true;
        }
        return false;
    }

    // Get all customers
    async getAllCustomers() {
        return this.customers;
    }

    // Add new customer
    async addCustomer(customer) {
        // Generate customer ID
        customer.id = 'CUST' + Date.now().toString().slice(-6);
        customer.createdAt = new Date().toISOString();
        customer.status = 'active';
        customer.policies = customer.policies || 0;

        // Validate email uniqueness
        if (this.customers.some(c => c.email === customer.email)) {
            throw new Error('Email already exists');
        }

        this.customers.push(customer);
        this.saveCustomers();
        this.createBackup(); // Create backup after adding
        return customer;
    }

    // Update customer
    async updateCustomer(customer) {
        const index = this.customers.findIndex(c => c.id === customer.id);
        if (index === -1) {
            throw new Error('Customer not found');
        }

        // Check email uniqueness
        if (customer.email !== this.customers[index].email &&
            this.customers.some(c => c.email === customer.email)) {
            throw new Error('Email already exists');
        }

        customer.updatedAt = new Date().toISOString();
        this.customers[index] = { ...this.customers[index], ...customer };
        this.saveCustomers();
        this.createBackup(); // Create backup after updating
        return this.customers[index];
    }

    // Delete customer
    async deleteCustomer(customerId) {
        const index = this.customers.findIndex(c => c.id === customerId);
        if (index === -1) {
            throw new Error('Customer not found');
        }

        // Store in deleted customers
        const deletedCustomers = JSON.parse(localStorage.getItem('deleted_customers') || '[]');
        const deletedCustomer = {
            ...this.customers[index],
            deletedAt: new Date().toISOString()
        };
        deletedCustomers.push(deletedCustomer);
        localStorage.setItem('deleted_customers', JSON.stringify(deletedCustomers));

        // Remove from active customers
        this.customers.splice(index, 1);
        this.saveCustomers();
        this.createBackup(); // Create backup after deleting
    }

    // Search customers
    async searchCustomers(query) {
        query = query.toLowerCase();
        return this.customers.filter(customer => 
            customer.name.toLowerCase().includes(query) ||
            customer.email.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            customer.id.toLowerCase().includes(query)
        );
    }

    // Get customer by ID
    async getCustomerById(customerId) {
        return this.customers.find(c => c.id === customerId);
    }

    // Export customers to JSON file
    exportCustomers() {
        const data = JSON.stringify(this.customers, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import customers from JSON file
    async importCustomers(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const customers = JSON.parse(e.target.result);
                    this.createBackup(); // Backup current data before import
                    this.customers = customers;
                    this.saveCustomers();
                    resolve(customers);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
}
