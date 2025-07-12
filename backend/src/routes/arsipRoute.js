import express from "express";
import { 
  createArsip, 
  getAllArsip, 
  downloadArsip, 
  updateStatusArsip,
  deleteArsip,
  getArsipStats
} from "../controllers/arsipController.js";
import { verifyUser, adminOnly} from "../middleware/authUser.js";
import { arsipUpload  } from "../middleware/upload.js";

const router = express.Router();

// Endpoint Arsip
router.post("/", verifyUser, adminOnly, arsipUpload.single('file'), createArsip);
router.get("/", verifyUser, adminOnly, getAllArsip);
router.get("/download/:id", verifyUser, adminOnly, downloadArsip);
router.get("/stats", verifyUser, adminOnly, getArsipStats);
router.put("/:id/status", verifyUser, adminOnly, updateStatusArsip);
router.delete("/:id", verifyUser, adminOnly, deleteArsip);

export default router;