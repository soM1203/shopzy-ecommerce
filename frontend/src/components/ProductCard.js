// frontend/src/components/ProductCard.js
import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  // Use real image if available, otherwise use emoji
  const displayImage = product.image && !product.image.includes('http') 
    ? <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{product.image}</div>
    : <img 
        src={product.image} 
        alt={product.name}
        style={{ 
          width: '100%', 
          height: '200px', 
          objectFit: 'contain',
          marginBottom: '15px',
          borderRadius: '8px'
        }}
      />;

  return (
    <div className="product-card">
      {displayImage}
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
      <p className="description">
        {product.description.length > 100 
          ? `${product.description.substring(0, 100)}...` 
          : product.description
        }
      </p>
      
      {/* Show rating if available */}
      {product.rating && (
        <div className="product-rating" style={{ margin: '10px 0', fontSize: '0.9em' }}>
          ⭐ {product.rating.rate} ({product.rating.count} reviews)
        </div>
      )}
      
      {/* Show category if available */}
      {product.category && (
        <div className="product-category" style={{ 
          background: '#f0f0f0', 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '0.8em',
          display: 'inline-block',
          marginBottom: '10px'
        }}>
          {product.category}
        </div>
      )}
      
      <button 
        onClick={() => onAddToCart(product)}
        className="add-to-cart-btn"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;