import express from 'express';
import { authUser, registerUser, getUsers, getUserById, updateUser, deleteUser, toggleUserBlock } from '../controllers/authController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/', registerUser);
router.get('/', verifyToken, verifyAdmin, getUsers);
router.get('/:id', verifyToken, verifyAdmin, getUserById);
router.put('/:id/block', verifyToken, verifyAdmin, toggleUserBlock);
router.put('/:id', verifyToken, verifyAdmin, updateUser);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

export default router;
