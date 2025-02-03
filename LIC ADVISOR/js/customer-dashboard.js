// Customer Dashboard Functionality

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    loadPolicyData();
    setupEventListeners();
    loadNotifications();
});

// Load and display policy data
async function loadPolicyData() {
    try {
        // Simulate API call
        const policies = [
            {
                id: 'POL001',
                name: 'Jeevan Anand',
                policyNo: '123456789',
                premiumDue: '2025-02-15',
                amount: 12500,
                status: 'active'
            },
            {
                id: 'POL002',
                name: 'Term Insurance Plan',
                policyNo: '987654321',
                premiumDue: '2025-03-05',
                amount: 8500,
                status: 'active'
            },
            {
                id: 'POL003',
                name: 'Money Back Policy',
                policyNo: '456789123',
                premiumDue: '2025-04-20',
                amount: 15000,
                status: 'active'
            }
        ];

        const policyList = document.querySelector('.policy-list');
        if (policyList) {
            policyList.innerHTML = policies.map(policy => `
                <div class="policy-card p-3 mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6>${policy.name}</h6>
                            <small class="text-muted">Policy No: ${policy.policyNo}</small>
                        </div>
                        <div class="text-end">
                            <div class="${new Date(policy.premiumDue) < new Date() ? 'premium-due' : 'premium-paid'}">
                                Premium Due: ${formatDate(policy.premiumDue)}
                            </div>
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="viewPolicy('${policy.id}')">
                                    View Details
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="payPremium('${policy.id}', ${policy.amount})">
                                    Pay Premium
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading policy data:', error);
        showNotification('Error loading policies', 'error');
    }
}

// Initialize dashboard charts
function initializeCharts() {
    // Premium Payment Trend Chart
    const premiumTrendCtx = document.getElementById('premiumTrendChart')?.getContext('2d');
    if (premiumTrendCtx) {
        createChart(premiumTrendCtx, 'line', {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Premium Payments',
                data: [35500, 33000, 36000, 32000, 38000, 35000],
                borderColor: '#2a5298',
                tension: 0.4
            }]
        });
    }

    // Policy Distribution Chart
    const policyDistributionCtx = document.getElementById('policyDistributionChart')?.getContext('2d');
    if (policyDistributionCtx) {
        createChart(policyDistributionCtx, 'doughnut', {
            labels: ['Term Life', 'Endowment', 'Money Back', 'Pension'],
            datasets: [{
                data: [30, 25, 25, 20],
                backgroundColor: ['#2a5298', '#4CAF50', '#FFC107', '#9C27B0']
            }]
        });
    }
}

// Handle premium payment
async function payPremium(policyId, amount) {
    try {
        const resetLoading = await loadDataWithSpinner(document.querySelector(`button[onclick="payPremium('${policyId}')"]`));
        
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show payment modal
        const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
        document.getElementById('paymentAmount').textContent = formatCurrency(amount);
        document.getElementById('policyIdInput').value = policyId;
        modal.show();
        
        resetLoading();
    } catch (error) {
        console.error('Error processing payment:', error);
        showNotification('Error processing payment', 'error');
    }
}

// View policy details
function viewPolicy(policyId) {
    // Simulate API call to get policy details
    const policyDetails = {
        id: policyId,
        name: 'Jeevan Anand',
        policyNo: '123456789',
        startDate: '2024-01-01',
        maturityDate: '2044-01-01',
        sumAssured: 2000000,
        premiumAmount: 12500,
        premiumFrequency: 'Monthly',
        nextDueDate: '2025-02-15'
    };

    const modal = new bootstrap.Modal(document.getElementById('policyDetailsModal'));
    const modalBody = document.querySelector('#policyDetailsModal .modal-body');
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Policy Name:</strong> ${policyDetails.name}</p>
                <p><strong>Policy Number:</strong> ${policyDetails.policyNo}</p>
                <p><strong>Start Date:</strong> ${formatDate(policyDetails.startDate)}</p>
                <p><strong>Maturity Date:</strong> ${formatDate(policyDetails.maturityDate)}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Sum Assured:</strong> ${formatCurrency(policyDetails.sumAssured)}</p>
                <p><strong>Premium Amount:</strong> ${formatCurrency(policyDetails.premiumAmount)}</p>
                <p><strong>Premium Frequency:</strong> ${policyDetails.premiumFrequency}</p>
                <p><strong>Next Due Date:</strong> ${formatDate(policyDetails.nextDueDate)}</p>
            </div>
        </div>
        <div class="mt-3">
            <button class="btn btn-sm btn-outline-primary me-2" onclick="downloadPolicy('${policyId}')">
                <i class="fas fa-download me-1"></i>Download Policy
            </button>
            <button class="btn btn-sm btn-outline-primary" onclick="viewPremiumHistory('${policyId}')">
                <i class="fas fa-history me-1"></i>Premium History
            </button>
        </div>
    `;
    
    modal.show();
}

// Download policy document
async function downloadPolicy(policyId) {
    try {
        const button = document.querySelector(`button[onclick="downloadPolicy('${policyId}')"]`);
        const resetLoading = await loadDataWithSpinner(button, 'Generating PDF...');
        
        // Simulate PDF generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const policyContent = document.getElementById('policyDetailsModal');
        await generatePDF(policyContent, `policy-${policyId}.pdf`);
        
        resetLoading();
        showNotification('Policy document downloaded successfully', 'success');
    } catch (error) {
        console.error('Error downloading policy:', error);
        showNotification('Error downloading policy document', 'error');
    }
}

// View premium payment history
function viewPremiumHistory(policyId) {
    // Simulate API call to get premium history
    const premiumHistory = [
        { date: '2025-01-05', amount: 12500, status: 'Paid' },
        { date: '2024-12-05', amount: 12500, status: 'Paid' },
        { date: '2024-11-05', amount: 12500, status: 'Paid' },
        { date: '2024-10-05', amount: 12500, status: 'Paid' }
    ];

    const modal = new bootstrap.Modal(document.getElementById('premiumHistoryModal'));
    const modalBody = document.querySelector('#premiumHistoryModal .modal-body');
    
    modalBody.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${premiumHistory.map(payment => `
                        <tr>
                            <td>${formatDate(payment.date)}</td>
                            <td>${formatCurrency(payment.amount)}</td>
                            <td><span class="badge bg-success">${payment.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    modal.show();
}

// Load notifications
function loadNotifications() {
    // Simulate notifications data
    const notifications = [
        { id: 1, message: 'Premium due for Policy #123456789', type: 'warning' },
        { id: 2, message: 'New policy document available', type: 'info' }
    ];

    const notificationCount = notifications.length;
    const badge = document.querySelector('.badge');
    if (badge) {
        badge.textContent = `${notificationCount} Notifications`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Payment form submission
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const policyId = document.getElementById('policyIdInput').value;
            const cardNumber = document.getElementById('cardNumber').value;
            
            try {
                const button = paymentForm.querySelector('button[type="submit"]');
                const resetLoading = await loadDataWithSpinner(button, 'Processing...');
                
                // Simulate payment processing
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                resetLoading();
                const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
                modal.hide();
                
                showNotification('Payment processed successfully', 'success');
                loadPolicyData(); // Refresh policy data
            } catch (error) {
                console.error('Payment error:', error);
                showNotification('Error processing payment', 'error');
            }
        });
    }
}
