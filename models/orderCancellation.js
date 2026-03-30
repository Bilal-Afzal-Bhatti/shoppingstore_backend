import mongoose from 'mongoose';

const orderCancellationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true 
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
    maxlength: [500, "Notes cannot exceed 500 characters"]
  },
  requestStatus: {
    type: String,
    required: true,
    enum: ['Pending Approval', 'Approved', 'Rejected', 'Resolved'],
    default: 'Pending Approval'
  },
  
  // --- NEW INDUSTRIAL FIELDS ---

  // 1. Tracks if the money was actually returned to the customer
  refundStatus: {
    type: String,
    enum: ['N/A', 'Pending', 'Completed', 'Failed'],
    default: 'N/A' // N/A for COD, Pending for Stripe/Online
  },

  // 2. Tracks if the items were added back to the product stock
  isRestocked: {
    type: Boolean,
    default: false 
  },

  // 3. Admin details for internal tracking
  adminComment: {
    type: String,
    trim: true
  },
  
  // 4. Reference for Stripe/PayPal refund receipts
  refundTransactionId: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Indexing for faster admin queries
orderCancellationSchema.index({ requestStatus: 1 });

const OrderCancellation = mongoose.model('OrderCancellation', orderCancellationSchema);
export default OrderCancellation;