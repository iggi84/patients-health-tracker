import express from "express";
import {
  getMonitoringData,
  createMonitoringData,
  updateMonitoringData,
  deleteMonitoringData
} from "../controllers/monitoring.controller.js";

const router = express.Router();

router.get("/monitoring", getMonitoringData);
router.post("/monitoring", createMonitoringData);
router.put("/monitoring/:id", updateMonitoringData);
router.delete("/monitoring/:id", deleteMonitoringData);

export default router;
