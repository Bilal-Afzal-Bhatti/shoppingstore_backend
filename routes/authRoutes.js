import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getProfile } from "../controllers/authController.js"; // import from authController
import { register, login } from "../controllers/authController.js";
import { updateUser } from "../controllers/authController.js";

const router = express.Router();

// REGISTER route
router.post("/register", register);

// LOGIN route
router.post("/login", login);

// PROFILE route (protected)
router.get("/profile", userAuth, getProfile);
router.put("/update",userAuth, updateUser);

export default router;
