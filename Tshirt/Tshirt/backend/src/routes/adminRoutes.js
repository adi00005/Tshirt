// src/routes/adminRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserToAdmin,
  createAdmin,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getInventory,
  updateInventory,
  getCustomerDesigns,
  approveDesignAsProduct
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard routes
router.get("/dashboard", getDashboardStats);

// User management routes
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.route('/users/:id/make-admin')
  .put(updateUserToAdmin);

router.post("/users/admin", createAdmin);

// Order management routes
router.route('/orders')
  .get(getOrders);

router.route('/orders/:id')
  .get(getOrderById);

router.route('/orders/:id/status')
  .put(updateOrderStatus);

// Product management routes (to be implemented)
// router.route('/products')
//   .get()
//   .post();

// router.route('/products/:id')
//   .get()
//   .put()
//   .delete();

// Inventory management routes
router.get('/inventory', getInventory);
router.put('/inventory/:productId', updateInventory);

// Design management routes
router.route('/designs')
  .get(getCustomerDesigns);

router.post('/designs/:id/approve', approveDesignAsProduct);

export default router;
