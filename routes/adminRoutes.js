const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  isAdmin,
  getAllUsers,
  getAllAdminsAndUsers,
  upgradeUserToAdmin,
  addTable,
  getTables,
  updateTable,
  deleteTable,
} = require("../controllers/AdminController");

const router = express.Router();

// Route cho Admin
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/", isAdmin, getAdmins);
router.get("/users", isAdmin, getAllUsers);
router.get("/all", isAdmin, getAllAdminsAndUsers);
router.put("/:id", isAdmin, updateAdmin);
router.delete("/:id", isAdmin, deleteAdmin);
router.put("/updateRole/:id", isAdmin, upgradeUserToAdmin);

// Route cho Table
router.post("/tables", isAdmin, addTable);
router.get("/tables", isAdmin, getTables);
router.put("/tables/:id", isAdmin, updateTable);
router.delete("/tables/:id", isAdmin, deleteTable);

module.exports = router;
