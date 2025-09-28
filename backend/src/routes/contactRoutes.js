import express from 'express';
import { body } from 'express-validator';
import {
  submitContact,
  getContactMessages,
  updateMessageStatus
} from '../controllers/contactController.js';

const router = express.Router();

// Validation rules
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2-100 karakter'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email tidak valid'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Pesan harus antara 10-2000 karakter')
];

// Routes
router.post('/submit', contactValidation, submitContact);
router.get('/messages', getContactMessages);
router.patch('/messages/:id/status', updateMessageStatus);

export default router;