import express from 'express';
import { verifyToken, verifyUser, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/user/dashboard (protected, user only)
 */
router.get('/user/dashboard', verifyToken, verifyUser, (req, res) => {
  res.json({
    message: 'Welcome to the USER dashboard',
    user: req.user, // already excludes password in middleware
  });
});

/**
 * GET /api/admin/dashboard (protected, admin only)
 */
router.get('/admin/dashboard', verifyToken, verifyAdmin, (req, res) => {
  res.json({
    message: 'Welcome to the ADMIN dashboard',
    user: req.user,
  });
});

export default router;

