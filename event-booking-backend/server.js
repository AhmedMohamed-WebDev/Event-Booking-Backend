require("dotenv").config();
const http = require("http");
const app = require("./app");
const config = require("./config/config");
const connectDB = require("./config/database");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");

// 🌐 Create HTTP server
const server = http.createServer(app);

// 🔌 Setup Socket.IO
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // replace with frontend URL in prod
    methods: ["GET", "POST"],
  },
});

// 🔐 JWT authentication middleware for sockets
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// 🎯 Real-time chat logic
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.user?.id);

  // Join personal room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle message sending
  socket.on("sendMessage", async ({ to, text }) => {
    const from = socket.user?.id;

    if (!from || !to || !text) return;

    try {
      const message = await Message.create({ from, to, text });

      // Emit to recipient
      io.to(to).emit("receiveMessage", message);

      // Emit to sender (optional confirmation)
      io.to(from).emit("messageSent", message);
    } catch (err) {
      console.error("❌ Socket message error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected");
  });
});

// 🚀 Connect DB and start server
connectDB().then(() => {
  const PORT = config.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
