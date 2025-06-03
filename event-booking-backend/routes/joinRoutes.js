const express = require("express");
const router = express.Router();
const {
  submitJoinRequest,
  getJoinRequests,
} = require("../controllers/joinController");
const authMiddleware = require("../middleware/auth");

// Public - for the footer form
router.post("/", submitJoinRequest);

// Optional: for admin to view all join requests
router.get("/", authMiddleware, getJoinRequests);

module.exports = router;
