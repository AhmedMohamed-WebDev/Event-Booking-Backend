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

exports.initiateContact = async (req, res) => {
  try {
    const { eventItemId } = req.body;
    const clientId = req.user.id;

    const eventItem = await EventItem.findById(eventItemId).populate(
      "supplier"
    );
    if (!eventItem) {
      return res.status(404).json({
        message: formatMessage("eventItemNotFound", req.lang),
      });
    }

    // Verify this is a contact-only category
    if (!isContactOnlyCategory(eventItem.category)) {
      return res.status(400).json({
        message: formatMessage("invalidContactCategory", req.lang),
      });
    }

    const supplier = await User.findById(eventItem.supplier);

    // Check if supplier is locked
    if (supplier.isLocked) {
      return res.status(403).json({
        message: formatMessage("supplierLocked", req.lang),
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

    // Check warning threshold
    if (shouldWarnSupplier(supplier.contactCount)) {
      // Send notification (implement your notification system)
      console.log(
        `Warning: Supplier ${supplier._id} reached ${supplier.contactCount} contacts`
      );
    }

    // Check lock threshold
    if (shouldLockSupplier(supplier.contactCount)) {
      supplier.isLocked = true;
    }

    await supplier.save();

    res.json({
      message: formatMessage("contactInitiated", req.lang),
      supplierPhone: supplier.phone,
      contact,
    });
  } catch (error) {
    console.error("Contact Error:", error);
    res.status(500).json({
      message: formatMessage("contactFailed", req.lang),
    });
  }
};
