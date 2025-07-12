import express from "express";
import {
  getAllAuditLogs,
  getAuditLogById,
  deleteAuditLog,
  deleteMultipleAuditLogs,
} from "../controllers/auditLogController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getAllAuditLogs);
router.get("/:id", verifyUser, adminOnly, getAuditLogById);
router.delete("/:id", verifyUser, adminOnly, deleteAuditLog);
router.delete("/", verifyUser, adminOnly, deleteMultipleAuditLogs);

export default router;
