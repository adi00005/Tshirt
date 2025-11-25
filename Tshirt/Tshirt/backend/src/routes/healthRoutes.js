// src/routes/healthRoutes.js
import express from 'express';
import { getHealthStatus, getDetailedHealthStatus } from '../controllers/healthController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/', getHealthStatus);

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with system information
 * @access  Private/Admin
 */
router.get('/detailed', protect, admin, getDetailedHealthStatus);

export default router;
