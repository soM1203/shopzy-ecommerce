const express = require('express');
const router = express.Router();

// Mock products data
const products = [
  { id: 1, name: "Wireless Headphones", price: 99.99, description: "High-quality wireless headphones with noise cancellation" },
  { id: 2, name: "Smart Watch", price: 199.99, description: "Feature-rich smartwatch with health monitoring" },
  { id: 3, name: "Laptop Backpack", price: 49.99, description: "Durable laptop backpack with USB charging port" },
  { id: 4, name: "Bluetooth Speaker", price: 79.99, description: "Portable Bluetooth speaker with 360° sound" },
  { id: 5, name: "Phone Case", price: 24.99, description: "Protective phone case with sleek design" },
  { id: 6, name: "Gaming Mouse", price: 59.99, description: "Precision gaming mouse with RGB lighting" },
  { id: 7, name: "Mechanical Keyboard", price: 89.99, description: "Tactile mechanical keyboard for typing enthusiasts" },
  { id: 8, name: "USB-C Hub", price: 39.99, description: "Multi-port USB-C hub for all your devices" }
];

// GET /api/products - Get all products
router.get('/', (req, res) => {
  try {
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;