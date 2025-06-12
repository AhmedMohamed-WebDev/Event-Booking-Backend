const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {
  standardizeJordanPhone,
  formatPhoneForDisplay,
} = require("../utils/phoneUtils");
const generateOTP = require("../utils/generateOTP");
const sendWhatsAppNotification = require("../utils/whatsapp");
const { formatMessage } = require("../utils/messages");

// Use Map for OTP storage with auto-expiry
const otpStore = new Map();
const OTP_EXPIRY =
  parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000 || 5 * 60 * 1000;

exports.sendOtp = async (req, res) => {
  try {
    const { phone, name } = req.body;
    const standardizedPhone = standardizeJordanPhone(phone);
    const otp =
      process.env.NODE_ENV === "development" ? "123456" : generateOTP(6);

    // Store OTP with expiration
    otpStore.set(standardizedPhone, {
      otp,
      name,
      timestamp: Date.now(),
    });

    // Auto-delete expired OTP
    setTimeout(() => otpStore.delete(standardizedPhone), OTP_EXPIRY);

    // Send OTP via WhatsApp in production
    if (process.env.NODE_ENV === "production") {
      await sendWhatsAppNotification(
        standardizedPhone,
        "otpMessage",
        req.headers["accept-language"]?.includes("en") ? "en" : "ar",
        otp,
        process.env.OTP_EXPIRY_MINUTES
      );
    } else {
      console.log(`📲 [DEV] OTP for ${standardizedPhone}: ${otp}`);
    }

    res.json({
      message: formatMessage(
        "otpSent",
        req.headers["accept-language"]?.includes("en") ? "en" : "ar"
      ),
      phone: formatPhoneForDisplay(standardizedPhone),
      testOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      message: formatMessage("sendOtpFailed", lang),
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const standardizedPhone = standardizeJordanPhone(req.body.phone);
    const { otp, name } = req.body;
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";

    const stored = otpStore.get(standardizedPhone);

    if (!stored || stored.otp !== otp) {
      return res.status(400).json({
        message: formatMessage("invalidOtp", lang),
      });
    }

    // Check OTP expiration
    if (Date.now() - stored.timestamp > OTP_EXPIRY) {
      otpStore.delete(standardizedPhone);
      return res.status(400).json({
        message: formatMessage("otpExpired", lang),
      });
    }

    let user = await User.findOne({ phone: standardizedPhone });

    if (!user) {
      user = await User.create({
        name: name || stored.name,
        phone: standardizedPhone,
        role: "client",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    otpStore.delete(standardizedPhone);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Verification Error:", error);
    const lang = req.headers["accept-language"]?.includes("en") ? "en" : "ar";
    res.status(500).json({
      message: formatMessage("verificationFailed", lang),
    });
  }
};
