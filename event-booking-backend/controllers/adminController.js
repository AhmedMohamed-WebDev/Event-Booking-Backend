const User = require("../models/User");
const EventItem = require("../models/EventItem");
const Booking = require("../models/Booking");

exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalSuppliers,
      totalServices,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueAgg,
      topCategories,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "supplier" }),
      EventItem.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "cancelled" }),
      Booking.aggregate([
        { $match: { status: "confirmed" } },
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      EventItem.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalUsers,
      totalSuppliers,
      totalServices,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      topCategories,
    });
  } catch (err) {
    console.error("❌ Admin stats failed:", err);
    res.status(500).json({ error: "Failed to load admin statistics" });
  }
};
