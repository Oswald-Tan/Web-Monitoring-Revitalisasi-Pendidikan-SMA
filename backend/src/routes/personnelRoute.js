import express from "express";
import {
  getPersonnel,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  getPersonnelByUserId,
} from "../controllers/personnelController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

// All routes require authentication and admin privileges

router.get("/", verifyUser, getPersonnel);
router.get("/:id", verifyUser, getPersonnelById);
router.get("/user/:userId", verifyUser, getPersonnelByUserId);
router.post("/", verifyUser, createPersonnel);
router.put("/:id", verifyUser, updatePersonnel);
router.delete("/:id", verifyUser, deletePersonnel);

export default router;