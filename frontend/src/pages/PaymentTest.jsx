import React, { useState } from 'react';
import { PaymentCalculator } from '../utils/paymentCalculator';
import { PaymentValidation } from '../utils/paymentValidation';
import SecureCheckout from '../components/SecureCheckout';
import './PaymentTest.css';

const PaymentTest = () => {
  const [testMode, setTestMode] = useState('single'); // single, multiple, checkout
  const [inputData, setInputData] = useState({
    price: 500,
    quantity: 2,
    discount: 10,
    tax: 18,
    shipping: 50
  });
  
  const [multipleItems, setMultipleItems] = useState([
    { id: 1, name: 'Product A', price: 500, quantity: 2, discount: 10 },
    { id: 2, name: 'Product B', price: 300, quantity: 1, discount: 5 },
    { id: 3, name: 'Product C', price: 200, quantity: 3, discount: 15 }
  ]);

  const [calculationResult, setCalculationResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock user for testing
  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    token: 'mock_token_123'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setInputData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleMultipleItemChange = (index, field, value) => {
    const numValue = field === 'name' ? value : parseFloat(value) || 0;
    setMultipleItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: numValue };
      return updated;
    });
  };

  const calculateSingleItem = () => {
    try {
      setLoading(true);
      setError(null);
      setValidationResult(null);

      // Validate inputs
      const validation = PaymentCalculator.validateInputs(
        inputData.price,
        inputData.quantity,
        inputData.discount,
        inputData.tax,
        inputData.shipping
      );

      setValidationResult(validation);

      if (!validation.isValid) {
        setError('Validation failed: ' + validation.errors.join(', '));
        return;
      }

      // Calculate payment
      const result = PaymentCalculator.calculatePayment(inputData);
      setCalculationResult(result);

    } catch (err) {
      setError(err.message);
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMultipleItems = () => {
    try {
      setLoading(true);
      setError(null);
      setValidationResult(null);

      // Validate items
      const validation = PaymentValidation.validateCart(multipleItems);
      setValidationResult(validation);

      if (!validation.isValid) {
        setError('Cart validation failed: ' + validation.errors.join(', '));
        return;
      }

      // Calculate payment
      const result = PaymentCalculator.calculateMultipleItems(multipleItems, 18, 50);
      setCalculationResult(result);

    } catch (err) {
      setError(err.message);
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setCalculationResult(null);
    setValidationResult(null);
    setError(null);
  };

  const renderSingleItemTest = () => (
    <div className="test-section">
      <h3>Single Item Payment Calculation</h3>
      
      <div className="input-grid">
        <div className="input-group">
          <label>Product Price (₹)</label>
          <input
            type="number"
            name="price"
            value={inputData.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="input-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={inputData.quantity}
            onChange={handleInputChange}
            min="1"
            step="1"
          />
        </div>
        
        <div className="input-group">
          <label>Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={inputData.discount}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        
        <div className="input-group">
          <label>GST Tax (%)</label>
          <input
            type="number"
            name="tax"
            value={inputData.tax}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        
        <div className="input-group">
          <label>Shipping (₹)</label>
          <input
            type="number"
            name="shipping"
            value={inputData.shipping}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="test-actions">
        <button className="btn btn-primary" onClick={calculateSingleItem} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Payment'}
        </button>
        <button className="btn btn-secondary" onClick={clearResults}>
          Clear Results
        </button>
      </div>
    </div>
  );

  const renderMultipleItemsTest = () => (
    <div className="test-section">
      <h3>Multiple Items Payment Calculation</h3>
      
      <div className="items-table">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price (₹)</th>
              <th>Quantity</th>
              <th>Discount (%)</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {multipleItems.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleMultipleItemChange(index, 'name', e.target.value)}
                    className="item-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleMultipleItemChange(index, 'price', e.target.value)}
                    className="item-input"
                    step="0.01"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleMultipleItemChange(index, 'quantity', e.target.value)}
                    className="item-input"
                    min="1"
                    step="1"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.discount}
                    onChange={(e) => handleMultipleItemChange(index, 'discount', e.target.value)}
                    className="item-input"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </td>
                <td>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="test-info">
        <p><strong>Tax:</strong> 18% GST (applied on total after discount)</p>
        <p><strong>Shipping:</strong> ₹50 (fixed)</p>
      </div>

      <div className="test-actions">
        <button className="btn btn-primary" onClick={calculateMultipleItems} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Total Payment'}
        </button>
        <button className="btn btn-secondary" onClick={clearResults}>
          Clear Results
        </button>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!calculationResult) return null;

    const { calculation, breakdown } = calculationResult;

    return (
      <div className="results-section">
        <h3>Calculation Results</h3>
        
        <div className="result-card">
          <h4>Payment Breakdown</h4>
          <div className="breakdown-grid">
            <div className="breakdown-row">
              <span>Subtotal:</span>
              <span>₹{calculation.subtotal.toFixed(2)}</span>
            </div>
            <div className="breakdown-row discount">
              <span>Discount ({calculation.discount.percentage}%):</span>
              <span>-₹{calculation.discount.amount.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Tax ({calculation.tax.percentage}%):</span>
              <span>₹{calculation.tax.amount.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Shipping:</span>
              <span>₹{calculation.shipping.toFixed(2)}</span>
            </div>
            <div className="breakdown-row total">
              <span>Total Amount:</span>
              <span>₹{calculation.final_total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="result-card">
          <h4>JSON Output</h4>
          <pre className="json-output">
            {JSON.stringify(breakdown, null, 2)}
          </pre>
        </div>

        {validationResult && (
          <div className="result-card">
            <h4>Validation Results</h4>
            <div className={`validation-status ${validationResult.isValid ? 'valid' : 'invalid'}`}>
              <span className="status-icon">
                {validationResult.isValid ? '✅' : '❌'}
              </span>
              <span className="status-text">
                {validationResult.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            
            {validationResult.errors && validationResult.errors.length > 0 && (
              <div className="validation-errors">
                <h5>Errors:</h5>
                <ul>
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="error-item">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="validation-warnings">
                <h5>Warnings:</h5>
                <ul>
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="warning-item">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCheckoutTest = () => (
    <div className="checkout-test">
      <h3>Complete Checkout Process</h3>
      <p>Test the full checkout flow with payment processing:</p>
      
      <div className="checkout-demo">
        <SecureCheckout
          items={multipleItems}
          user={mockUser}
          tax={18}
          shipping={50}
          onCheckoutComplete={(result) => {
            console.log('Checkout completed:', result);
            alert('Checkout completed successfully! Check console for details.');
          }}
          onCheckoutError={(error) => {
            console.error('Checkout error:', error);
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="payment-test">
      <div className="test-header">
        <h1>Payment Calculation & Checkout Test</h1>
        <p>Test the secure payment calculation and checkout system</p>
      </div>

      <div className="test-modes">
        <div className="mode-tabs">
          <button
            className={`mode-tab ${testMode === 'single' ? 'active' : ''}`}
            onClick={() => setTestMode('single')}
          >
            Single Item
          </button>
          <button
            className={`mode-tab ${testMode === 'multiple' ? 'active' : ''}`}
            onClick={() => setTestMode('multiple')}
          >
            Multiple Items
          </button>
          <button
            className={`mode-tab ${testMode === 'checkout' ? 'active' : ''}`}
            onClick={() => setTestMode('checkout')}
          >
            Full Checkout
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="test-content">
        {testMode === 'single' && renderSingleItemTest()}
        {testMode === 'multiple' && renderMultipleItemsTest()}
        {testMode === 'checkout' && renderCheckoutTest()}
      </div>

      {calculationResult && renderResults()}
    </div>
  );
};

export default PaymentTest;
