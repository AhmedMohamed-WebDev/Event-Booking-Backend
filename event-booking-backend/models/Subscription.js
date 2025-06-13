const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["basic", "premium"],
      default: "basic",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    paymentId: String,
    amount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
