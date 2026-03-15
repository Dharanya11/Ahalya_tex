import express from 'express';
import { addOrderItems, getMyOrders, getOrderById, getOrders, updateOrderStatus, confirmOrderPayment } from '../controllers/orderController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(verifyToken, addOrderItems);
router.route('/myorders').get(verifyToken, getMyOrders);
router.route('/:id').get(verifyToken, getOrderById);
router.route('/').get(verifyToken, verifyAdmin, getOrders);
router.route('/:id/status').put(verifyToken, verifyAdmin, updateOrderStatus);
router.route('/:id/payment-confirm').post(verifyToken, confirmOrderPayment);

export default router;
