// ProductDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./productdetails.css";
// Static guest user data since auth is removed
const guestUser = {
  name: 'Guest',
  email: ''
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [recommendations, setRecommendations] = useState([]);
  const user = guestUser;

useEffect(() => {
  // Fetch product details
  fetch(`${API_BASE_URL}/api/products/${id}`)
    .then((res) => res.json())
    .then((resData) => {
      console.log("API Response:", resData);
      setProduct(resData.data);
      // Set default selections from specifications
      if (resData.data?.specifications?.size?.length > 0) {
        setSelectedSize(resData.data.specifications.size[0]);
      }
      if (resData.data?.specifications?.color?.length > 0) {
        setSelectedColor(resData.data.specifications.color[0]);
      }
    })
    .catch((err) => console.error(err));

  // Fetch recommendations
  fetch(`${API_BASE_URL}/api/products/featured`)
    .then((res) => res.json())
    .then((resData) => {
      if (resData.success) {
        // Filter out current product and limit to 4 recommendations
        const filtered = resData.data.filter(item => item._id !== id).slice(0, 4);
        setRecommendations(filtered);
      }
    })
    .catch((err) => console.error(err));
}, [id]);

  const resolveImage = (path) => {
    // If it's from src/assets → require it
    if (path && path.includes("src/assets")) {
      try {
        const assetPath = path.split("src/assets/")[1]; // e.g., "login.webp"
        return require(`../../assets/${assetPath}`);
      } catch (err) {
        console.error("Image not found:", path);
        return "https://via.placeholder.com/400x400?text=No+Image";
      }
    }
    // Return the path as-is for external URLs
    return path || "https://via.placeholder.com/400x400?text=No+Image";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product._id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Added to cart successfully!');
        console.log('Cart updated:', data.data);
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    if (!user) {
      alert('Please login to place an order');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/orders/buy-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product._id,
          quantity: quantity,
          size: selectedSize,
          color: selectedColor
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Order placed successfully! Order ID: ${data.data.order_id}`);
        console.log('Order created:', data.data);
        // Optionally redirect to order confirmation page
        // window.location.href = `/order-confirmation/${data.data.order_id}`;
      } else {
        alert(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleAddToWishlist = () => {
    // Add to wishlist logic here
    console.log('Added to wishlist:', product);
    alert('Added to wishlist successfully!');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };
  if (!product) {
    return <p className="loading">Loading product details...</p>;
  }

  const mockGalleryImages = [
    product.image_url,
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500"
  ];

  return (
    <div className="product-details-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/homepage">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
      </div>

      <div className="product-main">
        {/* Image Gallery */}
        <div className="product-image-section">
          <div className="main-image-container">
            <img
              src={resolveImage(mockGalleryImages[selectedImage])}
              alt={product.name}
              className="product-main-image"
            />
            <button 
              className="wishlist-btn"
              onClick={handleAddToWishlist}
              title="Add to Wishlist"
            >
              ♡
            </button>
          </div>
          
          <div className="image-gallery">
            {mockGalleryImages.map((img, index) => (
              <img
                key={index}
                src={resolveImage(img)}
                alt={`${product.name}-${index}`}
                className={`gallery-thumb ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.average_rating || 4.5)}
            </div>
            <span className="rating-text">
              ({product.review_count || 0} reviews)
            </span>
          </div>

          <div className="product-pricing">
            {product.sale_price ? (
              <>
                <span className="sale-price">{formatPrice(product.sale_price)}</span>
                <span className="original-price">{formatPrice(product.price)}</span>
                <span className="discount">
                  {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="current-price">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="product-description">{product.short_description || product.description}</p>

          {/* Size Selection */}
          <div className="product-options">
            <div className="size-selection">
              <h4>Size</h4>
              <div className="size-options">
                {product.specifications?.size?.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="color-selection">
              <h4>Color</h4>
              <div className="color-options">
                {product.specifications?.color?.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  >
                    {selectedColor === color && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="quantity-selection">
              <h4>Quantity</h4>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="stock-info">
            {product.stock_quantity > 0 ? (
              <span className="in-stock">
                ✅ In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="out-of-stock">❌ Out of Stock</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
            >
              Add to Cart
            </button>
            <button 
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock_quantity === 0}
            >
              Buy Now
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="delivery-item">
              <span className="icon">🚚</span>
              <span>Free delivery on orders above ₹999</span>
            </div>
            <div className="delivery-item">
              <span className="icon">↩️</span>
              <span>7 days return policy</span>
            </div>
            <div className="delivery-item">
              <span className="icon">🔒</span>
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-details-tabs">
        <div className="tab-headers">
          <button 
            className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-header ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.review_count || 0})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-content">
              <p>{product.description}</p>
              <ul>
                <li>Premium quality cotton fabric</li>
                <li>Comfortable fit for all-day wear</li>
                <li>Machine washable</li>
                <li>Available in multiple sizes and colors</li>
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="specifications-content">
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td>Material</td>
                    <td>100% Cotton</td>
                  </tr>
                  <tr>
                    <td>Fit</td>
                    <td>Regular Fit</td>
                  </tr>
                  <tr>
                    <td>Sleeve Type</td>
                    <td>Short Sleeve</td>
                  </tr>
                  <tr>
                    <td>Neck Type</td>
                    <td>Round Neck</td>
                  </tr>
                  <tr>
                    <td>Care Instructions</td>
                    <td>Machine wash cold, tumble dry low</td>
                  </tr>
                  <tr>
                    <td>Country of Origin</td>
                    <td>India</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-content">
              <div className="reviews-summary">
                <div className="rating-overview">
                  <span className="avg-rating">{product.average_rating || 4.5}</span>
                  <div className="stars">
                    {renderStars(product.average_rating || 4.5)}
                  </div>
                  <span className="total-reviews">Based on {product.review_count || 0} reviews</span>
                </div>
              </div>
              
              <div className="sample-reviews">
                <div className="review-item">
                  <div className="reviewer-info">
                    <span className="reviewer-name">Rahul S.</span>
                    <div className="review-rating">
                      {renderStars(5)}
                    </div>
                  </div>
                  <p className="review-text">
                    Excellent quality T-shirt! The fabric is soft and comfortable. 
                    Perfect fit and great value for money.
                  </p>
                  <span className="review-date">2 days ago</span>
                </div>
                
                <div className="review-item">
                  <div className="reviewer-info">
                    <span className="reviewer-name">Priya M.</span>
                    <div className="review-rating">
                      {renderStars(4)}
                    </div>
                  </div>
                  <p className="review-text">
                    Good quality and fast delivery. The color is exactly as shown in the picture.
                  </p>
                  <span className="review-date">1 week ago</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>You May Also Like</h2>
        <div className="recommendations-grid">
          {recommendations.map((item) => (
            <Link 
              key={item._id} 
              to={`/product/${item._id}`}
              className="recommendation-card"
            >
              <img 
                src={resolveImage(item.image_url)} 
                alt={item.name}
                className="recommendation-image"
              />
              <div className="recommendation-info">
                <h4 className="recommendation-name">{item.name}</h4>
                <div className="recommendation-rating">
                  {renderStars(item.average_rating || 4.5)}
                  <span>({item.review_count || 0})</span>
                </div>
                <div className="recommendation-price">
                  {item.sale_price ? (
                    <>
                      <span className="sale-price">{formatPrice(item.sale_price)}</span>
                      <span className="original-price">{formatPrice(item.price)}</span>
                    </>
                  ) : (
                    <span className="current-price">{formatPrice(item.price)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>

  );
}
