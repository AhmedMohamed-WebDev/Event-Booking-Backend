const express = require("express");
const router = express.Router();
const { getAdminStats, unlockSupplier } = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/stats", authMiddleware, adminOnly, getAdminStats);
router.patch("/unlock/:id", authMiddleware, adminOnly, unlockSupplier);

module.exports = router;
