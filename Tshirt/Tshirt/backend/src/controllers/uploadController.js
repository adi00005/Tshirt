// src/controllers/uploadController.js
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import asyncHandler from 'express-async-handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * @desc    Upload a file
 * @route   POST /api/upload
 * @access  Private
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  const filePath = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      name: req.file.filename,
      path: filePath,
      size: req.file.size,
      type: req.file.mimetype,
    },
  });
});

/**
 * @desc    Delete a file
 * @route   DELETE /api/upload/:filename
 * @access  Private/Admin
 */
export const deleteFile = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404);
      throw new Error('File not found');
    }
    
    console.error('Error deleting file:', error);
    res.status(500);
    throw new Error('Error deleting file');
  }
});
