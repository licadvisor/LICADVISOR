// Admin Dashboard Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    loadClaimsData();
    loadActivityData();
    setupEventListeners();
    loadAdminNotifications();
});

// Initialize dashboard charts
function initializeCharts() {
    // Policy Distribution Chart
    const policyDistributionCtx = document.getElementById('policyDistributionChart')?.getContext('2d');
    if (policyDistributionCtx) {
        createChart(policyDistributionCtx, 'doughnut', {
            labels: ['Term Life', 'Endowment', 'Money Back', 'ULIP', 'Pension', 'Health'],
            datasets: [{
                data: [30, 25, 15, 10, 12, 8],
                backgroundColor: [
                    '#2a5298', '#4CAF50', '#FFC107', 
                    '#9C27B0', '#FF5722', '#00BCD4'
                ]
            }]
        }, {
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        });
    }

    // Premium Collection Trend
    const premiumTrendCtx = document.getElementById('premiumTrendChart')?.getContext('2d');
    if (premiumTrendCtx) {
        createChart(premiumTrendCtx, 'line', {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Premium Collection (in Lakhs)',
                data: [42, 38, 45, 40, 43, 50],
                borderColor: '#2a5298',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(42, 82, 152, 0.1)'
            }]
        });
    }
}

// Load claims data
async function loadClaimsData() {
    try {
        // Simulate API call for claims data
        const claims = [
            {
                id: 'CL-1234',
                customer: 'John Doe',
                type: 'Term Life',
                amount: 500000,
                status: 'pending',
                date: '2025-01-30'
            },
            {
                id: 'CL-1235',
                customer: 'Jane Smith',
                type: 'Health',
                amount: 75000,
                status: 'approved',
                date: '2025-01-29'
            },
            {
                id: 'CL-1236',
                customer: 'Mike Johnson',
                type: 'Vehicle',
                amount: 120000,
                status: 'rejected',
                date: '2025-01-28'
            }
        ];

        const claimsTable = document.querySelector('.claims-table tbody');
        if (claimsTable) {
            claimsTable.innerHTML = claims.map(claim => `
                <tr>
                    <td>${claim.id}</td>
                    <td>${claim.customer}</td>
                    <td>${claim.type}</td>
                    <td>${formatCurrency(claim.amount)}</td>
                    <td>
                        <span class="status-badge ${claim.status}">
                            ${claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="reviewClaim('${claim.id}')">
                            ${claim.status === 'pending' ? 'Review' : 'Details'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading claims:', error);
        showNotification('Error loading claims data', 'error');
    }
}

// Load activity data
async function loadActivityData() {
    try {
        // Simulate API call for activity data
        const activities = [
            {
                type: 'New Policy',
                description: 'Term Life policy created for John Doe',
                time: '2 mins ago'
            },
            {
                type: 'Claim Approved',
                description: 'Health claim approved for Jane Smith',
                time: '1 hour ago'
            },
            {
                type: 'Premium Payment',
                description: '₹25,000 received from Mike Johnson',
                time: '3 hours ago'
            },
            {
                type: 'New Customer',
                description: 'Sarah Wilson registered as a new customer',
                time: '5 hours ago'
            }
        ];

        const activityFeed = document.querySelector('.recent-activity');
        if (activityFeed) {
            activityFeed.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="d-flex justify-content-between">
                        <strong>${activity.type}</strong>
                        <span class="time">${activity.time}</span>
                    </div>
                    <p class="mb-0">${activity.description}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading activity data:', error);
        showNotification('Error loading activity feed', 'error');
    }
}

// Review claim
async function reviewClaim(claimId) {
    try {
        // Simulate API call for claim details
        const claimDetails = {
            id: claimId,
            customer: {
                name: 'John Doe',
                policyNo: '123456789',
                age: 35,
                occupation: 'Software Engineer'
            },
            claim: {
                type: 'Term Life',
                amount: 500000,
                submissionDate: '2025-01-30',
                reason: 'Critical Illness',
                documents: [
                    'Medical Reports',
                    'Doctor\'s Certificate',
                    'Hospital Bills'
                ]
            }
        };

        const modal = new bootstrap.Modal(document.getElementById('claimReviewModal'));
        const modalBody = document.querySelector('#claimReviewModal .modal-body');
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Customer Details</h6>
                    <p><strong>Name:</strong> ${claimDetails.customer.name}</p>
                    <p><strong>Policy No:</strong> ${claimDetails.customer.policyNo}</p>
                    <p><strong>Age:</strong> ${claimDetails.customer.age}</p>
                    <p><strong>Occupation:</strong> ${claimDetails.customer.occupation}</p>
                </div>
                <div class="col-md-6">
                    <h6>Claim Details</h6>
                    <p><strong>Type:</strong> ${claimDetails.claim.type}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(claimDetails.claim.amount)}</p>
                    <p><strong>Submission Date:</strong> ${formatDate(claimDetails.claim.submissionDate)}</p>
                    <p><strong>Reason:</strong> ${claimDetails.claim.reason}</p>
                </div>
            </div>
            <div class="mt-3">
                <h6>Submitted Documents</h6>
                <ul>
                    ${claimDetails.claim.documents.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
            </div>
            <div class="mt-4">
                <h6>Review Decision</h6>
                <div class="mb-3">
                    <label class="form-label">Comments</label>
                    <textarea class="form-control" id="reviewComments" rows="3"></textarea>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-success" onclick="updateClaimStatus('${claimId}', 'approved')">
                        <i class="fas fa-check me-1"></i>Approve
                    </button>
                    <button class="btn btn-danger" onclick="updateClaimStatus('${claimId}', 'rejected')">
                        <i class="fas fa-times me-1"></i>Reject
                    </button>
                    <button class="btn btn-secondary" onclick="requestMoreDocuments('${claimId}')">
                        <i class="fas fa-file me-1"></i>Request Documents
                    </button>
                </div>
            </div>
        `;
        
        modal.show();
    } catch (error) {
        console.error('Error loading claim details:', error);
        showNotification('Error loading claim details', 'error');
    }
}

// Update claim status
async function updateClaimStatus(claimId, status) {
    try {
        const comments = document.getElementById('reviewComments').value;
        const button = document.querySelector(`button[onclick="updateClaimStatus('${claimId}', '${status}')"]`);
        const resetLoading = await loadDataWithSpinner(button);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('claimReviewModal'));
        modal.hide();

        // Show success message
        showNotification(`Claim ${status} successfully`, 'success');
        
        // Refresh claims data
        loadClaimsData();
        loadActivityData();
        
        resetLoading();
    } catch (error) {
        console.error('Error updating claim status:', error);
        showNotification('Error updating claim status', 'error');
    }
}

// Request additional documents
function requestMoreDocuments(claimId) {
    const modal = new bootstrap.Modal(document.getElementById('documentRequestModal'));
    const modalBody = document.querySelector('#documentRequestModal .modal-body');
    
    modalBody.innerHTML = `
        <form id="documentRequestForm">
            <input type="hidden" id="claimIdInput" value="${claimId}">
            <div class="mb-3">
                <label class="form-label">Required Documents</label>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="income_proof" id="doc1">
                    <label class="form-check-label" for="doc1">Income Proof</label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="medical_records" id="doc2">
                    <label class="form-check-label" for="doc2">Additional Medical Records</label>
                </div>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="identity_proof" id="doc3">
                    <label class="form-check-label" for="doc3">Identity Proof</label>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Additional Notes</label>
                <textarea class="form-control" id="documentNotes" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Send Request</button>
        </form>
    `;
    
    // Handle form submission
    const form = document.getElementById('documentRequestForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const button = form.querySelector('button[type="submit"]');
            const resetLoading = await loadDataWithSpinner(button);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Close modals
            const docModal = bootstrap.Modal.getInstance(document.getElementById('documentRequestModal'));
            const reviewModal = bootstrap.Modal.getInstance(document.getElementById('claimReviewModal'));
            docModal.hide();
            reviewModal.hide();

            showNotification('Document request sent successfully', 'success');
            
            resetLoading();
        } catch (error) {
            console.error('Error sending document request:', error);
            showNotification('Error sending document request', 'error');
        }
    });
    
    modal.show();
}

// Load admin notifications
function loadAdminNotifications() {
    // Simulate notifications data
    const notifications = [
        { id: 1, message: 'New claim requires review', type: 'warning' },
        { id: 2, message: 'Premium collection target achieved', type: 'success' },
        { id: 3, message: 'System maintenance scheduled', type: 'info' },
        { id: 4, message: 'New agent registration pending', type: 'info' },
        { id: 5, message: 'Policy renewal alerts pending', type: 'warning' }
    ];

    const notificationCount = notifications.length;
    const badge = document.querySelector('.badge');
    if (badge) {
        badge.textContent = `${notificationCount} New Alerts`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add export functionality
    const exportBtn = document.querySelector('.export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            const data = [
                { id: 'CL-1234', customer: 'John Doe', type: 'Term Life', amount: 500000, status: 'Pending' },
                { id: 'CL-1235', customer: 'Jane Smith', type: 'Health', amount: 75000, status: 'Approved' },
                { id: 'CL-1236', customer: 'Mike Johnson', type: 'Vehicle', amount: 120000, status: 'Rejected' }
            ];
            
            exportToCSV(data, 'claims_report.csv');
            showNotification('Report exported successfully', 'success');
        });
    }
}
