class ClaimDB {
    constructor() {
        this.claims = this.loadClaims();
    }

    loadClaims() {
        const stored = localStorage.getItem('claims');
        return stored ? JSON.parse(stored) : [];
    }

    saveClaims() {
        localStorage.setItem('claims', JSON.stringify(this.claims));
    }

    createBackup() {
        const backup = {
            date: new Date().toISOString(),
            claims: this.claims
        };
        const backups = JSON.parse(localStorage.getItem('claim_backups') || '[]');
        backups.push(backup);
        localStorage.setItem('claim_backups', JSON.stringify(backups));
    }

    async getAllClaims() {
        return this.claims;
    }

    async addClaim(claim) {
        claim.id = 'CLM' + Date.now().toString().slice(-6);
        claim.createdAt = new Date().toISOString();
        claim.status = claim.status || 'pending';

        this.claims.push(claim);
        this.saveClaims();
        this.createBackup();
        return claim;
    }

    async updateClaim(claim) {
        const index = this.claims.findIndex(c => c.id === claim.id);
        if (index === -1) throw new Error('Claim not found');

        claim.updatedAt = new Date().toISOString();
        this.claims[index] = { ...this.claims[index], ...claim };
        this.saveClaims();
        this.createBackup();
        return this.claims[index];
    }

    async deleteClaim(claimId) {
        const index = this.claims.findIndex(c => c.id === claimId);
        if (index === -1) throw new Error('Claim not found');

        const deletedClaims = JSON.parse(localStorage.getItem('deleted_claims') || '[]');
        deletedClaims.push({
            ...this.claims[index],
            deletedAt: new Date().toISOString()
        });
        localStorage.setItem('deleted_claims', JSON.stringify(deletedClaims));

        this.claims.splice(index, 1);
        this.saveClaims();
        this.createBackup();
    }

    async searchClaims(query) {
        query = query.toLowerCase();
        return this.claims.filter(claim => 
            claim.id.toLowerCase().includes(query) ||
            claim.policyId.toLowerCase().includes(query) ||
            claim.customerId.toLowerCase().includes(query) ||
            claim.status.toLowerCase().includes(query)
        );
    }

    async getClaimById(claimId) {
        return this.claims.find(c => c.id === claimId);
    }

    async getClaimsByPolicyId(policyId) {
        return this.claims.filter(c => c.policyId === policyId);
    }

    async getClaimsByCustomerId(customerId) {
        return this.claims.filter(c => c.customerId === customerId);
    }
}
