import express from "express";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
} from "../controllers/calendarController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getCalendarEvents);
router.post("/", verifyUser, createCalendarEvent);
router.put("/:id", verifyUser, updateCalendarEvent);
router.delete("/:id", verifyUser, deleteCalendarEvent);

export default router;