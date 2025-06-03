const EventItem = require("../models/EventItem");
const Booking = require("../models/Booking");
const User = require("../models/User");

exports.getSupplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user.id;

    const supplier = await User.findById(supplierId).select("-password");

    const services = await EventItem.find({ supplier: supplierId }).select(
      "_id name"
    );

    const serviceIds = services.map((s) => s._id);

    const bookings = await Booking.find({ eventItem: { $in: serviceIds } })
      .populate("eventItem", "name category")
      .populate("client", "name phone")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "pending"
    ).length;
    const confirmedBookings = bookings.filter(
      (b) => b.status === "confirmed"
    ).length;
    const cancelledBookings = bookings.filter(
      (b) => b.status === "cancelled"
    ).length;

    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed")
      .reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);

    res.json({
      supplier: {
        id: supplier._id,
        name: supplier.name,
        phone: supplier.phone,
        serviceCount: services.length,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
      },
      services,
      bookings,
    });
  } catch (err) {
    console.error("Supplier Dashboard Error:", err);
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
};
