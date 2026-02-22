import express from "express";
import { addToCart } from "../controllers/cartController.js";
import { requireLogin } from "../middlewares/authMiddleware.js";
import {   getCart} from "../controllers/cartController.js";
import { updateCartItem, deleteCartItem } from "../controllers/cartController.js";
import userAuth from "../middlewares/userAuth.js";
const router = express.Router();

router.post("/add", requireLogin, addToCart);
router.get("/showcart", getCart);
// ✅ Update quantity
router.put("/update/:userId/:id", userAuth, updateCartItem);

router.delete("/delete/:userId/:id", userAuth, deleteCartItem);

export default router;
