// Policy Comparison Tool

const policyData = {
    'jeevan-anand': {
        name: 'Jeevan Anand',
        type: 'Endowment',
        minAge: 18,
        maxAge: 50,
        minTerm: 15,
        maxTerm: 35,
        minSumAssured: 100000,
        features: [
            'Death benefit throughout the policy term',
            'Maturity benefit on survival',
            'Bonus accumulation',
            'Tax benefits under Section 80C'
        ],
        benefits: {
            death: 'Sum Assured + Accumulated Bonus',
            maturity: 'Sum Assured + Accumulated Bonus',
            surrender: 'Available after 3 years'
        },
        premiumModes: ['Yearly', 'Half-yearly', 'Quarterly', 'Monthly']
    },
    'term-insurance': {
        name: 'Term Insurance Plan',
        type: 'Term',
        minAge: 18,
        maxAge: 65,
        minTerm: 10,
        maxTerm: 40,
        minSumAssured: 500000,
        features: [
            'High coverage at low premium',
            'Optional critical illness cover',
            'Accidental death benefit rider',
            'Tax benefits under Section 80C'
        ],
        benefits: {
            death: 'Sum Assured',
            maturity: 'No maturity benefit',
            surrender: 'No surrender value'
        },
        premiumModes: ['Yearly', 'Half-yearly', 'Quarterly', 'Monthly']
    },
    'money-back': {
        name: 'Money Back Policy',
        type: 'Money Back',
        minAge: 13,
        maxAge: 50,
        minTerm: 20,
        maxTerm: 25,
        minSumAssured: 200000,
        features: [
            'Regular survival benefits',
            'Death benefit throughout policy term',
            'Bonus accumulation',
            'Tax benefits under Section 80C'
        ],
        benefits: {
            death: 'Sum Assured + Accumulated Bonus',
            maturity: 'Final installment + Accumulated Bonus',
            survival: '20% of SA every 5 years'
        },
        premiumModes: ['Yearly', 'Half-yearly', 'Quarterly', 'Monthly']
    }
};

function initializePolicyComparison() {
    const container = document.getElementById('policyComparisonContainer');
    if (!container) return;

    // Create policy selection interface
    const selectionDiv = document.createElement('div');
    selectionDiv.className = 'policy-selection mb-4';
    selectionDiv.innerHTML = `
        <div class="row g-3">
            <div class="col-md-4">
                <select class="form-select" id="policy1">
                    <option value="">Select First Policy</option>
                    ${Object.entries(policyData).map(([key, policy]) => 
                        `<option value="${key}">${policy.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="col-md-4">
                <select class="form-select" id="policy2">
                    <option value="">Select Second Policy</option>
                    ${Object.entries(policyData).map(([key, policy]) => 
                        `<option value="${key}">${policy.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="col-md-4">
                <button class="btn btn-primary w-100" onclick="comparePolicies()">
                    Compare Policies
                </button>
            </div>
        </div>
    `;
    container.appendChild(selectionDiv);

    // Create comparison result container
    const resultDiv = document.createElement('div');
    resultDiv.id = 'comparisonResult';
    container.appendChild(resultDiv);
}

function comparePolicies() {
    const policy1Id = document.getElementById('policy1').value;
    const policy2Id = document.getElementById('policy2').value;

    if (!policy1Id || !policy2Id) {
        showNotification('Please select two policies to compare', 'warning');
        return;
    }

    if (policy1Id === policy2Id) {
        showNotification('Please select different policies', 'warning');
        return;
    }

    const policy1 = policyData[policy1Id];
    const policy2 = policyData[policy2Id];

    const resultDiv = document.getElementById('comparisonResult');
    resultDiv.innerHTML = `
        <div class="comparison-table-container">
            <table class="table table-bordered comparison-table">
                <thead class="table-light">
                    <tr>
                        <th>Feature</th>
                        <th>${policy1.name}</th>
                        <th>${policy2.name}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Policy Type</td>
                        <td>${policy1.type}</td>
                        <td>${policy2.type}</td>
                    </tr>
                    <tr>
                        <td>Entry Age</td>
                        <td>${policy1.minAge} - ${policy1.maxAge} years</td>
                        <td>${policy2.minAge} - ${policy2.maxAge} years</td>
                    </tr>
                    <tr>
                        <td>Policy Term</td>
                        <td>${policy1.minTerm} - ${policy1.maxTerm} years</td>
                        <td>${policy2.minTerm} - ${policy2.maxTerm} years</td>
                    </tr>
                    <tr>
                        <td>Minimum Sum Assured</td>
                        <td>${formatCurrency(policy1.minSumAssured)}</td>
                        <td>${formatCurrency(policy2.minSumAssured)}</td>
                    </tr>
                    <tr>
                        <td>Key Features</td>
                        <td>
                            <ul class="list-unstyled mb-0">
                                ${policy1.features.map(f => `<li><i class="fas fa-check text-success me-2"></i>${f}</li>`).join('')}
                            </ul>
                        </td>
                        <td>
                            <ul class="list-unstyled mb-0">
                                ${policy2.features.map(f => `<li><i class="fas fa-check text-success me-2"></i>${f}</li>`).join('')}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>Death Benefit</td>
                        <td>${policy1.benefits.death}</td>
                        <td>${policy2.benefits.death}</td>
                    </tr>
                    <tr>
                        <td>Maturity Benefit</td>
                        <td>${policy1.benefits.maturity}</td>
                        <td>${policy2.benefits.maturity}</td>
                    </tr>
                    <tr>
                        <td>Premium Modes</td>
                        <td>${policy1.premiumModes.join(', ')}</td>
                        <td>${policy2.premiumModes.join(', ')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="text-center mt-4">
            <button class="btn btn-outline-primary me-2" onclick="downloadComparison()">
                <i class="fas fa-download me-2"></i>Download Comparison
            </button>
            <button class="btn btn-outline-primary" onclick="shareComparison()">
                <i class="fas fa-share-alt me-2"></i>Share Comparison
            </button>
        </div>
    `;
}

async function downloadComparison() {
    try {
        const element = document.querySelector('.comparison-table-container');
        if (!element) {
            showNotification('No comparison data to download', 'error');
            return;
        }

        const policy1Name = document.getElementById('policy1').selectedOptions[0].text;
        const policy2Name = document.getElementById('policy2').selectedOptions[0].text;
        
        await generatePDF(element, `${policy1Name}_vs_${policy2Name}_comparison.pdf`);
        showNotification('Comparison downloaded successfully', 'success');
    } catch (error) {
        console.error('Error downloading comparison:', error);
        showNotification('Error downloading comparison', 'error');
    }
}

function shareComparison() {
    const policy1Name = document.getElementById('policy1').selectedOptions[0].text;
    const policy2Name = document.getElementById('policy2').selectedOptions[0].text;
    
    const shareData = {
        title: 'LIC Policy Comparison',
        text: `Check out this comparison between ${policy1Name} and ${policy2Name}`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showNotification('Comparison shared successfully', 'success'))
            .catch(error => {
                console.error('Error sharing:', error);
                showNotification('Error sharing comparison', 'error');
            });
    } else {
        // Fallback to copy link
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showNotification('Link copied to clipboard', 'success');
    }
}
