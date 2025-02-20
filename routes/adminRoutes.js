//routes/adminRoutes.js
const express = require("express");
const {
  registerAdmin,

  loginAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  isAdmin,
  getAllUsers,
} = require("../controllers/AdminController");

const router = express.Router();

router.post("/register", registerAdmin);

router.post("/login", loginAdmin);

router.get("/", isAdmin, getAdmins);

router.put("/:id", isAdmin, updateAdmin);

router.delete("/:id", isAdmin, deleteAdmin);

router.get("/users", isAdmin, getAllUsers);
module.exports = router;
