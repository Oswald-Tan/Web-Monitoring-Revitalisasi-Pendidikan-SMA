import express from "express";
import {
  addKelas,
  getAllKelas,
  getByName,
  remove
} from "../controllers/kelasController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, addKelas);
router.get("/", verifyUser, getAllKelas);
router.get("/:nama_kelas", verifyUser, getByName);
router.delete("/:id", verifyUser, adminOnly, remove);

export default router;
