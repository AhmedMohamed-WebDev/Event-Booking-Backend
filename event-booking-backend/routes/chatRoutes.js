const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  sendMessage,
  getConversation,
} = require("../controllers/chatController");

router.post("/", authMiddleware, sendMessage);
router.get("/:userId", authMiddleware, getConversation);

module.exports = router;
