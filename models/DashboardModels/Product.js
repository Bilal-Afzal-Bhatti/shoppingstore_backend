// models/DashboardModels/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discount: { type: String }, // e.g., "20% OFF"
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, required: true }, // URL from Cloudinary
  category: { 
    type: String, 
    required: true, 
    index: true, // Indexed for faster search/filtering
    enum: ["Electronics", "Fashion", "Home", "Beauty", "Accessories"] 
  },
  brand: { type: String, default: "Generic" },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  sku: { type: String, unique: true, sparse: true } // Stock Keeping Unit for Admin tracking
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;