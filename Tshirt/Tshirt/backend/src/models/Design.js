import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  designData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  // High-resolution preview for better quality display
  previewImage: {
    type: String,
    default: ''
  },
  // SVG version for vector-based clipart
  svgData: {
    type: String,
    default: ''
  },
  // For clipart
  clipart: {
    type: Boolean,
    default: false,
    index: true
  },
  // For templates
  template: {
    type: Boolean,
    default: false,
    index: true
  },
  category: {
    type: String,
    enum: ['tshirt', 'clipart', 'template', 'graphic', 'text', 'logo'],
    default: 'tshirt',
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  // For clipart - base price if this is a premium clipart
  basePrice: {
    type: Number,
    default: 0,
    min: 0
  },
  // For tracking usage and popularity
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // For versioning designs
  version: {
    type: Number,
    default: 1
  },
  parentDesign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Design'
  },
  // For performance optimization
  complexity: {
    type: Number,
    default: 1, // 1-10 scale, 1 being simplest
    min: 1,
    max: 10
  },
  // For search and filtering
  attributes: {
    colors: [String],
    styles: [String],
    themes: [String]
  },
  // For soft delete
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // Additional metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // For analytics
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
designSchema.index({ name: 'text', description: 'text', tags: 'text' });
designSchema.index({ 'attributes.colors': 1 });
designSchema.index({ 'attributes.styles': 1 });
designSchema.index({ 'attributes.themes': 1 });

// Virtual for like count (redundant but efficient for sorting)
designSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Pre-save hook to update likesCount
designSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  next();
});

// Static method to get clipart with filters and pagination
designSchema.statics.getClipart = async function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 24,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search = ''
  } = options;

  const skip = (page - 1) * limit;
  
  const query = {
    clipart: true,
    isPublic: true,
    isActive: true,
    ...filters
  };

  if (search) {
    query.$text = { $search: search };
  }

  const [clipart, total] = await Promise.all([
    this.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    clipart,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
};

// Static method to get user designs
designSchema.statics.getUserDesigns = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 12,
    clipart = false,
    template = false,
    search = ''
  } = options;

  const skip = (page - 1) * limit;
  
  const query = {
    createdBy: userId,
    isActive: true
  };

  if (clipart) query.clipart = true;
  if (template) query.template = true;
  
  if (search) {
    query.$text = { $search: search };
  }

  const [designs, total] = await Promise.all([
    this.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username avatar')
      .lean(),
    this.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    designs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
};

// Method to increment usage count
designSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Method to create a new version of a design
designSchema.methods.createVersion = async function(designData, userId) {
  const newDesign = new this.constructor({
    ...this.toObject(),
    _id: undefined, // Let MongoDB generate a new _id
    parentDesign: this._id,
    version: this.version + 1,
    designData,
    createdBy: userId,
    createdAt: undefined,
    updatedAt: undefined
  });
  
  return newDesign.save();
};

// Text index for search
designSchema.index(
  { name: 'text', description: 'text', tags: 'text', 'attributes.styles': 'text' },
  { weights: { name: 10, tags: 5, description: 3, 'attributes.styles': 2 } }
);

const Design = mongoose.model('Design', designSchema);

export default Design;
