import { toggleWishlist,
    getWishlist,
    clearWishlist } from "../controllers/authController.js";
import express from "express";
import userAuth from "../middlewares/userAuth.js";  
const router = express.Router();

router.use(userAuth);

router.post("w/add", toggleWishlist);
router.get("w/show", getWishlist);
router.delete("w/clear", clearWishlist);

export default router;