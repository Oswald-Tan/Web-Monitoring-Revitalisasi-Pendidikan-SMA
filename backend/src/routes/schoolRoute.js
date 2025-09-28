import express from "express";
import {
  getSchools,
  addSchool,
  getSchoolNames,
  getSchoolsForAdmin,
  getSchoolById,
  updateSchool,
  getSchoolsLandingPage,
  getKabupatenList,
  getProgressByKabupaten,
  getProjectStatusCount,
  getGalleryData,
} from "../controllers/schoolController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, getSchools);
router.get("/school-lp", getSchoolsLandingPage);
router.get("/kabupaten-list", getKabupatenList);
router.get("/my-school", verifyUser, getSchoolsForAdmin);
router.get("/names", verifyUser, getSchoolNames);
router.get('/progress/kabupaten', getProgressByKabupaten);
router.get('/status/count', getProjectStatusCount);
router.get("/gallery", getGalleryData);
router.get("/:id", verifyUser, adminOnly, getSchoolById);
router.post("/", verifyUser, adminOnly, addSchool);
router.put("/:id", verifyUser, adminOnly, updateSchool);

export default router;
