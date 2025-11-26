import Patient from "../models/patient.model.js";
import mongoose from "mongoose";
import Monitoring from "../models/monitoring-data.model.js";
import { getRiskPrediction } from '../ml/predictor.js';
import RiskAssessment from "../models/risk-assessment.model.js";

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

export const getPatientRiskAssessment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid patient ID" });
        }

        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        const monitoring = await Monitoring.findOne({ patientId: id }).sort({ updatedAt: -1 });
        if (!monitoring) {
            return res.status(404).json({ success: false, message: "No monitoring data found" });
        }

        // Get ML prediction
        const prediction = await getRiskPrediction(patient, monitoring);

        // Calculate BMI for snapshot
        let bmi = null;
        if (patient.weight && patient.height) {
            const heightInMeters = patient.height / 100;
            bmi = patient.weight / (heightInMeters * heightInMeters);
        }

        // Save assessment to database for audit trail (HIPAA compliance)
        const assessment = new RiskAssessment({
            patientId: id,
            riskLevel: prediction.riskLevel,
            confidence: prediction.confidence,
            riskFactors: prediction.riskFactors || [],
            probabilities: prediction.probabilities,
            vitalSignsSnapshot: {
                heartRate: monitoring.vitalSigns.heartRate,
                respiratoryRate: monitoring.vitalSigns.respiratoryRate,
                bloodPressure: {
                    systolic: monitoring.vitalSigns.bloodPressure.systolic,
                    diastolic: monitoring.vitalSigns.bloodPressure.diastolic
                },
                oxygenSaturation: monitoring.vitalSigns.oxygenSaturation,
                temperature: monitoring.vitalSigns.temperature
            },
            patientMetadata: {
                age: patient.age,
                weight: patient.weight,
                height: patient.height,
                bmi: bmi
            },
            assessmentTimestamp: new Date()
        });

        await assessment.save();

        res.status(200).json({
            success: true,
            data: {
                patientId: id,
                patientName: patient.name,
                timestamp: assessment.assessmentTimestamp,
                ...prediction
            }
        });
    } catch (error) {
        console.error("Risk assessment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRiskAssessmentHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: "Invalid patient ID" });
        }

        const history = await RiskAssessment.find({ patientId: id })
            .sort({ assessmentTimestamp: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Error fetching risk assessment history:", error);
        res.status(500).json({ success: false, message: error.message });
    }


};

// Demo risk assessment - accepts vitals directly without DB lookup
export const getDemoRiskAssessment = async (req, res) => {
    try {
        const { vitals, patientInfo } = req.body;

        if (!vitals) {
            return res.status(400).json({ success: false, message: "Vitals data required" });
        }

        // Create mock patient and monitoring objects for the predictor
        const mockPatient = {
            dateOfBirth: patientInfo?.dateOfBirth || null,
            age: patientInfo?.age || 50,
            weight: patientInfo?.weight || 70,
            height: patientInfo?.height || 170,
        };

        const mockMonitoring = {
            vitalSigns: {
                heartRate: vitals.heartRate,
                respiratoryRate: vitals.respiratoryRate,
                temperature: vitals.temperature,
                oxygenSaturation: vitals.oxygenSaturation,
                bloodPressure: {
                    systolic: vitals.systolic,
                    diastolic: vitals.diastolic,
                },
            },
        };

        // Get ML prediction
        const prediction = await getRiskPrediction(mockPatient, mockMonitoring);

        res.status(200).json({
            success: true,
            data: {
                timestamp: new Date(),
                ...prediction,
            },
        });
    } catch (error) {
        console.error("Demo risk assessment error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};