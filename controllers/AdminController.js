require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Đăng ký admin
exports.registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin already exists" });
  }
  if (!email.endsWith("@admin.com")) {
    return res.status(400).json({ message: "Email must end with @admin.com" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({
    username,
    email,
    passwordHash: hashedPassword,
    role: "admin",
  });
  await admin.save();
  res.status(201).json({ message: "Admin registered successfully", admin });
};

// Đăng nhập admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: admin._id, role: admin.role }, // Sử dụng role từ cơ sở dữ liệu
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: admin.role, // Trả về role từ cơ sở dữ liệu
      userId: admin._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy danh sách admin
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-passwordHash");
    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }
    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error });
  }
};

// Cập nhật thông tin admin
exports.updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;

  // Kiểm tra nếu email đã tồn tại và không phải là email của admin hiện tại
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin && existingAdmin._id.toString() !== id) {
    return res
      .status(400)
      .json({ message: "Email already in use by another admin" });
  }

  const updateData = { username, email };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-passwordHash");
    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res
      .status(200)
      .json({ message: "Admin updated successfully", updatedAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating admin", error });
  }
};

// Xóa admin
exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;
  const deletedAdmin = await Admin.findByIdAndDelete(id);
  if (!deletedAdmin) {
    return res.status(404).json({ message: "Admin not found" });
  }
  res.status(200).json({ message: "Admin deleted successfully" });
};

// Middleware xác thực admin
exports.isAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng biến môi trường
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

const User = require("../models/User"); // Import model User

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); // Loại bỏ trường passwordHash
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// API: Lấy tất cả Admins và Users
exports.getAllAdminsAndUsers = async (req, res) => {
  try {
    const admins = await Admin.find().select("-passwordHash");
    const users = await User.find().select("-passwordHash");

    if (!admins.length && !users.length) {
      return res.status(404).json({ message: "No admins or users found" });
    }

    res.status(200).json({ admins, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching admins and users", error });
  }
};
// API: Nâng cấp user lên admin
exports.upgradeUserToAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra nếu user đã là admin
    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    // Cập nhật vai trò của user thành admin
    user.role = "admin";
    await user.save();

    res
      .status(200)
      .json({ message: "User upgraded to admin successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error upgrading user to admin", error });
  }
};
const Table = require("../models/Table");

// API thêm bàn (table)
exports.addTable = async (req, res) => {
  const { name, phoneNumber, numberOfPeople, dateTime, note, email } = req.body;

  // Kiểm tra các trường bắt buộc (loại bỏ email khỏi danh sách bắt buộc)
  if (!name || !numberOfPeople || !dateTime) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  try {
    // Nếu email được cung cấp, kiểm tra xem đã tồn tại chưa
    if (email) {
      const existingTable = await Table.findOne({ email });
      if (existingTable) {
        return res
          .status(400)
          .json({ message: "Bàn với email này đã tồn tại" });
      }
    }

    // Tạo mới bàn
    const newTable = new Table({
      name,
      phoneNumber,
      numberOfPeople,
      dateTime,
      note,
      email, // có thể undefined
    });

    await newTable.save();

    res.status(201).json({ message: "Thêm bàn thành công", table: newTable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm bàn", error: error.message });
  }
};

// API lấy danh sách bàn – READ
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    if (!tables || tables.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bàn nào" });
    }
    res.status(200).json({ tables });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách bàn", error: error.message });
  }
};

// API cập nhật thông tin bàn – UPDATE
exports.updateTable = async (req, res) => {
  const { id } = req.params;
  const { name, phoneNumber, numberOfPeople, dateTime, note, email } = req.body;

  try {
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }

    // Nếu email được cập nhật và khác với giá trị hiện tại, kiểm tra trùng lặp
    if (email && email !== table.email) {
      const existingTable = await Table.findOne({ email });
      if (existingTable) {
        return res
          .status(400)
          .json({ message: "Email đã tồn tại với một bàn khác" });
      }
    }

    // Cập nhật các trường (nếu có dữ liệu mới)
    table.name = name || table.name;
    table.phoneNumber = phoneNumber || table.phoneNumber;
    table.numberOfPeople = numberOfPeople || table.numberOfPeople;
    table.dateTime = dateTime || table.dateTime;
    table.note = note || table.note;
    table.email = email || table.email;

    await table.save();
    res.status(200).json({ message: "Cập nhật bàn thành công", table });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật bàn", error: error.message });
  }
};

// API xóa bàn – DELETE
exports.deleteTable = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTable = await Table.findByIdAndDelete(id);
    if (!deletedTable) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }
    res.status(200).json({ message: "Xóa bàn thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi xóa bàn", error: error.message });
  }
};
