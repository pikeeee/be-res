import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin.js";

export const registerAdmin = async (req, res) => {
  console.log("Register API Called");  // ✅ Debug xem API có được gọi không
  console.log("Request Body:", req.body);  // ✅ Xem dữ liệu có đúng không
  console.log(123123111111);
  
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!email.endsWith("@admin.com")) {
    return res.status(400).json({ message: "Email must end with @admin.com" });
  }
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({ username, email, passwordHash: hashedPassword, role: "admin" });
  await admin.save();
  res.status(201).json({ message: "Admin registered successfully", admin });
};

export const loginAdmin = async (req, res) => {
  console.log("test login");
  
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful", token, role: admin.role, userId: admin._id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
