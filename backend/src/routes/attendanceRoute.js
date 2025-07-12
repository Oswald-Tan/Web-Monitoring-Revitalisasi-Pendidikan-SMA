import express from "express";
import {
  updateAttendance,
  getEventAttendance,
} from "../controllers/attendanceController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.put("/:id", verifyUser, updateAttendance);
router.get(
  "/events/:eventId/attendances",
  verifyUser,
  getEventAttendance
);

export default router;
