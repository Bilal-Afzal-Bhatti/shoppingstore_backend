import Order from "../models/order.js";
import OrderCancellation from "../models/orderCancellation.js";
import Product from "../models/productModel.js";

/**
 * @desc    Create a new cancellation request
 * @route   POST /api/orders/:id/cancel
 * @access  Private (User Only)
 */
export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { reason, additionalNotes } = req.body;
    const userId = req.user._id;

    // 1. Fetch Order and verify ownership
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: This is not your order." });
    }

    // 2. INDUSTRIAL STANDARD: The "Point of No Return" Check
    // Prevent cancellation if the order is already in transit
    const restrictedStatuses = ["Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    
    if (restrictedStatuses.includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be cancelled. Current status: ${order.orderStatus}` 
      });
    }

    // 3. Prevent duplicate requests
    const existingRequest = await OrderCancellation.findOne({ orderId });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: "A cancellation request is already pending for this order." });
    }

    // 4. Create the Cancellation Record
    const cancellationEntry = await OrderCancellation.create({
      orderId,
      userId,
      reason,
      additionalNotes,
      requestStatus: "Pending Approval"
    });

    // 5. Update Order Status to reflect a pending request
    // This prevents the user from clicking "Cancel" again while admin reviews
    order.orderStatus = "Processing"; // Or a specific "Cancellation Pending" status if you have one
    await order.save();

    res.status(201).json({ 
      success: true, 
      message: "Cancellation request submitted. Our team will review it shortly.",
      data: cancellationEntry 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Approve or Reject Cancellation
 * @route   PUT /api/admin/cancellations/:id/approve
 * @access  Private (Admin Only)
 */
export const processCancellationAdmin = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { action, adminComment } = req.body; // action: 'Approved' or 'Rejected'

    const cancellation = await OrderCancellation.findById(requestId).populate("orderId");
    if (!cancellation) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const order = cancellation.orderId;

    if (action === "Approved") {
      // 1. Update Cancellation Record
      cancellation.requestStatus = "Approved";
      cancellation.adminComment = adminComment || "Request approved by administrator.";
      
      // 2. Update the Order Status
      order.orderStatus = "Cancelled";
      
      // 3. INDUSTRIAL STANDARD: Restock Inventory
      // Loop through order items and add quantity back to Product stock
      const restockPromises = order.orderItems.map(item => {
        return Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty }
        });
      });
      await Promise.all(restockPromises);

      await order.save();
    } else {
      // If Rejected
      cancellation.requestStatus = "Rejected";
      cancellation.adminComment = adminComment || "Request denied. Order is already being prepared.";
      
      // Reset order status back to its previous state (usually Processing)
      order.orderStatus = "Processing";
      await order.save();
    }

    await cancellation.save();

    res.status(200).json({ 
      success: true, 
      message: `Cancellation request ${action.toLowerCase()} successfully.`,
      orderStatus: order.orderStatus
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};