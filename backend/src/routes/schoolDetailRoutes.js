import express from "express";
import multer from "multer";
import path from "path";
import {
  getSchoolDetail,
  updateRecommendations,
  addIssue,
  addPhoto,
  updateIssueStatus,
  deletePhoto,
} from "../controllers/schoolDetailController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";
import { schoolPhotoUpload } from "../middleware/upload.js";

const router = express.Router();

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});


router.get("/:id", verifyUser, getSchoolDetail);
router.patch("/:id/recommendations", verifyUser, adminOnly, updateRecommendations);
router.post('/:id/issues', verifyUser, adminOnly, addIssue);
router.post('/:id/photos', verifyUser, adminOnly, schoolPhotoUpload .single('photo'), addPhoto);
router.patch('/:id/issues/:issueId', verifyUser, adminOnly, updateIssueStatus);
router.delete("/:id/photos/:photoId", verifyUser,adminOnly, deletePhoto);

export default router;
