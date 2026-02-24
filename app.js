// app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import useremail from "./routes/useremailRoutes.js";
import userfeedback from "./routes/feedbackRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shopping-store-blond-one.vercel.app"
    ],
    credentials: true,
  })
);

app.options("*", cors());
// ===== MongoDB Connection (IMPORTANT for Serverless) =====
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

connectDB();

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/useremail", useremail);
app.use("/api/userfeedback", userfeedback);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.status(200).send("API is running...");
});

export default app;