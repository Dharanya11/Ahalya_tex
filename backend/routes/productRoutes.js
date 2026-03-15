import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts);
router.route('/:id').get(getProductById);
router.route('/').post(verifyToken, verifyAdmin, createProduct);
router.route('/:id').put(verifyToken, verifyAdmin, updateProduct).delete(verifyToken, verifyAdmin, deleteProduct);

export default router;
