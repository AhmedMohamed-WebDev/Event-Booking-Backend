const JoinRequest = require("../models/JoinRequest");

exports.submitJoinRequest = async (req, res) => {
  try {
    const { name, phone, serviceType, city, notes } = req.body;

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

exports.getJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to load join requests" });
  }
};
