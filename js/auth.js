class Auth {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.currentUser = JSON.parse(userStr);
        }
    }

    async register(userData) {
        try {
            const response = await api.register(userData);
            if (response.token) {
                this.currentUser = response.user;
                localStorage.setItem('user', JSON.stringify(response.user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async login(email, password, userType) {
        try {
            const response = await api.login({ email, password, userType });
            if (response.token) {
                this.currentUser = response.user;
                localStorage.setItem('user', JSON.stringify(response.user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        api.logout();
    }

    isAuthenticated() {
        return this.currentUser !== null && api.token !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

const auth = new Auth();

// Handle login form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        try {
            await auth.login(email, password, userType);
            if (userType === 'manufacturer') {
                window.location.href = 'manufacturer-dashboard.html';
            } else {
                window.location.href = 'hotel-dashboard.html';
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });
}

// Handle register form
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            userType: document.getElementById('userType').value,
            companyName: document.getElementById('companyName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        try {
            await auth.register(userData);
            if (userData.userType === 'manufacturer') {
                window.location.href = 'manufacturer-dashboard.html';
            } else {
                window.location.href = 'hotel-dashboard.html';
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    });
}