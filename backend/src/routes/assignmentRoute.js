import express from "express";
import {
  getAssignableUsers,
  getSchoolsWithAssignments,
  bulkAssignFacilitators,
  bulkAssignAdmins,
  getSchoolAdmins,
} from "../controllers/assignmentController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.use(verifyUser, adminOnly);

router.get("/assignable-users", getAssignableUsers);
router.get("/schools", getSchoolsWithAssignments);
router.get("/admins", getSchoolAdmins);
router.post("/bulk-assign-facilitators", bulkAssignFacilitators);
router.post("/bulk-assign-admins", bulkAssignAdmins);

export default router;