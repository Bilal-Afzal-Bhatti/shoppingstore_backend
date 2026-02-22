// models/User.js
// backend/models/User.js
import mongoose from "mongoose"; // <-- use import instead of require



const userSchema = new mongoose.Schema({
  name: {
  type: String,
  trim: true,       // removes leading/trailing spaces
  required: true,  // optional field
  default: ""       // optional: default empty string if not provided
},
emailOrPhone: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
    sparse: true, // allows null
},

  password: {
    type: String,
    required: true,
  },
  // optional fields
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  }
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

export default User; // ✅ ES Module export