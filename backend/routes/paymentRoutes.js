import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  checkPaymentStatus,
  handlePaymentTimeout,
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', verifyToken, createRazorpayOrder);
router.post('/verify-payment', verifyToken, verifyPayment);

// QR / UPI payment status polling
router.get('/check-status/:transactionId', checkPaymentStatus);

// Optional timeout callback endpoint (e.g. from Razorpay)
router.post('/timeout', handlePaymentTimeout);

// Test endpoint to check payment configuration
router.get('/test', (req, res) => {
  const isConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  res.json({
    razorpayConfigured: isConfigured,
    keyIdExists: !!process.env.RAZORPAY_KEY_ID,
    keySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
    message: isConfigured ? 'Payment gateway is configured' : 'Payment gateway is not configured'
  });
});

export default router;
