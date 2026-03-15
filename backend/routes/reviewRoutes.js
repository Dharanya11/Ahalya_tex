import express from 'express';
import { getReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getReviews).post(createReview);

// Admin-only delete (optional)
router.route('/:id').delete(verifyToken, verifyAdmin, deleteReview);

export default router;
