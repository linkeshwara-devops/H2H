const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
console.log('Connecting to MySQL...');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Linkesh@2005'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL server');
    
    // Create database
    db.query('CREATE DATABASE IF NOT EXISTS harvest2hotel', (err) => {
        if (err) {
            console.error('Failed to create database:', err);
            return;
        }
        console.log('Database ready');
        
        // Use the database
        db.changeUser({ database: 'harvest2hotel' }, (err) => {
            if (err) {
                console.error('Failed to select database:', err);
                return;
            }
            console.log('Connected to harvest2hotel database');
            
            // Create tables one by one
            db.query(`CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                user_type VARCHAR(20) NOT NULL,
                company_name VARCHAR(100),
                address TEXT,
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating users table:', err);
                else console.log('Users table ready');
            });
            
            db.query(`CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                manufacturer_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                price_per_kg DECIMAL(10,2) NOT NULL,
                stock_kg DECIMAL(10,2) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manufacturer_id) REFERENCES users(id) ON DELETE CASCADE
            )`, (err) => {
                if (err) console.error('Error creating products table:', err);
                else console.log('Products table ready');
            });
            
            db.query(`CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                hotel_id INT NOT NULL,
                hotel_name VARCHAR(100),
                total_amount DECIMAL(10,2) NOT NULL,
                delivery_address TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (hotel_id) REFERENCES users(id) ON DELETE CASCADE
            )`, (err) => {
                if (err) console.error('Error creating orders table:', err);
                else console.log('Orders table ready');
            });
            
            db.query(`CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                product_name VARCHAR(100) NOT NULL,
                quantity DECIMAL(10,2) NOT NULL,
                price_at_time DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )`, (err) => {
                if (err) console.error('Error creating order_items table:', err);
                else console.log('Order items table ready');
            });
            
            // Check if users exist, if not add sample data
            setTimeout(() => {
                db.query("SELECT COUNT(*) as count FROM users", (err, results) => {
                    if (!err && results[0].count === 0) {
                        console.log('Adding sample data...');
                        const hashedPassword = '$2a$10$rVgKx9YzX5cF8jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5l';
                        
                        db.query("INSERT INTO users (name, email, password, user_type, company_name, address, phone) VALUES ('Rajesh Kumar', 'rajesh@basantagro.com', ?, 'manufacturer', 'Basanta Agro Foods', '123 Industrial Area, Punjab', '+91 9876543210')", [hashedPassword]);
                        db.query("INSERT INTO users (name, email, password, user_type, company_name, address, phone) VALUES ('Priya Sharma', 'priya@shreefoods.com', ?, 'manufacturer', 'Shree Foods Ltd.', '456 Food Park, Maharashtra', '+91 9876543211')", [hashedPassword]);
                        db.query("INSERT INTO users (name, email, password, user_type, company_name, address, phone) VALUES ('Amit Patel', 'amit@tajhotel.com', ?, 'hotel', 'Taj Palace Hotel', '100 MG Road, Mumbai', '+91 9988776655')", [hashedPassword]);
                        
                        setTimeout(() => {
                            db.query("INSERT INTO products (manufacturer_id, name, category, price_per_kg, stock_kg, description) VALUES (1, 'Premium Basmati Rice', 'Rice', 120.00, 5000, 'Aged basmati rice, perfect for biryani'), (1, 'Golden Wheat', 'Wheat', 35.00, 10000, 'High protein wheat for atta'), (1, 'Toor Dal', 'Pulses', 110.00, 3000, 'Premium quality toor dal'), (2, 'Organic Basmati Rice', 'Rice', 150.00, 2000, 'Certified organic basmati'), (2, 'Sharbati Wheat', 'Wheat', 45.00, 5000, 'Premium sharbati wheat'), (2, 'Moong Dal', 'Pulses', 130.00, 2500, 'High quality moong dal'), (2, 'Potato', 'Vegetables', 28.00, 8000, 'Fresh farm potatoes')");
                            console.log('Sample data added successfully!');
                            console.log('\n========================================');
                            console.log('Server is ready!');
                            console.log('Open browser at: http://localhost:5000');
                            console.log('========================================\n');
                        }, 1000);
                    }
                });
            }, 2000);
        });
    });
});

// JWT Secret
const JWT_SECRET = 'harvest2hotel_secret_key_2024';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// ============ AUTHENTICATION ROUTES ============

app.post('/api/register', async (req, res) => {
    const { name, email, password, userType, companyName, address, phone } = req.body;
    if (!name || !email || !password || !userType) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (name, email, password, user_type, company_name, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [name, email, hashedPassword, userType, companyName, address, phone], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
                return res.status(500).json({ error: 'Registration failed' });
            }
            const token = jwt.sign({ id: result.insertId, email, userType }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: { id: result.insertId, name, email, userType } });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password, userType } = req.body;
    if (!email || !password || !userType) return res.status(400).json({ error: 'All fields are required' });
    const query = 'SELECT * FROM users WHERE email = ? AND user_type = ?';
    db.query(query, [email, userType], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email, userType: user.user_type }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, userType: user.user_type, companyName: user.company_name } });
    });
});

// ============ PRODUCT ROUTES ============

app.get('/api/products', (req, res) => {
    const query = `SELECT p.*, u.name as manufacturer_name, u.company_name as manufacturer_company FROM products p JOIN users u ON p.manufacturer_id = u.id WHERE p.stock_kg > 0`;
    db.query(query, (err, products) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch products' });
        res.json(products);
    });
});

app.post('/api/products', authenticateToken, (req, res) => {
    if (req.user.userType !== 'manufacturer') return res.status(403).json({ error: 'Only manufacturers can add products' });
    const { name, category, price_per_kg, stock_kg, description, image_url } = req.body;
    if (!name || !price_per_kg || !stock_kg) return res.status(400).json({ error: 'Product name, price, and stock are required' });
    const query = 'INSERT INTO products (manufacturer_id, name, category, price_per_kg, stock_kg, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [req.user.id, name, category, price_per_kg, stock_kg, description, image_url], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to add product' });
        res.json({ id: result.insertId, message: 'Product added successfully' });
    });
});

app.put('/api/products/:id/stock', authenticateToken, (req, res) => {
    if (req.user.userType !== 'manufacturer') return res.status(403).json({ error: 'Only manufacturers can update stock' });
    const { stock_kg } = req.body;
    const query = 'UPDATE products SET stock_kg = ? WHERE id = ? AND manufacturer_id = ?';
    db.query(query, [stock_kg, req.params.id, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update stock' });
        res.json({ message: 'Stock updated successfully' });
    });
});

app.get('/api/manufacturers', (req, res) => {
    db.query('SELECT id, name, company_name, email, phone, address FROM users WHERE user_type = "manufacturer"', (err, manufacturers) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch manufacturers' });
        res.json(manufacturers);
    });
});

app.get('/api/manufacturer/monthly-report', authenticateToken, (req, res) => {
    if (req.user.userType !== 'manufacturer') return res.status(403).json({ error: 'Access denied' });
    const query = `SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month, COUNT(DISTINCT o.id) as total_orders, SUM(oi.quantity) as total_kg_sold, SUM(oi.price_at_time * oi.quantity) as total_earnings FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.manufacturer_id = ? GROUP BY DATE_FORMAT(o.created_at, '%Y-%m') ORDER BY month DESC`;
    db.query(query, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch report' });
        res.json(results);
    });
});

app.post('/api/orders', authenticateToken, (req, res) => {
    if (req.user.userType !== 'hotel') return res.status(403).json({ error: 'Only hotels can place orders' });
    const { items, total_amount, delivery_address, hotel_name } = req.body;
    if (!items || !items.length || !total_amount) return res.status(400).json({ error: 'Order items and total amount are required' });
    const orderQuery = 'INSERT INTO orders (hotel_id, hotel_name, total_amount, delivery_address, status) VALUES (?, ?, ?, ?, "pending")';
    db.query(orderQuery, [req.user.id, hotel_name, total_amount, delivery_address], (err, orderResult) => {
        if (err) return res.status(500).json({ error: 'Failed to create order' });
        const orderId = orderResult.insertId;
        let completed = 0;
        items.forEach((item) => {
            db.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time) VALUES (?, ?, ?, ?, ?)', [orderId, item.product_id, item.product_name, item.quantity, item.price], (err) => {
                if (err) return res.status(500).json({ error: 'Failed to add order items' });
                db.query('UPDATE products SET stock_kg = stock_kg - ? WHERE id = ? AND stock_kg >= ?', [item.quantity, item.product_id, item.quantity], (err) => {
                    completed++;
                    if (completed === items.length) {
                        res.json({ orderId, message: 'Order placed successfully' });
                    }
                });
            });
        });
    });
});

app.get('/api/hotel/orders', authenticateToken, (req, res) => {
    if (req.user.userType !== 'hotel') return res.status(403).json({ error: 'Access denied' });
    const query = `SELECT o.*, GROUP_CONCAT(CONCAT(oi.product_name, ' (', oi.quantity, 'kg)') SEPARATOR ', ') as items_list FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.hotel_id = ? GROUP BY o.id ORDER BY o.created_at DESC`;
    db.query(query, [req.user.id], (err, orders) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch orders' });
        res.json(orders);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});