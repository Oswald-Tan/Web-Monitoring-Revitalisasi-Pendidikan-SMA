import express from "express";
import {
  createDailyReport,
  getDailyReportsBySchool,
  getDailyReportsForReview,
  reviewDailyReport,
  getDailyReportDetail,
} from "../controllers/dailyReportController.js";
import { dailyReportUpload } from "../middleware/upload.js";
import { verifyUser } from "../middleware/authUser.js";

const router = express.Router();

router.post(
  "/",
  dailyReportUpload.array("files", 5),
  verifyUser,
  createDailyReport
);
router.get("/school/:schoolId", verifyUser, getDailyReportsBySchool);
router.get('/review', verifyUser, getDailyReportsForReview);
router.get('/:id', verifyUser, getDailyReportDetail);
router.patch('/:id/review', verifyUser, reviewDailyReport);

export default router;
