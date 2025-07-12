import express from "express";
import { 
  createSurat, 
  getAllSurat, 
  getSuratById, 
  downloadSuratFile,
  updateSurat,
  deleteSurat,
  updateStatusSurat,
  disposisiSurat,
  cetakSurat
} from "../controllers/suratController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";
import { suratUpload } from "../middleware/upload.js";

const router = express.Router();

// Endpoint untuk manajemen surat
router.post("/", verifyUser, adminOnly, suratUpload.single('file'), createSurat);
router.get("/", verifyUser, adminOnly, getAllSurat);
router.get("/:id", verifyUser, adminOnly, getSuratById);
router.get("/:id/download", verifyUser, adminOnly, downloadSuratFile);
router.put("/:id", verifyUser, adminOnly, suratUpload.single('file'), updateSurat);
router.delete("/:id", verifyUser, adminOnly, deleteSurat);
router.put("/:id/status", verifyUser, adminOnly, updateStatusSurat);
router.post("/:id/disposisi", verifyUser, adminOnly, disposisiSurat);
router.get("/:id/cetak", verifyUser, adminOnly, cetakSurat);

export default router;