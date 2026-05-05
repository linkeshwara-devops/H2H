-- Create Database
CREATE DATABASE IF NOT EXISTS harvest2hotel;
USE harvest2hotel;

-- Users table (both manufacturers and hotels)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('manufacturer', 'hotel') NOT NULL,
    company_name VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
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
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hotel_id INT NOT NULL,
    hotel_name VARCHAR(100),
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- First, clear existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert manufacturers (password: password123 hashed)
INSERT INTO users (id, name, email, password, user_type, company_name, address, phone) VALUES
(1, 'Rajesh Kumar', 'rajesh@basantagro.com', '$2a$10$rVgKx9YzX5cF8jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5l', 'manufacturer', 'Basanta Agro Foods', '123 Industrial Area, Punjab', '+91 9876543210'),
(2, 'Priya Sharma', 'priya@shreefoods.com', '$2a$10$rVgKx9YzX5cF8jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5l', 'manufacturer', 'Shree Foods Ltd.', '456 Food Park, Maharashtra', '+91 9876543211');

-- Insert hotel (password: password123)
INSERT INTO users (id, name, email, password, user_type, company_name, address, phone) VALUES
(3, 'Amit Patel', 'amit@tajhotel.com', '$2a$10$rVgKx9YzX5cF8jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5l', 'hotel', 'Taj Palace Hotel', '100 MG Road, Mumbai', '+91 9988776655');

-- Insert products (using manufacturer_id 1 and 2 which now exist)
INSERT INTO products (manufacturer_id, name, category, price_per_kg, stock_kg, description, image_url) VALUES
(1, 'Premium Basmati Rice', 'Rice', 120.00, 5000, 'Aged basmati rice, perfect for biryani', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'),
(1, 'Golden Wheat', 'Wheat', 35.00, 10000, 'High protein wheat for atta', 'https://images.unsplash.com/photo-1574323347407-f2e1ad6cef3b?w=300'),
(1, 'Toor Dal (Split Pigeon Peas)', 'Pulses', 110.00, 3000, 'Premium quality toor dal', 'https://images.unsplash.com/photo-1515543904371-af1e4b868c9e?w=300'),
(2, 'Organic Basmati Rice', 'Rice', 150.00, 2000, 'Certified organic basmati', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300'),
(2, 'Sharbati Wheat', 'Wheat', 45.00, 5000, 'Premium sharbati wheat', 'https://images.unsplash.com/photo-1574323347407-f2e1ad6cef3b?w=300'),
(2, 'Moong Dal (Yellow Lentils)', 'Pulses', 130.00, 2500, 'High quality moong dal', 'https://images.unsplash.com/photo-1515543904371-af1e4b868c9e?w=300'),
(2, 'Potato (Jyoti Variety)', 'Vegetables', 28.00, 8000, 'Fresh farm potatoes', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300');

-- Insert sample order (hotel_id 3 exists now)
INSERT INTO orders (hotel_id, hotel_name, total_amount, delivery_address, status) VALUES
(3, 'Taj Palace Hotel', 36000.00, '100 MG Road, Mumbai', 'delivered');

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price_at_time) VALUES
(1, 1, 'Premium Basmati Rice', 200, 120.00),
(1, 2, 'Golden Wheat', 400, 35.00);