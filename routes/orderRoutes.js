import express from "express";
import { createCheckoutSession, createCODOrder, paymentstatus,getOrderTracking} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/cod", createCODOrder);
router.put("/update-payment", paymentstatus);
router.get("/track/:id",getOrderTracking);
//.post("/", orderinfo);

export default router;
