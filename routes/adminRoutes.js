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
import {
  getCustomers,
  getCustomerById,
  deleteCustomer,
} from '../controllers/adminCustomerController.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getStoreSettings,
  updateStoreSettings,
  getNotificationSettings,
  updateNotificationSettings,
} from '../controllers/adminSettingsController.js';

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



 
// Customer routes — all under /api/admin/customers
router.get('/customers',        getCustomers);      // GET all + summary stats
router.get('/customers/:id',    getCustomerById);   // GET single customer
router.delete('/customers/:id', deleteCustomer);    // DELETE customer
 


// ===== ADD THESE LINES into your existing adminRoutes.js =====



// Settings routes — all under /api/admin/settings
router.get('/settings/profile',            getProfile);
router.put('/settings/profile',            updateProfile);
router.put('/settings/password',           changePassword);
router.get('/settings/store',              getStoreSettings);
router.put('/settings/store',              updateStoreSettings);
router.get('/settings/notifications',      getNotificationSettings);
router.put('/settings/notifications',      updateNotificationSettings);
export default router;