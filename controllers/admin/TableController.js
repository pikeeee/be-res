import Table from "../../models/Table.js";

export const addTable = async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive number" });
  }
  try {
    const tables = await Table.find().sort({ tableNumber: 1 }).exec();
    let tableNumber = tables.length ? tables[tables.length - 1].tableNumber + 1 : 1;
    let newTables = [];
    for (let i = 0; i < quantity; i++) {
      newTables.push({ tableNumber: tableNumber++, numberOfPeople: 0, dateTime: new Date() });
    }
    const insertedTables = await Table.insertMany(newTables);
    res.status(201).json({ message: "Tables created successfully", tables: insertedTables });
  } catch (error) {
    res.status(500).json({ message: "Error creating tables", error: error.message });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
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

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    if (!tables.length) {
      return res.status(404).json({ message: "Không tìm thấy bàn nào" });
    }
    res.status(200).json({ tables });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách bàn", error: error.message });
  }
};

export const updateTable = async (req, res) => {
  const { id } = req.params;
  const { customerName, phoneNumber, numberOfPeople, dateTime, note } = req.body;

  try {
    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ message: "Không tìm thấy bàn" });
    }

    table.customerName = customerName || table.customerName;
    table.phoneNumber = phoneNumber || table.phoneNumber;
    table.numberOfPeople = numberOfPeople || table.numberOfPeople;
    table.dateTime = dateTime || table.dateTime;
    table.note = note || table.note;

    await table.save();
    res.status(200).json({ message: "Cập nhật bàn thành công", table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật bàn", error: error.message });
  }
};