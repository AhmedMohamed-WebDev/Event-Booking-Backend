const mongoose = require("mongoose");

const eventItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    price: { type: Number, required: true },
    location: {
      city: String,
      area: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    images: [String], // Array of image URLs
    videos: [String], // Array of video URLs
    availableDates: [Date],
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    minCapacity: Number,
    maxCapacity: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventItem", eventItemSchema);
