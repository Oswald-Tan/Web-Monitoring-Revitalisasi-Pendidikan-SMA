import express from 'express';
import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  getCategories
} from '../controllers/documentController.js';
import { dokumenUpload } from '../middleware/upload.js';
import { verifyUser, adminOnly } from '../middleware/authUser.js';

const router = express.Router();

// Public routes
router.get('/', getDocuments);
router.get('/categories', getCategories);
router.get('/download/:id', downloadDocument);

// Protected routes (admin only)
router.post('/upload', verifyUser, adminOnly, dokumenUpload.single('file'), uploadDocument);
router.put('/:id', verifyUser, adminOnly, updateDocument);
router.delete('/:id', verifyUser, adminOnly, deleteDocument);

export default router;