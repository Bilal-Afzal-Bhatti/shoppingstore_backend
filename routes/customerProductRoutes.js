import express from 'express';
import { getProducts, getProductById } from '../controllers/customerProductController.js';

const router = express.Router();

// GET /api/customer/product
router.get('/', getProducts);

// GET /api/customer/product/:id
router.get('/:id', getProductById);

export default router;
