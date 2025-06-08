// routes/notificationRoutes.js
import express from "express";
import { sendNotifications } from "../controllers/notificationController.js";

const router = express.Router();

// POST /api/notifications/send
router.post("/send", sendNotifications);

export default router;
