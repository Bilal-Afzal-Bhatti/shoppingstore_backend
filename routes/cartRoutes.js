import express from "express";
import { addToCart } from "../controllers/cartController.js";
import { requireLogin } from "../middlewares/authMiddleware.js";
import {   getCart} from "../controllers/cartController.js";
import { updateCartItem, deleteCartItem } from "../controllers/cartController.js";
import userAuth from "../middlewares/userAuth.js";
import { clearCart } from "../controllers/cartController.js";
const router = express.Router();

router.post("/add", requireLogin, addToCart);
router.get("/showcart", getCart);
// ✅ Update quantity
router.put("/update/:userId/:id", userAuth, updateCartItem);

router.delete("/delete/:userId/:id", userAuth, deleteCartItem);
// ... existing imports


// ✅ Clear entire cart after payment
// Remove "/:userId" from the path
router.delete("/clear", userAuth, clearCart);


export default router;
