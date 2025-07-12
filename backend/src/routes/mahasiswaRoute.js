import express from "express";
import {
  addMahasiswa,
  addDetail,
  list,
  getAllMahasiswa,
  getMahasiswaWithDetails,
  getById,
  getAllMahasiswaCount,
  getMahasiswaCount,
  getJumlahMahasiswa,
  remove,
  edit,
  getMahasiswaPerProdi
} from "../controllers/mahasiswaController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, addMahasiswa);
router.post("/add-detail", verifyUser, adminOnly, addDetail);
router.get("/", verifyUser, adminOnly, list);
router.get("/get-all-mahasiswa", verifyUser, adminOnly, getAllMahasiswa);
router.get("/get-all-mahasiswa-count", verifyUser, adminOnly, getAllMahasiswaCount);
router.get("/get-mahasiswa-count", verifyUser, adminOnly, getMahasiswaCount);
router.get("/get-jumlah-mahasiswa", verifyUser, adminOnly, getJumlahMahasiswa);
router.get("/per-prodi", verifyUser, adminOnly, getMahasiswaPerProdi);
router.get("/detail/:id/details", verifyUser, adminOnly, getMahasiswaWithDetails);
router.get("/:id", verifyUser, adminOnly, getById);
router.put("/:id", verifyUser, adminOnly, edit);
router.delete("/:id", verifyUser, adminOnly, remove);

export default router;
