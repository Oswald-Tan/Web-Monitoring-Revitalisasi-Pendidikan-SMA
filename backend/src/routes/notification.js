import express from "express";
import {
  sendNotificationNow,
} from "../controllers/notificationController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/:id/send", verifyUser, adminOnly, sendNotificationNow);

export default router;
