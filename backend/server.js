import express from "express";
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import path from "path";
import cors from "cors";
import alertRoute from "./routes/alert.route.js";
import monitoringDataRoute from "./routes/monitoring-data.route.js";
import patientRoute from "./routes/patient.route.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";  // ADD THIS
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.options('*', cors());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use(express.json());

// Auth routes (public - no auth required for token exchange)
app.use("/api/auth", authRoute);  // ADD THIS

// Protected test route
app.get('/api/protected-test', requireAuth, (req, res) => {
    res.json({
        message: 'You are authenticated with Cognito 🎉',
        user: {
            sub: req.user.sub,
            email: req.user.email,
            groups: req.user['cognito:groups'] || [],
        },
    });
});

// API routes (will add protection later)
app.use("/api/alert", alertRoute);
app.use("/api/monitoring", monitoringDataRoute);
app.use("/api/patient", patientRoute);
app.use("/api/users", userRoute);

if (process.env.NODE_ENV === "production") {
    console.log("This is the production setting.");
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log("Server started at port " + PORT);
});