import Order from "../models/order.js";
import OrderCancellation from "../models/orderCancellation.js";

/**
 * @desc    Create a new cancellation request (User Side)
 * @route   POST /api/ordercancel/:id/cancel
 * @access  Private
 */
export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason, additionalNotes } = req.body;
    const userId = req.user?._id || req.userId;

    // 1. Authentication Guard
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    // 2. Fetch Order & Ownership Check
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: This is not your order." });
    }

    // 3. Status Guard (Industrial "Point of No Return")
    // If order is already Shipped/Delivered, cancellation is physically impossible.
    const currentStatus = order.orderStatus.toLowerCase();
    const restricted = ["shipped", "delivered", "cancelled"];
    
    if (restricted.includes(currentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order is already ${currentStatus}. Cannot request cancellation.` 
      });
    }

    // 4. Duplicate Request Check
    const existingRequest = await OrderCancellation.findOne({ orderId });
    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: "A cancellation request for this order is already being reviewed." 
      });
    }

    // 5. Create the Cancellation Record
    // Matches your updated Schema with Financial & Restock fields
    const cancellationEntry = await OrderCancellation.create({
      orderId,
      userId,
      reason, // Must match: 'Changed my mind', 'Ordered by mistake', etc.
      additionalNotes,
      requestStatus: "Pending Approval",
      refundStatus: order.paymentMethod === 'cod' ? 'N/A' : 'Pending',
      isRestocked: false 
    });

    // 6. Update Order Status to 'processing'
    // This locks the order so it can't be shipped while the admin reviews it
    order.orderStatus = "processing"; 
    await order.save();

    res.status(201).json({ 
      success: true, 
      message: "Cancellation request submitted. Our team will review it shortly.",
      data: cancellationEntry 
    });

  } catch (error) {
    console.error("CANCELLATION_CONTROLLER_ERROR:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error" 
    });
  }
};