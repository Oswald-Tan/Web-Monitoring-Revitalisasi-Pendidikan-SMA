import express from "express";
import {
  generateFinalReport,
  getFinalReports,
  getFinalReportById,
  updateFinalReport,
  deleteFinalReport,
  downloadFinalReportPDF,
  exportFinalReportsPDF
} from "../controllers/finalReportController.js";
import { adminOnly, verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.post("/generate", verifyUser, adminOnly, generateFinalReport);
router.get("/", verifyUser, getFinalReports);
router.get("/export/pdf", verifyUser, exportFinalReportsPDF);
router.get("/:id", verifyUser, getFinalReportById);
router.put("/:id", verifyUser, adminOnly, updateFinalReport);
router.delete("/:id", verifyUser, adminOnly, deleteFinalReport);
router.get("/:id/pdf", verifyUser, downloadFinalReportPDF);

export default router;