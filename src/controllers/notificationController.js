// controllers/notificationController.js
import { Notification } from "../models/NotificationModel.js";
import { SocketUser } from "../models/SocketUserModel.js";

export const sendNotifications = async (req, res) => {
  try {
    const { notificationMessage, title, module, moduleId, userIds } = req.body;

    if (!notificationMessage || !title || !module || !moduleId || !userIds?.length) {
      return res.status(400).json({ message: "Missing required fields or userIds" });
    }

    // Array to hold created notifications
    const notificationsToCreate = userIds.map(userId => ({
      notificationMessage,
      title,
      module,
      moduleId,
      userId,
      read: false,
      sent: false,
    }));

    // Insert all notifications
    const createdNotifications = await Notification.insertMany(notificationsToCreate);

    // Now, send socket notifications for each user if connected
    for (const notif of createdNotifications) {
      const socketUser = await SocketUser.findOne({ userId: notif.userId });


      if (socketUser?.socketId) {
        // Emit socket event here — assuming you have access to io instance
        req.io.to(socketUser.socketId).emit("newNotificationSend", {
          _id: notif._id,
          notificationMessage: notif.notificationMessage,
          title: notif.title,
          module: notif.module,
          moduleId: notif.moduleId,
          read: notif.read,
          createdAt: notif.createdAt,
        });

        // Mark notification as sent
        notif.sent = true;
        await notif.save();
      }
    }

    return res.status(201).json({ message: "Notifications sent", notifications: createdNotifications });
  } catch (error) {
    console.error("Error in sendNotifications:", error);
    res.status(500).json({ message: "Server error" });
  }

};

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const query = { userId };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

    return res.status(200).json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const markNotificationsAsRead = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids array is required" });
    }

    const result = await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { read: true } }
    );

    return res.status(200).json({
      message: "Notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in markNotificationsAsRead:", error);
    res.status(500).json({ message: "Server error" });
  }
};
