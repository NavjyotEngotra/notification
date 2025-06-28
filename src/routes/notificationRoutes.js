import express from "express";
import {
  getNotifications,
  markNotificationsAsRead,
  sendNotifications
} from "../controllers/notificationController.js";

import { verifyTokenFromAuthService } from "../middlewares/authVerifyMiddleware.js";

const router = express.Router();

// protect all notification routes with this
router.use(verifyTokenFromAuthService);

router.post("/send", sendNotifications);
router.get("/", getNotifications);
router.put("/mark-read", markNotificationsAsRead);

export default router;
