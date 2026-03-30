import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // 🚀 PERFORMANCE INDEX: Fast lookup for "My Orders"
    },
  items: [
    {
      productId: { type: String, required: true }, // Matches your '2'
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },    // Matches your assets path
      discount: { type: String }                  // Optional: Store the discount too
    },
  ],
    billingInfo: {
      name: { type: String, required: true },
      company: { type: String },
      address: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      zipcode: { type: String, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    stripeSessionId: {
      type: String,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true, // 🚀 PERFORMANCE INDEX: Fast lookup for Admin Dashboard
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtuals show up in API responses
    toObject: { virtuals: true }
  }
  
);

// --- INDUSTRY LEVEL VIRTUAL ---
// This automatically calculates the progress percentage for your React Frontend
orderSchema.virtual('progressPercentage').get(function() {
  const statusMapping = {
    'processing': 33,
    'shipped': 66,
    'delivered': 100,
    'cancelled': 0
  };
  return statusMapping[this.orderStatus] || 0;
});

const Order = mongoose.model("Order", orderSchema);
export default Order;