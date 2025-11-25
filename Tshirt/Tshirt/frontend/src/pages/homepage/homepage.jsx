import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./homepage-dark.css";
import ProductCard from "../../components/ProductCard";

const Homepage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const carouselRef = useRef(null);
  
  // Mouse drag variables for carousel
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    // Use mock data directly to prevent network errors
    const mockProducts = [
      {
        id: 1,
        name: "Classic T-Shirt",
        price: 19.99,
        image: "https://picsum.photos/seed/tshirt1/400/500.jpg",
        category: "Men",
        description: "Comfortable classic fit t-shirt"
      },
      {
        id: 2,
        name: "Graphic Tee",
        price: 24.99,
        image: "https://picsum.photos/seed/tshirt2/400/500.jpg",
        category: "Women",
        description: "Stylish graphic print t-shirt"
      },
      {
        id: 3,
        name: "Premium Cotton Tee",
        price: 29.99,
        image: "https://picsum.photos/seed/tshirt3/400/500.jpg",
        category: "Men",
        description: "High-quality cotton t-shirt"
      },
      {
        id: 4,
        name: "Vintage Style Tee",
        price: 22.99,
        image: "https://picsum.photos/seed/tshirt4/400/500.jpg",
        category: "Women",
        description: "Retro-inspired vintage t-shirt"
      }
    ];
    
    setFeaturedProducts(mockProducts);
    setLoading(false);
  }, []);


  const handleMouseDown = (e) => {
    setIsDown(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => { setIsDown(false); };
  const handleMouseUp = () => { setIsDown(false); };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 3; // scroll-fast
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleCategoryClick = (category) => {
    // Filter products by category or navigate to shop page
    navigate(`/shop?category=${category.toLowerCase()}`);
  };

  const handleDealCategoryClick = (category) => {
    // Filter products by deal category
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="bg-white">

      {/* Modern Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-inner">
            {/* Logo */}
            <div className="navbar-logo">StyleThread</div>

            {/* Nav Links */}
            <div className="navbar-links">
              <button onClick={() => handleNavigation('/shop')} className="navbar-link">Shop</button>
              <button onClick={() => handleNavigation('/categories')} className="navbar-link">Categories</button>
              <button onClick={handleCartClick} className="navbar-link">Cart</button>
            </div>

            {/* Cart & Search (Right) */}
            <div className="navbar-actions">
              <form onSubmit={handleSearch} className="navbar-search">
                <input
                  type="text"
                  placeholder="Search for T-shirts..."
                  className="navbar-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-icon-btn">
                  <svg
                    className="search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M16.65 9.5A7.15 7.15 0 1110.5 2.35a7.15 7.15 0 016.15 7.15z"
                    />
                  </svg>
                </button>
              </form>
              
              <button onClick={handleCartClick} className="navbar-cart">
                🛒
                <span className="navbar-cart-badge">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Designs You'll Love. Quality You Can Feel.</h1>
          <p className="hero-subtitle">
            Discover premium T-shirts crafted with passion and designed for comfort. 
            From casual basics to statement pieces, find your perfect style.
          </p>
          <button onClick={() => handleNavigation('/shop')} className="hero-cta">
            Shop Now
          </button>
        </div>
      </section>







      {/* Hero Banner */}
      {/* Hero Banner */}
    <div className="weekly-deals-container">
        <h2 className="section-title">Weekly Best Deals</h2>
        <div
          className="product-carousel"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {loading ? (
            <p>Loading featured products...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p>No featured products available.</p>
          )}
        </div>
      </div>
{/* Weekly Best Deals */}


{/* Categories */}







      {/* New Arrivals Section */}
      <section className="bg-gray-50 py-12 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
            <p className="text-gray-600">Fresh designs just landed in our collection</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.slice(6, 10).map((product) => (
              <ProductCard key={`new-${product._id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="bg-white py-12 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Sports & Athletic", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", count: "25+ Items" },
              { name: "Casual Wear", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", count: "40+ Items" },
              { name: "Vintage Collection", image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400", count: "15+ Items" },
              { name: "Premium Cotton", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400", count: "30+ Items" }
            ].map((category, idx) => (
              <div key={idx} className="category-showcase-card" onClick={() => handleCategoryClick(category.name.split(' ')[0].toLowerCase())}>
                <img src={category.image} alt={category.name} className="category-showcase-image" />
                <div className="category-showcase-overlay">
                  <h3 className="category-showcase-title">{category.name}</h3>
                  <p className="category-showcase-count">{category.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-12 w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Best Sellers</h2>
            <p className="text-gray-600">Most loved T-shirts by our customers</p>
          </div>
          <div className="product-carousel">
            {featuredProducts.filter(p => p.average_rating >= 4.5).map((product) => (
              <ProductCard key={`bestseller-${product._id}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="flash-sale-banner">
        <div className="flash-sale-content">
          <h2 className="flash-sale-title">🔥 Flash Sale Alert!</h2>
          <p className="flash-sale-subtitle">Up to 50% off on selected T-shirts - Limited time only!</p>
          <div className="flash-sale-timer">
            <div className="flash-timer-box">
              <span className="flash-timer-number">02</span>
              <div className="flash-timer-label">HOURS</div>
            </div>
            <div className="flash-timer-box">
              <span className="flash-timer-number">35</span>
              <div className="flash-timer-label">MINS</div>
            </div>
            <div className="flash-timer-box">
              <span className="flash-timer-number">40</span>
              <div className="flash-timer-label">SECS</div>
            </div>
          </div>
          <button 
            onClick={() => handleNavigation('/shop?category=sale')}
            className="flash-sale-cta"
          >
            Shop Sale Items
          </button>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="reviews-section">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="section-title text-center mb-8">What Our Customers Say</h2>
          <div className="reviews-grid">
            {[
              {
                name: "Priya Sharma",
                rating: 5,
                review: "Amazing quality T-shirts! The fabric is so soft and comfortable. Will definitely order again.",
                product: "Premium Cotton Tee"
              },
              {
                name: "Rahul Kumar",
                rating: 5,
                review: "Fast delivery and excellent customer service. The athletic tee is perfect for my workouts.",
                product: "Athletic Performance Tee"
              },
              {
                name: "Sneha Patel",
                rating: 4,
                review: "Love the vintage collection! Unique designs and great fit. Highly recommended.",
                product: "Vintage Graphic Tee"
              }
            ].map((review, idx) => (
              <div key={idx} className="customer-review-card">
                <div className="customer-info">
                  <div className="customer-avatar">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="customer-details">
                    <h4>{review.name}</h4>
                    <div className="customer-rating">
                      {'★'.repeat(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="review-text">"{review.review}"</p>
                <p className="review-product">Purchased: {review.product}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t text-sm text-gray-500">
        &copy; {new Date().getFullYear()} T-Shirt Store. All rights reserved.
      </footer>
    </div>
  );
};

export default Homepage;
