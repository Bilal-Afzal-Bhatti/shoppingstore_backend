import Order from "../models/order.js";
import OrderCancellation from "../models/orderCancellation.js";

export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason, additionalNotes } = req.body;
    
    // 1. AUTH GUARD
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // 2. EXISTENCE GUARD
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 3. OWNERSHIP GUARD
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized request" });
    }

    // 4. DUPLICATE GUARD (Prevents spamming the separate collection)
    const existingRequest = await OrderCancellation.findOne({ orderId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "A request is already in our system" });
    }

    // --- 🚀 MODIFICATION HERE ---
    // We REMOVED order.cancellationRequested = true;
    // We REMOVED order.save();
    // This keeps the Button visible on the Frontend until YOU touch the DB.

    // 5. RECORD CREATION (The separate 'OrderCancellation' collection)
    const cancellationEntry = await OrderCancellation.create({
      orderId,
      userId,
      reason: reason || 'Other',
      additionalNotes: additionalNotes || "",
      requestStatus: "Pending Approval" // This is for YOUR internal tracking
    });

    res.status(201).json({ 
      success: true, 
      message: "Request sent. Admin will review this manually.",
      data: cancellationEntry 
    });

  } catch (error) {
    console.error("CANCELLATION_API_ERROR:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};