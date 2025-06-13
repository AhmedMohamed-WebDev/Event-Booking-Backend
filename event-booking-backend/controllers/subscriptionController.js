const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { formatMessage } = require("../utils/messages");
const sendWhatsAppNotification = require("../utils/whatsapp");

exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const supplier = await User.findById(req.user.id);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    // Calculate end date (3 months from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const subscription = await Subscription.create({
      supplier: supplier._id,
      plan,
      endDate,
      amount: plan === "premium" ? 100 : 50,
    });

    // Unlock supplier
    supplier.isLocked = false;
    supplier.bookingCount = 0; // Reset booking count
    await supplier.save();

    // Send notification
    await sendWhatsAppNotification(
      supplier.phone,
      "subscriptionCreated",
      lang,
      plan
    );

    res.status(201).json({
      message: formatMessage("subscriptionCreated", lang),
      subscription,
    });
  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({
      message: formatMessage("subscriptionFailed", req.lang),
    });
  }
};

exports.getSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      supplier: req.user.id,
      status: "active",
    });

    res.json({ subscription });
  } catch (error) {
    res.status(500).json({
      message: formatMessage("subscriptionStatusFailed", req.lang),
    });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      supplier: req.user.id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        message: formatMessage("subscriptionNotFound", req.lang),
      });
    }

    subscription.status = "cancelled";
    await subscription.save();

    res.json({
      message: formatMessage("subscriptionCancelled", req.lang),
    });
  } catch (error) {
    res.status(500).json({
      message: formatMessage("subscriptionCancelFailed", req.lang),
    });
  }
};
