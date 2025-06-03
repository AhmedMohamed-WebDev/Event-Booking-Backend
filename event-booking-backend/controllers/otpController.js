const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Mock DB for OTPs
const otpStore = {};

exports.sendOtp = async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[phone] = otp;

  console.log(`📲 OTP for ${phone}: ${otp}`);
  res.json({ message: "OTP sent successfully (mocked)" });
};

exports.verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] && otpStore[phone] === otp.toString()) {
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ name: "User", phone, role: "client" });
    }

    // Manual JWT generation
    const token = jwt.sign(
      {
        id: user._id,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({ token });
  }

  return res.status(400).json({ message: "Invalid or expired OTP" });
};
