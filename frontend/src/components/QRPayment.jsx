import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import './QRPayment.css';

const QRPayment = ({ 
  amount, 
  orderId, 
  customerInfo, 
  onPaymentSuccess, 
  onPaymentError,
  onCancel 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    generateQRCode();
    startPaymentMonitoring();
    startTimer();
  }, []);

  const generateQRCode = async () => {
    try {
      const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setTransactionId(txnId);

      const upiUrl = `upi://pay?pa=ahalyatexile@upi&pn=Shri+Ahalya+Tex&am=${amount}&cu=INR&tn=Order+Payment&tr=${txnId}`;
      
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
      onPaymentError('Failed to generate QR code');
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('failed');
          onPaymentError('QR Code expired. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const startPaymentMonitoring = () => {
    let checkCount = 0;
    const maxChecks = 60; // 5 minutes

    const checkStatus = () => {
      checkCount++;
      
      // Simulate payment success after 30-45 seconds
      if (checkCount >= 6 && checkCount <= 9) {
        setPaymentStatus('completed');
        
        const paymentData = {
          success: true,
          transactionId: transactionId,
          paymentId: `PAY${Date.now()}`,
          orderId: orderId,
          amount: amount,
          customerInfo: customerInfo,
          timestamp: new Date().toISOString()
        };

        onPaymentSuccess(paymentData);
        return;
      }

      // Timeout after 5 minutes
      if (checkCount >= maxChecks) {
        setPaymentStatus('failed');
        onPaymentError('Payment timeout. Please try again.');
        return;
      }

      // Continue checking
      setTimeout(checkStatus, 5000);
    };

    // Start checking after 5 seconds
    setTimeout(checkStatus, 5000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleRefresh = () => {
    setTimeLeft(300);
    setPaymentStatus('pending');
    generateQRCode();
    startPaymentMonitoring();
    startTimer();
  };

  if (paymentStatus === 'completed') {
    return (
      <div className="qr-payment-success">
        <div className="success-icon">✅</div>
        <h2>Payment Successful!</h2>
        <p>Your payment has been confirmed and order will be processed.</p>
        <div className="success-details">
          <p><strong>Transaction ID:</strong> {transactionId}</p>
          <p><strong>Amount:</strong> ₹{amount.toLocaleString('en-IN')}</p>
          <p><strong>Order ID:</strong> {orderId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-payment">
      <div className="qr-header">
        <h2>Scan QR Code to Pay</h2>
        <p>Complete your payment using any UPI app</p>
      </div>

      <div className="qr-content">
        <div className="qr-code-container">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Payment QR Code" />
          ) : (
            <div className="qr-loading">Generating QR Code...</div>
          )}
        </div>

        <div className="payment-details">
          <div className="amount-display">
            <span className="amount-label">Amount to Pay</span>
            <span className="amount-value">₹{amount.toLocaleString('en-IN')}</span>
          </div>

          <div className="timer-display">
            <span className="timer-label">QR Code expires in:</span>
            <span className={`timer-value ${timeLeft < 60 ? 'warning' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="instructions">
            <h4>How to Pay:</h4>
            <ol>
              <li>Open any UPI app (PhonePe, GPay, Paytm)</li>
              <li>Scan the QR code above</li>
              <li>Enter amount ₹{amount.toLocaleString('en-IN')}</li>
              <li>Complete the payment</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="qr-actions">
        {paymentStatus === 'failed' ? (
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 Refresh QR Code
          </button>
        ) : (
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel Payment
          </button>
        )}
      </div>

      <div className="payment-status">
        {paymentStatus === 'pending' && (
          <div className="status-pending">
            <span className="status-icon">⏳</span>
            <span>Waiting for payment...</span>
          </div>
        )}
        {paymentStatus === 'processing' && (
          <div className="status-processing">
            <span className="status-icon">⚙️</span>
            <span>Processing payment...</span>
          </div>
        )}
        {paymentStatus === 'failed' && (
          <div className="status-failed">
            <span className="status-icon">❌</span>
            <span>Payment failed or expired</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPayment;
