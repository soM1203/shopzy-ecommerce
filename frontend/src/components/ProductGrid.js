// ProductGrid.js
import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCartFromBackend();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching products from backend...');
      
      const response = await fetch('http://localhost:4000/api/products');
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Products loaded:', data);
      setProducts(data);
      
    } catch (error) {
      console.error('❌ Error fetching products:', error.message);
      setError(`Failed to load products: ${error.message}. Make sure the backend is running on port 4000.`);
      
      // Fallback to mock data
      console.log('🔄 Using mock data as fallback...');
      const mockProducts = [
        { 
          id: 1, 
          name: "Wireless Headphones", 
          price: 99.99, 
          description: "High-quality wireless headphones with noise cancellation",
          image: "🎧"
        },
        { 
          id: 2, 
          name: "Smart Watch", 
          price: 199.99, 
          description: "Feature-rich smartwatch with health monitoring",
          image: "⌚"
        },
        { 
          id: 3, 
          name: "Laptop Backpack", 
          price: 49.99, 
          description: "Durable laptop backpack with USB charging port",
          image: "🎒"
        },
        { 
          id: 4, 
          name: "Bluetooth Speaker", 
          price: 79.99, 
          description: "Portable Bluetooth speaker with 360° sound",
          image: "🔊"
        },
        { 
          id: 5, 
          name: "Phone Case", 
          price: 24.99, 
          description: "Protective phone case with sleek design",
          image: "📱"
        },
        { 
          id: 6, 
          name: "Gaming Mouse", 
          price: 59.99, 
          description: "Precision gaming mouse with RGB lighting",
          image: "🖱️"
        },
        { 
          id: 7, 
          name: "Mechanical Keyboard", 
          price: 89.99, 
          description: "Tactile mechanical keyboard for typing enthusiasts",
          image: "⌨️"
        },
        { 
          id: 8, 
          name: "USB-C Hub", 
          price: 39.99, 
          description: "Multi-port USB-C hub for all your devices",
          image: "🔌"
        }
      ];
      setProducts(mockProducts);
      setError(null); // Clear error since we're using mock data
    } finally {
      setLoading(false);
    }
  };

  const fetchCartFromBackend = async () => {
    try {
      console.log('🔄 Fetching cart from backend...');
      const response = await fetch('http://localhost:4000/api/cart');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cart loaded:', data);
        setCart(data.items || data);
      } else {
        console.warn('⚠️ Could not fetch cart, using local state');
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
    }
  };

  const addToCart = async (product) => {
    try {
      console.log('➕ Adding to cart:', product.name);
      
      const response = await fetch('http://localhost:4000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          name: product.name,
          price: product.price
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      console.log('✅ Item added to cart, refreshing...');
      await fetchCartFromBackend();

    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      // Fallback to local state
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        setCart(cart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { 
          id: product.id,
          name: product.name, 
          price: product.price, 
          quantity: 1 
        }]);
      }
    }
  };

  const refreshCart = async () => {
    console.log('🔄 Manually refreshing cart...');
    await fetchCartFromBackend();
  };

  if (loading) {
    return (
      <div className="products-section">
        <h2>Products</h2>
        <div className="loading">
          <p>Loading products...</p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>Checking backend connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-section">
        <h2>Products</h2>
        <div className="error-message">
          <p>{error}</p>
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <button onClick={fetchProducts} className="retry-btn">
              Retry Products
            </button>
            <button onClick={refreshCart} className="retry-btn" style={{ marginLeft: '10px' }}>
              Refresh Cart
            </button>
          </div>
          <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
            <p><strong>Troubleshooting:</strong></p>
            <ul style={{ textAlign: 'left', margin: '10px 0' }}>
              <li>Is the backend server running on port 4000?</li>
              <li>Check browser console for detailed errors</li>
              <li>Try accessing http://localhost:4000/api/products directly</li>
            </ul>
          </div>
        </div>
        
        {/* Show products even with error (using mock data) */}
        {products.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Showing mock data (backend connection failed)
            </p>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="products-section">
      <h2>Products</h2>
      
      {/* Cart status section has been removed */}
      
      <div className="product-grid">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;