const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { initiateContact } = require("../controllers/contactController");

router.post("/", authMiddleware, initiateContact);

module.exports = router;
