import Order from "../models/order.js";
import OrderCancellation from "../models/orderCancellation.js";

export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason, additionalNotes } = req.body;

    // 1. Check if user exists (Fix for potential 500 error)
    // If your middleware uses req.userId instead of req.user._id, change this!
    const userId = req.user?._id || req.userId; 

    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    // 2. Fetch Order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // 3. Verify Ownership
    // Note: Some schemas use 'user', some use 'userId'. Check your Order Model!
    const orderOwnerId = order.user ? order.user.toString() : order.userId.toString();
    if (orderOwnerId !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: This is not your order." });
    }

    // 4. "Point of No Return" Check
    // IMPORTANT: Make sure your Order model uses 'orderStatus'. If it uses 'status', change this.
    const currentStatus = order.orderStatus || orderstatus; 
    const restrictedStatuses = ["Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    
    if (restrictedStatuses.includes(currentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled. Current status: ${currentStatus}` 
      });
    }

    // 5. Prevent duplicate requests
    const existingRequest = await OrderCancellation.findOne({ orderId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "A cancellation request is already pending." });
    }

    // 6. Create the Cancellation Record
    const cancellationEntry = await OrderCancellation.create({
      orderId,
      userId,
      reason,
      additionalNotes,
      requestStatus: "Pending Approval"
    });

    // 7. Update Order Status
    if (order.orderStatus) order.orderStatus = "Processing";
    else if (order.status) order.status = "Processing";
    
    await order.save();

    res.status(201).json({ 
      success: true, 
      message: "Cancellation request submitted. Our team will review it shortly.",
      data: cancellationEntry 
    });

  } catch (error) {
    console.error("CANCELLATION ERROR:", error); // This helps you see the REAL error in Vercel logs
    res.status(500).json({ success: false, message: error.message });
  }
};