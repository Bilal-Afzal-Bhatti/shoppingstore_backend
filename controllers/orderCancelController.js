import Order from "../models/order.js";
import OrderCancellation from "../models/orderCancellation.js";

export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason, additionalNotes } = req.body;
    
    // 1. AUTH GUARD: Ensure user ID exists (from your auth middleware)
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication failed. Please login again." });
    }

    // 2. EXISTENCE GUARD: Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // 3. OWNERSHIP GUARD: Ensure this order belongs to the person requesting cancellation
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized. You can only cancel your own orders." });
    }

    // 4. DUPLICATE GUARD: Check if a request already exists in the separate collection
    const existingRequest = await OrderCancellation.findOne({ orderId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Cancellation request already submitted." });
    }

    // 5. ATOMIC UPDATE: Update the Order document first
    // This flips the boolean that triggers the "Under Review" UI
    order.cancellationRequested = true;
    await order.save();

    // 6. RECORD CREATION: Create the separate collection entry
    const cancellationEntry = await OrderCancellation.create({
      orderId,
      userId,
      reason: reason || 'Other',
      additionalNotes: additionalNotes || "",
      requestStatus: "Pending Approval"
    });

    // SUCCESS RESPONSE
    res.status(201).json({ 
      success: true, 
      message: "Cancellation request sent successfully.",
      data: cancellationEntry 
    });

  } catch (error) {
    // LOGGING: Real industry apps log the actual error to the console for debugging
    console.error("CANCELLATION_ERROR:", error);
    
    res.status(500).json({ 
      success: false, 
      message: "Server Error: " + error.message 
    });
  }
};