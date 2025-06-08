import express from "express";
import {
  getSocketByUserId,
  getUserBySocketId,
  removeSocketByUserId,
  listAllSockets
} from "../controllers/socketUserController.js";

const router = express.Router();

router.get("/user/:userId", getSocketByUserId);
router.get("/socket/:socketId", getUserBySocketId);
router.delete("/user/:userId", removeSocketByUserId);
router.get("/", listAllSockets);

export default router;
