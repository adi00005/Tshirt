// src/controllers/adminController.js
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Design from '../models/Design.js';
import asyncHandler from 'express-async-handler';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Fetch all data in parallel
    const [
      totalUsers,
      newUsersToday,
      activeUsersToday,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalOrders,
      todayOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      recentOrders,
      lowStockAlerts
    ] = await Promise.all([
      // User stats
      User.countDocuments({}),
      User.countDocuments({
        createdAt: { $gte: startOfToday }
      }),
      User.countDocuments({
        lastLogin: { $gte: startOfToday }
      }),
      
      // Product stats
      Product.countDocuments({}),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $lt: 10 } }),
      
      // Order stats
      Order.countDocuments({}),
      Order.countDocuments({
        createdAt: { $gte: startOfToday }
      }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      
      // Revenue stats
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            status: 'delivered',
            createdAt: { $gte: startOfToday }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            status: 'delivered',
            createdAt: { $gte: startOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            status: 'delivered',
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
          } 
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Recent orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .lean(),
      
      // Low stock products
      Product.find({ stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(10)
        .select('name stock price')
        .lean()
    ]);

    // Calculate revenue trends
    const currentMonthRev = monthlyRevenue[0]?.total || 0;
    const prevMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueTrend = prevMonthRev > 0 
      ? Math.round(((currentMonthRev - prevMonthRev) / prevMonthRev) * 100) 
      : 100;

    // Format the response
    const stats = {
      users: {
        total: totalUsers,
        active: activeUsersToday,
        newToday: newUsersToday
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts
      },
      orders: {
        total: totalOrders,
        today: todayOrders,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        monthly: currentMonthRev,
        trend: revenueTrend >= 0 ? 'up' : 'down',
        trendPercentage: Math.abs(revenueTrend)
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        customerName: order.user?.name || 'Guest User',
        date: order.createdAt,
        total: order.totalAmount,
        status: order.status,
        items: order.items.length
      })),
      lowStockAlerts: lowStockAlerts.map(product => ({
        _id: product._id,
        name: product.name,
        stock: product.stock,
        price: product.price
      }))
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// @desc    Get all users with filtering and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, isActive, role } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    if (role) user.role = role;

    const updatedUser = await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await user.remove();
    
    res.status(200).json({
      success: true,
      message: 'User removed',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Get all orders with filtering and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.$or = [
        { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } },
        { 'user.email': { $regex: req.query.search, $options: 'i' } },
        { _id: req.query.search }
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    // Format response
    const formattedOrders = orders.map(order => ({
      ...order,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`
    }));

    res.status(200).json({
      success: true,
      data: formattedOrders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Format response
    const formattedOrder = {
      ...order,
      orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
      items: order.items.map(item => ({
        ...item,
        product: item.product ? {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image
        } : { name: 'Product not available', price: 0, image: '' }
      }))
    };

    res.status(200).json({
      success: true,
      data: formattedOrder
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate status transition
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update order status
    order.status = status;
    order.statusHistory.push({
      status,
      date: new Date(),
      performedBy: req.user._id
    });

    // Add tracking number if provided and order is shipped
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    const updatedOrder = await order.save();

    // TODO: Send email notification to customer
    // await sendOrderStatusUpdateEmail(updatedOrder);

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: {
        _id: updatedOrder._id,
        status: updatedOrder.status,
        statusHistory: updatedOrder.statusHistory,
        trackingNumber: updatedOrder.trackingNumber
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
});

// @desc    Get all products with filtering and pagination
// @route   GET /api/admin/products
// @access  Private/Admin
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { sku: req.query.search }
      ];
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.inStock) {
      if (req.query.inStock === 'true') {
        query.stock = { $gt: 0 };
      } else {
        query.stock = 0;
      }
    }
    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Private/Admin
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      sku,
      images,
      isActive = true,
      variants = []
    } = req.body;

    // Basic validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Generate SKU if not provided
    let finalSku = sku;
    if (!finalSku) {
      const random = Math.floor(1000 + Math.random() * 9000);
      finalSku = `${name.substring(0, 3).toUpperCase()}${random}`;
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      sku: finalSku,
      images: Array.isArray(images) ? images : [],
      isActive,
      variants: Array.isArray(variants) ? variants : []
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created',
      data: createdProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    const {
      name,
      description,
      price,
      category,
      stock,
      sku,
      images,
      isActive,
      variants
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (typeof stock !== 'undefined') product.stock = stock;
    if (sku) product.sku = sku;
    if (Array.isArray(images)) product.images = images;
    if (typeof isActive !== 'undefined') product.isActive = isActive;
    if (Array.isArray(variants)) product.variants = variants;

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    // Or hard delete
    // await product.remove();

    res.status(200).json({
      success: true,
      message: 'Product deactivated',
      data: {
        _id: product._id,
        name: product.name,
        sku: product.sku
      }
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// @desc    Get inventory with filtering
// @route   GET /api/admin/inventory
// @access  Private/Admin
export const getInventory = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Stock level filter
    if (req.query.stockLevel) {
      switch (req.query.stockLevel) {
        case 'critical':
          query.stock = { $lte: 5 };
          break;
        case 'low':
          query.stock = { $gt: 5, $lte: 20 };
          break;
        case 'out':
          query.stock = 0;
          break;
        case 'in-stock':
          query.stock = { $gt: 0 };
          break;
      }
    }
    
    // Search filter
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: req.query.search }
      ];
    }
    
    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Active products only
    query.isActive = true;

    // Get products with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .select('name sku category price stock image')
        .sort({ stock: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Calculate inventory value
    const inventoryValue = products.reduce((sum, product) => {
      return sum + (product.price * product.stock);
    }, 0);

    // Get stock level counts
    const [criticalStock, lowStock, outOfStock] = await Promise.all([
      Product.countDocuments({ stock: { $lte: 5 }, isActive: true }),
      Product.countDocuments({ stock: { $gt: 5, $lte: 20 }, isActive: true }),
      Product.countDocuments({ stock: 0, isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: products,
      stats: {
        totalProducts: total,
        criticalStock,
        lowStock,
        outOfStock,
        inventoryValue: parseFloat(inventoryValue.toFixed(2))
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message
    });
  }
});

// @desc    Update inventory (stock level)
// @route   PUT /api/admin/inventory/:id
// @access  Private/Admin
export const updateInventory = asyncHandler(async (req, res) => {
  try {
    const { stock, action, quantity = 1 } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock based on action or direct value
    if (typeof stock === 'number' && stock >= 0) {
      product.stock = stock;
    } else if (action === 'increment') {
      product.stock += quantity;
    } else if (action === 'decrement') {
      product.stock = Math.max(0, product.stock - quantity);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action or stock value'
      });
    }

    // Save the updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated',
      data: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        updatedAt: product.updatedAt
      }
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const categoryExists = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = new Category({
      name,
      description,
      isActive
    });

    const createdCategory = await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: createdCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });

      if (categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category name already in use'
        });
      }

      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is in use by any products
    const productsCount = await Product.countDocuments({ category: category._id });
    
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: ${productsCount} product(s) are using it`
      });
    }

    await category.remove();

    res.status(200).json({
      success: true,
      message: 'Category deleted',
      data: {
        _id: category._id,
        name: category.name
      }
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

// @desc    Create a new admin user
// @route   POST /api/admin/users/admin
// @access  Private/Admin
export const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: true
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      message: 'Error creating admin',
      error: error.message
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({});

    res.json({
      users,
      page,
      pages: Math.ceil(totalUsers / limit),
      total: totalUsers
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      message: 'Error getting users',
      error: error.message
    });
  }
});

// @desc    Update user to admin
// @route   PUT /api/admin/users/:id/make-admin
// @access  Private/Admin
export const updateUserToAdmin = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.isAdmin = true;
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error updating user to admin:', error);
    res.status(500).json({
      message: 'Error updating user to admin',
      error: error.message
    });
  }
});

// @desc    Get customer designs for admin approval
// @route   GET /api/admin/designs
// @access  Private/Admin
export const getCustomerDesigns = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get customer designs (not templates)
    const designs = await Design.find({ template: false })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Design.countDocuments({ template: false });

    res.json({
      success: true,
      data: designs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer designs:', error);
    res.status(500).json({
      message: 'Error fetching customer designs',
      error: error.message
    });
  }
});

// @desc    Approve customer design and convert to product
// @route   POST /api/admin/designs/:id/approve
// @access  Private/Admin
export const approveDesignAsProduct = asyncHandler(async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).populate('user');
    
    if (!design) {
      res.status(404);
      throw new Error('Design not found');
    }

    // Create product from design
    const productData = {
      name: design.name,
      description: design.description,
      price: req.body.price || 1499,
      category: req.body.category || 'unisex',
      stock: req.body.stock || 50,
      images: [design.thumbnail, design.previewImage].filter(Boolean),
      status: 'active',
      tags: 'custom-design,customer-created',
      designId: design._id,
      createdBy: design.user._id
    };

    const product = await Product.create(productData);

    // Update design status
    design.status = 'approved';
    design.productId = product._id;
    await design.save();

    res.json({
      success: true,
      message: 'Design approved and converted to product',
      data: product
    });
  } catch (error) {
    console.error('Error approving design:', error);
    res.status(500).json({
      message: 'Error approving design',
      error: error.message
    });
  }
});
