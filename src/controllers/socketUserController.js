import { SocketUser } from "../models/SocketUserModel.js";

// Get socket ID by userId
export const getSocketByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const socketUser = await SocketUser.findOne({ userId });

    if (!socketUser) {
      return res.status(404).json({ message: "Socket not found for user." });
    }

    return res.status(200).json({ socketId: socketUser.socketId });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
  
};

// Get user by socketId
export const getUserBySocketId = async (req, res) => {
  try {
    const { socketId } = req.params;
    const socketUser = await SocketUser.findOne({ socketId });

    if (!socketUser) {
      return res.status(404).json({ message: "User not found for socket." });
    }

    return res.status(200).json({ userId: socketUser.userId });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// Remove socket mapping by userId
export const removeSocketByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    await SocketUser.findOneAndDelete({ userId });
    return res.status(200).json({ message: "Socket mapping removed." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

// List all active socket connections
export const listAllSockets = async (req, res) => {
  try {
    const allSockets = await SocketUser.find().populate("userId", "name email"); // Populate if needed
    return res.status(200).json(allSockets);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

