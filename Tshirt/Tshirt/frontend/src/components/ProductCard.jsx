// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  const PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="28" font-family="Arial, Helvetica, sans-serif">T-Shirt</text>
      </svg>`
    );

  // Prefer env, fallback to localhost
  const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL)
    || 'http://localhost:4999';

  const resolveImageUrl = (src) => {
    console.log('Original src:', src);
    
    // If no source, return placeholder
    if (!src) {
      console.log('No source provided, using placeholder');
      return PLACEHOLDER;
    }
    
    // If source is an array, use first item
    if (Array.isArray(src)) {
      console.log('Source is an array, using first item');
      src = src[0];
    }
    
    // If not a string, return placeholder
    if (typeof src !== 'string') {
      console.log('Source is not a string, using placeholder');
      return PLACEHOLDER;
    }

    // If it's already a full URL or data URI, return as-is
    if (src.startsWith('http') || src.startsWith('data:')) {
      console.log('Source is already a full URL or data URI:', src);
      return src;
    }

    console.log('Processing relative path:', src);
    
    // Normalize path separators and clean up the path
    let path = src
      .replace(/\\/g, '/')  // Convert backslashes to forward slashes
      .replace(/^[.\/]+/, '') // Remove leading ./ or /
      .replace(/^\/?(?:public|api)?\/?/i, ''); // Remove common leading path parts

    console.log('After initial cleanup:', path);

    // Ensure the path starts with 'uploads/designs/'
    if (!path.startsWith('uploads/')) {
      path = `uploads/designs/${path}`;
      console.log('Added uploads/designs/ prefix:', path);
    }
    
    // Remove any duplicate slashes
    path = path.replace(/([^:]\/)\/+/g, '$1');
    
    // Combine with API base URL and ensure proper formatting
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    const finalUrl = `${baseUrl}/${cleanPath}`;
    console.log('Final URL:', finalUrl);
    
    return finalUrl;
  };

  // Prefer image_url from product table
  const rawImageSrc =
    product.image_url ||
    product.image ||
    product.imageUrl ||
    (product.gallery_images && product.gallery_images[0]) ||
    PLACEHOLDER;

  const imageSrc = resolveImageUrl(rawImageSrc);

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-link">
        <div className="product-image-container">
          <img 
            src={imageSrc} 
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
          {product.is_featured && (
            <span className="featured-badge">Featured</span>
          )}
          {typeof product.stock_quantity === 'number' && product.stock_quantity < 10 && (
            <span className="low-stock-badge">Low Stock</span>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-brand">{product.brand}</p>
          
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.average_rating)}
            </div>
            <span className="review-count">({product.review_count})</span>
          </div>

          <div className="product-colors">
            {product.colors && product.colors.slice(0, 3).map((color, index) => (
              <span 
                key={index} 
                className="color-dot" 
                style={{ backgroundColor: String(color).toLowerCase() }}
                title={color}
              ></span>
            ))}
            {product.colors && product.colors.length > 3 && (
              <span className="more-colors">+{product.colors.length - 3}</span>
            )}
          </div>

          <div className="product-pricing">
            {product.sale_price ? (
              <>
                <span className="sale-price">{formatPrice(product.sale_price)}</span>
                <span className="original-price">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="price">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="product-sizes">
            <span className="sizes-label">Sizes: </span>
            {product.sizes && product.sizes.slice(0, 4).map((size, index) => (
              <span key={index} className="size-tag">{size}</span>
            ))}
            {product.sizes && product.sizes.length > 4 && (
              <span className="more-sizes">...</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
