import express from 'express';
import {
  getDashboardStats,
  getMySchoolProgress
} from '../controllers/dashboardController.js';

import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.get('/stats', verifyUser, getDashboardStats);
router.get('/my-school-progress', verifyUser, getMySchoolProgress);

export default router;