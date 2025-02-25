// orderRoutes.js (ES Modules)
import express from "express";
import { createOrder, getOrderById, getOrders } from "../controllers/orderController.js";

const router = express.Router();

// Create a new order
router.post("/", createOrder);

router.get("/", getOrders);

// Get order details by ID
router.get("/:orderId", getOrderById);

export default router;
