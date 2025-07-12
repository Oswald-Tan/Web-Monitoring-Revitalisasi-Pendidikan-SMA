import express from "express";
import {
  uploadDocument,
  downloadDocument,
  getAllDocuments,
  deleteDocument
} from "../controllers/documentController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";
import { dokumenUpload } from "../middleware/upload.js";

const prepareUserRoles = (req, res, next) => {
  // Format req.user sesuai yang diharapkan downloadDocument
  req.user = {
    role: req.role // req.role sudah diset oleh verifyUser
  };
  next();
};

const router = express.Router();

router.post("/", verifyUser, adminOnly, dokumenUpload.single('file'), uploadDocument);
router.get("/", verifyUser, adminOnly, getAllDocuments);
router.get("/download/:id", verifyUser, prepareUserRoles, downloadDocument);
router.delete("/:id", verifyUser, adminOnly, deleteDocument);

export default router;
