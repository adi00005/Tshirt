import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
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
  image_url: {
    type: String,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [cartItemSchema],
  total_amount: {
    type: Number,
    required: true,
    default: 0
  },
  total_items: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["active", "abandoned", "converted"],
    default: "active"
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.total_items = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.total_amount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
