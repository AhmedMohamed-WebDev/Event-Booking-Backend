const Booking = require("../models/Booking");
const EventItem = require("../models/EventItem");
const User = require("../models/User");
const { shouldEnforceLimit } = require("../utils/subscription");
const sendWhatsAppNotification = require("../utils/whatsapp");
const { formatMessage } = require("../utils/messages");
const { isContactOnlyCategory } = require("../utils/subscription");

exports.createBooking = async (req, res) => {
  try {
    const { eventItemId, eventDate, numberOfPeople } = req.body;
    const item = await EventItem.findById(eventItemId).populate("supplier");

    if (!item) {
      return res.status(404).json({ message: "Event item not found" });
    }

    // Check if category is contact-only
    if (isContactOnlyCategory(item.category)) {
      return res.status(400).json({
        message: formatMessage("invalidBookingCategory", req.lang),
      });
    }

    // Step 1: Validate eventDate is available
    const requestedDate = new Date(eventDate).toISOString();
    const available = item.availableDates.some(
      (d) => new Date(d).toISOString() === requestedDate
    );
    if (!available) {
      return res
        .status(400)
        .json({ message: "Selected date is not available for this service." });
    }

    // Step 2: Check supplier lock
    const supplier = await User.findById(item.supplier._id);
    if (supplier.isLocked) {
      return res.status(403).json({
        message:
          "هذا المزود تجاوز الحد المجاني للحجوزات. يرجى الاشتراك لمواصلة استقبال الحجوزات.",
      });
    }

    // Step 3: Booking creation
    const totalPrice = item.price;
    const paidAmount = totalPrice * 0.1;

    const booking = await Booking.create({
      eventItem: item._id,
      client: req.user.id,
      eventDate,
      numberOfPeople,
      totalPrice,
      paidAmount,
    });

    // Step 4: Booking limit and notifications
    if (shouldEnforceLimit(item.category)) {
      supplier.bookingCount += 1;

      if (supplier.bookingCount >= 41 && supplier.bookingCount < 50) {
        await sendWhatsAppNotification(
          supplier.phone,
          `تنبيه: اقتربت من الحد المجاني للحجوزات (${supplier.bookingCount} من 50).`
        );
      }

      if (supplier.bookingCount === 50) {
        supplier.isLocked = true;
        await sendWhatsAppNotification(
          supplier.phone,
          `تنبيه أخير: وصلت إلى الحد المجاني للحجوزات (50). تم إيقاف الحساب مؤقتًا.`
        );
      }

      await supplier.save();
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user.id }).populate(
      "eventItem",
      "name price category images"
    );

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load user bookings" });
  }
};

exports.getBookingsForSupplier = async (req, res) => {
  try {
    const items = await EventItem.find({ supplier: req.user.id }).select("_id");
    const itemIds = items.map((i) => i._id);

    const bookings = await Booking.find({ eventItem: { $in: itemIds } })
      .populate("eventItem", "name category price")
      .populate("client", "name phone");

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load supplier bookings" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("eventItem", "name category supplier")
      .populate("client", "name phone");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load bookings" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    // ✅ Ensure status is one of your enum values
    if (!["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(bookingId).populate("eventItem");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ✅ Allow only the supplier who owns the event item to update the status
    if (booking.eventItem.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: `Booking ${
        status === "confirmed" ? "confirmed" : "cancelled"
      } successfully`,
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update booking status" });
  }
};
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.user.id })
      .populate("eventItem", "name category location images price")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load your bookings" });
  }
};
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      client: req.user.id,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cancel failed" });
  }
};
