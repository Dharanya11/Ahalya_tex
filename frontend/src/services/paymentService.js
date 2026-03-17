/**
 * Secure Payment Processing Service
 * Handles payment processing, order management, and security
 */

import { PaymentCalculator } from '../utils/paymentCalculator';
import { PaymentValidation } from '../utils/paymentValidation';

export class PaymentService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://ahalya-tex-3.onrender.com';
    this.endpoints = {
      orders: '/orders',
      payment: {
        createOrder: '/payment/create-order',
        verifyPayment: '/payment/verify-payment',
        checkStatus: '/payment/check-status',
        config: '/config/razorpay'
      }
    };
  }

  /**
   * Generate unique order ID
   * @returns {string} Unique order ID
   */
  static generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `ORD${timestamp.toUpperCase()}${random.toUpperCase()}`;
  }

  /**
   * Generate transaction ID for payments
   * @returns {string} Unique transaction ID
   */
  static generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  /**
   * Create order before payment
   * @param {Object} orderData - Order data
   * @param {string} userToken - User authentication token
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData, userToken) {
    try {
      // Validate order data
      const validation = PaymentValidation.validateOrder(orderData);
      if (!validation.isValid) {
        throw new Error(`Order validation failed: ${validation.errors.join(', ')}`);
      }

      // Sanitize data
      const sanitizedData = PaymentValidation.sanitizeData(orderData);

      // Generate order ID
      const orderId = PaymentService.generateOrderId();

      // Prepare order payload
      const orderPayload = {
        orderId: orderId,
        orderItems: sanitizedData.items.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          productId: item.productId,
          customization: item.customization || {}
        })),
        shippingAddress: sanitizedData.shippingAddress,
        paymentMethod: sanitizedData.paymentMethod,
        itemsPrice: sanitizedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        taxPrice: 0, // Will be calculated by backend
        shippingPrice: 0, // Will be calculated by backend
        totalPrice: sanitizedData.totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Make API call
      const response = await fetch(`${this.baseURL}${this.endpoints.orders}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'X-Request-ID': PaymentService.generateTransactionId()
        },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create order (HTTP ${response.status})`);
      }

      const createdOrder = await response.json();
      
      return {
        success: true,
        order: createdOrder,
        orderId: orderId
      };

    } catch (error) {
      console.error('Order creation error:', error);
      return {
        success: false,
        error: error.message,
        code: 'ORDER_CREATION_FAILED'
      };
    }
  }

  /**
   * Process payment with Razorpay
   * @param {Object} paymentData - Payment data
   * @param {string} userToken - User authentication token
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData, userToken) {
    try {
      const { orderId, amount, currency = 'INR' } = paymentData;

      // Validate payment data
      if (!orderId || !amount || amount <= 0) {
        throw new Error('Invalid payment data');
      }

      // Create Razorpay order
      const razorpayOrder = await this.createRazorpayOrder(amount, currency, userToken);
      
      if (!razorpayOrder.success) {
        throw new Error(razorpayOrder.error || 'Failed to create payment order');
      }

      // Get Razorpay key
      const razorpayKey = await this.getRazorpayKey();
      
      if (!razorpayKey.success) {
        throw new Error(razorpayKey.error || 'Failed to get payment configuration');
      }

      return {
        success: true,
        paymentOrder: razorpayOrder.data,
        key: razorpayKey.data,
        orderId: orderId
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message,
        code: 'PAYMENT_PROCESSING_FAILED'
      };
    }
  }

  /**
   * Create Razorpay order
   * @param {number} amount - Payment amount
   * @param {string} currency - Currency code
   * @param {string} userToken - User token
   * @returns {Promise<Object>} Razorpay order
   */
  async createRazorpayOrder(amount, currency, userToken) {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.payment.createOrder}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'X-Request-ID': PaymentService.generateTransactionId()
        },
        body: JSON.stringify({
          // Backend will convert to the smallest currency unit
          amount,
          currency: currency,
          receipt: `receipt_${Date.now()}`,
          notes: {
            created_at: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create Razorpay order');
      }

      const razorpayOrder = await response.json();

      return {
        success: true,
        data: razorpayOrder
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
   * Get Razorpay key
   * @returns {Promise<Object>} Razorpay key
   */
  async getRazorpayKey() {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.payment.config}`, {
        method: 'GET',
        headers: {
          'X-Request-ID': PaymentService.generateTransactionId()
        }
      });

      if (!response.ok) {
        // Use fallback key for development
        const fallbackKey = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G5ag';
        console.warn('Using fallback Razorpay key');
        return {
          success: true,
          data: fallbackKey
        };
      }

      const key = await response.text();

      if (!key || key.includes('undefined') || key.includes('null')) {
        throw new Error('Invalid Razorpay key received');
      }

      return {
        success: true,
        data: key.trim()
      };

    } catch (error) {
      console.error('Razorpay key retrieval error:', error);
      // Use fallback key
      const fallbackKey = process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G5ag';
      return {
        success: true,
        data: fallbackKey
      };
    }
  }

  /**
   * Verify payment after completion
   * @param {Object} paymentResponse - Payment response from Razorpay
   * @param {string} orderId - Order ID
   * @param {string} userToken - User token
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(paymentResponse, orderId, userToken) {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.payment.verifyPayment}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'X-Request-ID': PaymentService.generateTransactionId()
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderId: orderId
        })
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
        error: error.message,
        verified: false
      };
    }
  }

  /**
   * Check payment status
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Payment status
   */
  async checkPaymentStatus(transactionId) {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.payment.checkStatus}/${transactionId}`, {
        method: 'GET',
        headers: {
          'X-Request-ID': PaymentService.generateTransactionId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const status = await response.json();

      return {
        success: true,
        status: status.status,
        data: status
      };

    } catch (error) {
      console.error('Payment status check error:', error);
      return {
        success: false,
        error: error.message,
        status: 'unknown'
      };
    }
  }

  /**
   * Process QR code payment
   * @param {Object} qrPaymentData - QR payment data
   * @param {string} userToken - User token
   * @returns {Promise<Object>} QR payment result
   */
  async processQRPayment(qrPaymentData, userToken) {
    try {
      const { orderId, amount, transactionId } = qrPaymentData;

      // Validate QR payment data
      if (!orderId || !amount || !transactionId) {
        throw new Error('Invalid QR payment data');
      }

      // Simulate QR payment processing
      const paymentResult = await this.simulateQRPayment(transactionId, amount);

      if (paymentResult.success) {
        // Update order with payment confirmation
        const updateResult = await this.confirmOrderPayment(orderId, {
          paymentMethod: 'qr_upi',
          paymentStatus: 'completed',
          transactionId: transactionId,
          amount: amount,
          timestamp: new Date().toISOString()
        }, userToken);

        return {
          success: true,
          paymentId: paymentResult.paymentId,
          status: 'completed',
          orderUpdate: updateResult
        };
      } else {
        throw new Error(paymentResult.error || 'QR payment failed');
      }

    } catch (error) {
      console.error('QR payment processing error:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Simulate QR payment processing (for development)
   * @param {string} transactionId - Transaction ID
   * @param {number} amount - Payment amount
   * @returns {Promise<Object>} Simulated payment result
   */
  async simulateQRPayment(transactionId, amount) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        paymentId: `PAY_${Date.now()}`,
        transactionId: transactionId,
        amount: amount,
        status: 'completed',
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: 'Payment processing failed. Please try again.',
        transactionId: transactionId
      };
    }
  }

  /**
   * Confirm order payment
   * @param {string} orderId - Order ID
   * @param {Object} paymentData - Payment confirmation data
   * @param {string} userToken - User token
   * @returns {Promise<Object>} Confirmation result
   */
  async confirmOrderPayment(orderId, paymentData, userToken) {
    try {
      const response = await fetch(`${this.baseURL}${this.endpoints.orders}/${orderId}/payment-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
          'X-Request-ID': PaymentService.generateTransactionId()
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to confirm payment');
      }

      const result = await response.json();

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Order payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle payment errors gracefully
   * @param {Error} error - Payment error
   * @param {string} context - Error context
   * @returns {Object} Formatted error response
   */
  static handlePaymentError(error, context = 'payment') {
    console.error(`Payment error in ${context}:`, error);

    const errorMap = {
      'NETWORK_ERROR': 'Network connection failed. Please check your internet connection.',
      'TIMEOUT': 'Payment request timed out. Please try again.',
      'INVALID_AMOUNT': 'Invalid payment amount. Please check your order.',
      'PAYMENT_FAILED': 'Payment failed. Please try again or use a different payment method.',
      'ORDER_CREATION_FAILED': 'Failed to create order. Please try again.',
      'PAYMENT_VERIFICATION_FAILED': 'Payment verification failed. Please contact support.',
      'INSUFFICIENT_BALANCE': 'Insufficient balance. Please use a different payment method.',
      'CARD_DECLINED': 'Card declined. Please use a different card or payment method.',
      'INVALID_CVV': 'Invalid CVV. Please check and try again.',
      'INVALID_EXPIRY': 'Invalid card expiry date. Please check and try again.'
    };

    const errorMessage = errorMap[error.code] || error.message || 'An unexpected error occurred. Please try again.';

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
export const paymentService = new PaymentService();

// Export utility functions
export const generateOrderId = PaymentService.generateOrderId;
export const generateTransactionId = PaymentService.generateTransactionId;
export const handlePaymentError = PaymentService.handlePaymentError;

export default PaymentService;
