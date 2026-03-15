import React, { useState } from 'react';
import PaymentMethodSelector from './PaymentMethodSelector';

const PaymentTest = () => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handlePaymentMethodChange = (method) => {
    addLog(`Payment method selected: ${method}`);
    setSelectedMethod(method);
  };

  const handlePayNow = async (paymentMethod) => {
    addLog(`Pay Now clicked with method: ${paymentMethod}`);
    
    // Simulate payment processing
    addLog('Processing payment...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (paymentMethod === 'qr_upi') {
      addLog('QR Code payment flow initiated');
    } else if (paymentMethod === 'upi') {
      addLog('UPI payment flow initiated');
    } else if (paymentMethod === 'card') {
      addLog('Card payment flow initiated');
    } else if (paymentMethod === 'netbanking') {
      addLog('Net Banking payment flow initiated');
    }
    
    addLog('Payment processing completed (test mode)');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Payment Method Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Test Payment Methods</h2>
        <PaymentMethodSelector
          selectedMethod={selectedMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
          onPayNow={handlePayNow}
          totalAmount={100}
          isLoading={false}
          customerInfo={{
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Activity Log</h3>
          <button 
            onClick={clearLogs}
            style={{
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Log
          </button>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '10px',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#6c757d' }}>No activity yet. Try clicking on payment methods.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '4px' }}>
        <h3>Test Instructions</h3>
        <ol>
          <li>Click on any payment method (QR Code, UPI, Card, Net Banking)</li>
          <li>Observe the activity log to see if the selection is registered</li>
          <li>Click the "Pay Now" button</li>
          <li>Check if the payment processing starts correctly</li>
        </ol>
        
        <p><strong>Expected behavior:</strong></p>
        <ul>
          <li>Payment method should be highlighted when selected</li>
          <li>Activity log should show selection events</li>
          <li>Pay Now button should trigger payment processing</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTest;
