// Advanced Premium Calculator

const premiumRates = {
    'term-insurance': {
        baseRate: 0.5, // per 1000 sum assured
        ageFactor: 0.1, // additional rate per year of age
        termFactor: -0.02, // reduction per year of term
        smokingFactor: 0.3, // additional rate for smokers
        occupationFactors: {
            'office': 1,
            'field': 1.2,
            'hazardous': 1.5
        }
    },
    'endowment': {
        baseRate: 45, // per 1000 sum assured
        ageFactor: 0.2,
        termFactor: -0.1,
        bonusRate: 40 // per 1000 sum assured per year
    },
    'money-back': {
        baseRate: 50,
        ageFactor: 0.15,
        termFactor: -0.05,
        survivalBenefitRate: 0.2 // percentage of sum assured
    }
};

function initializePremiumCalculator() {
    const container = document.getElementById('premiumCalculatorContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="calculator-form">
            <form id="premiumCalculatorForm" class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Policy Type</label>
                    <select class="form-select" id="policyType" required onchange="updateCalculatorFields()">
                        <option value="">Select Policy Type</option>
                        <option value="term-insurance">Term Insurance</option>
                        <option value="endowment">Endowment Plan</option>
                        <option value="money-back">Money Back Policy</option>
                    </select>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label">Sum Assured</label>
                    <div class="input-group">
                        <span class="input-group-text">₹</span>
                        <input type="number" class="form-control" id="sumAssured" required min="100000" step="100000">
                    </div>
                </div>
                
                <div class="col-md-4">
                    <label class="form-label">Age</label>
                    <input type="number" class="form-control" id="age" required min="18" max="65">
                </div>
                
                <div class="col-md-4">
                    <label class="form-label">Policy Term (Years)</label>
                    <input type="number" class="form-control" id="term" required min="5" max="40">
                </div>
                
                <div class="col-md-4">
                    <label class="form-label">Premium Mode</label>
                    <select class="form-select" id="premiumMode" required>
                        <option value="yearly">Yearly</option>
                        <option value="half-yearly">Half-Yearly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                
                <div id="additionalFields"></div>
                
                <div class="col-12">
                    <button type="submit" class="btn btn-primary">
                        Calculate Premium
                    </button>
                </div>
            </form>
        </div>
        
        <div id="premiumResult" class="mt-4" style="display: none;">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Premium Calculation Result</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="premium-details"></div>
                        </div>
                        <div class="col-md-6">
                            <div class="benefit-illustration"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setupCalculatorEvents();
}

function updateCalculatorFields() {
    const policyType = document.getElementById('policyType').value;
    const additionalFields = document.getElementById('additionalFields');
    
    if (!policyType) {
        additionalFields.innerHTML = '';
        return;
    }

    let fields = '';
    
    if (policyType === 'term-insurance') {
        fields = `
            <div class="col-md-4">
                <label class="form-label">Smoking Habit</label>
                <select class="form-select" id="smokingHabit" required>
                    <option value="no">Non-Smoker</option>
                    <option value="yes">Smoker</option>
                </select>
            </div>
            
            <div class="col-md-4">
                <label class="form-label">Occupation</label>
                <select class="form-select" id="occupation" required>
                    <option value="office">Office/Clerical</option>
                    <option value="field">Field Work</option>
                    <option value="hazardous">Hazardous</option>
                </select>
            </div>
            
            <div class="col-md-4">
                <label class="form-label">Critical Illness Cover</label>
                <select class="form-select" id="criticalIllnessCover">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        `;
    } else if (policyType === 'endowment') {
        fields = `
            <div class="col-md-6">
                <label class="form-label">Bonus Option</label>
                <select class="form-select" id="bonusOption" required>
                    <option value="simple">Simple Reversionary Bonus</option>
                    <option value="compound">Compound Reversionary Bonus</option>
                </select>
            </div>
            
            <div class="col-md-6">
                <label class="form-label">Premium Waiver Benefit</label>
                <select class="form-select" id="premiumWaiver">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        `;
    } else if (policyType === 'money-back') {
        fields = `
            <div class="col-md-6">
                <label class="form-label">Survival Benefit Frequency</label>
                <select class="form-select" id="survivalBenefitFreq" required>
                    <option value="5">Every 5 years</option>
                    <option value="4">Every 4 years</option>
                </select>
            </div>
            
            <div class="col-md-6">
                <label class="form-label">Accidental Death Benefit</label>
                <select class="form-select" id="accidentalDeathBenefit">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                </select>
            </div>
        `;
    }

    additionalFields.innerHTML = fields;
}

function calculatePremium(formData) {
    const { policyType, sumAssured, age, term } = formData;
    const rates = premiumRates[policyType];
    let annualPremium = 0;

    // Base calculation
    const baseAmount = (sumAssured / 1000) * rates.baseRate;
    const ageFactor = age * rates.ageFactor;
    const termFactor = term * rates.termFactor;

    if (policyType === 'term-insurance') {
        annualPremium = baseAmount * (1 + ageFactor + termFactor);
        
        // Apply smoking factor
        if (formData.smokingHabit === 'yes') {
            annualPremium *= (1 + rates.smokingFactor);
        }
        
        // Apply occupation factor
        annualPremium *= rates.occupationFactors[formData.occupation];
        
        // Add critical illness cover
        if (formData.criticalIllnessCover === 'yes') {
            annualPremium *= 1.25;
        }
    } else if (policyType === 'endowment') {
        annualPremium = baseAmount * (1 + ageFactor + termFactor);
        
        // Add bonus component
        const bonusComponent = (sumAssured / 1000) * rates.bonusRate * term;
        annualPremium += (bonusComponent / term);
        
        // Premium waiver benefit
        if (formData.premiumWaiver === 'yes') {
            annualPremium *= 1.1;
        }
    } else if (policyType === 'money-back') {
        annualPremium = baseAmount * (1 + ageFactor + termFactor);
        
        // Add survival benefit component
        const survivalBenefitFreq = parseInt(formData.survivalBenefitFreq);
        const survivalBenefits = Math.floor(term / survivalBenefitFreq);
        const survivalComponent = sumAssured * rates.survivalBenefitRate * survivalBenefits;
        annualPremium += (survivalComponent / term);
        
        // Accidental death benefit
        if (formData.accidentalDeathBenefit === 'yes') {
            annualPremium *= 1.15;
        }
    }

    // Adjust for premium mode
    const modeFactors = {
        'yearly': 1,
        'half-yearly': 0.51,
        'quarterly': 0.26,
        'monthly': 0.087
    };
    
    const modalPremium = annualPremium * modeFactors[formData.premiumMode];
    
    return {
        modalPremium: Math.ceil(modalPremium),
        annualPremium: Math.ceil(annualPremium)
    };
}

function displayPremiumResult(formData, premiumResult) {
    const resultDiv = document.getElementById('premiumResult');
    const detailsDiv = resultDiv.querySelector('.premium-details');
    const illustrationDiv = resultDiv.querySelector('.benefit-illustration');
    
    // Display premium details
    detailsDiv.innerHTML = `
        <h6 class="mb-3">Premium Details</h6>
        <table class="table table-sm">
            <tr>
                <td>Premium Amount:</td>
                <td class="text-end">${formatCurrency(premiumResult.modalPremium)}</td>
            </tr>
            <tr>
                <td>Premium Mode:</td>
                <td class="text-end">${formData.premiumMode.charAt(0).toUpperCase() + formData.premiumMode.slice(1)}</td>
            </tr>
            <tr>
                <td>Annual Premium:</td>
                <td class="text-end">${formatCurrency(premiumResult.annualPremium)}</td>
            </tr>
            <tr>
                <td>Sum Assured:</td>
                <td class="text-end">${formatCurrency(formData.sumAssured)}</td>
            </tr>
            <tr>
                <td>Policy Term:</td>
                <td class="text-end">${formData.term} years</td>
            </tr>
        </table>
    `;

    // Display benefit illustration
    let illustration = '<h6 class="mb-3">Benefit Illustration</h6>';
    
    if (formData.policyType === 'endowment') {
        const maturityAmount = formData.sumAssured + (formData.sumAssured * 0.4 * formData.term);
        illustration += `
            <div class="benefit-item mb-2">
                <div class="d-flex justify-content-between">
                    <span>Maturity Benefit:</span>
                    <span>${formatCurrency(maturityAmount)}</span>
                </div>
                <small class="text-muted">Includes bonus @ ₹40 per ₹1000 SA per year</small>
            </div>
        `;
    } else if (formData.policyType === 'money-back') {
        const survivalBenefitFreq = parseInt(formData.survivalBenefitFreq);
        const survivalBenefits = Math.floor(formData.term / survivalBenefitFreq);
        const survivalAmount = (formData.sumAssured * 0.2);
        
        illustration += `
            <div class="benefit-item mb-2">
                <div class="d-flex justify-content-between">
                    <span>Survival Benefits:</span>
                    <span>${formatCurrency(survivalAmount)} × ${survivalBenefits}</span>
                </div>
                <small class="text-muted">Payable every ${survivalBenefitFreq} years</small>
            </div>
        `;
    }
    
    illustration += `
        <div class="benefit-item mb-2">
            <div class="d-flex justify-content-between">
                <span>Death Benefit:</span>
                <span>${formatCurrency(formData.sumAssured)}</span>
            </div>
        </div>
        <div class="mt-3">
            <button class="btn btn-sm btn-outline-primary me-2" onclick="downloadIllustration()">
                <i class="fas fa-download me-1"></i>Download Illustration
            </button>
            <button class="btn btn-sm btn-primary" onclick="proceedToApplication()">
                <i class="fas fa-arrow-right me-1"></i>Apply Now
            </button>
        </div>
    `;
    
    illustrationDiv.innerHTML = illustration;
    resultDiv.style.display = 'block';
}

function setupCalculatorEvents() {
    const form = document.getElementById('premiumCalculatorForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            policyType: document.getElementById('policyType').value,
            sumAssured: parseFloat(document.getElementById('sumAssured').value),
            age: parseInt(document.getElementById('age').value),
            term: parseInt(document.getElementById('term').value),
            premiumMode: document.getElementById('premiumMode').value
        };

        // Get additional fields based on policy type
        if (formData.policyType === 'term-insurance') {
            formData.smokingHabit = document.getElementById('smokingHabit').value;
            formData.occupation = document.getElementById('occupation').value;
            formData.criticalIllnessCover = document.getElementById('criticalIllnessCover').value;
        } else if (formData.policyType === 'endowment') {
            formData.bonusOption = document.getElementById('bonusOption').value;
            formData.premiumWaiver = document.getElementById('premiumWaiver').value;
        } else if (formData.policyType === 'money-back') {
            formData.survivalBenefitFreq = document.getElementById('survivalBenefitFreq').value;
            formData.accidentalDeathBenefit = document.getElementById('accidentalDeathBenefit').value;
        }

        const premiumResult = calculatePremium(formData);
        displayPremiumResult(formData, premiumResult);
    });
}

async function downloadIllustration() {
    try {
        const element = document.getElementById('premiumResult');
        await generatePDF(element, 'premium_illustration.pdf');
        showNotification('Illustration downloaded successfully', 'success');
    } catch (error) {
        console.error('Error downloading illustration:', error);
        showNotification('Error downloading illustration', 'error');
    }
}

function proceedToApplication() {
    // Save calculator data to session storage
    const formData = {
        policyType: document.getElementById('policyType').value,
        sumAssured: document.getElementById('sumAssured').value,
        term: document.getElementById('term').value,
        premiumMode: document.getElementById('premiumMode').value
    };
    
    sessionStorage.setItem('policyApplication', JSON.stringify(formData));
    
    // Redirect to application page
    window.location.href = '../apply/policy-application.html';
}
