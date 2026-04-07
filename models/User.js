// backend/models/User.js
import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
  productId: { type: String, required: true }, // String for your temp "1", "2", "3" IDs
  name: { type: String, required: true },
  price: { type: String }, // String to handle your "$120" format
  image: { type: String },
  discount: { type: String },
  rating: { type: Number, default: 0 }
}, { _id: true }); // We keep _id: true to make deleting by specific item ID easier

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // Password is only required for 'local' signups
  password: {
    type: String,
    required: function() {
      return !this.googleId; 
    },
  },
  // --- OAUTH & IDENTITY ---
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Crucial: allows nulls for local users
  },
  authMethod: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  avatar: {
    type: String, 
    default: "https://placehold.co/400x400?text=User", // Standard fallback
  },
  // --- E-COMMERCE SPECIFIC ---
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Linking products to the user for persistence
  wishlist: [wishlistItemSchema],
  isVerified: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });



const User = mongoose.model("User", userSchema);
export default User;