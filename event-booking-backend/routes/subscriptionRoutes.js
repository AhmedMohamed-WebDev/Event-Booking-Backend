const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
} = require("../controllers/subscriptionController");

router.post("/", authMiddleware, createSubscription);
router.get("/status", authMiddleware, getSubscriptionStatus);
router.post("/cancel", authMiddleware, cancelSubscription);

module.exports = router;