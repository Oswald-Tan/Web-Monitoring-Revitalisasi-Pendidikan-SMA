import express from "express";
import {
  getUsers,
  getUsersPersonnel,
  getUserById,
  getTotalUsers,
  getFacilitators,
  deleteUser,
  addUser,
  updateUser,
} from "../controllers/usersController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getUsers);
router.get("/personnel", verifyUser, adminOnly, getUsersPersonnel);
router.get("/facilitators", verifyUser, getFacilitators);
router.get("/total-users", verifyUser, getTotalUsers);
router.get("/:id", verifyUser, adminOnly, getUserById);
router.post("/", verifyUser, adminOnly, addUser);
router.patch("/:id", verifyUser, adminOnly, updateUser);
router.delete("/:id", verifyUser, adminOnly, deleteUser);

export default router;
