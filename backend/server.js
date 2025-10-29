// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Use MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe-commerce';

let Order;
let Cart;

console.log('🔧 Attempting to connect to MongoDB Atlas...');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  
  // Order Schema
  const orderSchema = new mongoose.Schema({
    orderId: String,
    customer: Object,
    items: Array,
    total: Number,
    timestamp: { type: Date, default: Date.now }
  });
  
  // Cart Schema - FIXED to match frontend format
  const cartSchema = new mongoose.Schema({
    sessionId: { type: String, default: 'default' },
    items: [{
      id: Number,        // Changed from productId to id
      name: String,
      price: Number,
      quantity: Number
    }],
    updatedAt: { type: Date, default: Date.now }
  });
  
  Order = mongoose.model('Order', orderSchema);
  Cart = mongoose.model('Cart', cartSchema);
  console.log('📊 MongoDB models initialized');
})
.catch(err => {
  console.log('⚠️ MongoDB not available, using in-memory storage');
  console.log('💡 Error details:', err.message);
});

// Memory fallback
let memoryCart = [];
let memoryOrders = [];

// Helper function to get or create cart
const getCart = async () => {
  if (Cart) {
    try {
      let cart = await Cart.findOne({ sessionId: 'default' });
      if (!cart) {
        cart = new Cart({ sessionId: 'default', items: [] });
        await cart.save();
      }
      return cart;
    } catch (error) {
      console.log('❌ MongoDB cart error, using memory:', error.message);
      return null;
    }
  }
  return null;
};

// Products API with Fake Store Integration
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching products from Fake Store API...');
    
    const response = await fetch('https://fakestoreapi.com/products');
    
    if (!response.ok) {
      throw new Error(`Fake Store API error: ${response.status}`);
    }
    
    const fakeProducts = await response.json();
    
    // Transform the data to match our frontend format
    const products = fakeProducts.map(product => ({
      id: product.id,
      name: product.title,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      rating: product.rating
    }));
    
    console.log(`✅ Fetched ${products.length} products from Fake Store API`);
    res.json(products);
    
  } catch (error) {
    console.error('❌ Fake Store API failed, using fallback products:', error.message);
    
    // Fallback to our original products
    const fallbackProducts = [
      { id: 1, name: "Wireless Headphones", price: 99.99, description: "High-quality wireless headphones with noise cancellation", image: "🎧" },
      { id: 2, name: "Smart Watch", price: 199.99, description: "Feature-rich smartwatch with health monitoring", image: "⌚" },
      { id: 3, name: "Laptop Backpack", price: 49.99, description: "Durable laptop backpack with USB charging port", image: "🎒" },
      { id: 4, name: "Bluetooth Speaker", price: 79.99, description: "Portable Bluetooth speaker with 360° sound", image: "🔊" },
      { id: 5, name: "Phone Case", price: 24.99, description: "Protective phone case with sleek design", image: "📱" },
      { id: 6, name: "Gaming Mouse", price: 59.99, description: "Precision gaming mouse with RGB lighting", image: "🖱️" },
      { id: 7, name: "Mechanical Keyboard", price: 89.99, description: "Tactile mechanical keyboard for typing enthusiasts", image: "⌨️" },
      { id: 8, name: "USB-C Hub", price: 39.99, description: "Multi-port USB-C hub for all your devices", image: "🔌" }
    ];
    
    res.json(fallbackProducts);
  }
});

// Cart API - FIXED data format
app.get('/api/cart', async (req, res) => {
  try {
    if (Cart) {
      const cart = await getCart();
      if (cart) {
        console.log('🛒 Cart from MongoDB:', cart.items);
        res.json({ items: cart.items });
        return;
      }
    }
    
    // Fallback to memory
    console.log('🛒 Cart from memory:', memoryCart);
    res.json({ items: memoryCart });
    
  } catch (error) {
    console.error('❌ Cart fetch error:', error);
    res.json({ items: memoryCart });
  }
});

app.post('/api/cart', async (req, res) => {
  const { productId, quantity = 1, name, price } = req.body;
  console.log('➕ Adding to cart:', { productId, quantity, name, price });
  
  try {
    if (Cart) {
      let cart = await getCart();
      if (cart) {
        const existingItem = cart.items.find(item => item.id === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.items.push({
            id: productId,      // Using 'id' instead of 'productId'
            name: name,
            price: price,
            quantity: quantity
          });
        }
        
        cart.updatedAt = new Date();
        await cart.save();
        console.log('✅ Cart saved to MongoDB');
        res.json({ success: true, items: cart.items });
        return;
      }
    }
    
    // Memory fallback
    const existingItem = memoryCart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      memoryCart.push({
        id: productId,
        name,
        price,
        quantity
      });
    }
    res.json({ success: true, items: memoryCart });
    
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    // Emergency memory fallback
    const existingItem = memoryCart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      memoryCart.push({
        id: productId,
        name,
        price,
        quantity
      });
    }
    res.json({ success: true, items: memoryCart });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log('🗑️ Removing from cart:', productId);
  
  try {
    if (Cart) {
      const cart = await getCart();
      if (cart) {
        cart.items = cart.items.filter(item => item.id !== parseInt(productId));
        cart.updatedAt = new Date();
        await cart.save();
        console.log('✅ Item removed from MongoDB cart');
        res.json({ success: true, items: cart.items });
        return;
      }
    }
    
    // Memory fallback
    memoryCart = memoryCart.filter(item => item.id !== parseInt(productId));
    res.json({ success: true, items: memoryCart });
    
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    memoryCart = memoryCart.filter(item => item.id !== parseInt(productId));
    res.json({ success: true, items: memoryCart });
  }
});

app.put('/api/cart/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  console.log('✏️ Updating cart:', productId, 'quantity:', quantity);
  
  try {
    if (Cart) {
      const cart = await getCart();
      if (cart) {
        const item = cart.items.find(item => item.id === parseInt(productId));
        if (item) {
          item.quantity = quantity;
          cart.updatedAt = new Date();
          await cart.save();
        }
        res.json({ success: true, items: cart.items });
        return;
      }
    }
    
    // Memory fallback
    const item = memoryCart.find(item => item.id === parseInt(productId));
    if (item) {
      item.quantity = quantity;
    }
    res.json({ success: true, items: memoryCart });
    
  } catch (error) {
    console.error('❌ Update cart error:', error);
    const item = memoryCart.find(item => item.id === parseInt(productId));
    if (item) {
      item.quantity = quantity;
    }
    res.json({ success: true, items: memoryCart });
  }
});

// Clear entire cart (useful for debugging)
app.delete('/api/cart', async (req, res) => {
  console.log('🗑️ Clearing entire cart');
  
  try {
    if (Cart) {
      await Cart.findOneAndUpdate(
        { sessionId: 'default' },
        { items: [], updatedAt: new Date() }
      );
      console.log('✅ MongoDB cart cleared');
    }
    
    memoryCart = [];
    res.json({ success: true, items: [] });
    
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    memoryCart = [];
    res.json({ success: true, items: [] });
  }
});

// Checkout
app.post('/api/cart/checkout', async (req, res) => {
  try {
    const { cartItems, customerInfo } = req.body;
    console.log('💰 Checkout process started for:', customerInfo.name);
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'ORD-' + Date.now();
    
    // Save order
    if (Order) {
      const order = new Order({
        orderId: orderId,
        customer: customerInfo,
        items: cartItems,
        total: total
      });
      
      await order.save();
      console.log('✅ Order saved to MongoDB:', orderId);
    } else {
      memoryOrders.push({
        orderId: orderId,
        customer: customerInfo,
        items: cartItems,
        total: total,
        timestamp: new Date()
      });
      console.log('✅ Order saved to memory:', orderId);
    }
    
    // Clear cart after checkout
    if (Cart) {
      await Cart.findOneAndUpdate(
        { sessionId: 'default' },
        { items: [], updatedAt: new Date() }
      );
    }
    memoryCart = [];
    
    // Return receipt
    const receipt = {
      orderId: orderId,
      customer: customerInfo,
      items: cartItems,
      total: total,
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 Checkout completed successfully');
    res.json(receipt);
    
  } catch (error) {
    console.error('❌ Checkout error:', error.message);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// Get orders
app.get('/api/orders', async (req, res) => {
  try {
    if (Order) {
      const orders = await Order.find().sort({ timestamp: -1 });
      res.json({ storage: 'MongoDB', orders: orders });
    } else {
      res.json({ storage: 'Memory', orders: memoryOrders });
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.json({ storage: 'Memory', orders: memoryOrders });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: Cart ? 'MongoDB Atlas Connected' : 'In-Memory',
    serverTime: new Date().toISOString()
  });
});

// Debug endpoint to see current cart state
app.get('/api/debug/cart', async (req, res) => {
  try {
    if (Cart) {
      const cart = await Cart.findOne({ sessionId: 'default' });
      res.json({ 
        source: 'MongoDB',
        cart: cart 
      });
    } else {
      res.json({ 
        source: 'Memory',
        cart: { items: memoryCart } 
      });
    }
  } catch (error) {
    res.json({ 
      source: 'Memory (Error)',
      cart: { items: memoryCart } 
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🛒 Cart: http://localhost:${PORT}/api/cart`);
  console.log(`💳 Checkout: http://localhost:${PORT}/api/cart/checkout`);
  console.log(`📊 Orders: http://localhost:${PORT}/api/orders`);
  console.log(`🐛 Debug: http://localhost:${PORT}/api/debug/cart`);
  console.log(`🛍️ Fake Store API: Integrated with fallback`);
});