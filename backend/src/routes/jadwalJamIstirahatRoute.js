import express from "express";
import {
  addJamIstirahat, getJamIstirahat, remove
} from "../controllers/jadwalJamIstirahatController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

router.post("/", verifyUser, adminOnly, addJamIstirahat);
router.get("/", verifyUser, adminOnly, getJamIstirahat);
router.delete("/:id", verifyUser, adminOnly, remove);

export default router;
