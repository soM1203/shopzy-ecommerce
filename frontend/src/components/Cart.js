// Cart.js
import React, { useState, useEffect } from 'react';

const Cart = ({ cart, setCart, setShowCheckout }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCartFromBackend();
  }, []);

  const fetchCartFromBackend = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:4000/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.items || data);
        console.log('🔄 Cart synced from backend:', data.items || data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/cart/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCartFromBackend();
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    try {
      // Use PUT for quantity updates
      const response = await fetch(`http://localhost:4000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      await fetchCartFromBackend();

    } catch (error) {
      console.error('Error updating quantity:', error);
      setCart(cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="cart">
        <h2>Shopping Cart</h2>
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h4>{item.name}</h4>
                <p className="item-price">Price: ${item.price}</p>
              </div>
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span className="quantity">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="cart-total">
            <h3>Total: ${getTotal()}</h3>
          </div>
          
          {cart.length > 0 && (
            <button 
              onClick={() => setShowCheckout(true)}
              className="checkout-btn"
            >
              Proceed to Checkout
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;