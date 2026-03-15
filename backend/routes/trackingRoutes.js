import express from 'express';
import { trackByNumber, updateTrackingLocation } from '../controllers/trackingController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:trackingNumber', trackByNumber);
router.put('/:trackingNumber/location', verifyToken, verifyAdmin, updateTrackingLocation);

export default router;
