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
    availability: {
      dateRange: {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
      },
      excludedDates: [Date],
    },
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
eventItemSchema.methods.isDateAvailable = function (date) {
  const checkDate = new Date(date);

  // If no availability range is set, fall back to availableDates array
  if (
    !this.availability?.dateRange?.from ||
    !this.availability?.dateRange?.to
  ) {
    const arr = Array.isArray(this.availableDates) ? this.availableDates : [];
    return arr.some(
      (d) => new Date(d).toDateString() === checkDate.toDateString()
    );
  }

  // Check if date is within range
  const fromDate = new Date(this.availability.dateRange.from);
  const toDate = new Date(this.availability.dateRange.to);

  if (checkDate < fromDate || checkDate > toDate) {
    return false;
  }

  // Check if date is not in excluded dates
  return !this.availability.excludedDates?.some(
    (excluded) => new Date(excluded).toDateString() === checkDate.toDateString()
  );
};

module.exports = mongoose.model("EventItem", eventItemSchema);
