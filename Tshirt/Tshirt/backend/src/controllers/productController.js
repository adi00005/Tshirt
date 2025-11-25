// controllers/productController.js
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { 
    name, description, price, discountPrice, category, subCategory, brand,
    sizes, colors, stock, specifications, tags, isFeatured
  } = req.body;

  // Handle image uploads
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => 
      cloudinary.uploader.upload(file.path, { folder: 'tshirt-store/products' })
    );
    const results = await Promise.all(uploadPromises);
    imageUrls = results.map(result => result.secure_url);
  }

  const product = new Product({
    name,
    slug: slugify(name, { lower: true }),
    description,
    price,
    discountPrice: discountPrice || 0,
    category,
    subCategory,
    brand,
    images: imageUrls,
    sizes: sizes ? JSON.parse(sizes) : [],
    colors: colors ? JSON.parse(colors) : [],
    stock: Number(stock) || 0,
    specifications: specifications ? JSON.parse(specifications) : {},
    tags: tags ? JSON.parse(tags) : [],
    isFeatured: isFeatured === 'true',
    createdBy: req.user._id
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const { 
    name, description, price, discountPrice, category, subCategory, brand,
    sizes, colors, stock, specifications, tags, isFeatured, imagesToDelete
  } = req.body;

  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Handle image uploads
  let imageUrls = [...product.images];
  
  // Remove deleted images
  if (imagesToDelete) {
    const imagesToRemove = JSON.parse(imagesToDelete);
    imageUrls = imageUrls.filter(img => !imagesToRemove.includes(img));
    
    // Delete from Cloudinary
    await Promise.all(
      imagesToRemove.map(publicId => 
        cloudinary.uploader.destroy(publicId.split('/').pop().split('.')[0])
      )
    );
  }

  // Add new images
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => 
      cloudinary.uploader.upload(file.path, { folder: 'tshirt-store/products' })
    );
    const results = await Promise.all(uploadPromises);
    results.forEach(result => imageUrls.push(result.secure_url));
  }

  // Update product fields
  product.name = name || product.name;
  product.slug = name ? slugify(name, { lower: true }) : product.slug;
  product.description = description || product.description;
  product.price = price || product.price;
  product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
  product.category = category || product.category;
  product.subCategory = subCategory || product.subCategory;
  product.brand = brand || product.brand;
  product.images = imageUrls;
  product.sizes = sizes ? JSON.parse(sizes) : product.sizes;
  product.colors = colors ? JSON.parse(colors) : product.colors;
  product.stock = stock !== undefined ? Number(stock) : product.stock;
  product.specifications = specifications ? JSON.parse(specifications) : product.specifications;
  product.tags = tags ? JSON.parse(tags) : product.tags;
  product.isFeatured = isFeatured !== undefined ? isFeatured === 'true' : product.isFeatured;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  await Promise.all(
    product.images.map(publicId => 
      cloudinary.uploader.destroy(publicId.split('/').pop().split('.')[0])
    )
  );

  await product.remove();
  res.json({ message: 'Product removed' });
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAdminProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
        ],
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getProductByIdAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create product review
// @route   POST /api/admin/products/:id/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product stock
// @route   PUT /api/admin/products/:id/stock
// @access  Private/Admin
export const updateProductStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.stock = Number(stock);
  await product.save();

  res.json({ message: 'Stock updated', stock: product.stock });
});

// @desc    Toggle product active status
// @route   PUT /api/admin/products/:id/active
// @access  Private/Admin
export const toggleProductActive = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isActive = !product.isActive;
  await product.save();

  res.json({ 
    message: `Product ${product.isActive ? 'activated' : 'deactivated'}`,
    isActive: product.isActive 
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const featuredProducts = await Product.find({ 
      is_featured: true, 
      status: "active" 
    }).populate("category_id vendor_id").limit(8);
    
    res.status(200).json({
      success: true,
      count: featuredProducts.length,
      data: featuredProducts
    });
  } catch (err) {
    console.error("Get Featured Products Error:", err);
    
    // Fallback to mock featured products when database is unavailable
    const mockFeaturedProducts = [
      {
        _id: "featured1",
        name: "Premium Cotton T-Shirt",
        price: 2499,
        sale_price: 1999,
        image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Black", "Navy"],
        average_rating: 4.5,
        review_count: 128,
        category: "men",
        stock_quantity: 15,
        is_featured: true,
        low_stock: false
      },
      {
        _id: "featured2",
        name: "Women's Vintage Tee",
        price: 2199,
        sale_price: null,
        image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Pink", "White", "Lavender"],
        average_rating: 4.7,
        review_count: 89,
        category: "women",
        stock_quantity: 22,
        is_featured: true,
        low_stock: false
      },
      {
        _id: "featured3",
        name: "Kids Superhero T-Shirt",
        price: 1599,
        sale_price: 1299,
        image_url: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500",
        sizes: ["XS", "S", "M"],
        colors: ["Red", "Blue", "Black"],
        average_rating: 4.8,
        review_count: 156,
        category: "kids",
        stock_quantity: 8,
        is_featured: true,
        low_stock: true
      },
      {
        _id: "featured4",
        name: "Athletic Performance Tee",
        price: 2999,
        sale_price: 2499,
        image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Gray", "Navy"],
        average_rating: 4.6,
        review_count: 203,
        category: "men",
        stock_quantity: 18,
        is_featured: true,
        low_stock: false
      }
    ];
    
    res.status(200).json({
      success: true,
      count: mockFeaturedProducts.length,
      data: mockFeaturedProducts
    });
  }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category.toLowerCase();
    }
    
    const products = await Product.find(query).populate("category_id vendor_id");
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category_id vendor_id");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    console.error("Get Product By ID Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Database error - unable to fetch product" 
    });
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
export const createProductPublic = asyncHandler(async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
export const updateProductPublic = asyncHandler(async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProductPublic = asyncHandler(async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
