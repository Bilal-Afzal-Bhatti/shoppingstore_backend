import express from "express";
import { createCheckoutSession, createCODOrder, paymentstatus} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/cod", createCODOrder);
router.put("/update-payment", paymentstatus);
//.post("/", orderinfo);

export default router;
