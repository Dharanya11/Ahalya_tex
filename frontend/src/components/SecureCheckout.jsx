import React, { useState, useEffect } from 'react';
import { PaymentCalculator } from '../utils/paymentCalculator';
import { PaymentValidation } from '../utils/paymentValidation';
import { paymentService, generateOrderId, handlePaymentError } from '../services/paymentService';
import OrderSummary from './OrderSummary';
import './SecureCheckout.css';

const SecureCheckout = ({ 
  items = [], 
  user = null,
  tax = 18, 
  shipping = 0,
  onCheckoutComplete,
  onCheckoutError 
}) => {
  // State management
  const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment, 4: Processing, 5: Complete
  const [calculation, setCalculation] = useState(null);
  const [validation, setValidation] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warnings, setWarnings] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    shippingAddress: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    paymentMethod: 'qr_upi',
    saveCard: false,
    cardholderConsent: false
  });

  // Initialize calculation
  useEffect(() => {
    if (items.length > 0) {
      calculateOrderTotal();
    }
  }, [items, tax, shipping]);

  const calculateOrderTotal = () => {
    try {
      setLoading(true);
      setError(null);

      const result = PaymentCalculator.calculateMultipleItems(items, tax, shipping);
      setCalculation(result);

      // Validate cart
      const cartValidation = PaymentValidation.validateCart(items);
      setValidation(cartValidation);
      setWarnings(cartValidation.warnings || []);

    } catch (err) {
      setError(err.message);
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        // Review step - validate cart
        if (!calculation || !calculation.success) {
          setError('Invalid order calculation');
          return false;
        }
        if (!validation || !validation.isValid) {
          setError('Cart validation failed');
          return false;
        }
        return true;

      case 2:
        // Address step - validate shipping address
        const addressValidation = PaymentValidation.validateAddress(formData.shippingAddress);
        if (!addressValidation.isValid) {
          setError(addressValidation.errors.join(', '));
          return false;
        }
        setWarnings(prev => [...prev, ...addressValidation.warnings]);
        return true;

      case 3:
        // Payment step - validate payment method
        const paymentValidation = PaymentValidation.validatePaymentMethod(
          formData.paymentMethod,
          {
            orderValue: calculation?.calculation?.final_total || 0,
            saveCard: formData.saveCard,
            cardholderConsent: formData.cardholderConsent
          }
        );
        if (!paymentValidation.isValid) {
          setError(paymentValidation.errors.join(', '));
          return false;
        }
        setWarnings(prev => [...prev, ...paymentValidation.warnings]);
        return true;

      default:
        return true;
    }
  };

  const handleNextStep = async () => {
    if (!validateStep(step)) {
      return;
    }

    if (step === 3) {
      // Process checkout
      await processCheckout();
    } else {
      setStep(step + 1);
      setError(null);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  const processCheckout = async () => {
    try {
      setLoading(true);
      setStep(4); // Processing step
      setError(null);

      // Prepare order data
      const orderPayload = {
        items: items,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
        totalAmount: calculation.calculation.final_total,
        userId: user?.id,
        saveCard: formData.saveCard,
        cardholderConsent: formData.cardholderConsent
      };

      // Validate and sanitize order data
      const orderValidation = PaymentValidation.validateOrder(orderPayload);
      if (!orderValidation.isValid) {
        throw new Error(orderValidation.errors.join(', '));
      }

      // Create order
      const orderResult = await paymentService.createOrder(orderPayload, user?.token);
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      setOrderData(orderResult);

      // Process payment based on method
      let paymentResult;
      
      if (formData.paymentMethod === 'qr_upi') {
        paymentResult = await processQRPayment(orderResult.orderId);
      } else {
        paymentResult = await processCardPayment(orderResult.orderId);
      }

      if (paymentResult.success) {
        setStep(5); // Complete step
        if (onCheckoutComplete) {
          onCheckoutComplete({
            order: orderResult.order,
            payment: paymentResult,
            calculation: calculation
          });
        }
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }

    } catch (err) {
      const errorResponse = handlePaymentError(err, 'checkout');
      setError(errorResponse.error);
      setStep(3); // Go back to payment step
      
      if (onCheckoutError) {
        onCheckoutError(errorResponse);
      }
    } finally {
      setLoading(false);
    }
  };

  const processQRPayment = async (orderId) => {
    const transactionId = paymentService.generateTransactionId();
    
    const qrPaymentData = {
      orderId: orderId,
      amount: calculation.calculation.final_total,
      transactionId: transactionId
    };

    return await paymentService.processQRPayment(qrPaymentData, user?.token);
  };

  const processCardPayment = async (orderId) => {
    const paymentPayload = {
      orderId: orderId,
      amount: calculation.calculation.final_total,
      currency: 'INR'
    };

    return await paymentService.processPayment(paymentPayload, user?.token);
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className="steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Review Order</div>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Shipping Info</div>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Payment</div>
        </div>
        <div className={`step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Confirmation</div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="checkout-step">
      <h2>Review Your Order</h2>
      
      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="warning">
              <span className="warning-icon">⚠️</span>
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      <div className="order-review">
        <OrderSummary 
          items={items}
          tax={tax}
          shipping={shipping}
          onCalculationComplete={(result) => setCalculation(result)}
        />
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-primary"
          onClick={handleNextStep}
          disabled={loading || !calculation?.success}
        >
          Proceed to Shipping
        </button>
      </div>
    </div>
  );

  const renderAddressStep = () => (
    <div className="checkout-step">
      <h2>Shipping Information</h2>
      
      <div className="address-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="shippingAddress.fullName"
              value={formData.shippingAddress.fullName}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="shippingAddress.email"
              value={formData.shippingAddress.email}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="shippingAddress.phone"
            value={formData.shippingAddress.phone}
            onChange={handleInputChange}
            className="form-control"
            placeholder="10-digit phone number"
            required
          />
        </div>

        <div className="form-group">
          <label>Street Address *</label>
          <textarea
            name="shippingAddress.address"
            value={formData.shippingAddress.address}
            onChange={handleInputChange}
            className="form-control"
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="shippingAddress.city"
              value={formData.shippingAddress.city}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input
              type="text"
              name="shippingAddress.state"
              value={formData.shippingAddress.state}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pincode *</label>
            <input
              type="text"
              name="shippingAddress.pincode"
              value={formData.shippingAddress.pincode}
              onChange={handleInputChange}
              className="form-control"
              placeholder="6-digit pincode"
              required
            />
          </div>
          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              name="shippingAddress.country"
              value={formData.shippingAddress.country}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={handlePrevStep}>
          Back to Review
        </button>
        <button className="btn btn-primary" onClick={handleNextStep}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="checkout-step">
      <h2>Payment Method</h2>
      
      <div className="payment-methods">
        <div className="payment-option">
          <label className="payment-method-label">
            <input
              type="radio"
              name="paymentMethod"
              value="qr_upi"
              checked={formData.paymentMethod === 'qr_upi'}
              onChange={handleInputChange}
            />
            <div className="payment-method-content">
              <div className="payment-method-icon">📱</div>
              <div className="payment-method-info">
                <h4>QR Code Payment</h4>
                <p>Scan QR code with any UPI app</p>
              </div>
            </div>
          </label>
        </div>

        <div className="payment-option">
          <label className="payment-method-label">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formData.paymentMethod === 'card'}
              onChange={handleInputChange}
            />
            <div className="payment-method-content">
              <div className="payment-method-icon">💳</div>
              <div className="payment-method-info">
                <h4>Credit/Debit Card</h4>
                <p>Pay with Visa, Mastercard, etc.</p>
              </div>
            </div>
          </label>
        </div>

        <div className="payment-option">
          <label className="payment-method-label">
            <input
              type="radio"
              name="paymentMethod"
              value="netbanking"
              checked={formData.paymentMethod === 'netbanking'}
              onChange={handleInputChange}
            />
            <div className="payment-method-content">
              <div className="payment-method-icon">🏦</div>
              <div className="payment-method-info">
                <h4>Net Banking</h4>
                <p>Pay through your bank account</p>
              </div>
            </div>
          </label>
        </div>
      </div>

      {formData.paymentMethod === 'card' && (
        <div className="card-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="saveCard"
              checked={formData.saveCard}
              onChange={handleInputChange}
            />
            Save card details for future purchases
          </label>
        </div>
      )}

      <div className="order-summary-compact">
        <h3>Order Total</h3>
        <div className="total-amount">
          {calculation && PaymentCalculator.formatCurrency(calculation.calculation.final_total)}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={handlePrevStep}>
          Back to Address
        </button>
        <button className="btn btn-primary" onClick={handleNextStep}>
          Place Order
        </button>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="checkout-step">
      <div className="processing-content">
        <div className="processing-spinner"></div>
        <h2>Processing Your Order</h2>
        <p>Please wait while we process your payment and create your order...</p>
        <div className="processing-steps">
          <div className="processing-step active">
            <span className="step-icon">✓</span>
            <span>Validating order details</span>
          </div>
          <div className="processing-step active">
            <span className="step-icon">⏳</span>
            <span>Processing payment</span>
          </div>
          <div className="processing-step">
            <span className="step-icon">⏳</span>
            <span>Creating order</span>
          </div>
          <div className="processing-step">
            <span className="step-icon">⏳</span>
            <span>Sending confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="checkout-step">
      <div className="completion-content">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        
        {orderData && (
          <div className="order-details">
            <div className="detail-row">
              <span>Order ID:</span>
              <span className="order-id">#{orderData.order._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <span>{calculation && PaymentCalculator.formatCurrency(calculation.calculation.final_total)}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{formData.paymentMethod === 'qr_upi' ? 'QR Code Payment' : formData.paymentMethod}</span>
            </div>
          </div>
        )}

        <div className="completion-actions">
          <button className="btn btn-primary" onClick={() => window.location.href = '/orders'}>
            View Orders
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/'}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderReviewStep();
      case 2: return renderAddressStep();
      case 3: return renderPaymentStep();
      case 4: return renderProcessingStep();
      case 5: return renderCompleteStep();
      default: return renderReviewStep();
    }
  };

  if (loading && step !== 4) {
    return (
      <div className="secure-checkout loading">
        <div className="loading-spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="secure-checkout">
      {renderStepIndicator()}
      
      {error && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="error-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {renderCurrentStep()}
    </div>
  );
};

export default SecureCheckout;
