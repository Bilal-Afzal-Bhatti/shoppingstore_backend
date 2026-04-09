import Order from "../../models/order.js";

// Go up TWO levels, then into 'models', then the file
import OrderCancellation from '../../models/DashboardModels/orderCancellation.js';
import User from "../../models/User.js";

// Abstracted dashboard reporting logic separately to maintain clean MVC Business Logic
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSalesAggr = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } }, 
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalSales = totalSalesAggr[0]?.total || 0;
    
    // Check how many users are registered via Google vs Local
    const authStats = await User.aggregate([
      { $group: { _id: "$authMethod", count: { $sum: 1 } } }
    ]);

    const pendingCancellations = await OrderCancellation.countDocuments({ requestStatus: 'Pending Approval' });

    res.status(200).json({
      totalOrders,
      totalSales,
      authStats,
      pendingCancellations
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};
