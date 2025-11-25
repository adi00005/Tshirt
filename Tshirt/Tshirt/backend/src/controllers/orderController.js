// controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import asyncHandler from 'express-async-handler';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  try {
    const { 
      items, 
      shippingInfo, 
      paymentInfo, 
      orderNotes, 
      subtotal, 
      discount, 
      total, 
      coupon 
    } = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingInfo || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Shipping and payment information are required'
      });
    }

    // Calculate COD charges if applicable
    let finalTotal = total;
    let codCharges = 0;
    if (paymentInfo.method === 'cod') {
      codCharges = 50;
      finalTotal += codCharges;
    }

    // Create order
    const order = new Order({
      userId: req.user.id,
      items,
      shippingInfo,
      paymentInfo,
      orderNotes: orderNotes || '',
      subtotal,
      discount: discount || 0,
      total: finalTotal,
      coupon: coupon || null,
      codCharges
    });

    await order.save();

    // If payment method is COD, mark as confirmed
    if (paymentInfo.method === 'cod') {
      order.status = 'confirmed';
      order.paymentInfo.paymentStatus = 'pending'; // Will be paid on delivery
      await order.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.orderId,
        order: {
          id: order._id,
          orderId: order.orderId,
          status: order.status,
          total: order.total,
          paymentStatus: order.paymentInfo.paymentStatus,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @desc    Process payment for an order
// @route   POST /api/orders/:orderId/pay
// @access  Private
export const processPayment = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentData } = req.body;

    const order = await Order.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    // Check if payment is already completed
    if (order.paymentInfo.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this order'
      });
    }

    // Simulate payment processing based on payment method
    let paymentResult = { success: false, transactionId: null };

    switch (order.paymentInfo.method) {
      case 'card':
        paymentResult = await processCardPayment(paymentData, order.total);
        break;
      case 'upi':
        paymentResult = await processUPIPayment(paymentData, order.total);
        break;
      case 'wallet':
        paymentResult = await processWalletPayment(paymentData, order.total);
        break;
      case 'cod':
        return res.status(400).json({
          success: false,
          message: 'COD orders do not require online payment'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    if (paymentResult.success) {
      await order.updatePaymentStatus('completed', paymentResult.transactionId);
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          orderId: order.orderId,
          transactionId: paymentResult.transactionId,
          paymentStatus: 'completed',
          orderStatus: order.status
        }
      });
    } else {
      await order.updatePaymentStatus('failed');
      
      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: paymentResult.error
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
});

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const orders = await Order.findByUserId(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    const totalOrders = await Order.countDocuments({ 
      userId: req.user.id,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order._id,
          orderId: order.orderId,
          items: order.items,
          status: order.status,
          paymentStatus: order.paymentInfo.paymentStatus,
          paymentMethod: order.paymentInfo.method,
          total: order.total,
          createdAt: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
          deliveredAt: order.deliveredAt,
          trackingNumber: order.trackingNumber
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @desc    Get single order details
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrderDetails = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderId: order.orderId,
          items: order.items,
          shippingInfo: order.shippingInfo,
          paymentInfo: {
            method: order.paymentInfo.method,
            paymentStatus: order.paymentInfo.paymentStatus,
            transactionId: order.paymentInfo.transactionId,
            paidAt: order.paymentInfo.paidAt
          },
          orderNotes: order.orderNotes,
          subtotal: order.subtotal,
          discount: order.discount,
          shippingCost: order.shippingCost,
          codCharges: order.codCharges,
          total: order.total,
          coupon: order.coupon,
          status: order.status,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the user is the owner or an admin
    if (order.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting order by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findByOrderId(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason || 'Cancelled by customer';

    // If payment was completed, mark for refund
    if (order.paymentInfo.paymentStatus === 'completed') {
      order.paymentInfo.paymentStatus = 'refunded';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        orderId: order.orderId,
        status: order.status,
        cancelledAt: order.cancelledAt
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the order owner or admin
    if (order.userId.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update order status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = Date.now();
    
    // Add status history
    order.statusHistory.push({
      status: 'paid',
      changedAt: Date.now(),
      changedBy: req.user.id
    });

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order to paid:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    
    // Add status history
    order.statusHistory.push({
      status: 'delivered',
      changedAt: Date.now(),
      changedBy: req.user.id
    });

    const updatedOrder = await order.save();

    // TODO: Send delivery confirmation email to customer

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order to delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order delivery status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    order.updatedAt = Date.now();
    
    // Add status history
    order.statusHistory.push({
      status,
      changedAt: Date.now(),
      changedBy: req.user.id
    });

    const updatedOrder = await order.save();

    // TODO: Send status update email to user
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mock payment processing functions
const processCardPayment = async (paymentData, amount) => {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock success/failure (90% success rate)
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
  } else {
    return {
      success: false,
      error: 'Card payment failed. Please try again.'
    };
  }
};

const processUPIPayment = async (paymentData, amount) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const success = Math.random() > 0.05; // 95% success rate for UPI
  
  if (success) {
    return {
      success: true,
      transactionId: `UPI_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
  } else {
    return {
      success: false,
      error: 'UPI payment failed. Please check your UPI ID.'
    };
  }
};

const processWalletPayment = async (paymentData, amount) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const success = Math.random() > 0.08; // 92% success rate for wallet
  
  if (success) {
    return {
      success: true,
      transactionId: `WALLET_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };
  } else {
    return {
      success: false,
      error: 'Wallet payment failed. Insufficient balance or wallet error.'
    };
  }
};
