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
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed, failed
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [showDummyPayment, setShowDummyPayment] = useState(false);
  const [dummyPaymentMethod, setDummyPaymentMethod] = useState('');
  const [dummyOrderId, setDummyOrderId] = useState('');

  const subtotal = useMemo(() => {
    return effectiveItems.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);
  }, [effectiveItems]);
  const tax = subtotal * 0.18;
  const shipping = subtotal >= 2000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  const trackingPreviewSteps = ['Order Placed', 'Shipped', 'Out for Delivery', 'Delivered'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Payment method handlers
  const handlePaymentMethodChange = (method) => {
    console.log('Payment method selected:', method);
    setSelectedPaymentMethod(method);
    setPaymentError('');
    setPaymentResult(null);

    // Update form data for compatibility
    setFormData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handlePayNow = async (paymentMethod) => {
    try {
      console.log('Pay Now clicked with method:', paymentMethod);

      // Validate form
      if (!validateForm()) {
        console.log('Form validation failed');
        setPaymentError('Please fill all required fields');
        return;
      }

      if (!user) {
        console.log('User not authenticated');
        setPaymentError('Please login to continue');
        return;
      }

      setIsProcessingPayment(true);
      setPaymentError('');

      // Generate order ID
      const newOrderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setOrderId(newOrderId);
      console.log('Generated order ID:', newOrderId);

      // Handle different payment methods as dummy payments
      if (paymentMethod === 'qr_upi') {
        // QR Code Payment - show QR modal
        await handleQRPayment(newOrderId, {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        });
      } else {
        // UPI, Card, Net Banking - show dummy payment modal
        await handleDummyPayment(paymentMethod, newOrderId);
      }

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDummyPayment = async (paymentMethod, orderId) => {
    try {
      console.log(`=== DUMMY PAYMENT START - ${paymentMethod} ===`);

      // Show dummy payment modal
      setShowDummyPayment(true);
      setDummyPaymentMethod(paymentMethod);
      setDummyOrderId(orderId);

    } catch (error) {
      console.error('Dummy payment error:', error);
      setPaymentError('Failed to open payment form. Please try again.');
    }
  };

  const handleDummyPaymentSubmit = async () => {
    try {
      console.log('=== DUMMY PAYMENT SUBMIT ===');
      setProcessingPayment(true);
      setPaymentError('');

      // Prevent multiple order placements
      if (orderPlaced) {
        console.log('Order already placed, skipping...');
        return;
      }

      // Place order in backend immediately
      await placeOrderInBackend(dummyOrderId);

      console.log('Order placed successfully, updating UI...');

      // Update UI with success
      setPaymentStatus('completed');
      setPaymentConfirmed(true);
      setOrderPlaced(true);
      setPaymentResult({
        success: true,
        message: `${dummyPaymentMethod === 'upi' ? 'UPI' : dummyPaymentMethod === 'card' ? 'Card' : 'Net Banking'} Payment Successful! Your order has been confirmed.`,
        transactionId: dummyOrderId,
        orderId: dummyOrderId,
        paymentId: `PAY${Date.now()}`,
        amount: total,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        timestamp: new Date().toISOString(),
        items: effectiveItems
      });

      // Close dummy payment modal
      setShowDummyPayment(false);

      // Clear cart and redirect after delay
      setTimeout(() => {
        clearCart();
        navigate('/my-orders');
      }, 3000);

    } catch (error) {
      console.error('Dummy payment error:', error);
      setPaymentError('Failed to place order. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleQRPayment = async (orderId, customerInfo) => {
    try {
      console.log('=== QR PAYMENT START ===');
      console.log('Starting QR payment process...');
      console.log('Order ID:', orderId);
      console.log('Customer Info:', customerInfo);

      // Generate QR code
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setTransactionId(transactionId);
      console.log('Generated transaction ID:', transactionId);

      // Create UPI payment URL with proper parameters
      const upiId = 'ahalyatexile@upi'; // Business UPI ID
      const merchantName = 'Shri Ahalya Tex';
      const transactionNote = `Order Payment - ${orderId}`;

      // Create proper UPI URL
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}`;
      console.log('UPI URL:', upiUrl);

      // Generate QR Code with better error handling
      try {
        console.log('Generating QR code...');
        const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#8B5A2B', // Brand color
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        console.log('QR code generated successfully');
        console.log('QR code URL length:', qrCodeDataUrl.length);
        console.log('QR code URL starts with:', qrCodeDataUrl.substring(0, 50));

        setQrCodeUrl(qrCodeDataUrl);
        console.log('setQrCodeUrl called');

        setShowQRCode(true);
        console.log('setShowQRCode called - modal should show');
        setPaymentStatus('pending');
        console.log('setPaymentStatus called');

        // Start payment monitoring
        startPaymentMonitoring(transactionId);
        console.log('Payment monitoring started');

      } catch (qrError) {
        console.error('QR code generation failed:', qrError);
        throw new Error('Failed to generate QR code. Please try again.');
      }

    } catch (error) {
      console.error('QR payment error:', error);
      setPaymentError(error.message || 'Failed to generate QR code. Please try again.');
    }
  };

  const startPaymentMonitoring = (txnId) => {
    // Auto-success after exactly 10 seconds
    console.log('Starting 10-second countdown for QR payment...');

    setTimeout(async () => {
      try {
        console.log('10 seconds completed - placing order automatically');

        // Prevent multiple order placements
        if (orderPlaced) {
          console.log('Order already placed, skipping...');
          return;
        }

        // Place the order in backend first
        await placeOrderInBackend(txnId);

        // Then update UI with success
        setPaymentStatus('completed');
        setPaymentConfirmed(true);
        setOrderPlaced(true);
        setPaymentResult({
          success: true,
          message: 'QR Payment Successful! Your order has been confirmed.',
          transactionId: txnId,
          orderId: orderId,
          paymentId: `PAY${Date.now()}`,
          amount: total,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          timestamp: new Date().toISOString(),
          items: effectiveItems
        });

        // Clear cart and redirect after delay
        setTimeout(() => {
          clearCart();
          navigate('/my-orders');
        }, 3000);

      } catch (error) {
        console.error('Error placing order:', error);
        setPaymentStatus('failed');
        setPaymentError('Failed to place order. Please try again.');
      }
    }, 10000); // Exactly 10 seconds
  };

  const placeOrderInBackend = async (transactionId) => {
    try {
      console.log('Placing order in backend with transaction ID:', transactionId);

      // Create order data
      const orderData = {
        orderItems: effectiveItems.map((item) => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          productId: item.productId,
          customization: item.customization || {},
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.pincode,
          country: formData.state,
        },
        paymentMethod: 'qr_upi',
        paymentResult: {
          id: transactionId,
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: formData.email,
        },
        itemsPrice: subtotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice: total,
        isPaid: true,
        paidAt: new Date().toISOString(),
        isDelivered: false,
        transactionId: transactionId,
      };

      // Send order to backend
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
        console.log('Order placed successfully:', order);
        return order;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to place order (Status: ${response.status})`;
        console.error('Order placement failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  // Retry payment function
  const retryPayment = () => {
    setPaymentError('');
    setPaymentStatus('pending');
    setPaymentResult(null);
    if (selectedPaymentMethod === 'qr_upi') {
      handleQRPayment(orderId, {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirmation = async () => {
    try {
      console.log('=== PAYMENT CONFIRMATION START ===');
      setProcessingPayment(true);
      setPaymentError('');

      // Prevent multiple order placements - check both flags
      if (orderPlaced || processingPayment) {
        console.log('Order already being processed or placed, skipping...');
        return;
      }

      // Place the order in backend immediately
      await placeOrderInBackend(transactionId);

      console.log('Order placed successfully, updating UI...');

      // Update UI with success
      setPaymentStatus('completed');
      setPaymentConfirmed(true);
      setOrderPlaced(true);
      setPaymentResult({
        success: true,
        message: 'QR Payment Successful! Your order has been confirmed.',
        transactionId: transactionId,
        orderId: orderId,
        paymentId: `PAY${Date.now()}`,
        amount: total,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        timestamp: new Date().toISOString(),
        items: effectiveItems
      });

      // Clear cart and redirect after delay
      setTimeout(() => {
        clearCart();
        navigate('/my-orders');
      }, 3000);

    } catch (error) {
      console.error('Payment confirmation error:', error);
      setPaymentError('Failed to place order. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Simplified validation for testing - only check essential fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    // Make phone validation more flexible
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Remove all non-digits and handle leading 0
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // Handle Indian phone numbers: 
      // - With leading 0: 07010544176 -> 7010544176 (10 digits)
      // - Without leading 0: 7010544176 (10 digits)
      // - With country code: +917010544176 -> 917010544176 (12 digits)

      let finalPhone = cleanPhone;
      if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
        // Remove leading 0 for numbers like 07010544176
        finalPhone = cleanPhone.substring(1);
      } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
        // Keep country code for numbers like 917010544176
        finalPhone = cleanPhone;
      }

      // Validate final phone number (10 digits for Indian numbers without country code, or 12 with country code)
      if (!/^\d{10}$/.test(finalPhone) && !/^\d{12}$/.test(finalPhone)) {
        newErrors.phone = 'Phone must be 10 digits (or 12 with country code)';
      }
    }

    // For testing, allow empty address fields
    // if (!formData.address.trim()) newErrors.address = 'Address is required';
    // if (!formData.city.trim()) newErrors.city = 'City is required';
    // if (!formData.state.trim()) newErrors.state = 'State is required';
    // if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';

    setErrors(newErrors);
    console.log('Validation errors:', newErrors);
    console.log('Form data:', formData);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        resolve(false);
      };
      script.onabort = () => {
        console.error('Razorpay SDK loading aborted');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  };

  // Generate QR Code for UPI Payment
  const generateQRCode = async () => {
    try {
      setProcessingPayment(true);

      // Generate unique transaction ID
      const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
      setTransactionId(transactionId);

      const upiId = 'ahalyatexile@upi'; // Business UPI ID
      const merchantName = 'Ahalya Texile';
      const transactionNote = `Order Payment - ${orderId || 'ORD' + Date.now()}`;

      // Create UPI payment URL with more parameters for better tracking
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${transactionId}&mc=5221`; // mc=5221 for retail

      // Generate QR Code with better styling
      const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' // Medium error correction for better scanning
      });

      setQrCodeUrl(qrCodeDataUrl);
      setShowQRCode(true);

      // Start payment timeout monitoring
      startPaymentMonitoring(transactionId);

    } catch (error) {
      console.error('Error generating QR code:', error);
      setPaymentError('Failed to generate QR code. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const cancelPayment = () => {
    console.log('Payment cancelled by user');
    setShowQRCode(false);
    setQrCodeUrl('');
    setTransactionId('');
    setPaymentStatus('pending');
    setProcessingPayment(false);
    setPaymentError('');
    if (paymentTimeout) {
      clearTimeout(paymentTimeout);
      setPaymentTimeout(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place an order');
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Prevent multiple payment attempts
    if (isProcessingPayment) {
      alert('Payment is already being processed. Please wait...');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Create Order in Backend
      const orderItems = effectiveItems.map((item) => ({
        name: item.name,
        qty: item.quantity,
        image: item.image,
        price: item.price,
        productId: item.productId,
        customization: item.customization || {},
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.pincode,
          country: 'India',
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com'}/api/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const rawText = await response.text().catch(() => '');
        let message = '';
        try {
          const parsed = rawText ? JSON.parse(rawText) : null;
          message = parsed?.message || '';
        } catch {
          message = '';
        }
        throw new Error(message || rawText || `Failed to place order (HTTP ${response.status})`);
      }

      const createdOrder = await response.json();
      setOrderId(createdOrder._id);

      // Handle QR Code Payment
      if (formData.paymentMethod === 'qr_upi') {
        await generateQRCode();
        return;
      }

      // All other payments are now online payments
      // 2. Load Razorpay SDK
      console.log('Loading Razorpay SDK...');
      const res = await loadRazorpay();

      if (!res) {
        throw new Error('Payment gateway is currently unavailable. Please try QR code payment or contact support.');
      }

      console.log('Razorpay SDK loaded, creating order...');

      // 3. Create Razorpay Order (Server side)
      const payload = {
        amount: total,
        currency: 'INR',
        receipt: orderId || 'receipt_' + Date.now(),
        notes: {
          order_id: orderId,
          customer_name: formData.fullName,
          customer_email: formData.email
        }
      };
      const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com'}/api/payment/create-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Payment order response status:', paymentResponse.status);

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({}));
        console.error('Payment order creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create payment order. Please try again.');
      }

      const paymentData = await paymentResponse.json();
      console.log('Payment order created:', paymentData);

      // 4. Get Razorpay Key ID
      let razorpayKey;
      try {
        const keyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com'}/api/config/razorpay`);
        if (!keyResponse.ok) {
          console.warn('Failed to get Razorpay key from server, using fallback');
          razorpayKey = 'rzp_test_1DP5mmOlF5G5ag'; // Test key fallback
        } else {
          razorpayKey = await keyResponse.text();
        }
      } catch (error) {
        console.warn('Error getting Razorpay key, using fallback:', error);
        razorpayKey = 'rzp_test_1DP5mmOlF5G5ag'; // Test key fallback
      }

      if (!razorpayKey || razorpayKey.includes('undefined') || razorpayKey.includes('null')) {
        console.error('Invalid Razorpay key:', razorpayKey);
        throw new Error('Payment gateway not configured properly. Please contact support or try QR code payment.');
      }

      console.log('Using Razorpay key:', razorpayKey.substring(0, 10) + '...');

      // 5. Open Razorpay
      console.log('Opening Razorpay payment modal...');
      const options = {
        key: razorpayKey,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Shri Ahalya Tex',
        description: `Order Payment - ${orderId?.slice(-8).toUpperCase()}`,
        order_id: paymentData.id,
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
            // Optionally handle payment cancellation
            // You could show a message or redirect to cart
          },
          escape: true,
          backdropclose: true,
          handleback: true
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          order_id: orderId
        }
      };

      const verifyData = await verifyResponse.json();
      console.log('Payment verification response:', verifyData);

      if (verifyResponse.ok) {
        setOrderId(createdOrder._id);
        clearCart();
        setOrderPlaced(true);
        navigate(`/orders/${createdOrder._id}`);
      } else {
        console.error('Payment verification failed:', verifyData);
        throw new Error(verifyData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert(`Payment verification failed: ${error.message || 'Unknown error'}. Please contact support with your order ID: ${orderId?.slice(-8).toUpperCase()}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (effectiveItems.length === 0 && !orderPlaced) {
    return (
      <>
        <div className="checkout-page">
          <EmptyState
            message="Your cart is empty"
            icon="🛒"
            actionLabel="Continue Shopping"
            onAction={() => navigate('/')}
          />
        </div>
        <Footer />
      </>
    );
  }

  if (orderPlaced) {
    return (
      <>
        <div className="checkout-page">
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h1>Order Placed Successfully!</h1>
            <p>Thank you for your purchase.</p>
            <p className="order-id">Order ID: {orderId}</p>
            <div className="success-details">
              <p><strong>Shipping to:</strong></p>
              <p>{formData.fullName}</p>
              <p>{formData.address}</p>
              <p>{formData.city}, {formData.state} - {formData.pincode}</p>
              <p><strong>Payment Method:</strong> {
                formData.paymentMethod === 'card' ? 'Credit/Debit Card' :
                  formData.paymentMethod === 'upi' ? 'UPI' :
                    'Net Banking'
              }</p>
            </div>
            <button className="shop-now-btn" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
            <button className="view-orders-btn" onClick={() => navigate(`/orders/${orderId}`)}>
              View / Track Order
            </button>
            <button className="view-orders-btn" onClick={() => navigate('/my-orders')}>
              My Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
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

                <div className="delivery-preview">
                  <h2>Delivery Tracking</h2>
                  <div className="tracking">
                    <div className="tracking-bar" aria-hidden="true">
                      <div className="tracking-bar-fill" style={{ width: '25%' }} />
                    </div>
                    <div className="tracking-steps">
                      {trackingPreviewSteps.map((step, idx) => (
                        <div key={step} className={`tracking-step ${idx === 0 ? 'current' : ''}`}>
                          <div className="tracking-dot" />
                          <div className="tracking-label">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="tracking-meta" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                    <div className="tracking-meta-row">
                      <strong>Estimated delivery:</strong>{' '}
                      <span>3-5 business days</span>
                    </div>
                  </div>
                </div>

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
      </div>
    </div>

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
              <p><strong>Payment ID:</strong> {paymentResult.paymentId}</p>
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
            <button
              className="close-qr-modal"
              onClick={cancelPayment}
              disabled={processingPayment}
            >
              ×
            </button>
          </div>

          <div className="qr-payment-content">
            {/* Payment Status */}
            <div className={`payment-status-indicator ${paymentStatus}`}>
              <div className="status-icon">
                {paymentStatus === 'pending' && '⏳'}
                {paymentStatus === 'processing' && '⚡'}
                {paymentStatus === 'completed' && '✅'}
                {paymentStatus === 'failed' && '❌'}
              </div>
              <div className="status-text">
                {paymentStatus === 'pending' && 'Waiting for payment...'}
                {paymentStatus === 'processing' && 'Processing payment...'}
                {paymentStatus === 'completed' && 'Payment successful!'}
                {paymentStatus === 'failed' && 'Payment failed'}
              </div>
            </div>

            {/* Order and Transaction Details */}
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">#{orderId?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value">{transactionId}</span>
              </div>
              <div className="detail-row amount-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value amount">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="qr-code-section">
              <div className="qr-code-container">
                {qrCodeUrl && !paymentConfirmed ? (
                  <>
                    <img src={qrCodeUrl} alt="Payment QR Code" className="qr-code-image" />
                    <div className="qr-scanning-indicator">
                      <div className="scanning-line"></div>
                    </div>
                  </>
                ) : paymentConfirmed ? (
                  <div className="payment-success-animation">
                    <div className="success-checkmark">✓</div>
                  </div>
                ) : (
                  <div className="qr-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>

              {/* Debug Info */}
              <div style={{ fontSize: '10px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                DEBUG: showQRCode={showQRCode.toString()}, qrCodeUrl exists={!!qrCodeUrl}, paymentConfirmed={paymentConfirmed.toString()}
              </div>

              {/* Timer */}
              {paymentStatus === 'pending' && (
                <div className="payment-timer">
                  <p>Order will be placed automatically in: <span className="timer-text">10 seconds</span></p>
                  <div className="timer-progress">
                    <div className="timer-bar"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Instructions */}
            <div className="payment-instructions">
              <h3>How to Pay:</h3>
              <div className="instructions-list">
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
                  <span className="step-text">Verify the amount (₹{total.toLocaleString('en-IN')}) and pay</span>
                </div>
                <div className="instruction-step">
                  <span className="step-number">4</span>
                  <span className="step-text">Wait for payment confirmation</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="supported-apps">
              <p>Supported Apps:</p>
              <div className="app-icons">
                <div className="app-icon">📱 PhonePe</div>
                <div className="app-icon">💚 GPay</div>
                <div className="app-icon">💙 Paytm</div>
                <div className="app-icon">🔵 BHIM</div>
              </div>
            </div>

            {/* Error Display */}
            {paymentError && (
              <div className="payment-error">
                <div className="error-icon">⚠️</div>
                <div className="error-message">{paymentError}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="payment-actions">
              {!paymentConfirmed ? (
                <>
                  <button
                    className="payment-confirmed-btn"
                    onClick={handlePaymentConfirmation}
                    disabled={processingPayment || paymentStatus === 'processing'}
                  >
                    {processingPayment ? 'Processing...' : 'I have completed payment'}
                  </button>
                  <button
                    className="cancel-payment-btn"
                    onClick={cancelPayment}
                    disabled={processingPayment}
                  >
                    Cancel Payment
                  </button>
                </>
              ) : (
                <button
                  className="view-order-btn"
                  onClick={() => navigate('/my-orders')}
                >
                  View Order Details
                </button>
              )}

              {paymentStatus === 'failed' && (
                <button
                  className="retry-payment-btn"
                  onClick={retryPayment}
                  disabled={processingPayment}
                >
                  🔄 Retry Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Dummy Payment Modal for UPI, Card, Net Banking */}
    {showDummyPayment && (
      <div className="qr-payment-overlay">
        <div className="qr-payment-modal">
          <div className="qr-payment-header">
            <div className="qr-header-content">
              <div className="qr-header-icon">
                {dummyPaymentMethod === 'upi' && '📱'}
                {dummyPaymentMethod === 'card' && '💳'}
                {dummyPaymentMethod === 'net_banking' && '🏦'}
              </div>
              <div>
                <h2>
                  {dummyPaymentMethod === 'upi' && 'UPI Payment'}
                  {dummyPaymentMethod === 'card' && 'Card Payment'}
                  {dummyPaymentMethod === 'net_banking' && 'Net Banking Payment'}
                </h2>
                <p className="qr-header-subtitle">Enter payment details to complete your order</p>
              </div>
            </div>
            <button
              className="close-qr-modal"
              onClick={() => setShowDummyPayment(false)}
              disabled={processingPayment}
            >
              ×
            </button>
          </div>

          <div className="qr-payment-content">
            {/* Payment Status */}
            <div className={`payment-status-indicator ${paymentStatus}`}>
              <div className="status-icon">
                {paymentStatus === 'pending' && '⏳'}
                {paymentStatus === 'processing' && '⚡'}
                {paymentStatus === 'completed' && '✅'}
                {paymentStatus === 'failed' && '❌'}
              </div>
              <div className="status-text">
                {paymentStatus === 'pending' && 'Waiting for payment...'}
                {paymentStatus === 'processing' && 'Processing payment...'}
                {paymentStatus === 'completed' && 'Payment successful!'}
                {paymentStatus === 'failed' && 'Payment failed'}
              </div>
            </div>

            {/* Order and Transaction Details */}
            <div className="payment-details">
              <div className="detail-row">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">#{dummyOrderId?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value amount">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="product-details-section">
              <h4>Product Details</h4>
              {effectiveItems.map((item, index) => (
                <div key={index} className="product-detail-item">
                  <div className="product-info">
                    <span className="product-name">{item.name || 'Product Name'}</span>
                    <span className="product-quantity">Qty: {item.quantity || 1}</span>
                  </div>
                  <span className="product-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Payment Form */}
            <div className="payment-form-section">
              <h3>Payment Details</h3>
              <div className="payment-form">
                {dummyPaymentMethod === 'upi' && (
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g., user@paytm)"
                      className="payment-input"
                    />
                  </div>
                )}

                {dummyPaymentMethod === 'card' && (
                  <>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="payment-input"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="payment-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="payment-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {dummyPaymentMethod === 'net_banking' && (
                  <div className="form-group">
                    <label>Bank Account</label>
                    <input
                      type="text"
                      placeholder="Enter bank account number"
                      className="payment-input"
                    />
                  </div>
                )}

                <button
                  className="payment-confirmed-btn"
                  onClick={handleDummyPaymentSubmit}
                  disabled={processingPayment || paymentStatus === 'processing'}
                >
                  {processingPayment ? (
                    <>
                      <div className="btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      💳 Complete Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    <Footer />
  </>
);
}
