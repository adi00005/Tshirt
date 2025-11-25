import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 50
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
    },
    image: {
      type: String,
      default: ''
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    order: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 100
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  justOne: false
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .replace(/\s+/g, '-') // replace spaces with -
      .replace(/--+/g, '-') // replace multiple - with single
      .trim();
  }
  next();
});

// Prevent deletion if category has products
categorySchema.pre('remove', async function(next) {
  const Product = mongoose.model('Product');
  const productsCount = await Product.countDocuments({ category: this._id });
  
  if (productsCount > 0) {
    throw new Error(`Cannot delete: ${productsCount} product(s) are using this category`);
  }
  
  // Remove all subcategories
  await this.model('Category').deleteMany({ parent: this._id });
  
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
