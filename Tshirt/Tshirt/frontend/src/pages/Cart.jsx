import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    applyCoupon,
    removeCoupon,
    coupon,
    getSubtotal,
    getDiscount,
    getTotal,
    getItemCount
  } = useCart();
  
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Mock coupon codes for demo
  const validCoupons = {
    'SAVE10': { type: 'percentage', value: 10, description: '10% off' },
    'FLAT50': { type: 'fixed', value: 50, description: '₹50 off' },
    'WELCOME20': { type: 'percentage', value: 20, description: '20% off' }
  };

  const handleQuantityChange = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(cartId, newQuantity);
  };

  const handleRemoveItem = (cartId) => {
    removeFromCart(cartId);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    // Simulate API call
    setTimeout(() => {
      const validCoupon = validCoupons[couponCode.toUpperCase()];
      if (validCoupon) {
        applyCoupon({
          code: couponCode.toUpperCase(),
          ...validCoupon
        });
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError('Invalid coupon code');
      }
      setIsApplyingCoupon(false);
    }, 1000);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponError('');
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="empty-cart-icon">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2>Your Cart is Empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <div className="cart-hero-copy">
            <p className="eyebrow">Minimal tech · Luxe fashion</p>
            <h1>Curate your drop</h1>
            <p>Review silhouettes, tweak quantities, and apply studio perks before heading to checkout.</p>
          </div>
          <div className="cart-pillars">
            <div>
              <span className="stat">{getItemCount()}</span>
              <small>{getItemCount() === 1 ? 'item' : 'items'}</small>
            </div>
            <div>
              <span className="stat">₹{getSubtotal().toLocaleString()}</span>
              <small>Subtotal</small>
            </div>
            <div>
              <span className="stat gradient">72h</span>
              <small>Priority ship</small>
            </div>
          </div>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-items-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Price</span>
              <span>Total</span>
              <span></span>
            </div>

            {items.map((item) => (
              <div key={item.cartId} className="cart-item">
                <div className="item-details">
                  <div className="item-image">
                    {item.designPreview ? (
                      <img src={item.designPreview} alt={item.name} />
                    ) : (
                      <div className="placeholder-image">
                        <span>T-Shirt</span>
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <h3>{item.name || 'Custom T-Shirt'}</h3>
                    <div className="item-attributes">
                      <span className="size">Size: {item.size}</span>
                      <span className="color">
                        Color: 
                        <span 
                          className="color-swatch" 
                          style={{ backgroundColor: item.color }}
                        ></span>
                      </span>
                    </div>
                    {item.customization && (
                      <div className="customization-details">
                        <small>Custom Design</small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="item-price">
                  ₹{item.price.toLocaleString()}
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveItem(item.cartId)}
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}

            <div className="cart-actions">
              <button className="continue-shopping" onClick={handleContinueShopping}>
                ← Continue shopping
              </button>
              <div className="action-chips">
                <button className="chip">Price drop alert</button>
                <button className="chip">Featured only</button>
              </div>
              <button className="clear-cart" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="coupon-section">
                <h4>Coupon Code</h4>
                {coupon ? (
                  <div className="applied-coupon">
                    <div className="coupon-info">
                      <span className="coupon-code">{coupon.code}</span>
                      <span className="coupon-desc">{coupon.description}</span>
                    </div>
                    <button className="remove-coupon" onClick={handleRemoveCoupon}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button 
                        className="apply-btn"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <div className="coupon-error">{couponError}</div>}
                    <div className="coupon-suggestions">
                      <small>Try: SAVE10, FLAT50, WELCOME20</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toLocaleString()}</span>
                </div>
                
                {getDiscount() > 0 && (
                  <div className="price-row discount">
                    <span>Discount ({coupon.code})</span>
                    <span>-₹{getDiscount().toLocaleString()}</span>
                  </div>
                )}
                
                <div className="price-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                
                <div className="price-row total">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString()}</span>
                </div>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <div className="security-badges">
                <div className="badge">
                  <span>🔒</span>
                  <small>Secure Checkout</small>
                </div>
                <div className="badge">
                  <span>📦</span>
                  <small>Free Shipping</small>
                </div>
                <div className="badge">
                  <span>↩️</span>
                  <small>Easy Returns</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
