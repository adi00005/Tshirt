// src/models/Product.js
import mongoose from "mongoose";

const variationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Color", "Size"
  options: [{
    name: { type: String, required: true }, // e.g., "Red", "Blue", "S", "M"
    price_adjustment: { type: Number, default: 0 },
    sku_suffix: { type: String },
    image_url: { type: String }
  }]
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    // 1. Identification (Required)
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, unique: true, trim: true, sparse: true, index: true },
    sku: { type: String, unique: true, sparse: true, index: true },
    category_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      required: true,
      index: true 
    },

    // 2. Enhanced Descriptions
    short_description: { type: String, maxlength: 500 },
    description: { type: String },
    specifications: { type: mongoose.Schema.Types.Mixed },
    features: [String],
    care_instructions: String,

    // 3. Enhanced Pricing
    price: { type: Number, required: true, min: 0 },
    sale_price: { type: Number, min: 0 },
    cost_price: { type: Number, min: 0 },
    compare_at_price: { type: Number, min: 0 },
    currency: { type: String, default: "USD" },
    tax_class: { type: String, default: "standard" },

    // 4. Enhanced Inventory
    stock_quantity: { type: Number, required: true, default: 0 },
    stock_status: { 
      type: String, 
      enum: ["in_stock", "out_of_stock", "preorder", "backorder"], 
      default: "in_stock" 
    },
    track_inventory: { type: Boolean, default: true },
    allow_backorders: { type: Boolean, default: false },
    low_stock_threshold: { type: Number, default: 5 },
    
    // 5. Product Variations
    has_variations: { type: Boolean, default: false },
    variations: [variationSchema],
    default_variation: { type: mongoose.Schema.Types.Mixed },
    
    // 6. T-Shirt Specific
    sizes: { 
      type: [String], 
      enum: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"],
      default: ["S", "M", "L", "XL"]
    },
    colors: { 
      type: [String],
      default: []
    },
    material: { 
      type: String, 
      enum: [
        "100% Cotton", 
        "Polyester Blend", 
        "Organic Cotton", 
        "100% Organic Cotton",
        "Bamboo", 
        "Hemp",
        "Linen",
        "Recycled Fabric"
      ],
      default: "100% Cotton" 
    },
    fit: { 
      type: String, 
      enum: ["Regular", "Slim", "Slim Fit", "Classic", "Oversized", "Fitted", "Relaxed"], 
      default: "Regular" 
    },
    sleeve_length: {
      type: String,
      enum: ["Short Sleeve", "Long Sleeve", "Sleeveless", "3/4 Sleeve", "Raglan Sleeve"],
      default: "Short Sleeve"
    },
    neck_style: {
      type: String,
      enum: ["Crew Neck", "V-Neck", "Polo", "Henley", "Turtle Neck", "Scoop Neck"],
      default: "Crew Neck"
    },
    
    // 7. Physical Attributes
    weight: { type: Number, min: 0 },  // in grams
    dimensions: {
      length: { type: Number, min: 0 }, // in cm
      width: { type: Number, min: 0 },  // in cm
      height: { type: Number, min: 0 }   // in cm
    },
    package_includes: [String],

    // 8. Enhanced Media
    image_url: { type: String, required: true },
    gallery_images: { type: [String], default: [] },
    video_url: { type: String },
    video_thumbnail: { type: String },
    lookbook_images: { type: [String] },
    size_chart: { type: String },

    // 9. SEO & Marketing
    meta_title: { type: String, maxlength: 70 },
    meta_description: { type: String, maxlength: 320 },
    meta_keywords: [String],
    canonical_url: { type: String },
    og_tags: {
      title: String,
      description: String,
      image: String
    },
    tags: { type: [String], index: true },
    is_featured: { type: Boolean, default: false, index: true },
    is_bestseller: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    is_on_sale: { type: Boolean, default: false },
    is_preorder: { type: Boolean, default: false },
    preorder_release_date: { type: Date },

    // 10. Vendor & Brand
    brand: { type: String, index: true },
    vendor_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Vendor",
      index: true 
    },
    collection_name: { type: String },
    manufacturer: { type: String },
    country_of_origin: { type: String },

    // 11. Enhanced Ratings & Reviews
    average_rating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    review_count: { 
      type: Number, 
      default: 0 
    },
    rating_count: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },

    // 12. Enhanced Shipping
    shipping_class: { type: String },
    shipping_weight: { type: Number, min: 0 }, // in kg
    shipping_dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    free_shipping: { type: Boolean, default: false },
    delivery_time: { type: String },
    estimated_delivery: {
      min_days: { type: Number, min: 0 },
      max_days: { type: Number, min: 0 }
    },

    // 13. Related Products
    related_products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    cross_sell_products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    up_sell_products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // 14. Status & Timestamps
    status: { 
      type: String, 
      enum: ["active", "inactive", "draft", "archived"], 
      default: "draft",
      index: true 
    },
    published_at: { type: Date },
    
    // 15. Custom Fields
    custom_fields: { type: Map, of: mongoose.Schema.Types.Mixed },
    
    // 16. Analytics
    view_count: { type: Number, default: 0 },
    purchase_count: { type: Number, default: 0 },
    wishlist_count: { type: Number, default: 0 },
    
    // 17. Design & Customization
    is_customizable: { type: Boolean, default: false },
    design_templates: [{
      name: String,
      preview_url: String,
      design_data: { type: mongoose.Schema.Types.Mixed }
    }],
    
    // 18. Bundle & Kits
    is_bundle: { type: Boolean, default: false },
    bundle_items: [{
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, min: 1, default: 1 },
      discount: { type: Number, min: 0, max: 100, default: 0 }
    }],
    
    // 19. Subscription & Membership
    is_subscription: { type: Boolean, default: false },
    subscription_options: {
      frequency: {
        type: String,
        enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']
      },
      discount_percentage: { type: Number, min: 0, max: 100 },
      min_subscription_weeks: { type: Number, min: 1 }
    },
    
    // 20. Digital Products
    is_digital: { type: Boolean, default: false },
    digital_downloads: [{
      name: String,
      file_url: String,
      file_size: Number,
      file_type: String,
      download_limit: { type: Number, default: 0 },
      expiry_days: { type: Number, default: 0 }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1, average_rating: -1 });
productSchema.index({ 'variations.options.name': 1 });

// Virtual for sale discount percentage
productSchema.virtual('discount_percentage').get(function() {
  if (this.sale_price && this.price > 0) {
    return Math.round(((this.price - this.sale_price) / this.price) * 100);
  }
  return 0;
});

// Update stock status based on quantity
productSchema.pre('save', function(next) {
  if (this.stock_quantity <= 0) {
    this.stock_status = 'out_of_stock';
  } else if (this.stock_quantity <= this.low_stock_threshold) {
    this.stock_status = 'low_stock';
  } else {
    this.stock_status = 'in_stock';
  }
  
  // Set is_on_sale based on sale price
  this.is_on_sale = !!(this.sale_price && this.sale_price < this.price);
  
  next();
});

// Update average rating
productSchema.methods.updateAverageRating = async function() {
  const result = await this.model('Review').aggregate([
    { $match: { product_id: this._id } },
    {
      $group: {
        _id: '$product_id',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    this.average_rating = result[0].averageRating;
    this.review_count = result[0].numberOfReviews;
  } else {
    this.average_rating = 0;
    this.review_count = 0;
  }

  return this.save();
};

export default mongoose.model("Product", productSchema);
