// Utility functions for LIC Advisor dashboards

// Format currency in Indian Rupees
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date in Indian format
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Show notification toast
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// Load data with loading state
async function loadDataWithSpinner(element, loadingText = 'Loading...') {
    const originalContent = element.innerHTML;
    element.innerHTML = `<div class="spinner-border spinner-border-sm text-primary me-2"></div>${loadingText}`;
    return () => element.innerHTML = originalContent;
}

// Validate form data
function validateFormData(formData, rules) {
    const errors = {};
    
    for (const [field, value] of Object.entries(formData)) {
        if (rules[field]) {
            if (rules[field].required && !value) {
                errors[field] = `${field} is required`;
            }
            if (rules[field].minLength && value.length < rules[field].minLength) {
                errors[field] = `${field} must be at least ${rules[field].minLength} characters`;
            }
            if (rules[field].pattern && !rules[field].pattern.test(value)) {
                errors[field] = `${field} format is invalid`;
            }
        }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
}

// Save data to localStorage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

// Get data from localStorage
function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from storage:', error);
        return null;
    }
}

// Generate PDF document
async function generatePDF(element, filename) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.html(element, {
            callback: function(doc) {
                doc.save(filename);
            },
            margin: [10, 10, 10, 10],
            autoPaging: 'text',
            x: 0,
            y: 0,
            width: 190,
            windowWidth: 675
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}

// Export data to CSV
function exportToCSV(data, filename) {
    try {
        const csvContent = "data:text/csv;charset=utf-8," 
            + data.map(row => Object.values(row).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw error;
    }
}

// Chart creation utility
function createChart(ctx, type, data, options = {}) {
    try {
        return new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...options
            }
        });
    } catch (error) {
        console.error('Error creating chart:', error);
        throw error;
    }
}

// Debounce function for search/filter
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers here
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}
