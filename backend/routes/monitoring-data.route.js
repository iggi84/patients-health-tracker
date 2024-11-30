import express from "express";
import {
  getMonitoringData,
  createMonitoringData,
  updateMonitoringData,
  deleteMonitoringData, getMonitoringDataByPatientId
} from "../controllers/monitoring.controller.js";

const router = express.Router();

router.get("/", getMonitoringData);
router.get("/:id", getMonitoringDataByPatientId);
router.post("/", createMonitoringData);
router.put("/:id", updateMonitoringData);
router.delete("/:id", deleteMonitoringData);

export default router;
