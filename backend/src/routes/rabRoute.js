import express from 'express';
import { 
  uploadRab, 
  getRabBySchool, 
  deleteRab,
} from '../controllers/rabController.js';
import { rabUpload } from '../middleware/upload.js';

const router = express.Router();

// Gunakan middleware yang sudah berupa instance multer
router.post('/upload', rabUpload.single('rabFile'), uploadRab);
router.get('/school/:schoolId', getRabBySchool);
router.delete('/school/:schoolId', deleteRab);

export default router;