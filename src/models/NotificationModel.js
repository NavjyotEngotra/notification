// models/NotificationModel.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  notificationMessage: { type: String, required: true },
  title: { type: String, required: true },
  module: { type: String, required: true },
  moduleId: { type: String, required: true },
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false },
  userId: {     type: String,
    required: true, },
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);