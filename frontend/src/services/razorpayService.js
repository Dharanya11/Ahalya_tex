/**
 * Razorpay Integration Service
 * Handles Razorpay payment gateway integration with proper error handling
 */

export class RazorpayService {
  constructor() {
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * Load Razorpay SDK
   * @returns {Promise<boolean>} Load status
   */
  async loadRazorpay() {
    if (this.isLoaded) {
      return true;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        this.isLoaded = true;
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        this.isLoaded = true;
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

    return this.loadPromise;
  }

  /**
   * Get Razorpay key from server or use fallback
   * @returns {Promise<string>} Razorpay key
   */
  async getRazorpayKey() {
    try {
      const response = await fetch('/api/config/razorpay');
      
      if (response.ok) {
        const key = await response.text();
        
        if (key && !key.includes('undefined') && !key.includes('null')) {
          return key.trim();
        }
      }
    } catch (error) {
      console.warn('Failed to get Razorpay key from server, using fallback:', error);
    }

    // Fallback to test key
    const fallbackKey = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G5ag';
    console.log('Using fallback Razorpay key');
    return fallbackKey;
  }

  /**
   * Create Razorpay order
   * @param {number} amount - Amount in INR
   * @param {string} currency - Currency code (default: INR)
   * @param {string} receipt - Receipt ID
   * @param {Object} notes - Additional notes
   * @param {string} userToken - User authentication token
   * @returns {Promise<Object>} Razorpay order response
   */
  async createOrder(amount, currency = 'INR', receipt = null, notes = {}, userToken = null) {
    try {
      const payload = {
        amount: amount, // Backend will convert to paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          created_at: new Date().toISOString(),
          source: 'react_checkout'
        }
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-Request-ID': this.generateRequestId()
      };

      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      }

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create Razorpay order');
      }

      const orderData = await response.json();
      console.log('Razorpay order created:', orderData);
      
      return {
        success: true,
        data: orderData
      };

    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Open Razorpay checkout
   * @param {Object} options - Razorpay options
   * @returns {Promise<Object>} Payment result
   */
  async openCheckout(options) {
    try {
      // Load Razorpay SDK
      const isLoaded = await this.loadRazorpay();
      
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay not available');
      }

      // Create Razorpay instance
      const razorpay = new window.Razorpay(options);

      // Return promise that resolves with payment result
      return new Promise((resolve, reject) => {
        // Success handler
        razorpay.on('payment.success', (response) => {
          console.log('Payment successful:', response);
          resolve({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        });

        // Failure handler
        razorpay.on('payment.failed', (response) => {
          console.error('Payment failed:', response);
          const error = response.error;
          
          reject({
            success: false,
            error: error.description || 'Payment failed',
            code: error.code,
            dismissed: false,
            metadata: {
              orderId: response.error?.metadata?.payment_id,
              source: 'razorpay_checkout'
            }
          });
        });

        // Modal dismissed handler
        razorpay.on('modal.closed', () => {
          console.log('Payment modal closed');
          resolve({
            success: false,
            error: 'Payment cancelled by user',
            code: 'CANCELLED'
          });
        });

        // Open checkout
        razorpay.open();
      });

    } catch (error) {
      console.error('Razorpay checkout error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process complete payment flow
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'INR',
        customerInfo,
        orderId,
        userToken,
        paymentMethod = 'card'
      } = paymentData;

      // Validate required fields
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      if (!customerInfo || !customerInfo.name || !customerInfo.email) {
        throw new Error('Customer information is required');
      }

      // Create Razorpay order
      const orderResult = await this.createOrder(
        amount,
        currency,
        orderId,
        {
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          payment_method: paymentMethod
        },
        userToken
      );

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create payment order');
      }

      // Get Razorpay key
      const key = await this.getRazorpayKey();

      // Prepare checkout options
      const checkoutOptions = {
        key: key,
        amount: orderResult.data.amount, // Amount in paise from backend
        currency: orderResult.data.currency || currency,
        name: 'Shri Ahalya Tex',
        description: `Order Payment - ${orderId?.slice(-8).toUpperCase() || 'N/A'}`,
        order_id: orderResult.data.id,
        handler: function (response) {
          // This will be handled by the success event listener
          console.log('Payment handler called:', response);
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone || ''
        },
        notes: {
          order_id: orderId,
          customer_name: customerInfo.name,
          payment_method: paymentMethod
        },
        theme: {
          color: '#8B5A2B', // Brand color
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user');
            // Reject the promise to handle dismissal properly
            reject({
              success: false,
              error: 'Payment modal was dismissed',
              code: 'MODAL_DISMISSED',
              dismissed: true
            });
          },
          escape: true,
          backdropclose: true,
          handleback: true
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: {
          method: 'post',
          url: '/api/payment/timeout'
        }
      };

      // Enable specific payment methods based on selection
      if (paymentMethod === 'upi') {
        checkoutOptions.method = 'upi';
        checkoutOptions.upi = {
          flow: 'collect',
          vpa: customerInfo.upiVpa || ''
        };
      } else if (paymentMethod === 'card') {
        checkoutOptions.method = 'card';
      } else if (paymentMethod === 'netbanking') {
        checkoutOptions.method = 'netbanking';
      }

      // Open checkout
      const paymentResult = await this.openCheckout(checkoutOptions);

      return {
        success: paymentResult.success,
        paymentId: paymentResult.paymentId,
        orderId: paymentResult.orderId,
        signature: paymentResult.signature,
        error: paymentResult.error,
        razorpayOrderId: orderResult.data.id
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify payment signature
   * @param {Object} paymentData - Payment verification data
   * @param {string} userToken - User authentication token
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(paymentData, userToken) {
    try {
      const response = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'X-Request-ID': this.generateRequestId()
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Payment verification failed');
      }

      const verificationResult = await response.json();
      
      return {
        success: true,
        verified: true,
        data: verificationResult
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        verified: false,
        error: error.message
      };
    }
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle payment errors gracefully
   * @param {Error} error - Payment error
   * @param {string} context - Error context
   * @returns {Object} Formatted error
   */
  static handlePaymentError(error, context = 'payment') {
    console.error(`Payment error in ${context}:`, error);

    const errorMap = {
      'BAD_REQUEST_ERROR': 'Invalid payment request. Please try again.',
      'NETWORK_ERROR': 'Network error. Please check your connection and try again.',
      'TIMEOUT': 'Payment timed out. Please try again.',
      'SERVER_ERROR': 'Server error. Please try again later.',
      'INVALID_AMOUNT': 'Invalid payment amount.',
      'PAYMENT_FAILED': 'Payment failed. Please try again.',
      'CANCELLED': 'Payment was cancelled.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    const errorMessage = errorMap[error.code] || error.message || 'Payment failed. Please try again.';

    return {
      success: false,
      error: errorMessage,
      code: error.code || 'UNKNOWN_ERROR',
      context: context,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();

// Export utility functions
export const loadRazorpay = () => razorpayService.loadRazorpay();
export const processRazorpayPayment = (data) => razorpayService.processPayment(data);
export const verifyRazorpayPayment = (data, token) => razorpayService.verifyPayment(data, token);
export const handleRazorpayError = (error, context) => RazorpayService.handlePaymentError(error, context);

export default RazorpayService;
