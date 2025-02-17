const Table = require("../models/Table"); // Import schema Table

// Create a new reservation
exports.createReservation = async (req, res) => {
  const { name, phoneNumber, numberOfPeople, dateTime, note, email } = req.body;

  try {
    const newTable = new Table({
      name,
      phoneNumber,
      numberOfPeople,
      dateTime,
      note,
      email,
    });

    await newTable.save();
    res
      .status(201)
      .json({ message: "Reservation created successfully", data: newTable });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res
      .status(500)
      .json({
        error: "Server error while creating reservation",
        details: error.message,
      });
  }
};

// Get a reservation by email
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Table.find();
    res
      .status(200)
      .json({
        message: "Reservations retrieved successfully",
        data: reservations,
      });
  } catch (error) {
    console.error("Error retrieving reservations:", error);
    res
      .status(500)
      .json({
        error: "Server error while fetching reservations",
        details: error.message,
      });
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  const { email } = req.params;
  const { name, phoneNumber, numberOfPeople, dateTime, note } = req.body;

  try {
    const updatedTable = await Table.findOneAndUpdate(
      { email },
      { name, phoneNumber, numberOfPeople, note },
      { new: true }
    );

    if (!updatedTable) {
      return res
        .status(404)
        .json({ message: "Reservation not found for this email" });
    }

    res
      .status(200)
      .json({
        message: "Reservation updated successfully",
        data: updatedTable,
      });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res
      .status(500)
      .json({
        error: "Server error while updating reservation",
        details: error.message,
      });
  }
};
