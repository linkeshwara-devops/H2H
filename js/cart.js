class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addItem(item) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            this.items.push({ ...item });
        }
        this.saveCart();
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
    }

    updateQuantity(index, quantity) {
        if (this.items[index]) {
            this.items[index].quantity = quantity;
            this.saveCart();
        }
    }

    getItems() {
        return this.items;
    }

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    getTotalAmount() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }
}

const cart = new Cart();