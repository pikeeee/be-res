import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import userController from "../controllers/UserController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/profile", userController.getProfile);
router.post("/logout", userController.logout);
router.put("/profile", userController.editProfile);
router.put("/editPass", userController.editPassword);
router.post("/verify", userController.verifyCode);
router.post("/forget-password", userController.sendForgotPasswordCode);
router.post("/reset-password", userController.resetPassword);
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("profile-image"),
  userController.uploadAvatar
);

export default router;
