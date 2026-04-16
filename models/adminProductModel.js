// models/adminProductModel.js
import mongoose from 'mongoose';

// ─── Color Sub-Schema ─────────────────────────────────────────────────────────
const colorSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true }, // e.g. "Red", "Navy Blue"
  hex:   { type: String, required: true, trim: true }, // e.g. "#FF0000"
  stock: { type: Number, default: 0, min: 0 },         // stock per color variant
}, { _id: true });

const adminProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    discount: {
      type: String,
      default: 'No Discount',
      trim: true,
    },

    // ── Category ──────────────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Electronics',
        'Clothing',
        'Footwear',
        'Accessories',
        'Home & Kitchen',
        'Beauty & Health',
        'Sports & Outdoors',
        'Toys & Games',
        'Books',
        'Other',
      ],
      default: 'Other',
    },

    // ── Colors ────────────────────────────────────────────────────────────────
    // Array of color variants — each has name, hex code, and its own stock
    colors: {
      type: [colorSchema],
      default: [],
    },
// ── Industry Standard Ratings ──────────────────────────────────────────────
    ratings: {
      average: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5,
        set: v => Math.round(v * 10) / 10 // Industry Standard: Round to 1 decimal
      },
      count: { type: Number, default: 0 },
      // Summary of stars (helpful for building the "5-star bar" UI)
      stars: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  
  { timestamps: true }
);

export default mongoose.model('AdminProduct', adminProductSchema);