import express from "express";
import {
  getThreads,
  getThread,
  createThread,
  addMessage,
  updateThreadStatus,
  deleteThread
} from "../controllers/discussionController.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", getThreads);
router.get("/:id", getThread);
router.post("/", verifyUser, createThread);
router.post("/:id/messages", verifyUser, addMessage);
router.patch("/:id/status", verifyUser, updateThreadStatus);
router.delete("/:id", verifyUser, deleteThread);

export default router;