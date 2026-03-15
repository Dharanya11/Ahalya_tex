import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import './SimplePaymentPage.css';

const SimplePaymentPage = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loginForm, setLoginForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Mock order data
  const orderData = {
    orderId: `ORD${Date.now().toString(36).toUpperCase()}`,
    items: [
      {
        name: 'Premium Cotton Saree',
        quantity: 2,
        price: 500,
        size: 'M',
        color: 'Maroon'
      },
      {
        name: 'Silk Blouse',
        quantity: 1,
        price: 800,
        size: 'L',
        color: 'Blue'
      }
    ],
    subtotal: 1800,
    tax: 324,
    shipping: 50,
    total: 2174
  };

  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
    
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generateQRCode = async () => {
    try {
      const upiUrl = `upi://pay?pa=ahalyatexile@upi&pn=Shri+Ahalya+Tex&am=${orderData.total}&cu=INR&tn=Order+Payment&tr=TXN${Date.now()}`;
      
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#8B5A2B',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleHavePaid = () => {
    setShowLoginForm(true);
    setShowSuccess(false);
    setLoginForm({ name: '', email: '', phone: '' });
    setLoginErrors({});
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (loginErrors[name]) {
      setLoginErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!loginForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      errors.email = 'Invalid email format';
    }

    if (!loginForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(loginForm.phone)) {
      errors.phone = 'Phone must be 10 digits';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmPayment = async () => {
    if (!validateLoginForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment confirmation
    setTimeout(() => {
      const paymentConfirmation = {
        orderId: orderData.orderId,
        amount: orderData.total,
        paymentId: `PAY${Date.now()}`,
        transactionId: `TXN${Date.now()}`,
        customerName: loginForm.name,
        customerEmail: loginForm.email,
        customerPhone: loginForm.phone,
        paymentMethod: 'UPI QR',
        status: 'completed',
        timestamp: new Date().toISOString(),
        items: orderData.items
      };

      setPaymentData(paymentConfirmation);
      setShowSuccess(true);
      setShowLoginForm(false);
      setIsProcessing(false);
      
      console.log('Payment confirmed:', paymentConfirmation);
    }, 2000);
  };

  const resetPayment = () => {
    setShowLoginForm(false);
    setShowSuccess(false);
    setLoginForm({ name: '', email: '', phone: '' });
    setLoginErrors({});
    setPaymentData(null);
    setTimeLeft(300);
    generateQRCode();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (showSuccess) {
    return (
      <div className="simple-payment-page">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Thank you for your payment. Your order has been confirmed and will be processed shortly.
          </p>
          
          <div className="order-confirmation">
            <h2>Order Confirmation</h2>
            <div className="order-details">
              <div className="detail-row">
                <span className="label">Order ID:</span>
                <span className="value">{paymentData?.orderId || orderData.orderId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment ID:</span>
                <span className="value">{paymentData?.paymentId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount Paid:</span>
                <span className="value">₹{paymentData?.amount?.toLocaleString('en-IN') || orderData.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Customer Name:</span>
                <span className="value">{paymentData?.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{paymentData?.customerEmail}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{paymentData?.customerPhone}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="value">{paymentData?.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Time:</span>
                <span className="value">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="order-items">
            <h3>Order Items</h3>
            {paymentData?.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-specs">
                    {item.size && `Size: ${item.size}`}
                    {item.size && item.color && ` | `}
                    {item.color && `Color: ${item.color}`}
                  </span>
                </div>
                <div className="item-price">
                  <span className="item-quantity">Qty: {item.quantity}</span>
                  <span className="item-total">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{orderData.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Tax (18%):</span>
              <span>₹{orderData.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>₹{orderData.shipping.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{orderData.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div className="success-actions">
            <button className="btn btn-primary" onClick={resetPayment}>
              Make Another Payment
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h1>Secure Checkout</h1>
          <p className="payment-subtitle">Complete your purchase securely with UPI payment</p>
          <div className="order-summary-header">
            <span className="order-id">Order #{orderData.orderId}</span>
            <span className="order-total">₹{orderData.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {!showLoginForm ? (
          <div className="qr-section">
            <div className="qr-container">
              <div className="qr-code">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Payment QR Code" />
                ) : (
                  <div className="qr-loading">Generating QR Code...</div>
                )}
              </div>
              <div className="qr-instructions">
                <h2>Scan QR Code to Make Payment</h2>
                <div className="instructions">
                  <div className="instruction-step">
                    <span className="step-number">1</span>
                    <span className="step-text">Open any UPI app (PhonePe, GPay, Paytm, etc.)</span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">2</span>
                    <span className="step-text">Scan the QR code above</span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">3</span>
                    <span className="step-text">Enter amount ₹{orderData.total.toLocaleString('en-IN')} and complete payment</span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-number">4</span>
                    <span className="step-text">Click "I Have Paid" button below</span>
                  </div>
                </div>
              </div>

              <div className="payment-timer">
                <div className="timer-display">
                  <span className="timer-label">QR Code expires in:</span>
                  <span className={`timer-value ${timeLeft < 60 ? 'warning' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="payment-amount">
                <div className="amount-display">
                  <span className="amount-label">Total Amount</span>
                  <span className="amount-value">₹{orderData.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="have-paid-section">
              <button 
                className="have-paid-btn"
                onClick={handleHavePaid}
                disabled={timeLeft === 0}
              >
                <span className="btn-icon">✓</span>
                I Have Paid
              </button>
              {timeLeft === 0 && (
                <div className="qr-expired">
                  <span className="expired-icon">⏰</span>
                  <span className="expired-text">QR Code expired. Please refresh to get a new QR code.</span>
                  <button className="refresh-btn" onClick={resetPayment}>
                    Refresh QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="login-section">
            <div className="login-header">
              <h2>Confirm Your Payment</h2>
              <p>Please enter your details to confirm the payment of ₹{orderData.total.toLocaleString('en-IN')}</p>
            </div>

            <div className="login-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={loginForm.name}
                  onChange={handleLoginChange}
                  className={`form-input ${loginErrors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                />
                {loginErrors.name && (
                  <span className="error-message">{loginErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className={`form-input ${loginErrors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                />
                {loginErrors.email && (
                  <span className="error-message">{loginErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={loginForm.phone}
                  onChange={handleLoginChange}
                  className={`form-input ${loginErrors.phone ? 'error' : ''}`}
                  placeholder="Enter your 10-digit phone number"
                  maxLength="10"
                />
                {loginErrors.phone && (
                  <span className="error-message">{loginErrors.phone}</span>
                )}
              </div>

              <div className="login-actions">
                <button 
                  className="btn btn-primary confirm-btn"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="btn-spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      Confirm Payment
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-secondary back-btn"
                  onClick={resetPayment}
                  disabled={isProcessing}
                >
                  Back to QR Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="payment-footer">
        <div className="security-info">
          <span className="security-icon">🔒</span>
          <span className="security-text">Secure payment powered by Shri Ahalya Tex</span>
        </div>
        <div className="support-info">
          <span className="support-icon">📞</span>
          <span className="support-text">Need help? Contact us at +91-9876543210</span>
        </div>
      </div>
    </div>
  );
};

export default SimplePaymentPage;
