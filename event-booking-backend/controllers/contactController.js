const Contact = require("../models/Contact");
const ContactRequest = require("../models/ContactRequest");
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

// Send contact request (new method for the updated system)
exports.sendContactRequest = async (req, res) => {
  try {
    const { client, supplier, service, message } = req.body;
    const clientId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    // Verify the client is making the request for themselves
    if (client !== clientId) {
      return res.status(403).json({
        success: false,
        message: formatMessage("unauthorized", lang),
      });
    }

    const eventItem = await EventItem.findById(service).populate("supplier");
    if (!eventItem) {
      return res.status(404).json({
        success: false,
        message: formatMessage("eventItemNotFound", lang),
      });
    }

    // Verify this is a contact-only category
    if (!isContactOnlyCategory(eventItem.category, eventItem.subcategory)) {
      return res.status(400).json({
        success: false,
        message: formatMessage("invalidContactCategory", lang),
      });
    }

    const supplierUser = await User.findById(supplier);
    if (!supplierUser) {
      return res.status(404).json({
        success: false,
        message: formatMessage("supplierNotFound", lang),
      });
    }

    // Check if supplier is locked
    if (supplierUser.isLocked) {
      return res.status(403).json({
        success: false,
        message: formatMessage("supplierLocked", lang),
      });
    }

    // Create contact request record
    const contactRequest = await ContactRequest.create({
      client: clientId,
      supplier: supplier,
      service: service,
      message: message,
      status: "pending",
    });

    // Update supplier contact count
    supplierUser.contactCount += 1;

    // Check warning threshold and send notification
    if (shouldWarnSupplier(supplierUser.contactCount)) {
      const remainingContacts = FREE_CONTACT_LIMIT - supplierUser.contactCount;
      await sendWhatsAppNotification(
        supplierUser.phone,
        "contactLimitWarning",
        supplierUser.language || "ar",
        remainingContacts
      );
    }

    // Check lock threshold
    if (shouldLockSupplier(supplierUser.contactCount)) {
      supplierUser.isLocked = true;
      supplierUser.lockReason = "Contact limit reached";

      // Send final notification
      await sendWhatsAppNotification(
        supplierUser.phone,
        "contactLimitReached",
        supplierUser.language || "ar"
      );
    }

    await supplierUser.save();

    res.json({
      success: true,
      message: formatMessage("contactRequestSent", lang),
      contactRequest,
    });
  } catch (error) {
    console.error("Contact Request Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      success: false,
      message: formatMessage("contactRequestFailed", lang),
    });
  }
};

// Get contact requests for supplier
exports.getContactRequests = async (req, res) => {
  try {
    const supplierId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    const contactRequests = await ContactRequest.find({ supplier: supplierId })
      .populate("client", "name phone")
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    res.json(contactRequests);
  } catch (error) {
    console.error("Get Contact Requests Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      success: false,
      message: formatMessage("getContactRequestsFailed", lang),
    });
  }
};

// Get contact requests for client
exports.getClientContactRequests = async (req, res) => {
  try {
    const clientId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    const contactRequests = await ContactRequest.find({ client: clientId })
      .populate("supplier", "name phone")
      .populate("service", "name category")
      .sort({ createdAt: -1 });

    res.json(contactRequests);
  } catch (error) {
    console.error("Get Client Contact Requests Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      success: false,
      message: formatMessage("getContactRequestsFailed", lang),
    });
  }
};

// Get contact limit info for supplier
exports.getContactLimitInfo = async (req, res) => {
  try {
    const supplierId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    const supplier = await User.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: formatMessage("supplierNotFound", lang),
      });
    }

    const currentContacts = supplier.contactCount || 0;
    const maxContacts = FREE_CONTACT_LIMIT;
    const usagePercentage = (currentContacts / maxContacts) * 100;
    const isLocked = supplier.isLocked || false;
    const hasWarning = currentContacts >= WARNING_THRESHOLD;

    res.json({
      currentContacts,
      maxContacts,
      isLocked,
      lockReason: supplier.lockReason,
      hasWarning,
      warningType: hasWarning ? "near-limit" : undefined,
      usagePercentage: Math.min(usagePercentage, 100),
    });
  } catch (error) {
    console.error("Get Contact Limit Info Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      success: false,
      message: formatMessage("getContactLimitInfoFailed", lang),
    });
  }
};

// Check contact request status between client and supplier
exports.checkContactRequestStatus = async (req, res) => {
  try {
    const { clientId, supplierId, serviceId } = req.query;
    const currentUserId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    // Verify the user is checking their own request or is the supplier
    if (currentUserId !== clientId && currentUserId !== supplierId) {
      return res.status(403).json({
        success: false,
        message: formatMessage("unauthorized", lang),
      });
    }

    const contactRequest = await ContactRequest.findOne({
      client: clientId,
      supplier: supplierId,
      service: serviceId,
    });

    if (!contactRequest) {
      return res.json({
        status: "none",
      });
    }

    res.json({
      status: contactRequest.status,
      requestId: contactRequest._id,
    });
  } catch (error) {
    console.error("Check Contact Request Status Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      success: false,
      message: formatMessage("checkContactRequestStatusFailed", lang),
    });
  }
};

// Update contact request status
exports.updateContactRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const supplierId = req.user.id;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    const contactRequest = await ContactRequest.findById(requestId)
      .populate("client", "name phone email")
      .populate("service", "name category");

    if (!contactRequest) {
      return res.status(404).json({
        success: false,
        message: formatMessage("contactRequestNotFound", lang),
      });
    }

    // Verify the supplier owns this contact request
    if (contactRequest.supplier.toString() !== supplierId) {
      return res.status(403).json({
        success: false,
        message: formatMessage("unauthorized", lang),
      });
    }

    contactRequest.status = status;
    await contactRequest.save();

    // If accepted, create a chat room and send notifications
    if (status === "accepted") {
      try {
        // Create chat room between client and supplier
        const Chat = require("../models/Chat");
        const existingChat = await Chat.findOne({
          participants: {
            $all: [contactRequest.client._id, supplierId],
            $size: 2,
          },
        });

        if (!existingChat) {
          const newChat = new Chat({
            participants: [contactRequest.client._id, supplierId],
            type: "contact-request",
            contactRequest: contactRequest._id,
            lastMessage: {
              content: `Contact request for "${contactRequest.service.name}" has been accepted. You can now chat directly with the supplier.`,
              sender: supplierId,
              timestamp: new Date(),
            },
          });
          await newChat.save();
        }

        // Send notification to client (email or in-app notification)
        const client = await User.findById(contactRequest.client._id);
        if (client) {
          // You can implement email notification here
          console.log(
            `Contact request accepted for client: ${client.name} (${client.email})`
          );

          // For now, we'll rely on the client checking their dashboard
          // In the future, you can add email notifications or push notifications
        }

        // Send WhatsApp notification to supplier (if available)
        const supplier = await User.findById(supplierId);
        if (supplier && supplier.phone) {
          try {
            await sendWhatsAppNotification(
              supplier.phone,
              "contactRequestAccepted",
              supplier.language || "ar",
              contactRequest.client.name,
              contactRequest.service.name
            );
          } catch (whatsappError) {
            console.log(
              "WhatsApp notification failed, but request was accepted:",
              whatsappError.message
            );
          }
        }
      } catch (chatError) {
        console.error("Error creating chat room:", chatError);
        // Don't fail the request if chat creation fails
      }
    } else if (status === "rejected") {
      // Send rejection notification to client
      const client = await User.findById(contactRequest.client._id);
      if (client) {
        console.log(
          `Contact request rejected for client: ${client.name} (${client.email})`
        );
        // You can implement email notification here
      }

      // Send WhatsApp notification to supplier (if available)
      const supplier = await User.findById(supplierId);
      if (supplier && supplier.phone) {
        try {
          await sendWhatsAppNotification(
            supplier.phone,
            "contactRequestRejected",
            supplier.language || "ar",
            contactRequest.client.name,
            contactRequest.service.name
          );
        } catch (whatsappError) {
          console.log(
            "WhatsApp notification failed, but request was rejected:",
            whatsappError.message
          );
        }
      }
    }

    res.json({
      success: true,
      message: formatMessage("contactRequestStatusUpdated", lang),
      contactRequest,
    });
  } catch (error) {
    console.error("Update Contact Request Status Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      success: false,
      message: formatMessage("updateContactRequestStatusFailed", lang),
    });
  }
};

// Legacy method (keeping for backward compatibility)
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
    if (!isContactOnlyCategory(eventItem.category, eventItem.subcategory)) {
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
        "contactLimitWarning",
        supplier.language || "ar",
        remainingContacts
      );
    }

    // Check lock threshold
    if (shouldLockSupplier(supplier.contactCount)) {
      supplier.isLocked = true;
      supplier.lockReason = "Contact limit reached";

      // Send final notification
      await sendWhatsAppNotification(
        supplier.phone,
        "contactLimitReached",
        supplier.language || "ar"
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
