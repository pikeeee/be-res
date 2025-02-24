const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const userController = require("../controllers/UserController");
const upload = require("../config/multerConfig");

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

//Edit PassWord
router.put("/editPass", userController.editPassword);

//Verify New Account
router.post("/verify", userController.verifyCode);

//Send verify to reset
router.post("/forget-password", userController.sendForgotPasswordCode);

//Reset password
router.post("/reset-password", userController.resetPassword);

//// Route để upload ảnh đại diện, xử lý trong controller
router.post("/upload-avatar", authenticateToken, upload.single("profile-image"), userController.uploadAvatar);

module.exports = router;
