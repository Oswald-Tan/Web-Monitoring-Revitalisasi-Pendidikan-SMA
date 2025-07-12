import express from "express";
import {
  createMatkul,
  getAllMatkul,
  remove,
  getTotal
} from "../controllers/matkulController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, createMatkul);
router.get("/", verifyUser, adminOnly, getAllMatkul);
router.get("/total/:prodi", verifyUser, adminOnly, getTotal);
router.delete("/:id", verifyUser, adminOnly, remove);

export default router;
