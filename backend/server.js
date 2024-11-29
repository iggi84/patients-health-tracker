import express from "express";
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
// import productRoutes from "./routes/product.route.js";
import path from "path";
import cors from "cors";
import alertRoute from "./routes/alert.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use(express.json());

app.use(
  cors({
    origin: "https://opto.website", // Allow requests from your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow cookies or credentials if needed
  })
);

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    credentials: true, // Include cookies or credentials if needed
  })
);

 app.use("/api/alert", alertRoute);

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
