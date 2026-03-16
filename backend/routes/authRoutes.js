/**
 * Auth Routes
 * - Register (user only)
 * - Login (user/admin - both stored in MongoDB)
 * - Logout
 */

import express from 'express';
import { register, signup, login, logout, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register - User register (preferred)
router.post('/register', register);

// POST /api/auth/signup - Backward compatible alias
router.post('/signup', signup);

// POST /api/auth/login - Both admin and user login (single form)
router.post('/login', login);

// POST /api/auth/logout - clears cookie
router.post('/logout', logout);

// PUT /api/auth/update-profile - Update user profile
router.put('/update-profile', updateProfile);

export default router;
