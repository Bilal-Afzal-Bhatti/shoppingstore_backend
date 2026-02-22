import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// REGISTER
export const register = async (req, res) => {
  const { name, emailOrPhone, password } = req.body; // match frontend key exactly

  try {
    // Check if user already exists using emailOrPhone
    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      emailOrPhone,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ===== NODEMAILER =====
    if (emailOrPhone.includes("@")) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"ECOMMERCE SHOP" <${process.env.EMAIL_USER}>`,
          to: emailOrPhone,
          subject: "Welcome to ECOMMERCE SHOP",
          html: `
            <h2>Hello ${name}!</h2>
            <p>You have successfully registered at <strong>ECOMMERCE SHOP</strong>.</p>
            <p>Start shopping now and enjoy our services!</p>
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }
    // ======================

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const user = await User.findOne({ emailOrPhone });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const updateUser = async (req, res) => {
  try {
    const { name, emailOrPhone, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (emailOrPhone) user.emailOrPhone = emailOrPhone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET PROFILE (Protected)
export const getProfile = async (req, res) => {
  res.json({
    message: "User profile accessed",
    user: req.user,
  });
};
