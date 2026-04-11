import express from 'express';
import { registerAdmin, loginAdmin, getAdminProfile } from '../controllers/adminController.js';
import { requireLogin } from '../middlewares/authMiddleware.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/adminProductController.js';

const router = express.Router();

/**
 * @route   POST /api/admin/register
 * @desc    Create a new admin account
 */
router.post('/register', registerAdmin);

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate admin & get token
 */
router.post('/login', loginAdmin);

/**
 * @route   GET /api/admin/profile
 * @desc    Get logged-in admin data
 * @access  Private (Requires JWT)
 */
router.get('/profile',  requireLogin, getAdminProfile);
// ===== ADD THESE LINES into your existing adminRoutes.js =====


// Product CRUD — all scoped under /api/admin/products
router.get('/products',        getProducts);
router.get('/products/:id',    getProductById);
router.post('/products',       createProduct);
router.put('/products/:id',    updateProduct);
router.delete('/products/:id', deleteProduct);
export default router;