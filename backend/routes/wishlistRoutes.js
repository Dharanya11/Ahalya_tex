import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getWishlist, putWishlist, clearWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/', verifyToken, getWishlist);
router.put('/', verifyToken, putWishlist);
router.delete('/', verifyToken, clearWishlist);

export default router;
