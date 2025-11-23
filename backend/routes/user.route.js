// backend/routes/user.route.js
import express from "express";
import {
    getUsers,
    getGroups,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/cognitoVerifier.js";

const router = express.Router();

// All user management routes require Admin role
router.use(requireAuth);
router.use(requireRole("Admin"));

// Get all users
router.get("/", getUsers);

// Get available groups/roles
router.get("/groups", getGroups);

// Create new user
router.post("/", createUser);

// Update user (change role)
router.put("/:username", updateUser);

// Delete user
router.delete("/:username", deleteUser);

// Reset user password
router.post("/:username/reset-password", resetPassword);

export default router;