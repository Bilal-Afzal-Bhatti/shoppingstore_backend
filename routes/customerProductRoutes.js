import express from 'express';
import { getProducts, getProductById, rateProduct } from '../controllers/customerProductController.js';

const router = express.Router();

// GET /api/customer/product/show
router.get('/show', getProducts);

// GET /api/customer/product/:id
router.get('/:id', getProductById);

// POST /api/customer/product/:id/rate
router.post('/:id/rate', rateProduct);

export default router;
