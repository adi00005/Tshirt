import express from 'express';
import { 
  getAdminProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateProductStock,
  toggleProductActive,
  createProductReview
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateProduct } from '../middleware/validationMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

// @route   GET /api/admin/products
// @desc    Get all products (admin)
// @access  Private/Admin
router.get('/', getAdminProducts);

// @route   POST /api/admin/products
// @desc    Create a new product
// @access  Private/Admin
router.post(
  '/', 
  upload.array('images', 10), // Handle multiple file uploads (max 10)
  validateProduct.create,
  createProduct
);

// @route   GET /api/admin/products/:id
// @desc    Get product by ID
// @access  Private/Admin
router.get('/:id', getProductById);

// @route   PUT /api/admin/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put(
  '/:id', 
  upload.array('images', 10), // Handle multiple file uploads (max 10)
  validateProduct.update,
  updateProduct
);

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', deleteProduct);

// @route   PUT /api/admin/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put('/:id/stock', validateProduct.updateStock, updateProductStock);

// @route   PUT /api/admin/products/:id/active
// @desc    Toggle product active status
// @access  Private/Admin
router.put('/:id/active', toggleProductActive);

// @route   POST /api/admin/products/:id/reviews
// @desc    Create a new review
// @access  Private
router.post('/:id/reviews', createProductReview);

export default router;
