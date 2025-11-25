// src/routes/uploadRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../utils/fileUpload.js';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Upload file
router.post('/', upload.single('image'), uploadFile);

// Delete file (admin only)
router.delete('/:filename', admin, deleteFile);

export default router;
