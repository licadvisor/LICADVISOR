class PolicyDB {
    constructor() {
        this.policies = this.loadPolicies();
    }

    loadPolicies() {
        const stored = localStorage.getItem('policies');
        return stored ? JSON.parse(stored) : [];
    }

    savePolicies() {
        localStorage.setItem('policies', JSON.stringify(this.policies));
    }

    createBackup() {
        const backup = {
            date: new Date().toISOString(),
            policies: this.policies
        };
        const backups = JSON.parse(localStorage.getItem('policy_backups') || '[]');
        backups.push(backup);
        localStorage.setItem('policy_backups', JSON.stringify(backups));
    }

    async getAllPolicies() {
        return this.policies;
    }

    async addPolicy(policy) {
        policy.id = 'POL' + Date.now().toString().slice(-6);
        policy.createdAt = new Date().toISOString();
        policy.status = policy.status || 'active';

        this.policies.push(policy);
        this.savePolicies();
        this.createBackup();
        return policy;
    }

    async updatePolicy(policy) {
        const index = this.policies.findIndex(p => p.id === policy.id);
        if (index === -1) throw new Error('Policy not found');

        policy.updatedAt = new Date().toISOString();
        this.policies[index] = { ...this.policies[index], ...policy };
        this.savePolicies();
        this.createBackup();
        return this.policies[index];
    }

    async deletePolicy(policyId) {
        const index = this.policies.findIndex(p => p.id === policyId);
        if (index === -1) throw new Error('Policy not found');

        const deletedPolicies = JSON.parse(localStorage.getItem('deleted_policies') || '[]');
        deletedPolicies.push({
            ...this.policies[index],
            deletedAt: new Date().toISOString()
        });
        localStorage.setItem('deleted_policies', JSON.stringify(deletedPolicies));

        this.policies.splice(index, 1);
        this.savePolicies();
        this.createBackup();
    }

    async searchPolicies(query) {
        query = query.toLowerCase();
        return this.policies.filter(policy => 
            policy.id.toLowerCase().includes(query) ||
            policy.customerId.toLowerCase().includes(query) ||
            policy.type.toLowerCase().includes(query)
        );
    }

    async getPolicyById(policyId) {
        return this.policies.find(p => p.id === policyId);
    }

    async getPoliciesByCustomerId(customerId) {
        return this.policies.filter(p => p.customerId === customerId);
    }
}
