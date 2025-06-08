import mongoose from "mongoose";

const socketUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  socketId: {
    type: String,
    required: true,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
});

export const SocketUser = mongoose.model("SocketUser", socketUserSchema);
