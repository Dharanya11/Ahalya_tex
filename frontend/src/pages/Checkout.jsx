import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { razorpayService } from '../services/razorpayService';
import QRCode from 'qrcode';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const buyNowItem = location?.state?.buyNowItem;

  const effectiveItems = useMemo(() => {
    if (buyNowItem) return [buyNowItem];
    return cartItems;
  }, [buyNowItem, cartItems]);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'upi'
  });

  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentTimeout, setPaymentTimeout] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [showDummyPayment, setShowDummyPayment] = useState(false);
  const [dummyPaymentMethod, setDummyPaymentMethod] = useState('');
  const [dummyOrderId, setDummyOrderId] = useState('');

  const subtotal = useMemo(() => {
    return effectiveItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [effectiveItems]);

  const tax = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const shipping = useMemo(() => (subtotal >= 1000 ? 0 : 50), [subtotal]);
  const total = useMemo(() => subtotal + tax + shipping, [subtotal, tax, shipping]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!selectedPaymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePaymentMethodChange = (method) => {
    console.log('Payment method selected:', method);
    setSelectedPaymentMethod(method);
    setPaymentError('');
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handlePayNow = async () => {
    if (!validateForm()) return;

    setIsProcessingPayment(true);
    setPaymentError('');

    try {
      const orderData = {
        items: effectiveItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          productId: item.productId,
          customization: item.customization || {}
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        paymentMethod: selectedPaymentMethod,
        totalAmount: total
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com'}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderId(order._id);
        setShowQRCode(true);
        
        // Generate QR code for UPI payment
        const qrData = {
          upi: "yourupi@paytm",
          amount: total,
          orderId: order._id
        };
        const qrCode = QRCode.toDataURL(qrData);
        setQrCodeUrl(qrCode);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    setPaymentConfirmed(true);
    setProcessingPayment(true);
    setPaymentError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com'}/api/payment/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          transactionId: transactionId,
          status: 'completed'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPaymentStatus('completed');
        setOrderPlaced(true);
        clearCart();
        setTimeout(() => {
          navigate(`/orders/${orderId}`);
        }, 2000);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      setPaymentError(error.message);
      setPaymentStatus('failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDummyPaymentSubmit = async () => {
    setProcessingPayment(true);
    setPaymentError('');

    try {
      const txnId = `TXN${Date.now()}`;
      setTransactionId(txnId);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentStatus('completed');
      setPaymentConfirmed(true);
      setOrderPlaced(true);
      setPaymentResult({
        success: true,
        message: `${dummyPaymentMethod === 'upi' ? 'UPI' : dummyPaymentMethod === 'card' ? 'Card' : 'Net Banking'} Payment Successful! Your order has been confirmed.`,
        transactionId: txnId,
        orderId: orderId
      });
      clearCart();
    } catch (error) {
      console.error('Dummy payment error:', error);
      setPaymentError(error.message);
      setPaymentStatus('failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const retryPayment = () => {
    setPaymentError('');
    setPaymentStatus('pending');
    if (selectedPaymentMethod === 'qr_upi') {
      handlePaymentConfirmation();
    }
  };

  const trackingPreviewSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

  // Early returns for different states
  if (effectiveItems.length === 0 && !orderPlaced) {
    return (
      <div className="checkout-page">
        <EmptyState
          message="Your cart is empty"
          icon="🛒"
          actionLabel="Continue Shopping"
          onAction={() => navigate('/')}
        />
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your purchase. Your order has been confirmed and will be processed shortly.</p>
          <div className="order-details">
            <p><strong>Order ID:</strong> {orderId?.slice(-8).toUpperCase()}</p>
            <p><strong>Transaction ID:</strong> {transactionId}</p>
            <p><strong>Total Amount:</strong> ₹{total.toLocaleString('en-IN')}</p>
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              View Orders
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-stepper" aria-label="Checkout steps">
          <div className="checkout-step done">
            <div className="checkout-step-dot" />
            <div className="checkout-step-label">Cart</div>
          </div>
          <div className="checkout-step current">
            <div className="checkout-step-dot" />
            <div className="checkout-step-label">Address</div>
          </div>
          <div className="checkout-step">
            <div className="checkout-step-dot" />
            <div className="checkout-step-label">Payment</div>
          </div>
          <div className="checkout-step">
            <div className="checkout-step-dot" />
            <div className="checkout-step-label">Confirmation</div>
          </div>
        </div>
        <h1 className="checkout-title">Secure Checkout</h1>
        <div className="checkout-subtitle">Your payment is processed securely. We never store card details.</div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            <h2>Shipping Address</h2>
            <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? 'error' : ''}
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6 digits"
                    className={errors.pincode ? 'error' : ''}
                  />
                  {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                </div>
              </div>

              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                onPayNow={handlePayNow}
                totalAmount={total}
                isLoading={isProcessingPayment}
                customerInfo={{
                  name: formData.fullName,
                  email: formData.email,
                  phone: formData.phone
                }}
              />
            </form>
          </div>

          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {effectiveItems.map(item => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <img src={item.image || '/hero.png'} alt={item.name} />
                    <div>
                      <p className="order-item-name">{item.name}</p>
                      <small>
                        {item.customization?.size && `Size: ${item.customization.size} `}
                        {item.customization?.color && `Color: ${item.customization.color}`}
                      </small>
                      <small>Qty: {item.quantity}</small>
                    </div>
                  </div>
                  <p className="order-item-price">₹ {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹ {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="total-row">
                <span>Tax (18% GST):</span>
                <span>₹ {tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>{shipping === 0 ? 'Free' : `₹ ${shipping}`}</span>
              </div>
              <div className="total-row final-total">
                <span>Total:</span>
                <span>₹ {total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Payment Modal */}
      {showQRCode && (
        <div className="qr-payment-overlay">
          <div className="qr-payment-modal">
            <div className="qr-payment-header">
              <div className="qr-header-content">
                <div className="qr-header-icon">📱</div>
                <div>
                  <h2>Secure UPI Payment</h2>
                  <p className="qr-header-subtitle">Scan QR code to complete payment</p>
                </div>
              </div>
              <button className="qr-close-btn" onClick={() => setShowQRCode(false)}>
                ×
              </button>
            </div>
            <div className="qr-payment-body">
              <div className="qr-code-section">
                {qrCodeUrl && (
                  <div className="qr-code-container">
                    <img src={qrCodeUrl} alt="Payment QR Code" className="qr-code-image" />
                    <div className="qr-scanning-indicator">
                      <div className="scanning-line"></div>
                    </div>
                    <div className="qr-instructions">
                      <h3>How to Pay:</h3>
                      <ol>
                        <li>Open any UPI app (PhonePe, GPay, Paytm, etc.)</li>
                        <li>Scan this QR code</li>
                        <li>Enter the amount and confirm payment</li>
                        <li>Payment will be confirmed automatically</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              <div className="payment-actions">
                {!paymentConfirmed ? (
                  <button
                    className="payment-confirmed-btn"
                    onClick={handlePaymentConfirmation}
                    disabled={processingPayment || paymentStatus === 'processing'}
                  >
                    {processingPayment ? (
                      <div className="btn-spinner"></div>
                    ) : (
                      <div>
                        <span className="btn-icon">✓</span>
                        Confirm Payment
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="payment-success-message">
                    <div className="success-icon-large">✓</div>
                    <h3>Payment Confirmed!</h3>
                    <p>Thank you for your payment. Your order has been confirmed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Result Display */}
      {paymentResult && (
        <div className={`payment-result ${paymentResult.success ? 'success' : 'error'}`}>
          <div className="result-icon">
            {paymentResult.success ? '✅' : '❌'}
          </div>
          <div className="result-message">
            <h3>{paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}</h3>
            <p>{paymentResult.message}</p>
            {paymentResult.success && (
              <div className="result-details">
                <p><strong>Order ID:</strong> #{paymentResult.orderId?.slice(-8).toUpperCase()}</p>
                <p><strong>Payment ID:</strong> {paymentResult.transactionId}</p>
                <p><strong>Amount:</strong> ₹{total.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
          {paymentResult.success && (
            <div className="result-actions">
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                View Orders
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
