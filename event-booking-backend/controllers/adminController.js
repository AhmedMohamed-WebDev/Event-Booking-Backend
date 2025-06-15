const User = require("../models/User");
const EventItem = require("../models/EventItem");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");
const Subscription = require("../models/Subscription");
const ContactMessage = require("../models/ContactMessage");

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
      // Add new aggregations
      contactOnlySuppliers,
      lockedSuppliers,
      totalContactRequests,
      activeSubscriptions,
      contactMessages,
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
      User.countDocuments({
        role: "supplier",
        "services.category": { $in: ["wedding-halls", "farm"] },
      }),
      User.countDocuments({ isLocked: true }),
      Contact.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
      ContactMessage.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalSuppliers,
      totalServices,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      topCategories,
      // Add new stats
      contactOnlySuppliers,
      lockedSuppliers,
      totalContactRequests,
      activeSubscriptions,
      contactMessages,
    });
  } catch (err) {
    console.error("❌ Admin stats failed:", err);
    res.status(500).json({ error: "Failed to load admin statistics" });
  }
};

// Add new endpoints for contact messages
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load contact messages" });
  }
};

// Add endpoint to handle supplier unlocking
exports.unlockSupplier = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.isLocked = false;
    supplier.bookingCount = 0;

    await supplier.save();

    res.json({ message: "Supplier has been unlocked successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unlock supplier" });
  }
};
