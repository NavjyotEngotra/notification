import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import { SocketUser } from "./models/SocketUserModel.js";
import socketUserRoutes from "./routes/socketUserRoutes.js"; // REST routes
import notificationRoutes from "./routes/notificationRoutes.js";
import { Notification } from "./models/NotificationModel.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/socket-users", socketUserRoutes);
app.use("/api/notifications", notificationRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ Use a specific domain in production
  },
});

// ✅ MongoDB Connection
(async () => {
  try {
    const DBinstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
    console.log("✅ MongoDB Connected -->", DBinstance.connection.host);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
})().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.auth?.userId;

  await SocketUser.findOneAndUpdate(
    { userId },
    { socketId: socket.id },
    { upsert: true, new: true }
  );


  const unsentNotifications = await Notification.find({
    userId: userId,
  }).sort({ createdAt: -1 }) // Sort by newest first
    .limit(20);              // Limit to latest 20 notifications

  for (const notif of unsentNotifications) {
    socket.emit("notification", {
      _id: notif._id,
      notificationMessage: notif.notificationMessage,
      title: notif.title,
      module: notif.module,
      moduleId: notif.moduleId,
      read: notif.read,
      createdAt: notif.createdAt,
    });

    notif.sent = true;
    await notif.save();
  }




  socket.on("register", async (userId) => {
    try {
      await SocketUser.findOneAndUpdate(
        { userId },
        { socketId: socket.id, connectedAt: new Date() },
        { upsert: true, new: true }
      );
      console.log(`User ${userId} registered with socket ${socket.id}`);
    } catch (error) {
      console.error("Error saving socket ID:", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      // Instead of deleting, set socketId to null
      await SocketUser.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null },
        { new: true }
      );
      console.log(`❌ Client disconnected: ${socket.id}, socketId set to null in DB`);
    } catch (error) {
      console.error("Error updating socketId to null:", error);
    }
  });
});
