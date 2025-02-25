import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/admin/AuthController.js";
import { getAdmins, updateAdmin, deleteAdmin, getAdminProfile, changeAdminPassword } from "../controllers/admin/AdminController.js";
// import { getAllUsers, getAllAdminsAndUsers, deleteUser, upgradeUserToAdmin } from "../controllers/admin/UserController.js";
import { getAllUsers, deleteUser } from "../controllers/admin/UserController.js";
import { addTable, getTables, updateTable, deleteTable } from "../controllers/admin/TableController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

console.log(123123132);


// Route cho Admin
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/admins", isAdmin, getAdmins);
router.get("/users", isAdmin, getAllUsers);
// router.get("/all", isAdmin, getAllAdminsAndUsers);
router.delete("/users/:id", isAdmin, deleteUser);
router.delete("/admins/:id", isAdmin, deleteAdmin);

// Route lấy và cập nhật thông tin admin
router.get("/profile", isAdmin, getAdminProfile);
router.put("/profile/:id", isAdmin, updateAdmin);
router.put("/editPass", isAdmin, changeAdminPassword);

// Route cho Table
router.post("/tables", isAdmin, addTable);
router.get("/tables", isAdmin, getTables);
router.put("/tables/:id", isAdmin, updateTable);
router.delete("/tables/:id", isAdmin, deleteTable);

export default router;
