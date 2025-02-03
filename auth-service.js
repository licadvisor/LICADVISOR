// Authentication Service
class AuthService {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'auth_user';
    }

    login(username, password) {
        // In a real app, this would make an API call
        if (username === 'admin' && password === 'admin123') {
            const token = 'dummy_token_' + Date.now();
            const user = {
                id: 1,
                username: username,
                role: 'admin'
            };
            
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        window.location.href = '../login/admin-login.html';
    }

    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey);
        return !!token;
    }

    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }
}
