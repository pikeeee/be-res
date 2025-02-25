import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import userController from "../controllers/UserController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

// Signup Route
router.post("/signup", userController.signup);
// Login Route
router.post("/login", userController.login);
// Get User Profile Route
router.get("/profile", userController.getProfile);
// Logout Route
router.post("/logout", userController.logout);
// Edit User Profile Route
router.put("/profile", userController.editProfile);
// Edit PassWord
router.put("/editPass", userController.editPassword);
// Verify New Account
router.post("/verify", userController.verifyCode);
// Send verify to reset
router.post("/forget-password", userController.sendForgotPasswordCode);
// Reset password
router.post("/reset-password", userController.resetPassword);
// Upload Avatar
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("profile-image"),
  userController.uploadAvatar
);

export default router;
