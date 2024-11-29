import express from "express";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from "../controllers/patient.controller.js";

const router = express.Router();

router.get("/patients", getPatients);
router.get("/patients/:id", getPatientById);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

export default router;
