import express from 'express';
import { registerAdmin, loginAdmin, getAdminProfile } from '../controllers/adminController.js';
import { requireLogin } from '../middlewares/authMiddleware.js';

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

export default router;