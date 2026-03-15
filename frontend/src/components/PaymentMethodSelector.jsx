import React, { useState } from 'react';
import './PaymentMethodSelector.css';

const PaymentMethodSelector = ({ 
  onPaymentMethodChange, 
  onPayNow, 
  selectedMethod, 
  totalAmount, 
  isLoading = false,
  customerInfo = {}
}) => {
  const [localSelectedMethod, setLocalSelectedMethod] = useState(selectedMethod || '');
  const [error, setError] = useState('');

  const paymentMethods = [
    {
      id: 'qr_upi',
      name: 'QR Code Payment',
      icon: '📱',
      description: 'Scan QR code with any UPI app',
      razorpayMethod: 'upi'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '💚',
      description: 'Pay with PhonePe, GPay, Paytm',
      razorpayMethod: 'upi'
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, Rupay',
      razorpayMethod: 'card'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'All major banks supported',
      razorpayMethod: 'netbanking'
    }
  ];

  const handlePaymentMethodChange = (method) => {
    console.log('Payment method clicked:', method);
    setLocalSelectedMethod(method);
    setError('');
    
    if (onPaymentMethodChange) {
      try {
        onPaymentMethodChange(method);
        console.log('Payment method change callback executed successfully');
      } catch (error) {
        console.error('Error in payment method change callback:', error);
        setError('Failed to select payment method. Please try again.');
      }
    }
  };

  const validateAndPay = () => {
    console.log('Pay Now clicked in PaymentMethodSelector');
    console.log('Selected method:', localSelectedMethod);
    console.log('Total amount:', totalAmount);
    
    if (!localSelectedMethod) {
      console.log('No payment method selected');
      setError('Please select a payment method');
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      console.log('Invalid amount:', totalAmount);
      setError('Invalid payment amount');
      return;
    }

    if (onPayNow) {
      try {
        console.log('Calling onPayNow callback...');
        onPayNow(localSelectedMethod);
        console.log('onPayNow callback executed successfully');
      } catch (error) {
        console.error('Error in onPayNow callback:', error);
        setError('Failed to process payment. Please try again.');
      }
    } else {
      console.error('onPayNow callback is not defined');
      setError('Payment processing not available. Please refresh the page.');
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="payment-method-selector">
      <div className="payment-header">
        <h2>Select Payment Method</h2>
        <div className="payment-amount">
          <span className="amount-label">Total Amount:</span>
          <span className="amount-value">{formatAmount(totalAmount)}</span>
        </div>
      </div>

      <div className="payment-options">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-option ${localSelectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodChange(method.id)}
          >
            <div className="payment-option-content">
              <div className="payment-option-radio">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={localSelectedMethod === method.id}
                  onChange={() => handlePaymentMethodChange(method.id)}
                />
                <span className="radio-custom"></span>
              </div>
              
              <div className="payment-option-icon">
                <span>{method.icon}</span>
              </div>
              
              <div className="payment-option-details">
                <h3>{method.name}</h3>
                <p>{method.description}</p>
              </div>
              
              <div className="payment-option-badge">
                {localSelectedMethod === method.id && (
                  <span className="selected-badge">Selected</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="payment-error">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="error-close" onClick={() => setError('')}>
            ×
          </button>
        </div>
      )}

      <div className="payment-actions">
        <button
          className={`pay-now-btn ${localSelectedMethod ? 'active' : 'disabled'}`}
          onClick={validateAndPay}
          disabled={isLoading || !localSelectedMethod}
        >
          {isLoading ? (
            <>
              <span className="btn-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              <span className="pay-icon">💳</span>
              Pay Now
            </>
          )}
        </button>
      </div>

      <div className="payment-security">
        <div className="security-info">
          <span className="security-icon">🔒</span>
          <span className="security-text">
            Secure payment powered by Razorpay
          </span>
        </div>
        <div className="supported-methods">
          <span className="methods-label">Supported methods:</span>
          <div className="method-icons">
            <span title="UPI">💚</span>
            <span title="Cards">💳</span>
            <span title="Net Banking">🏦</span>
            <span title="QR Code">📱</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
