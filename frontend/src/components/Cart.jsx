import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import DummyPayment from './DummyPayment';
import { clearCart as clearCartUtil } from '../utils/cartUtils';
import './CartPaymentModal.css';

export default function Cart({ setCurrentPage }) {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    // Clear cart after successful payment
    clearCart();
    clearCartUtil();
  };

  const handleOrderCreated = (orderData) => {
    console.log('Order created:', orderData);
    // Navigation will be handled by DummyPayment component
  };

  const handleRemove = (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart(itemId);
    }
  };

  // Show payment modal if checkout is initiated
  if (showPayment) {
    return (
      <div className="payment-modal-overlay">
        <div className="payment-modal">
          <button 
            className="close-modal-btn"
            onClick={() => setShowPayment(false)}
          >
            ×
          </button>
          <DummyPayment
            cartItems={cartItems}
            totalPrice={getTotalPrice()}
            user={user}
            onPaymentSuccess={handlePaymentSuccess}
            onOrderCreated={handleOrderCreated}
          />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to get started!</p>
          <button 
            className="shop-now-btn"
            onClick={() => setCurrentPage('home')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image || '/hero.png'} alt={item.name} />
                </div>
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <div className="cart-item-specs">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  <p className="cart-item-price">₹ {item.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="cart-item-quantity">
                  <label>Qty:</label>
                  <div className="quantity-selector">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="qty-btn"
                    >
                      -
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-total">
                  <p>₹ {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>

                <button 
                  className="remove-item-btn"
                  onClick={() => handleRemove(item.id)}
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹ {getTotalPrice().toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <span>₹ {getTotalPrice().toLocaleString('en-IN')}</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            <button 
              className="continue-shopping-btn"
              onClick={() => setCurrentPage('home')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
