const JoinRequest = require("../models/JoinRequest");
const User = require("../models/User");

// Submit join request (public)
exports.submitJoinRequest = async (req, res) => {
  try {
    const { name, phone, serviceType, city, notes } = req.body;

    const existing = await JoinRequest.findOne({ phone, status: "pending" });
    if (existing) {
      return res.status(400).json({ message: "Request already submitted" });
    }

    const request = await JoinRequest.create({
      name,
      phone,
      serviceType,
      city,
      notes,
    });

    res.status(201).json({
      message: "Join request submitted successfully",
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit join request" });
  }
};

// View all join requests (optional filter)
exports.getJoinRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const requests = await JoinRequest.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to load join requests" });
  }
};

// Approve request → create a supplier account
exports.approveJoinRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status === "approved") {
      return res.status(400).json({ message: "Request already approved" });
    }

    // Auto-create supplier user if not already registered
    const existingUser = await User.findOne({ phone: request.phone });
    if (!existingUser) {
      await User.create({
        name: request.name,
        phone: request.phone,
        role: "supplier",
        password: Math.random().toString(36).substring(2, 10), // temporary
      });
    }

    request.status = "approved";
    await request.save();

    res.json({ message: "Request approved and supplier account created." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  }
};

// Reject request
exports.rejectJoinRequest = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected." });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject request" });
  }
};

// Mark request as reviewed
exports.markAsReviewed = async (req, res) => {
  try {
    const request = await JoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "reviewed";
    await request.save();

    res.json({ message: "Request marked as reviewed." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update request" });
  }
};
