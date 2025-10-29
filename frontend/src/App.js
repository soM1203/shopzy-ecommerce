import React, { useState, useEffect } from 'react';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Receipt from './components/Receipt';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [cartKey, setCartKey] = useState(0);

  // Load cart from localStorage on startup
  useEffect(() => {
    const savedCart = localStorage.getItem('shopzy-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shopzy-cart', JSON.stringify(cart));
  }, [cart]);

  const handleCheckoutSuccess = (orderReceipt) => {
    console.log('🔄 Clearing cart and forcing refresh...');
    
    // Clear everything
    setCart([]);
    setReceipt(orderReceipt);
    setShowCheckout(false);
    
    // Force refresh by changing the key
    setCartKey(prev => prev + 1);
    
    // Double clear localStorage
    localStorage.setItem('shopzy-cart', JSON.stringify([]));
    
    console.log('✅ Cart should be cleared now');
  };

  const handleCloseReceipt = () => {
    setReceipt(null);
    setShowCart(false);
  };

  const goToHome = () => {
    setShowCart(false);
    setShowCheckout(false);
    setReceipt(null);
  };

  // Force fetch from backend after checkout
  const refreshCartFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.items);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  };

  // Refresh cart when receipt is shown (after checkout)
  useEffect(() => {
    if (receipt) {
      refreshCartFromBackend();
    }
  }, [receipt]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Shopzy</h1>
        <div className="header-buttons">
          <button 
            className="home-button"
            onClick={goToHome}
          >
            Home
          </button>
          <button 
            className="cart-button"
            onClick={() => setShowCart(!showCart)}
          >
            Cart ({cart.reduce((total, item) => total + item.quantity, 0)})
          </button>
        </div>
      </header>

      {showCheckout && (
        <Checkout 
          cart={cart}
          onCheckoutSuccess={handleCheckoutSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {receipt && (
        <Receipt 
          receipt={receipt}
          onClose={handleCloseReceipt}
        />
      )}

      {showCart ? (
        <Cart 
          key={cartKey}
          cart={cart} 
          setCart={setCart}
          setShowCheckout={setShowCheckout}
        />
      ) : (
        <div>
          <h2>Products</h2>
          <ProductGrid cart={cart} setCart={setCart} />
        </div>
      )}
    </div>
  );
}

export default App;