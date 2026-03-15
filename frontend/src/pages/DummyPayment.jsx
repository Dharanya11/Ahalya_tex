import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Footer from '../components/Footer';
import './DummyPayment.css';

export default function DummyPayment() {
  const [step, setStep] = useState('qr'); // 'qr', 'login', 'success'
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate QR Code on component mount
  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      // Dummy UPI payment URL
      const upiUrl = `upi://pay?pa=ahalyatexile@upi&pn=Ahalya%20Texile&am=999&cu=INR&tn=Order%20Payment`;
      const qrUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#2d3748', light: '#ffffff' }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate order details
    const order = {
      orderId: `ORD${Date.now().toString(36).toUpperCase()}`,
      transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: 999,
      name: formData.name,
      email: formData.email,
      date: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    };
    
    setOrderDetails(order);
    setIsProcessing(false);
    setStep('success');
  };

  const handleIHavePaid = () => {
    setStep('login');
  };

  return (
    <div className="dummy-payment-page">
      <div className="payment-container">
        {/* Header */}
        <div className="payment-header">
          <h1>Payment</h1>
          <div className="amount-display">
            <span className="amount-label">Amount to Pay</span>
            <span className="amount-value">₹999</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step === 'qr' ? 'active' : ''} ${step !== 'qr' ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Scan QR</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step === 'login' ? 'active' : ''} ${step === 'success' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Confirm</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step === 'success' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Done</span>
          </div>
        </div>

        {/* QR Code Step */}
        {step === 'qr' && (
          <div className="payment-step qr-step">
            <div className="qr-section">
              <div className="qr-instructions">
                <h2>Scan the QR Code to Make Payment</h2>
                <p>Use any UPI app (PhonePe, Google Pay, Paytm, etc.) to scan and pay</p>
              </div>
              
              <div className="qr-code-wrapper">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Payment QR Code" className="qr-image" />
                ) : (
                  <div className="qr-loading">Generating QR Code...</div>
                )}
              </div>
              
              <div className="upi-apps">
                <span>Supported Apps:</span>
                <div className="app-icons">
                  <span className="app-badge">PhonePe</span>
                  <span className="app-badge">Google Pay</span>
                  <span className="app-badge">Paytm</span>
                  <span className="app-badge">BHIM</span>
                </div>
              </div>
            </div>

            <button className="btn-primary btn-paid" onClick={handleIHavePaid}>
              <span className="btn-icon">✓</span>
              I Have Paid
            </button>

            <p className="help-text">
              After making the payment, click the button above to confirm your order.
            </p>
          </div>
        )}

        {/* Login/Confirmation Step */}
        {step === 'login' && (
          <div className="payment-step login-step">
            <div className="login-header">
              <h2>Confirm Your Payment</h2>
              <p>Enter your details to complete the order</p>
            </div>

            <form className="login-form" onSubmit={handleConfirmPayment}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-confirm"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">🔒</span>
                    Confirm Payment
                  </>
                )}
              </button>
            </form>

            <button 
              className="btn-back" 
              onClick={() => setStep('qr')}
              disabled={isProcessing}
            >
              ← Back to QR Code
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && orderDetails && (
          <div className="payment-step success-step">
            <div className="success-icon-wrapper">
              <div className="success-icon">✓</div>
            </div>
            
            <h2>Payment Successful!</h2>
            <p className="success-message">Your payment has been confirmed successfully.</p>

            <div className="order-confirmation">
              <h3>Order Confirmation</h3>
              
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">{orderDetails.orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value">{orderDetails.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Paid</span>
                  <span className="detail-value amount">₹{orderDetails.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{orderDetails.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{orderDetails.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{orderDetails.date}</span>
                </div>
              </div>

              <div className="confirmation-note">
                <span className="note-icon">📧</span>
                <p>A confirmation email has been sent to {orderDetails.email}</p>
              </div>
            </div>

            <div className="success-actions">
              <button 
                className="btn-primary"
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setStep('qr');
                  setFormData({ name: '', email: '' });
                  setOrderDetails(null);
                }}
              >
                Make Another Payment
              </button>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="security-badge">
          <span className="security-icon">🔒</span>
          <span>Secure Payment - Demo Mode</span>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
