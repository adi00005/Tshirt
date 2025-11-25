// src/routes/productRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validateProduct } from "../middleware/validationMiddleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getAdminProducts,
  getProductByIdAdmin,
  createProductReview,
  updateProductStock,
  toggleProductActive
} from "../controllers/productController.js";

const router = express.Router();

// Public routes
router.get("/featured", getFeaturedProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (require authentication)
router.use(protect);
router.post(
  "/:id/reviews",
  validateProduct.review,
  createProductReview
);

// Admin routes (require admin role)
router.use(admin);
router.post(
  "/",
  validateProduct.create,
  createProduct
);

router.put(
  "/:id",
  validateProduct.update,
  updateProduct
);

router.delete("/:id", deleteProduct);
router.get("/admin/products", getAdminProducts);
router.get("/admin/products/:id", getProductByIdAdmin);

router.put(
  "/:id/stock",
  validateProduct.updateStock,
  updateProductStock
);

router.put(
  "/:id/active",
  validateProduct.toggleActive,
  toggleProductActive
);

export default router;
