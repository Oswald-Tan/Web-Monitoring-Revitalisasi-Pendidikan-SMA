import express from "express";
import multer from "multer";
import path from "path";
import {
  getUsers,
  getUserById,
  getUserDetails,
  getTotalUsers,
  createUser,
  updateUser,
  deleteUser,
  addAdminProdi,
  listAdminProdi,
  listDetailAdminProdi,
  editAdminProdi,
  getUserWithDetails,
  getUsersByRole,
  getEventParticipants,
} from "../controllers/usersController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

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

const upload = multer({ storage: storage });

router.get("/users", verifyUser, adminOnly, getUsers);
router.get("/list-admin-prodi", verifyUser, adminOnly, listAdminProdi);
router.get("/users/:id/details", verifyUser, adminOnly, getUserDetails);
router.get("/user-details/:id", verifyUser, adminOnly, getUserWithDetails);
router.get("/users/:id/list-admin-prodi-details", verifyUser, adminOnly, listDetailAdminProdi);
router.get("/user/:id", verifyUser, adminOnly, getUserById);
router.get("/total-users", verifyUser, getTotalUsers);
router.get("/event-participants", verifyUser, adminOnly, getEventParticipants);
router.get("/by-role", verifyUser, adminOnly, getUsersByRole);
router.post("/user", verifyUser, adminOnly, createUser);
router.post("/add-admin-prodi", verifyUser, adminOnly, upload.single('photo_profile'), addAdminProdi);
router.patch("/user/:id", verifyUser, adminOnly, updateUser);
router.patch("/user/:id/edit-admin-prodi", verifyUser, adminOnly, upload.single('photo_profile'), editAdminProdi);
router.delete("/user/:id", verifyUser, adminOnly, deleteUser);

export default router;
