const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    customerName: { type: String },
    tableNumber: { type: Number, required: true, unique: true },
    phoneNumber: { type: String },
    numberOfPeople: { type: Number, default: 0 },
    dateTime: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
