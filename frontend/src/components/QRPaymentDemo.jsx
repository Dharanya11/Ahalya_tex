import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import './QRPaymentDemo.css';

const QRPaymentDemo = ({ totalAmount = 100 }) => {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('initial'); // 'initial', 'waiting', 'success'
  const [isGenerating, setIsGenerating] = useState(false);
  
  const upiLink = "upi://pay?pa=demo@upi&pn=CollegeProject&am=100";

  useEffect(() => {
    if (paymentStatus === 'waiting') {
      const timer = setTimeout(() => {
        setPaymentStatus('success');
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handlePayNow = async () => {
    setIsGenerating(true);
    
    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(upiLink, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrDataUrl(qrDataUrl);
      setShowQR(true);
      setPaymentStatus('waiting');
    } catch (err) {
      console.error('QR Code generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPayment = () => {
    setShowQR(false);
    setPaymentStatus('initial');
    setQrDataUrl('');
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
    <div className="qr-payment-demo">
      <div className="payment-card">
        {/* Header */}
        <div className="payment-header">
          <h1>QR Code Payment</h1>
          <div className="amount-display">
            <span className="amount-label">Total Amount:</span>
            <span className="amount-value">{formatAmount(totalAmount)}</span>
          </div>
        </div>

        {/* Initial State */}
        {!showQR && (
          <div className="payment-initial">
            <div className="payment-info">
              <div className="qr-icon">📱</div>
              <h2>Pay with QR Code</h2>
              <p>Click "Pay Now" to generate a QR code for secure payment</p>
            </div>
            
            <button 
              className="pay-now-btn"
              onClick={handlePayNow}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating QR Code...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        )}

        {/* QR Code Display */}
        {showQR && paymentStatus === 'waiting' && (
          <div className="qr-display">
            <div className="qr-code-container">
              <div className="qr-code-wrapper">
                <img 
                  src={qrDataUrl} 
                  alt="UPI Payment QR Code" 
                  className="qr-code-image"
                />
              </div>
              
              <div className="qr-instructions">
                <h3>Scan this QR code using any UPI app to make the payment.</h3>
                <p className="apps-text">Use PhonePe, Google Pay, Paytm or any UPI app</p>
              </div>
              
              <div className="waiting-message">
                <div className="loading-spinner">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <p>Waiting for payment confirmation...</p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {paymentStatus === 'success' && (
          <div className="payment-success">
            <div className="success-icon">✅</div>
            <h2>Payment Successful ✅</h2>
            <p>Your payment has been processed successfully!</p>
            <div className="success-details">
              <p><strong>Amount:</strong> {formatAmount(totalAmount)}</p>
              <p><strong>Payment Method:</strong> QR Code Payment</p>
              <p><strong>Transaction ID:</strong> {`TXN${Date.now()}`}</p>
            </div>
            <button className="new-payment-btn" onClick={resetPayment}>
              Make New Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPaymentDemo;
