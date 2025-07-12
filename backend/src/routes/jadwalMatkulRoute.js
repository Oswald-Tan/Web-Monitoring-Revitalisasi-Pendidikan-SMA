import express from "express";
import {
  createJadwalMatkul,
  list,
  remove,
  getByDay,
  listDosen,
  listDosenByLab,
  listJadwalDosen,
  updateJadwalMatkul,
} from "../controllers/jadwalMatkulController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, createJadwalMatkul);
router.get("/", verifyUser, adminOnly, list);
router.get("/list-dosen", verifyUser, adminOnly, listDosen);
router.get("/list-dosen-lab", verifyUser, adminOnly, listDosenByLab);
router.get("/:hari", verifyUser, getByDay);
router.get("/dosen/:hari", verifyUser, adminOnly, listJadwalDosen);
router.put("/:id", verifyUser, adminOnly, updateJadwalMatkul);
router.delete("/:id", verifyUser, adminOnly, remove);

export default router;
