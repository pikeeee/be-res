import express from "express";
import { createOrder, getOrderById, getOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrders);

router.get("/:userId", getOrders);

export default router;
