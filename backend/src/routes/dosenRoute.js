import express from "express";
import {
  addDosen,
  getById,
  edit,
  list,
  remove,
  getAllDosen,
  getDosenWithDetails,
  getAllDosenCount
} from "../controllers/dosenController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, addDosen);
router.get("/", verifyUser, adminOnly, list);
router.get("/get-all-dosen-count", verifyUser, adminOnly, getAllDosenCount);
router.get("/get-all-dosen", verifyUser, adminOnly, getAllDosen);
router.get("/detail/:id/details", verifyUser, adminOnly, getDosenWithDetails);
router.get("/:id", verifyUser, adminOnly, getById);
router.put("/:id", verifyUser, adminOnly, edit);
router.delete("/:id", verifyUser, adminOnly, remove);

export default router;
