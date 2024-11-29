import Alert from "../models/alert.model.js";
import mongoose from "mongoose";

// Get all alerts
export const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({});
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    console.error("Error while fetching alerts:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create a new alert
export const createAlert = async (req, res) => {
  const alert = req.body;

  // Validate required fields
  if (!alert.patientId || !alert.type || !alert.message || !alert.priority) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." });
  }

  const newAlert = new Alert(alert);

  try {
    await newAlert.save();
    return res.status(201).json({ success: true, data: newAlert });
  } catch (error) {
    console.error("Error while saving alert:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update an alert
export const updateAlert = async (req, res) => {
  const { id } = req.params;
  const alert = req.body;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Alert not found with that ID." });
  }

  try {
    const updatedAlert = await Alert.findByIdAndUpdate(id, alert, { new: true });
    res.status(200).json({ success: true, data: updatedAlert });
  } catch (error) {
    console.error("Error while updating alert:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete an alert
export const deleteAlert = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Alert not found with that ID." });
  }

  try {
    await Alert.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Alert deleted" });
  } catch (error) {
    console.error("Error while deleting alert:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
