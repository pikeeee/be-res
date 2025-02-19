//routes/adminRoutes.js
const express = require("express");
const {
  registerAdmin,
  getAllAdmins,
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

router.get("/admins", getAllAdmins);

router.get("/", isAdmin, getAdmins);

router.put("/:id", isAdmin, updateAdmin);

router.delete("/:id", isAdmin, deleteAdmin);

router.get("/users", isAdmin, getAllUsers);
module.exports = router;
