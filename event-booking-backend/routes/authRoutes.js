const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { sendOtp, verifyOtp } = require("../controllers/otpController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/register", register);
router.post("/login", login);

module.exports = router;
