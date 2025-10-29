// In Receipt.js - Update the continue shopping button
import React from 'react';

const Receipt = ({ receipt, onClose }) => {
  return (
    <div className="receipt-modal">
      <div className="receipt-content">
        <h2>🎉 Order Confirmed!</h2>
        <div className="receipt-details">
          <p><strong>Order ID:</strong> {receipt.orderId}</p>
          <p><strong>Customer:</strong> {receipt.customer.name}</p>
          <p><strong>Email:</strong> {receipt.customer.email}</p>
          <p><strong>Order Date:</strong> {receipt.timestamp}</p>
          
          <h3>Order Summary:</h3>
          {receipt.items.map(item => (
            <div key={item.id} className="receipt-item">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="receipt-total">
            <strong>Total: ${receipt.total.toFixed(2)}</strong>
          </div>
        </div>
        
        <div className="receipt-actions">
          <button onClick={onClose} className="continue-shopping-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;