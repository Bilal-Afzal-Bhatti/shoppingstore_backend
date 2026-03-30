import mongoose from 'mongoose';

const orderCancellationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true // Optimization: Helps Admin find cancellations for specific orders faster
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reason: {
    type: String,
    required: [true, "Please provide a reason for cancellation"],
    enum: [
      'Changed my mind',
      'Found a better price elsewhere',
      'Ordered by mistake',
      'Delivery time is too long',
      'Other'
    ]
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: [500, "Notes cannot exceed 500 characters"] // Industrial safety
  },
  // ✅ CHANGE: This tracks the PROGRESS of the cancellation request
  requestStatus: {
    type: String,
    required: true,
    enum: ['Pending Approval', 'Approved', 'Rejected', 'Resolved'],
    default: 'Pending Approval'
  },
  // ✅ ADDED: Admin feedback (Why was a cancellation rejected?)
  adminComment: {
    type: String,
    trim: true
  },
  // ✅ ADDED: Tracking if a refund was processed via Stripe/Paypal
  refundTransactionId: {
    type: String,
    default: null
  }
}, { timestamps: true });

const OrderCancellation = mongoose.model('OrderCancellation', orderCancellationSchema);
export default OrderCancellation;