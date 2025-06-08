// controllers/notificationController.js
import { Notification } from "../models/NotificationModel.js";
import { SocketUser } from "../models/SocketUserModel.js";

export const sendNotifications = async (req, res) => {
    console.log("kdsjghfiugiufdgvui ijdghsfui")
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

        
      console.log("///////v /////" , notif)

      const socketUser = await SocketUser.findOne({ userId: notif.userId });

      console.log("////////////" , socketUser)

      if (socketUser?.socketId) {
        // Emit socket event here — assuming you have access to io instance
        req.io.to(socketUser.socketId).emit("notification", {
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
