const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/adminController");
const authMiddleware = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { unlockSupplier } = require("../controllers/adminController");

router.patch("/unlock/:id", authMiddleware, adminOnly, unlockSupplier);
router.get("/stats", authMiddleware, adminOnly, getAdminStats);

module.exports = router;
