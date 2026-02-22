// app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import useremail from "./routes/useremailRoutes.js";
import userfeedback from "./routes/feedbackRoutes.js"

import cartRoutes from "./routes/cartRoutes.js"; // your cart routes

import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";


dotenv.config();

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
// ✅ Allow requests from your frontend (Vite runs on port 5173)
app.use(cors({
  origin: ["http://localhost:5173",   "http://192.168.18.40:5173",],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/useremail",useremail );
app.use("/api/userfeedback",userfeedback);
app.use("/api/cart",cartRoutes);
app.use("/api/orders", orderRoutes);

// test route
app.get("/", (req, res) => res.send("API is running..."));

export default app;
