// routes/orderRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateOrder } from '../middleware/validationMiddleware.js';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus
} from '../controllers/orderController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// User routes
router.route('/')
  .post(validateOrder.create, createOrder)
  .get(admin, getOrders);

router.route('/myorders').get(getMyOrders);

// Admin routes
router.route('/:id')
  .get(getOrderById)
  .put(admin, validateOrder.updateStatus, updateOrderStatus);

router.route('/:id/pay').put(updateOrderToPaid);
router.route('/:id/deliver').put(admin, updateOrderToDelivered);

export default router;
