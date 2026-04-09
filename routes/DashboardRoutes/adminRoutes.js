import express from "express";
import { getCancellations, processCancellation, adminRegister, adminLogin } from "../../controllers/DashboardController/adminController.js";
import { getDashboardStats } from "../../controllers/DashboardController/dashboardController.js";
import { getProducts, addProduct, deleteProduct } from "../../controllers/DashboardController/productController.js";
import { requireAdmin } from "../../middlewares/adminMiddleware.js";

const router = express.Router();

// Admin Authentication
router.post("/auth/register", adminRegister);
router.post("/auth/login", adminLogin);

// Admin Dashboard charts data route
router.get("/dashboard", requireAdmin, getDashboardStats);

// Products management
router.get("/products", requireAdmin, getProducts);
router.post("/products", requireAdmin, addProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);

// Orders Cancellations management
router.get("/cancellations", requireAdmin, getCancellations);
router.post("/cancellations/:cancellationId/process", requireAdmin, processCancellation);

export default router;
