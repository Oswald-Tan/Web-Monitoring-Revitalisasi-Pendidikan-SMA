import express from "express";
import {
    generateTimeSchedule,
    getTimeSchedule,
    updateTimeSchedule
} from "../controllers/timeScheduleController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post('/generate/:schoolId', verifyUser, adminOnly, generateTimeSchedule);
router.get('/:schoolId', verifyUser, adminOnly, getTimeSchedule);
router.put('/:id', verifyUser, adminOnly, updateTimeSchedule);

export default router;
