//routes/adminRoutes.js
const express = require("express");
const { registerAdmin, loginAdmin, isAdmin } = require("../controllers/AdminController");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/dashboard", isAdmin, (req, res) => {
  res.json({ message: "Welcome to admin dashboard" });
});

module.exports = router;

