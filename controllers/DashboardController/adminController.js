
// This goes up TWO levels (out of DashboardController and out of controllers)
import OrderCancellation from '../../models/DashboardModels/orderCancellation.js';
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- ADMIN AUTH ---
export const adminRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({
      name, email, password: hashedPassword, role: 'admin', authMethod: 'local'
    });
    
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ message: "Admin created", token, user: newAdmin });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') return res.status(403).json({ message: "Access denied or Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ message: "Login successful", token, user });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// getCancellations and processCancellation
export const getCancellations = async (req, res) => {
  try {
    // Shows user details in customer page, including if they entered shop via google/local
    const cancellations = await OrderCancellation.find()
      .populate('orderId')
      .populate('userId', 'name email authMethod') 
      .sort({ createdAt: -1 });
      
    res.status(200).json(cancellations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cancellations", error: error.message });
  }
};

export const processCancellation = async (req, res) => {
  try {
    const { cancellationId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const cancellation = await OrderCancellation.findById(cancellationId).populate('orderId');
    if (!cancellation) return res.status(404).json({ message: "Cancellation request not found" });

    const order = cancellation.orderId;

    if (action === 'approve') {
      // Check if the parcel is in processing then cancel it
      if (order.orderStatus === 'processing') {
        order.orderStatus = 'cancelled';
        await order.save();
        
        cancellation.requestStatus = 'Approved';
        cancellation.refundStatus = 'Pending';
        cancellation.adminComment = "Order cancelled from processing state. Sending back to the res.";
        await cancellation.save();
        
        return res.status(200).json({ 
            message: "Success! Order was in processing, now cancelled and sending back to the res.",
            order,
            cancellation
        });
      } else {
        return res.status(400).json({ message: `Cannot cancel: Order is already ${order.orderStatus}` });
      }
    } else if (action === 'reject') {
      cancellation.requestStatus = 'Rejected';
      await cancellation.save();
      return res.status(200).json({ message: "Cancellation rejected." });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error processing cancellation", error: error.message });
  }
};
