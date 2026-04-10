import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Using a unified User model is best practice

export const requireLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Find the user/admin and attach to request
    // This works for BOTH because they share the same collection
    const account = await User.findById(decoded.id).select("-password");

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    req.user = account; // ✅ This contains name, email, and ROLE
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized access" });
  }
};