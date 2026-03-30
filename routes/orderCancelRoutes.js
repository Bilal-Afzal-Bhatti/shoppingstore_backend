import express from 'express';
const router = express.Router();
import { 
  requestOrderCancellation, 
  processCancellationAdmin 
} from '../controllers/orderCancelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// User Route: Request a cancellation
// POST /api/orders/:id/cancel
router.route('/:id/cancel').post(protect, requestOrderCancellation);

// Admin Route: Approve or Reject a cancellation
// PUT /api/admin/orders/cancellation/:id
router.route('/admin/cancellation/:id').put(protect, admin, processCancellationAdmin);

export default router;