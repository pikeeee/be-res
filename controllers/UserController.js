import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationCode } from "../services/EmailService.js";
import dotenv from "dotenv";
dotenv.config();

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidEmailName = (email) => {
  const emailName = email.split("@")[0];
  const emailNameRegex = /^[a-zA-Z0-9]{6,}$/;
  return emailNameRegex.test(emailName);
};

const isValidPassword = (password) => {
  const passwordRegex = /^[a-zA-Z0-9]{6,}$/;
  return passwordRegex.test(password);
};

const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;
  return phoneRegex.test(phoneNumber);
};

// Hàm để tạo mã xác thực 6 chữ số
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Random 6 chữ số
};

// User Signup
const signup = async (req, res) => {
  const { username, email, password, phoneNumber, address } = req.body;
  
  if (!username || typeof username !== "string" || username.trim().length === 0) {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }
  
  const normalizedEmail = email.toLowerCase().trim();

  // Kiểm tra định dạng email cơ bản
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicEmailRegex.test(normalizedEmail)) {
    return res.status(400).json({ message: "Email format is invalid" });
  }

  // Tách phần local và domain
  const [localPart, domain] = normalizedEmail.split("@");
  // Kiểm tra local part: ít nhất 6 ký tự và chỉ chứa chữ và số
  const localPartRegex = /^[a-zA-Z0-9]{6,}$/;
  if (!localPartRegex.test(localPart)) {
    return res.status(400).json({
      message: "Email name (before @) must be at least 6 characters long and contain only letters and numbers",
    });
  }

  // Kiểm tra mật khẩu
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  // Kiểm tra số điện thoại nếu có
  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({
      message: "Phone number must be a valid Vietnamese phone number",
    });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo mã xác thực 6 chữ số
    const verificationCode = generateVerificationCode();

    // Gửi mã xác thực tới email của người dùng
    await sendVerificationCode(normalizedEmail, verificationCode);

    // Lưu thông tin người dùng với mã xác thực
    const newUser = new User({
      username,
      email: normalizedEmail,
      passwordHash,
      phoneNumber,
      address,
      verificationCode,
      createdAt: Date.now(),
    });

    await newUser.save();
    res.status(201).json({
      message:
        "User created successfully. Please check your email for the verification code.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Xác thực mã
const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Xác thực thành công, cập nhật trạng thái xác thực của người dùng
    user.isVerified = true;
    user.verificationCode = null; // Xóa mã xác thực sau khi xác thực thành công
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });

    // Gọi hàm xóa tài khoản chưa xác thực (nếu có) nhưng không await để đảm bảo lỗi không ảnh hưởng
    deleteUnverifiedAccounts().catch((error) => {
      console.error("Error deleting unverified accounts:", error);
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      console.error("Error after response sent:", error);
    }
  }
};

// Edit Password
const editPassword = async (req, res) => {
  const { password, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Token is required for authentication" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is empty or invalid" });
  }

  if (!newPassword || typeof newPassword !== "string") {
    return res
      .status(400)
      .json({ message: "New password is empty or invalid" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ message: "Password is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Kiểm tra xem tài khoản đã được xác thực chưa
    if (user.verificationCode !== null) {
      return res.status(400).json({ message: "Tài khoản chưa được xác thực" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Gửi mã xác thực khi quên mật khẩu
const sendForgotPasswordCode = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    await sendVerificationCode(normalizedEmail, verificationCode);
    res.status(200).json({ message: "Verification code sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Đặt lại mật khẩu mới sau khi xác thực mã
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase();

  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    !isValidPassword(newPassword)
  ) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters long and cannot contain special characters",
    });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.verificationCode !== null) {
      return res
        .status(400)
        .json({ message: "User not found or verification incomplete" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Fail" });
  }
};

// Get User Profile
const getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
const logout = (req, res) => {
  res.status(200).json({ message: "User logged out successfully" });
};

// Edit User Profile
const editProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const { username, phoneNumber, address } = req.body;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        message: "Phone number must be a valid Vietnamese phone number",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, phoneNumber, address },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({ avatarUrl });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ error: "Error uploading avatar" });
  }
};

// Xuất tất cả các hàm theo default export
export default {
  signup,
  verifyCode,
  editPassword,
  login,
  sendForgotPasswordCode,
  resetPassword,
  getProfile,
  logout,
  editProfile,
  uploadAvatar,
};
