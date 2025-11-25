// src/pages/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css';
// Static guest user data since auth is removed
const guestUser = {
  name: 'Guest',
  email: ''
};

const Wishlist = () => {
  const user = guestUser;
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterBy, setFilterBy] = useState('all');

  // Mock wishlist data - replace with API call
  const mockWishlistItems = [
    {
      id: 'w1',
      productId: 'p1',
      name: 'Athletic Performance Tee',
      brand: 'ActiveFit',
      price: 4149,
      originalPrice: 4565,
      discount: 9,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      colors: ['Black', 'White', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.5,
      reviews: 128,
      inStock: true,
      stockCount: 15,
      dateAdded: '2024-08-10T10:30:00Z',
      category: 'Athletic',
      isOnSale: true
    },
    {
      id: 'w2',
      productId: 'p2',
      name: 'Classic White T-Shirt',
      brand: 'EcoWear',
      price: 2074,
      originalPrice: 2074,
      discount: 0,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      colors: ['White', 'Cream'],
      sizes: ['XS', 'S', 'M', 'L'],
      rating: 4.2,
      reviews: 89,
      inStock: true,
      stockCount: 8,
      dateAdded: '2024-08-08T15:45:00Z',
      category: 'Casual',
      isOnSale: false
    },
    {
      id: 'w3',
      productId: 'p3',
      name: 'Striped Long Sleeve Tee',
      brand: 'ComfortWear',
      price: 2904,
      originalPrice: 3320,
      discount: 13,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
      colors: ['Navy/White', 'Black/Gray'],
      sizes: ['M', 'L', 'XL'],
      rating: 4.7,
      reviews: 156,
      inStock: false,
      stockCount: 0,
      dateAdded: '2024-08-05T12:20:00Z',
      category: 'Casual',
      isOnSale: true
    },
    {
      id: 'w4',
      productId: 'p4',
      name: 'Navy Blue Polo Shirt',
      brand: 'ClassicFit',
      price: 3319,
      originalPrice: 3319,
      discount: 0,
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500',
      colors: ['Navy', 'Black', 'White'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      rating: 4.3,
      reviews: 94,
      inStock: true,
      stockCount: 22,
      dateAdded: '2024-08-03T09:15:00Z',
      category: 'Formal',
      isOnSale: false
    },
    {
      id: 'w5',
      productId: 'p5',
      name: 'Vintage Graphic Tee',
      brand: 'RetroStyle',
      price: 2490,
      originalPrice: 2905,
      discount: 14,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=500',
      colors: ['Black', 'Gray', 'White'],
      sizes: ['S', 'M', 'L'],
      rating: 4.6,
      reviews: 203,
      inStock: true,
      stockCount: 5,
      dateAdded: '2024-08-01T14:30:00Z',
      category: 'Graphic',
      isOnSale: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWishlistItems(mockWishlistItems);
      setLoading(false);
    }, 1000);
  }, [mockWishlistItems]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const removeFromWishlist = (itemId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  };

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    const availableItems = filteredAndSortedItems.filter(item => item.inStock);
    setSelectedItems(availableItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const removeSelectedItems = () => {
    setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const moveSelectedToCart = () => {
    // Implementation for moving to cart
    console.log('Moving to cart:', selectedItems);
    // After successful move, remove from wishlist
    removeSelectedItems();
  };

  const sortItems = (items) => {
    switch (sortBy) {
      case 'dateAdded':
        return [...items].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      case 'priceLowHigh':
        return [...items].sort((a, b) => a.price - b.price);
      case 'priceHighLow':
        return [...items].sort((a, b) => b.price - a.price);
      case 'name':
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return [...items].sort((a, b) => b.rating - a.rating);
      default:
        return items;
    }
  };

  const filterItems = (items) => {
    switch (filterBy) {
      case 'inStock':
        return items.filter(item => item.inStock);
      case 'outOfStock':
        return items.filter(item => !item.inStock);
      case 'onSale':
        return items.filter(item => item.isOnSale);
      case 'all':
      default:
        return items;
    }
  };

  const filteredAndSortedItems = sortItems(filterItems(wishlistItems));

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

  const renderWishlistItem = (item) => (
    <div key={item.id} className={`wishlist-item ${!item.inStock ? 'out-of-stock' : ''}`}>
      <div className="item-checkbox">
        <input
          type="checkbox"
          checked={selectedItems.includes(item.id)}
          onChange={() => toggleSelectItem(item.id)}
          disabled={!item.inStock}
        />
      </div>

      <div className="item-image-container">
        <img src={item.image} alt={item.name} className="item-image" />
        {item.isOnSale && <div className="sale-badge">Sale</div>}
        {!item.inStock && <div className="stock-overlay">Out of Stock</div>}
      </div>

      <div className="item-details">
        <div className="item-header">
          <h3 className="item-name">{item.name}</h3>
          <button 
            onClick={() => removeFromWishlist(item.id)}
            className="remove-btn"
            title="Remove from wishlist"
          >
            ×
          </button>
        </div>

        <p className="item-brand">{item.brand}</p>
        
        <div className="item-rating">
          <div className="stars">
            {renderStars(item.rating)}
          </div>
          <span className="rating-text">({item.reviews} reviews)</span>
        </div>

        <div className="item-options">
          <div className="colors">
            <span className="label">Colors:</span>
            <div className="color-list">
              {item.colors.map((color, index) => (
                <span key={index} className="color-option">{color}</span>
              ))}
            </div>
          </div>
          
          <div className="sizes">
            <span className="label">Sizes:</span>
            <div className="size-list">
              {item.sizes.map((size, index) => (
                <span key={index} className="size-option">{size}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="item-pricing">
          <div className="price-container">
            <span className="current-price">{formatPrice(item.price)}</span>
            {item.discount > 0 && (
              <>
                <span className="original-price">{formatPrice(item.originalPrice)}</span>
                <span className="discount">({item.discount}% off)</span>
              </>
            )}
          </div>
        </div>

        <div className="item-meta">
          <span className="date-added">Added on {formatDate(item.dateAdded)}</span>
          {item.inStock && (
            <span className="stock-info">
              {item.stockCount < 10 ? `Only ${item.stockCount} left` : 'In Stock'}
            </span>
          )}
        </div>

        <div className="item-actions">
          {item.inStock ? (
            <>
              <button className="btn-primary">Add to Cart</button>
              <Link to={`/product/${item.productId}`} className="btn-secondary">
                View Details
              </Link>
            </>
          ) : (
            <>
              <button className="btn-secondary" disabled>Notify When Available</button>
              <Link to={`/product/${item.productId}`} className="btn-secondary">
                View Details
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p>Save your favorite T-shirts for later</p>
      </div>

      {wishlistItems.length > 0 && (
        <div className="wishlist-controls">
          <div className="selection-controls">
            <button onClick={selectAllItems} className="control-btn">
              Select All Available
            </button>
            <button onClick={clearSelection} className="control-btn">
              Clear Selection
            </button>
            {selectedItems.length > 0 && (
              <>
                <button onClick={moveSelectedToCart} className="btn-primary">
                  Move to Cart ({selectedItems.length})
                </button>
                <button onClick={removeSelectedItems} className="btn-danger">
                  Remove Selected
                </button>
              </>
            )}
          </div>

          <div className="filter-sort-controls">
            <div className="filter-group">
              <label>Filter:</label>
              <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                <option value="all">All Items</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
                <option value="onSale">On Sale</option>
              </select>
            </div>

            <div className="sort-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="dateAdded">Date Added</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="wishlist-stats">
        <div className="stat-item">
          <span className="stat-number">{wishlistItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{wishlistItems.filter(item => item.inStock).length}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{wishlistItems.filter(item => item.isOnSale).length}</span>
          <span className="stat-label">On Sale</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {formatPrice(wishlistItems.reduce((total, item) => total + item.price, 0))}
          </span>
          <span className="stat-label">Total Value</span>
        </div>
      </div>

      <div className="wishlist-items">
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map(renderWishlistItem)
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Start adding T-shirts you love to your wishlist</p>
            <Link to="/homepage" className="btn-primary">
              Browse T-Shirts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
