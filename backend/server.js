import express from "express";
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import path from "path";
import cors from "cors";
import alertRoute from "./routes/alert.route.js";
import monitoringDataRoute from "./routes/monitoring-data.route.js";
import patientRoute from "./routes/patient.route.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import { requireAuth } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.options('*', cors());
app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true
    })
);

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use(express.json());

app.use("/api/auth", authRoute);

app.use("/api/alert", requireAuth, alertRoute);
app.use("/api/monitoring", requireAuth, monitoringDataRoute);
app.use("/api/patient", requireAuth, patientRoute);
app.use("/api/users", requireAuth, userRoute);

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