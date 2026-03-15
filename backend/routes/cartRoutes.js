import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getCart, putCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/', verifyToken, getCart);
router.put('/', verifyToken, putCart);
router.delete('/', verifyToken, clearCart);

export default router;
