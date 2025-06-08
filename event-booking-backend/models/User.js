const mongoose = require("mongoose");
const {
  isValidJordanPhone,
  standardizeJordanPhone,
} = require("../utils/phoneUtils");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: isValidJordanPhone,
        message: (props) =>
          `${props.value} is not a valid Jordan phone number!`,
      },
    },
    role: {
      type: String,
      enum: ["client", "supplier", "admin"],
      default: "client",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    bookingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Add a pre-save middleware to format phone numbers
userSchema.pre("save", function (next) {
  if (this.isModified("phone")) {
    try {
      this.phone = standardizeJordanPhone(this.phone);
    } catch (error) {
      next(error);
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
