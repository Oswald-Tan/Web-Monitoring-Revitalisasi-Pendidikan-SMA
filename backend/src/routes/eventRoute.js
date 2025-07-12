import express from "express";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventNotifications,
  getEventStats,
  getEventAttendanceStats,
  getEventById,
  getTotalUpcomingEvents,
  getTotalOngoingEvents,
  getUpcomingEventCount,
  getOngoingEventCount,
  updateEvent,
  updateAllEventStatuses,
  deleteEvent,
} from "../controllers/eventController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, createEvent);
router.get("/", verifyUser, getEvents);
router.get("/my-event", verifyUser, getMyEvents);
router.get("/total-upcoming-dosen", verifyUser, getTotalUpcomingEvents);
router.get("/total-ongoing-dosen", verifyUser, getTotalOngoingEvents);
router.get("/total-upcoming", verifyUser, adminOnly, getUpcomingEventCount);
router.get("/total-ongoing", verifyUser, adminOnly, getOngoingEventCount);
router.get("/stats", verifyUser, adminOnly, getEventStats);
router.get("/:eventId/attendance-stat", verifyUser, adminOnly, getEventAttendanceStats);
router.get("/:id", verifyUser, adminOnly, getEventById);
router.get("/:id/notifications", verifyUser, adminOnly, getEventNotifications);
router.put("/:id", verifyUser, adminOnly, updateEvent);
router.post("/update-statuses", verifyUser, adminOnly, updateAllEventStatuses);
router.delete("/:id", verifyUser, adminOnly, deleteEvent);

export default router;
