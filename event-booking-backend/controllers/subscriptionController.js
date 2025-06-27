const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { formatMessage } = require("../utils/messages");
const {
  SUBSCRIPTION_PLANS,
  shouldWarnSupplier,
  shouldLockSupplier,
} = require("../utils/subscription");
const sendWhatsAppNotification = require("../utils/whatsapp");
const notifications = require("../utils/notifications");
const { addDays } = require("date-fns");

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

    if (!subscription) {
      return res.json({
        status: "inactive",
        contactsUsed: 0,
        contactLimit: 50,
      });
    }

    // Calculate stats
    const stats = {
      isLocked: req.user.isLocked,
      usagePercentage: (req.user.contactCount / 50) * 100,
      daysUntilExpiry: Math.ceil(
        (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
      hasWarning: false,
      warningType: undefined,
    };

    // Add warning logic
    if (stats.usagePercentage > 90) {
      stats.hasWarning = true;
      stats.warningType = "near-limit";
    }
    if (stats.daysUntilExpiry < 7) {
      stats.hasWarning = true;
      stats.warningType = "expiring";
    }
    if (stats.isLocked) {
      stats.hasWarning = true;
      stats.warningType = "locked";
    }

    res.json({
      subscription: {
        _id: subscription._id,
        status: subscription.status,
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        contactLimit: 50,
        contactsUsed: req.user.contactCount,
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get subscription status" });
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

exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      supplier: req.user.id,
      status: "active",
    });

    const user = await User.findById(req.user.id);
    const plan = subscription?.plan || "basic";
    const contactLimit = SUBSCRIPTION_PLANS[plan.toUpperCase()].contactLimit;

    // Check if should warn
    if (shouldWarnSupplier(user.contactCount)) {
      const usagePercent = Math.round((user.contactCount / contactLimit) * 100);
      await sendWhatsAppNotification(
        user.phone,
        formatMessage(
          "subscriptionLimitNear",
          user.language || "ar",
          usagePercent
        )
      );
    }

    // Check if should lock
    if (shouldLockSupplier(user.contactCount) && !user.isLocked) {
      user.isLocked = true;
      user.lockReason = "Contact limit reached";
      await user.save();

      await sendWhatsAppNotification(
        user.phone,
        formatMessage("contactLimitReached", user.language || "ar")
      );
    }

    if (!subscription) {
      return res.json({
        status: "inactive",
        type: "basic",
        contactLimit: 50,
        contactsUsed: user.contactCount || 0,
        startDate: null,
        expiryDate: null,
        autoRenew: false,
      });
    }

    res.json({
      _id: subscription._id,
      status: subscription.status,
      type: subscription.plan,
      contactLimit: subscription.plan === "premium" ? 100 : 50,
      contactsUsed: user.contactCount || 0,
      startDate: subscription.startDate,
      expiryDate: subscription.endDate,
      autoRenew: subscription.autoRenew,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      message: formatMessage("subscriptionFailed", req.user.language || "ar"),
    });
  }
};

exports.getSubscriptionStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const subscription = await Subscription.findOne({
      supplier: req.user.id,
      status: "active",
    });

    const contactLimit = subscription?.plan === "premium" ? 100 : 50;
    const usagePercentage = ((user.contactCount || 0) / contactLimit) * 100;
    const daysUntilExpiry = subscription
      ? Math.ceil(
          (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const stats = {
      isLocked: user.isLocked,
      lockReason: user.lockReason,
      lockExpiryDate: user.lockExpiryDate,
      usagePercentage,
      daysUntilExpiry,
      hasWarning: false,
      warningType: undefined,
    };

    // Set warning type
    if (user.isLocked) {
      stats.hasWarning = true;
      stats.warningType = "locked";
    } else if (usagePercentage > 90) {
      stats.hasWarning = true;
      stats.warningType = "near-limit";
    } else if (daysUntilExpiry < 7) {
      stats.hasWarning = true;
      stats.warningType = "expiring";
    }

    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to get subscription stats" });
  }
};

exports.renewSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.user.id);
    const currentSubscription = await Subscription.findOne({
      supplier: req.user.id,
      status: "active",
    });

    // Validate plan
    if (!plan || !["basic", "premium"].includes(plan)) {
      return res.status(400).json({
        message: "Invalid plan. Must be 'basic' or 'premium'",
      });
    }

    // Create new subscription with the requested plan
    const newSubscription = new Subscription({
      supplier: req.user.id,
      plan: plan,
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      autoRenew: currentSubscription?.autoRenew || false,
    });

    // Expire current subscription if exists
    if (currentSubscription) {
      currentSubscription.status = "expired";
      await currentSubscription.save();
    }

    await newSubscription.save();

    // Reset contact count on renewal
    user.contactCount = 0;
    user.isLocked = false;
    user.lockReason = undefined;
    user.lockExpiryDate = undefined;
    await user.save();

    // Send WhatsApp notification
    await sendWhatsAppNotification(
      user.phone,
      formatMessage("subscriptionRenewed", user.language || "ar")
    );

    res.json({
      _id: newSubscription._id,
      status: newSubscription.status,
      type: newSubscription.plan,
      contactLimit: newSubscription.plan === "premium" ? 100 : 50,
      contactsUsed: 0,
      startDate: newSubscription.startDate,
      expiryDate: newSubscription.endDate,
      autoRenew: newSubscription.autoRenew,
    });
  } catch (error) {
    console.error("Renewal error:", error);
    res.status(500).json({
      message: formatMessage("subscriptionFailed", req.user.language || "ar"),
    });
  }
};

exports.toggleAutoRenew = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      supplier: req.user.id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    subscription.autoRenew = !subscription.autoRenew;
    await subscription.save();

    res.json({ autoRenew: subscription.autoRenew });
  } catch (error) {
    console.error("Auto-renew toggle error:", error);
    res.status(500).json({ message: "Failed to toggle auto-renewal" });
  }
};
