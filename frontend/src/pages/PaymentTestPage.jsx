import React, { useState } from 'react';
import SimplePayment from '../components/SimplePayment';
import './PaymentTestPage.css';

const PaymentTestPage = () => {
  const [testAmount, setTestAmount] = useState(1000);
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePaymentComplete = (result) => {
    console.log('Payment completed:', result);
    setPaymentResult(result);
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentResult({ success: false, error: error });
  };

  const resetTest = () => {
    setPaymentResult(null);
  };

  return (
    <div className="payment-test-page">
      <div className="test-header">
        <h1>Payment System Test</h1>
        <p>Test the payment functionality with different amounts</p>
      </div>

      <div className="test-controls">
        <div className="amount-control">
          <label>Test Amount (₹):</label>
          <input
            type="number"
            value={testAmount}
            onChange={(e) => setTestAmount(Number(e.target.value))}
            min="1"
            max="100000"
            step="0.01"
          />
        </div>
        <button className="reset-btn" onClick={resetTest}>
          Reset Test
        </button>
      </div>

      <div className="payment-container">
        {!paymentResult ? (
          <SimplePayment
            totalAmount={testAmount}
            onPaymentComplete={handlePaymentComplete}
            onPaymentError={handlePaymentError}
          />
        ) : (
          <div className="payment-result">
            {paymentResult.success ? (
              <div className="result-success">
                <h2>✅ Payment Successful!</h2>
                <div className="result-details">
                  <p><strong>Amount:</strong> ₹{paymentResult.amount?.toFixed(2) || testAmount.toFixed(2)}</p>
                  <p><strong>Payment ID:</strong> {paymentResult.paymentId}</p>
                  <p><strong>Order ID:</strong> {paymentResult.orderId}</p>
                  <p><strong>Method:</strong> {paymentResult.method}</p>
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                </div>
                <button className="btn btn-primary" onClick={resetTest}>
                  Test Again
                </button>
              </div>
            ) : (
              <div className="result-error">
                <h2>❌ Payment Failed</h2>
                <p>{paymentResult.error}</p>
                <button className="btn btn-primary" onClick={resetTest}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="test-info">
        <h3>Test Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Payment Methods</h4>
            <ul>
              <li>QR Code Payment - Test UPI QR flow</li>
              <li>UPI - Test direct UPI payment</li>
              <li>Credit/Debit Card - Test card payment flow</li>
              <li>Net Banking - Test bank transfer flow</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>Test Scenarios</h4>
            <ul>
              <li>Valid payment amount</li>
              <li>Payment method selection</li>
              <li>Payment processing simulation</li>
              <li>Success/error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTestPage;
