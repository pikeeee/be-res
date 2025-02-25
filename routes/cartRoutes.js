import express from "express";
import cartController from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", cartController.getCart);
router.post("/:userId", cartController.addToCart);
router.put("/:userId/:productId", cartController.updateCartItem);

export default router;
