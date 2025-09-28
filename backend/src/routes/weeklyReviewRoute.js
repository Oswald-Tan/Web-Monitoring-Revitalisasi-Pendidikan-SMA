import express from 'express';
import {
  getWeeklyAggregate,
  createWeeklyReview,
  getWeeklyReviews,
  exportWeeklyReviewPDF,
  updateWeeklyReviewStatus,
  exportWeeklyAggregatePDF,
  getCommonTechnicalIssues,
} from '../controllers/weeklyReviewController.js';
import { adminOnly, verifyUser } from '../middleware/authUser.js';
const router = express.Router();

router.get('/aggregate', verifyUser, getWeeklyAggregate);
router.get('/', verifyUser, getWeeklyReviews);
router.get('/export/aggregate', verifyUser, exportWeeklyAggregatePDF);
router.get('/common-technical-issues', verifyUser, getCommonTechnicalIssues);
router.get('/:id/export', verifyUser, exportWeeklyReviewPDF);
router.post('/', verifyUser, createWeeklyReview);
router.put('/:id', verifyUser, createWeeklyReview);
router.patch('/:id/status', verifyUser, updateWeeklyReviewStatus);

export default router;