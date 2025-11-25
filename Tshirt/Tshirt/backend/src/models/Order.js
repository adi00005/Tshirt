import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  customization: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  designPreview: {
    type: String,
    default: null
  }
});

const shippingInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  }
});

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['card', 'upi', 'wallet', 'cod']
  },
  cardLast4: {
    type: String,
    default: null
  },
  upiId: {
    type: String,
    default: null
  },
  walletType: {
    type: String,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: {
    type: Date,
    default: null
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingInfo: {
    type: shippingInfoSchema,
    required: true
  },
  paymentInfo: {
    type: paymentInfoSchema,
    required: true
  },
  orderNotes: {
    type: String,
    default: ''
  },
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  codCharges: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  coupon: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: String
  }],
  trackingNumber: {
    type: String,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Generate order ID
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderId = `ORD-${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Calculate estimated delivery date
orderSchema.pre('save', function(next) {
  if (!this.estimatedDelivery && this.status === 'confirmed') {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from confirmation
    this.estimatedDelivery = deliveryDate;
  }
  next();
});

// Add COD charges if payment method is COD
orderSchema.pre('save', function(next) {
  if (this.paymentInfo.method === 'cod' && this.codCharges === 0) {
    this.codCharges = 50;
    this.total += 50;
  }
  next();
});

// Instance methods
orderSchema.methods.updateStatus = function(newStatus, changedBy, notes = null) {
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus, changedBy, notes });
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
    this.paymentInfo.paymentStatus = 'completed';
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  return this.save();
};

orderSchema.methods.updatePaymentStatus = function(status, transactionId = null) {
  this.paymentInfo.paymentStatus = status;
  if (transactionId) {
    this.paymentInfo.transactionId = transactionId;
  }
  if (status === 'completed') {
    this.paymentInfo.paidAt = new Date();
    if (this.status === 'pending') {
      this.status = 'confirmed';
    }
  }
  return this.save();
};

// Static methods
orderSchema.statics.findByUserId = function(userId, options = {}) {
  const { page = 1, limit = 10, status = null } = options;
  const query = { userId };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('userId', 'username email');
};

orderSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId }).populate('userId', 'username email');
};

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentInfo.paymentStatus': 1 });

export default mongoose.model('Order', orderSchema);