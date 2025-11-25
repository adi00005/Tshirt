import express from 'express';
import {
  saveDesign,
  getDesign,
  getMyDesigns,
  updateDesign,
  deleteDesign,
  getTemplates,
  applyTemplate
} from '../controllers/designController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Design CRUD routes
router.route('/')
  .post(saveDesign)
  .get(getMyDesigns);

router.route('/:id')
  .get(getDesign)
  .put(updateDesign)
  .delete(deleteDesign);

// Template routes
router.get('/templates', getTemplates);
router.post('/apply-template/:templateId', applyTemplate);

export default router;
