import express from "express";
import {
  generateMonthlyReport,
  getMonthlyReports,
  getMonthlyReportById,
  downloadMonthlyReportPDF,
  exportMonthlyReportsPDF
} from "../controllers/monthlyReportController.js";
import { adminOnly, verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.post('/generate', verifyUser, adminOnly, generateMonthlyReport);
router.get('/', getMonthlyReports);
router.get('/export/pdf', exportMonthlyReportsPDF);
router.get('/:id', getMonthlyReportById);
router.get('/:id/pdf', downloadMonthlyReportPDF );

export default router;
