const API_BASE_URL = 'http://localhost:5000/api';

class API {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        if (data.token) {
            this.setToken(data.token);
        }
        return data;
    }

    logout() {
        this.setToken(null);
    }

    // Products
    async getProducts() {
        return this.request('/products');
    }

    async getProductsByCategory(category) {
        return this.request(`/products/category/${category}`);
    }

    async addProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProductStock(productId, stockKg) {
        return this.request(`/products/${productId}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ stock_kg: stockKg })
        });
    }

    // Manufacturers
    async getManufacturers() {
        return this.request('/manufacturers');
    }

    async getManufacturerById(id) {
        return this.request(`/manufacturer/${id}`);
    }

    async getManufacturerReport() {
        return this.request('/manufacturer/monthly-report');
    }

    // Orders
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    async getHotelOrders() {
        return this.request('/hotel/orders');
    }
}

const api = new API();