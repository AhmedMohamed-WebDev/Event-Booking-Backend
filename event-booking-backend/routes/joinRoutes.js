const express = require("express");
const router = express.Router();

const {
  submitJoinRequest,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  markAsReviewed,
} = require("../controllers/joinController");

const authMiddleware = require("../middleware/auth");

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

// Public
router.post("/", submitJoinRequest);

// Admin
router.get("/", authMiddleware, adminOnly, getJoinRequests);
router.patch("/:id/approve", authMiddleware, adminOnly, approveJoinRequest);
router.patch("/:id/reject", authMiddleware, adminOnly, rejectJoinRequest);
router.patch("/:id/review", authMiddleware, adminOnly, markAsReviewed);

module.exports = router;
