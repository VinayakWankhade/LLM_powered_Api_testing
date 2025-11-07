const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Validation schemas
const userValidationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const productValidationSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  stock: Joi.number().integer().min(0).default(0)
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { error, value } = userValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = value;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Simulate user creation (in real app, save to database)
    const user = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword
    };

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Simulate user lookup (in real app, query database)
    const user = { id: 1, username, password: await bcrypt.hash(password, 10) };
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User management endpoints
app.get('/api/users', authenticateToken, (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  // Simulate user data
  const users = [
    { id: 1, username: 'john_doe', email: 'john@example.com', created_at: '2023-01-15' },
    { id: 2, username: 'jane_smith', email: 'jane@example.com', created_at: '2023-02-20' },
    { id: 3, username: 'bob_wilson', email: 'bob@example.com', created_at: '2023-03-10' }
  ];

  res.json({
    users: users.slice((page - 1) * limit, page * limit),
    total: users.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Simulate user lookup
  const user = { 
    id: parseInt(id), 
    username: 'user_' + id, 
    email: `user${id}@example.com`,
    profile: {
      firstName: 'User',
      lastName: id,
      bio: 'Sample user profile'
    }
  };

  if (parseInt(id) > 100) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(user);
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate updates
  if (updates.email && !Joi.string().email().validate(updates.email).error) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  res.json({
    message: 'User updated successfully',
    user: { id: parseInt(id), ...updates }
  });
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  res.json({ message: 'User deleted successfully' });
});

// Product management endpoints
app.get('/api/products', (req, res) => {
  const { category, price_min, price_max, page = 1, limit = 20 } = req.query;
  
  // Simulate product data
  const products = [
    { id: 1, name: 'Laptop', description: 'High-performance laptop', price: 999.99, category: 'electronics', stock: 10 },
    { id: 2, name: 'Book', description: 'Programming guide', price: 29.99, category: 'books', stock: 50 },
    { id: 3, name: 'Coffee', description: 'Premium coffee beans', price: 15.99, category: 'food', stock: 100 }
  ];

  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (price_min) {
    filtered = filtered.filter(p => p.price >= parseFloat(price_min));
  }
  
  if (price_max) {
    filtered = filtered.filter(p => p.price <= parseFloat(price_max));
  }

  res.json({
    products: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.post('/api/products', authenticateToken, (req, res) => {
  const { error, value } = productValidationSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const product = {
    id: Date.now(),
    ...value,
    created_by: req.user.id,
    created_at: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Product created successfully',
    product
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  const product = {
    id: parseInt(id),
    name: `Product ${id}`,
    description: `Description for product ${id}`,
    price: Math.random() * 100,
    category: 'general',
    stock: Math.floor(Math.random() * 50)
  };

  if (parseInt(id) > 1000) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  res.json({
    message: 'Product updated successfully',
    product: { id: parseInt(id), ...updates }
  });
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  res.json({ message: 'Product deleted successfully' });
});

// Order management endpoints
app.get('/api/orders', authenticateToken, (req, res) => {
  const orders = [
    { id: 1, user_id: req.user.id, total: 99.99, status: 'completed', created_at: '2023-12-01' },
    { id: 2, user_id: req.user.id, total: 149.99, status: 'pending', created_at: '2023-12-15' }
  ];

  res.json({ orders });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, shipping_address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items required' });
  }

  const order = {
    id: Date.now(),
    user_id: req.user.id,
    items,
    shipping_address,
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'pending',
    created_at: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Order created successfully',
    order
  });
});

app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const order = {
    id: parseInt(id),
    user_id: req.user.id,
    items: [
      { product_id: 1, name: 'Sample Product', price: 29.99, quantity: 2 }
    ],
    total: 59.98,
    status: 'completed',
    created_at: '2023-12-01',
    shipping_address: {
      street: '123 Main St',
      city: 'Sample City',
      country: 'Sample Country'
    }
  };

  res.json(order);
});

// Analytics endpoints
app.get('/api/analytics/summary', authenticateToken, (req, res) => {
  res.json({
    total_users: 1500,
    total_products: 250,
    total_orders: 890,
    total_revenue: 45230.50,
    growth_rate: 12.5
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;