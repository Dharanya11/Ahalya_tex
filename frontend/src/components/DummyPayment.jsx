import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DummyPayment.css';

const DummyPayment = ({ 
  cartItems, 
  totalPrice, 
  user, 
  onPaymentSuccess, 
  onOrderCreated 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('initial'); // 'initial', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleDummyPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentResult = {
        success: true,
        paymentId: `PAY_${Date.now()}`,
        amount: totalPrice,
        method: 'dummy_payment',
        timestamp: new Date().toISOString()
      };

      setPaymentStatus('success');

      // Create order after successful payment
      const orderData = {
        user: {
          id: user?.id || 'guest',
          name: user?.name || 'Guest User',
          email: user?.email || 'guest@example.com',
          phone: user?.phone || '',
          address: user?.address || ''
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        })),
        totalPrice: totalPrice,
        paymentDetails: {
          paymentId: paymentResult.paymentId,
          method: paymentResult.method,
          status: 'Paid',
          amount: paymentResult.amount,
          timestamp: paymentResult.timestamp
        },
        orderStatus: 'Processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Call order creation function
      await createOrder(orderData);

      // Notify parent components
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentResult);
      }

      if (onOrderCreated) {
        onOrderCreated(orderData);
      }

      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      // Try to save to backend API first
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user?.token ? `Bearer ${user.token}` : '',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const savedOrder = await response.json();
        console.log('Order saved to backend:', savedOrder);
        return savedOrder;
      } else {
        // If backend fails, save to localStorage as fallback
        console.warn('Backend order creation failed, using localStorage fallback');
        saveOrderToLocalStorage(orderData);
        return orderData;
      }
    } catch (error) {
      console.error('Backend order creation error:', error);
      // Fallback to localStorage
      saveOrderToLocalStorage(orderData);
      return orderData;
    }
  };

  const saveOrderToLocalStorage = (orderData) => {
    try {
      // Get existing orders from localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Add new order with unique ID
      const newOrder = {
        ...orderData,
        _id: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Save to localStorage
      existingOrders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      console.log('Order saved to localStorage:', newOrder);
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="dummy-payment-success">
        <div className="success-icon">✅</div>
        <h2>Payment successful. Your order has been placed.</h2>
        <p>Redirecting to your orders...</p>
        <div className="order-summary">
          <p><strong>Order ID:</strong> {`ORD_${Date.now()}`}</p>
          <p><strong>Amount Paid:</strong> {formatPrice(totalPrice)}</p>
          <p><strong>Payment Method:</strong> Dummy Payment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dummy-payment">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Complete Your Payment</h2>
          <div className="total-amount">
            <span>Total Amount:</span>
            <span className="amount">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <div className="payment-method">
          <h3>Payment Method</h3>
          <div className="method-info">
            <div className="method-icon">💳</div>
            <div className="method-details">
              <h4>Dummy Payment</h4>
              <p>This is a test payment simulation for demo purposes</p>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map((item, index) => (
              <div key={index} className="summary-item">
                <span className="item-name">{item.name}</span>
                <span className="item-price">
                  {item.quantity} × {formatPrice(item.price)} = {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span className="total">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {errorMessage}
          </div>
        )}

        <button
          className={`pay-now-btn ${isProcessing ? 'processing' : ''}`}
          onClick={handleDummyPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processing Payment...
            </>
          ) : (
            'Pay Now'
          )}
        </button>

        <div className="payment-note">
          <p>🔒 This is a secure dummy payment simulation</p>
          <p>No actual charges will be made</p>
        </div>
      </div>
    </div>
  );
};

export default DummyPayment;
