class AgentDB {
    constructor() {
        this.agents = this.loadAgents();
    }

    loadAgents() {
        const stored = localStorage.getItem('agents');
        return stored ? JSON.parse(stored) : [];
    }

    saveAgents() {
        localStorage.setItem('agents', JSON.stringify(this.agents));
    }

    createBackup() {
        const backup = {
            date: new Date().toISOString(),
            agents: this.agents
        };
        const backups = JSON.parse(localStorage.getItem('agent_backups') || '[]');
        backups.push(backup);
        localStorage.setItem('agent_backups', JSON.stringify(backups));
    }

    async getAllAgents() {
        return this.agents;
    }

    async addAgent(agent) {
        agent.id = 'AGT' + Date.now().toString().slice(-6);
        agent.createdAt = new Date().toISOString();
        agent.status = agent.status || 'active';

        if (this.agents.some(a => a.email === agent.email)) {
            throw new Error('Email already exists');
        }

        this.agents.push(agent);
        this.saveAgents();
        this.createBackup();
        return agent;
    }

    async updateAgent(agent) {
        const index = this.agents.findIndex(a => a.id === agent.id);
        if (index === -1) throw new Error('Agent not found');

        if (agent.email !== this.agents[index].email &&
            this.agents.some(a => a.email === agent.email)) {
            throw new Error('Email already exists');
        }

        agent.updatedAt = new Date().toISOString();
        this.agents[index] = { ...this.agents[index], ...agent };
        this.saveAgents();
        this.createBackup();
        return this.agents[index];
    }

    async deleteAgent(agentId) {
        const index = this.agents.findIndex(a => a.id === agentId);
        if (index === -1) throw new Error('Agent not found');

        const deletedAgents = JSON.parse(localStorage.getItem('deleted_agents') || '[]');
        deletedAgents.push({
            ...this.agents[index],
            deletedAt: new Date().toISOString()
        });
        localStorage.setItem('deleted_agents', JSON.stringify(deletedAgents));

        this.agents.splice(index, 1);
        this.saveAgents();
        this.createBackup();
    }

    async searchAgents(query) {
        query = query.toLowerCase();
        return this.agents.filter(agent => 
            agent.id.toLowerCase().includes(query) ||
            agent.name.toLowerCase().includes(query) ||
            agent.email.toLowerCase().includes(query) ||
            agent.phone.includes(query)
        );
    }

    async getAgentById(agentId) {
        return this.agents.find(a => a.id === agentId);
    }

    async getActiveAgents() {
        return this.agents.filter(a => a.status === 'active');
    }
}
