import Order from "../models/order.js";
import OrderCancellation from "../models/orderCancellation.js";

export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason, additionalNotes } = req.body;
    const userId = req.user?._id || req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "Login required." });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    // Verify ownership
    const ownerId = order.user || order.userId;
    if (ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access." });
    }

    // Industrial Guard: Status check (Normalized to lowercase for safety)
    const currentStatus = (order.orderStatus || order.status).toLowerCase();
    const forbidden = ["shipped", "delivered", "cancelled"];
    
    if (forbidden.includes(currentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order in ${currentStatus} state.` 
      });
    }

    // Check for existing request
    const existing = await OrderCancellation.findOne({ orderId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Cancellation request already exists." });
    }

    // Create Request Record
    const cancellationEntry = await OrderCancellation.create({
      orderId,
      userId,
      reason,
      additionalNotes,
      requestStatus: "Pending Approval"
    });

    // Update Order Status to 'processing' (Matches your Enum)
    // Note: Use exact casing from your Mongoose Schema Enum
    order.orderStatus = "processing"; 
    await order.save();

    res.status(201).json({ 
      success: true, 
      message: "Request submitted successfully.",
      data: cancellationEntry 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};