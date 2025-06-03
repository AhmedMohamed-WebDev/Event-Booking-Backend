const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const eventItemRoutes = require("./routes/eventItemRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const joinRoutes = require("./routes/joinRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// 💡 Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev")); // Optional: logs each request

// 🔐 Rate limiter (15 min window, 100 requests/IP)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/event-items", eventItemRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/join", joinRoutes);
app.use("/api/chat", chatRoutes);

// 🏁 Root test
app.get("/", (req, res) => res.send("✅ Event Booking API is running."));

// 🔻 Global Error Handler
app.use(errorHandler);

module.exports = app;
