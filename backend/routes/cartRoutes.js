const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// GET /api/cart - Get cart with total (from database)
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ sessionId: 'default-session' });
    
    if (!cart) {
      cart = new Cart({ sessionId: 'default-session', items: [] });
      await cart.save();
    }

    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

    res.json({
      items: cart.items,
      total: total.toFixed(2),
      itemCount: itemCount
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart (with database persistence)
router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Mock products
    const mockProducts = [
      { id: 1, name: "Wireless Headphones", price: 99.99 },
      { id: 2, name: "Smart Watch", price: 199.99 },
      { id: 3, name: "Laptop Backpack", price: 49.99 },
      { id: 4, name: "Bluetooth Speaker", price: 79.99 },
      { id: 5, name: "Phone Case", price: 24.99 },
      { id: 6, name: "Gaming Mouse", price: 59.99 },
      { id: 7, name: "Mechanical Keyboard", price: 89.99 },
      { id: 8, name: "USB-C Hub", price: 39.99 }
    ];
    
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find or create cart in database
    let cart = await Cart.findOne({ sessionId: 'default-session' });
    if (!cart) {
      cart = new Cart({ sessionId: 'default-session', items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.json({ 
      message: 'Item added to cart', 
      items: cart.items,
      total: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    let cart = await Cart.findOne({ sessionId: 'default-session' });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ 
      message: 'Item removed from cart', 
      items: cart.items 
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// POST /api/checkout - Mock checkout (WITH ORDER SAVING)
router.post('/checkout', async (req, res) => {
  try {
    const { cartItems, customerInfo } = req.body;
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create and save order to MongoDB
    const order = new Order({
      orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      customer: customerInfo,
      items: cartItems,
      total: total.toFixed(2),
      status: 'confirmed',
      timestamp: new Date()
    });

    // Save order to database
    await order.save();
    console.log('✅ Order saved to MongoDB:', order.orderId);

    // Clear cart after successful checkout
    let cart = await Cart.findOne({ sessionId: 'default-session' });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    const receipt = {
      orderId: order.orderId,
      customer: order.customer,
      items: order.items,
      total: order.total,
      timestamp: order.timestamp,
      status: order.status,
      databaseSaved: true,
      message: 'Order saved to MongoDB database!'
    };

    res.json(receipt);
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// GET /api/orders - Get all orders (for testing and verification)
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json({
      message: `Found ${orders.length} orders in database`,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;