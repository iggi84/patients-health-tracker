import Patient from "../models/patient.model.js";
import mongoose from "mongoose";

// Get all patients
export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    console.error("Error while fetching patients:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get a specific patient by ID
export const getPatientById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Patient not found with that ID." });
  }

  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error("Error while fetching patient:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Create a new patient
export const createPatient = async (req, res) => {
  const { name, age, contactInfo, medicalHistory, assignedDeviceId } = req.body;

  // Validate required fields
  if (!name || !age) {
    return res.status(400).json({ success: false, message: "Please provide name and age." });
  }

  try {
    const newPatient = new Patient({
      name,
      age,
      contactInfo: contactInfo || {}, // Default to empty object if not provided
      medicalHistory: medicalHistory || [], // Default to empty array if not provided
      assignedDeviceId: assignedDeviceId || null, // Default to null if not provided
    });

    await newPatient.save();
    return res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    console.error("Error while saving patient:", error.message);
    return res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// Update a patient's data
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const patient = req.body;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Patient not found with that ID." });
  }

  try {
    const updatedPatient = await Patient.findByIdAndUpdate(id, patient, { new: true });
    if (!updatedPatient) {
      return res.status(404).json({ success: false, message: "Patient not found." });
    }
    res.status(200).json({ success: true, data: updatedPatient });
  } catch (error) {
    console.error("Error while updating patient:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete a patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Patient not found with that ID." });
  }

  try {
    await Patient.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Patient deleted" });
  } catch (error) {
    console.error("Error while deleting patient:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
