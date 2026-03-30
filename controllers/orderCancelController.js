export const requestOrderCancellation = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const order = await Order.findById(orderId);
    
    // 1. Flip the new boolean instead of changing orderStatus
    order.cancellationRequested = true; 
    await order.save();

    // 2. Create the record for your manual DB change later
    await OrderCancellation.create({
      orderId,
      userId: req.user._id,
      reason: req.body.reason,
      requestStatus: "Pending Approval"
    });

    res.status(201).json({ success: true, message: "Request Sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};