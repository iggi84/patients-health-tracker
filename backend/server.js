import express from "express";
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
// import productRoutes from "./routes/product.route.js";
import path from "path";
import cors from "cors";
import alertRoute from "./routes/alert.route.js";
import monitoringDataRoute from "./routes/monitoring-data.route.js";
import patientRoute from "./routes/patient.route.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = ["https://opto.website"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    credentials: true, // Allow cookies or credentials if needed
  })
);


const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use(express.json());


app.use("/api/alert", alertRoute);
app.use("/api/monitoring", monitoringDataRoute);
app.use("/api/patient", patientRoute);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  connectDB();
  console.log("Server started at port " + PORT);
});
