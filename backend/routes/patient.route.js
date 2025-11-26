import express from "express";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientRiskAssessment,
  getRiskAssessmentHistory,
  getDemoRiskAssessment
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);
router.get("/:id/risk-assessment", getPatientRiskAssessment);
router.get("/:id/risk-assessment-history", getRiskAssessmentHistory);
router.post("/demo-risk-assessment", getDemoRiskAssessment);

export default router;
