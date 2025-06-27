const Contact = require("../models/Contact");
const User = require("../models/User");
const EventItem = require("../models/EventItem");
const {
  isContactOnlyCategory,
  shouldWarnSupplier,
  shouldLockSupplier,
  WARNING_THRESHOLD,
  FREE_CONTACT_LIMIT,
} = require("../utils/subscription");
const { formatMessage } = require("../utils/messages");
const sendWhatsAppNotification = require("../utils/whatsapp");

exports.initiateContact = async (req, res) => {
  try {
    const { eventItemId } = req.body;
    const clientId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    const eventItem = await EventItem.findById(eventItemId).populate(
      "supplier"
    );
    if (!eventItem) {
      return res.status(404).json({
        message: formatMessage("eventItemNotFound", lang),
      });
    }

    // Verify this is a contact-only category
    if (!isContactOnlyCategory(eventItem.category)) {
      return res.status(400).json({
        message: formatMessage("invalidContactCategory", lang),
      });
    }

    const supplier = await User.findById(eventItem.supplier);

    // Check if supplier is locked
    if (supplier.isLocked) {
      return res.status(403).json({
        message: formatMessage("supplierLocked", lang),
      });
    }

    // Create contact record
    const contact = await Contact.create({
      client: clientId,
      supplier: supplier._id,
      eventItem: eventItemId,
    });

    // Update supplier contact count
    supplier.contactCount += 1;

    // Check warning threshold and send notification
    if (shouldWarnSupplier(supplier.contactCount)) {
      const remainingContacts = FREE_CONTACT_LIMIT - supplier.contactCount;
      await sendWhatsAppNotification(
        supplier.phone,
        formatMessage(
          "contactLimitWarning",
          supplier.language || "ar",
          remainingContacts
        )
      );
    }

    // Check lock threshold
    if (shouldLockSupplier(supplier.contactCount)) {
      supplier.isLocked = true;
      supplier.lockReason = "Contact limit reached";

      // Send final notification
      await sendWhatsAppNotification(
        supplier.phone,
        formatMessage("contactLimitReached", supplier.language || "ar")
      );
    }

    await supplier.save();

    res.json({
      message: formatMessage("contactInitiated", lang),
      supplierPhone: supplier.phone,
      contact,
      remainingContacts: FREE_CONTACT_LIMIT - supplier.contactCount,
    });
  } catch (error) {
    console.error("Contact Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      message: formatMessage("contactFailed", lang),
    });
  }
};
