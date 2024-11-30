import Monitoring from "../models/monitoring-data.model.js";
import mongoose from "mongoose";

// Get all monitoring data
export const getMonitoringData = async (req, res) => {
  try {
    const monitoringData = await Monitoring.find({});
    res.status(200).json({ success: true, data: monitoringData });
  } catch (error) {
    console.error("Error while fetching monitoring data:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get monitoring data by patient ID
export const getMonitoringDataByPatientId = async (req, res) => {
  const { id } = req.params;
  const { latest } = req.query;

  console.log("Received patientId:", id);
  console.log(mongoose.Types.ObjectId.isValid(id));
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid patient ID" });
  }

  try {
    let query = { patientId: id };
    let options = latest === "true" ? { sort: { monitoringTimestamp: -1 }, limit: 1 } : {};

    console.log("Query:", query);

    const monitoringData = await Monitoring.findOne(query).sort({ updatedAt: -1 });
    console.log("Fetched data:", monitoringData);
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    res.status(200).json({ success: true, data: latest === "true" ? monitoringData : monitoringData });
  } catch (error) {
    console.error("Error fetching monitoring data:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create new monitoring data
export const createMonitoringData = async (req, res) => {
  const monitoring = req.body;

  // Validate required fields
  if (!monitoring.patientId) {
    return res.status(400).json({ success: false, message: "Please provide all required fields." });
  }

  const newMonitoringData = new Monitoring(monitoring);

  try {
    await newMonitoringData.save();
    return res.status(201).json({ success: true, data: newMonitoringData });
  } catch (error) {
    console.error("Error while saving monitoring data:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update monitoring data
export const updateMonitoringData = async (req, res) => {
  const { id } = req.params;
  const monitoring = req.body;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Monitoring data not found with that ID." });
  }

  try {
    const updatedMonitoringData = await Monitoring.findByIdAndUpdate(id, monitoring, { new: true });
    res.status(200).json({ success: true, data: updatedMonitoringData });
  } catch (error) {
    console.error("Error while updating monitoring data:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete monitoring data
export const deleteMonitoringData = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Monitoring data not found with that ID." });
  }

  try {
    await Monitoring.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Monitoring data deleted" });
  } catch (error) {
    console.error("Error while deleting monitoring data:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
