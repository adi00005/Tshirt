import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ user_id: userId, status: "active" })
      .populate('items.product_id', 'name price image_url');
    
    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
      await cart.save();
    }
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart"
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity, size, color } = req.body;

    if (!product_id || !quantity || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity, size, and color are required"
      });
    }

    // Get product details
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user_id: userId, status: "active" });
    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.product_id.toString() === product_id &&
        item.size === size &&
        item.color === color
    );

    const price = product.sale_price || product.price;

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      cart.items.push({
        product_id,
        name: product.name,
        price,
        quantity: parseInt(quantity),
        size,
        color,
        image_url: product.image_url
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: "Item added to cart successfully",
      data: cart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart"
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, size, color, quantity } = req.body;

    if (!product_id || !size || !color || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID, size, color, and quantity are required"
      });
    }

    const cart = await Cart.findOne({ user_id: userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const itemIndex = cart.items.findIndex(
      item => 
        item.product_id.toString() === product_id &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    await cart.save();

    res.json({
      success: true,
      message: "Cart updated successfully",
      data: cart
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart"
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, size, color } = req.body;

    const cart = await Cart.findOne({ user_id: userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items = cart.items.filter(
      item => !(
        item.product_id.toString() === product_id &&
        item.size === size &&
        item.color === color
      )
    );

    await cart.save();

    res.json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart"
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ user_id: userId, status: "active" });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart"
    });
  }
};
