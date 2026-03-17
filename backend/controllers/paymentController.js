import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Check if auto-payment mode is enabled (for testing)
    if (process.env.AUTO_PAYMENT_MODE === 'true') {
      console.log('Auto-payment mode enabled - creating dummy order');
      
      // Create a dummy order response for auto-payment
      const dummyOrder = {
        id: `order_auto_${Date.now()}`,
        entity: 'order',
        amount: amount * 100,
        amount_paid: 0,
        amount_due: amount * 100,
        currency: 'INR',
        receipt: `receipt_auto_${Date.now()}`,
        offer_id: null,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
      };
      
      return res.status(200).json(dummyOrder);
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
        process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_secret_key_here') {
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ 
        message: 'Failed to create payment order. Please try again.' 
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      message: 'Payment gateway error. Please try again later.',
      error: error.message 
    });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify-payment
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId // The database Order ID
    } = req.body;

    // Check if auto-payment mode is enabled (for testing)
    if (process.env.AUTO_PAYMENT_MODE === 'true') {
      console.log('Auto-payment mode enabled - verifying payment automatically');
      
      // Auto-verify payment in test mode
      try {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentResult = {
            id: `auto_payment_${Date.now()}`,
            status: 'completed',
            update_time: new Date().toISOString(),
            email_address: req.user?.email || 'customer@example.com',
          };
          await order.save();
          
          return res.status(200).json({
            success: true,
            message: 'Payment verified successfully (auto-mode)',
            order: order
          });
        }
      } catch (error) {
        console.error('Auto-payment verification error:', error);
        return res.status(500).json({ message: 'Auto-payment verification failed' });
      }
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_secret_key_here') {
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please contact administrator.' 
      });
    }

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ 
        message: 'Missing required payment verification parameters' 
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Database update logic
      // Find the order and update status
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if order is already paid
      if (order.isPaid) {
        return res.status(400).json({ 
          message: 'Order is already paid' 
        });
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'Payment Successful',
        update_time: Date.now(),
        email_address: req.user.email,
      };

      if (order.orderStatus === 'Placed') {
        order.orderStatus = 'Confirmed';
        order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
        order.statusHistory.push({ status: 'Confirmed', date: Date.now(), note: 'Payment confirmed' });
      }

      const updatedOrder = await order.save();

      res.json({
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        dbOrder: updatedOrder
      });
    } else {
      res.status(400).json({
        message: 'Invalid payment signature - verification failed',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      message: 'Payment verification failed. Please contact support.',
      error: error.message 
    });
  }
};

// @desc    Check payment status by transaction ID (for QR / polling)
// @route   GET /api/payment/check-status/:transactionId
// @access  Public (data is non-sensitive)
const checkPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const order = await Order.findOne({ 'paymentResult.transactionId': transactionId });

    if (!order) {
      return res.json({
        status: 'pending',
        transactionId,
      });
    }

    const status = order.isPaid ? 'completed' : 'pending';

    return res.json({
      status,
      transactionId,
      orderId: order._id,
      paymentResult: order.paymentResult || null,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return res.status(500).json({
      status: 'unknown',
      message: error.message || 'Failed to check payment status',
    });
  }
};

// @desc    Handle payment timeout callback from Razorpay (optional)
// @route   POST /api/payment/timeout
// @access  Public (called by gateway)
const handlePaymentTimeout = async (req, res) => {
  try {
    // For now just log and acknowledge; can be extended later
    console.warn('Payment timeout callback received:', {
      body: req.body,
    });

    return res.json({ message: 'Payment timeout recorded' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to record payment timeout' });
  }
};

export {
  createRazorpayOrder,
  verifyPayment,
  checkPaymentStatus,
  handlePaymentTimeout,
};
