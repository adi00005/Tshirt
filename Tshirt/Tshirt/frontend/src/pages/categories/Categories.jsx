import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { FiChevronRight } from 'react-icons/fi';
import './Categories.css';

const colorStories = [
  {
    title: "Sunset Fade",
    accent: "#ff9a8b",
    description: "Warm ombré dyes with metallic puff prints",
    colors: ["#ff9a8b", "#fcb69f", "#f6d365"]
  },
  {
    title: "Luxe Minimal",
    accent: "#5d5fef",
    description: "Matte blacks, tonal typography, subtle emboss",
    colors: ["#111111", "#5d5fef", "#dcdcdc"]
  },
  {
    title: "Neon Pulse",
    accent: "#12c2e9",
    description: "Vibrant gradients with reflective foils",
    colors: ["#12c2e9", "#c471ed", "#f64f59"]
  }
];

const featuredCapsules = [
  {
    label: "Studio drop",
    title: "Architect grid set",
    blurb: "Structured lines + breathable mesh panelling",
    price: "₹1,899",
    gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
  },
  {
    label: "Community pick",
    title: "Eco tonal duo",
    blurb: "Organic cotton in eucalyptus + slate",
    price: "₹1,499",
    gradient: "linear-gradient(135deg, #42275a, #734b6d)"
  },
  {
    label: "Performance",
    title: "AeroFlex pro kit",
    blurb: "Sweat mapping vents with reflective trims",
    price: "₹2,199",
    gradient: "linear-gradient(135deg, #1d976c, #93f9b9)"
  }
];

const Categories = () => {
  const BASE_URL = "http://localhost:4999";

  // Data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI/Filters
  const [selectedCat, setSelectedCat] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const PLACEHOLDER = '/path/to/placeholder-image.jpg';
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Fetch all products on page open
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");
        console.log('Fetching products from:', `${BASE_URL}/api/products`);
        const res = await fetch(`${BASE_URL}/api/products`);
        const data = await res.json();
        console.log('API Response:', data);
        
        if (data?.success) {
          const processedProducts = (data.data || []).map(product => {
            console.log('Processing product:', product._id, 'Image URL:', product.image_url || product.image);
            return {
              ...product,
              image_url: product.image_url || product.image || (product.gallery_images?.[0] || '')
            };
          });
          
          console.log('Processed products:', processedProducts);
          setProducts(processedProducts);
        } else {
          const errorMsg = data?.message || "Failed to load products";
          console.error('API Error:', errorMsg);
          setError(errorMsg);
        }
      } catch (e) {
        console.error("Categories fetch error", e);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [BASE_URL]);

  const resolveImageUrl = (src) => {
    console.log('Original src:', src);
    
    if (!src) {
      console.log('No source provided, using placeholder');
      return PLACEHOLDER;
    }
    
    if (Array.isArray(src)) {
      console.log('Source is an array, using first item');
      src = src[0];
    }
    
    if (typeof src !== 'string') {
      console.log('Source is not a string, using placeholder');
      return PLACEHOLDER;
    }
  
    if (src.startsWith('http') || src.startsWith('data:')) {
      console.log('Source is already a full URL or data URI:', src);
      return src;
    }
  
    if (src.includes('/src/assets/') || src.includes('src/assets/')) {
      const filename = src.split('/').pop();
      return `/assets/${filename}`;
    }
  
    console.log('Processing backend image path:', src);
    
    let path = src
      .replace(/\\/g, '/')
      .replace(/^[.\/]+/, '')
      .replace(/^\/?(?:public|api)?\/?/i, '');
  
    console.log('After initial cleanup:', path);
  
    if (!path.startsWith('uploads/')) {
      path = `uploads/designs/${path}`;
      console.log('Added uploads/designs/ prefix:', path);
    }
    
    path = path.replace(/([^:]\/)\/+/g, '$1');
    
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    const finalUrl = `${baseUrl}/${cleanPath}`;
    console.log('Final URL:', finalUrl);
    
    return finalUrl;
  };

  // Derive categories from backend populated field: category_id?.name
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    for (const p of products) {
      const name = p?.category_id?.name || "Uncategorized";
      set.add(name);
    }
    return Array.from(set);
  }, [products]);

  // Get category stats
  const categoryStats = useMemo(() => {
    const stats = {};
    categories.forEach(cat => {
      if (cat === "All") {
        stats[cat] = products.length;
      } else {
        stats[cat] = products.filter(p => (p?.category_id?.name || "Uncategorized") === cat).length;
      }
    });
    return stats;
  }, [categories, products]);

  // Search + filter + featured
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const catName = p?.category_id?.name || "Uncategorized";
      if (selectedCat !== "All" && catName !== selectedCat) return false;
      if (onlyFeatured && !p?.is_featured) return false;
      if (!term) return true;
      const hay = `${p?.name || ""} ${p?.brand || ""} ${(p?.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [products, selectedCat, onlyFeatured, search]);

  // Sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "price_asc":
        arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price_desc":
        arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "rating_desc":
        arr.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
        break;
      case "name_asc":
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  // Pagination
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCat, search, sortBy, onlyFeatured]);

  const getCategoryIcon = (category) => {
    const icons = {
      "All": "🛍️",
      "Men": "👔",
      "Women": "👗",
      "Kids": "🧸",
      "Sports": "⚽",
      "Casual": "👕",
      "Formal": "🤵",
      "Accessories": "👜",
      "Uncategorized": "📦"
    };
    return icons[category] || "🏷️";
  };

  return (
    <div className="categories-page">
      <div className="categories-container">
        {/* Header */}
        <div className="categories-header">
          <div className="header-content">
            <h1>Product Categories</h1>
            <p>Discover our amazing collection of T-shirts across different categories</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{products.length}</span>
              <span className="stat-label">Total Products</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{categories.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{products.filter(p => p.is_featured).length}</span>
              <span className="stat-label">Featured</span>
            </div>
          </div>
        </div>

        <div className="category-highlights">
          {colorStories.map((story) => (
            <article key={story.title} className="story-card" style={{ borderColor: story.accent }}>
              <div className="story-meta">
                <h3>{story.title}</h3>
                <p>{story.description}</p>
              </div>
              <div className="story-swatches">
                {story.colors.map((tone) => (
                  <span key={tone} style={{ background: tone }} />
                ))}
              </div>
              <button className="story-cta">
                Build look <FiChevronRight />
              </button>
            </article>
          ))}
          {featuredCapsules.map((capsule) => (
            <article key={capsule.title} className="capsule-card" style={{ backgroundImage: capsule.gradient }}>
              <p className="capsule-label">{capsule.label}</p>
              <h3>{capsule.title}</h3>
              <p>{capsule.blurb}</p>
              <div className="capsule-footer">
                <span>{capsule.price}</span>
                <button className="capsule-btn">Preview</button>
              </div>
            </article>
          ))}
        </div>

        {/* Main Content */}
        <div className="categories-layout">
          {/* Sidebar */}
          <aside className="categories-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <h3>🔍 Filters</h3>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setSelectedCat("All");
                    setOnlyFeatured(false);
                    setSearch("");
                    setSortBy("relevance");
                  }}
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="filter-section">
                <h4>Categories</h4>
                <div className="category-list">
                  {categories.map((cat) => (
                    <div 
                      key={cat} 
                      className={`category-item ${selectedCat === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCat(cat)}
                    >
                      <div className="category-info">
                        <span className="category-icon">{getCategoryIcon(cat)}</span>
                        <span className="category-name">{cat}</span>
                      </div>
                      <span className="category-count">{categoryStats[cat] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Filter */}
              <div className="filter-section">
                <div className="checkbox-filter">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={onlyFeatured}
                      onChange={(e) => setOnlyFeatured(e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">⭐ Featured Products Only</span>
                  </label>
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h4>Quick Actions</h4>
                <div className="quick-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setSortBy("price_asc")}
                  >
                    💰 Lowest Price
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setSortBy("rating_desc")}
                  >
                    ⭐ Best Rated
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => setOnlyFeatured(true)}
                  >
                    🔥 Featured Only
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <section className="categories-content">
            {/* Toolbar */}
            <div className="content-toolbar">
              <div className="search-section">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search products, brands, tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                  {search && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearch("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              <div className="toolbar-controls">
                <div className="view-controls">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    ⊞ Grid
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    ☰ List
                  </button>
                </div>
                
                <div className="sort-section">
                  <span className="sort-label">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
              <div className="results-text">
                <span className="results-count">
                  Showing <strong>{paged.length}</strong> of <strong>{total}</strong> products
                  {selectedCat !== "All" && (
                    <span className="category-filter-info">
                      {" "}in <span className="active-category">{selectedCat}</span>
                    </span>
                  )}
                </span>
              </div>
              {loading && (
                <div className="loading-indicator">
                  <div className="loading-spinner"></div>
                  <span>Loading products...</span>
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            <div className="products-section">
              {loading ? (
                <div className={`products-grid ${viewMode}`}>
                  {Array.from({ length: pageSize }).map((_, i) => (
                    <div key={i} className="product-skeleton">
                      <div className="skeleton-image"></div>
                      <div className="skeleton-content">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <h3>Oops! Something went wrong</h3>
                  <p>{error}</p>
                  <button 
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                </div>
              ) : paged.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSelectedCat("All");
                      setOnlyFeatured(false);
                      setSearch("");
                      setSortBy("relevance");
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className={`products-grid ${viewMode}`}>
                  {paged.map((product) => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="pagination-section">
                <div className="pagination-controls">
                  <button
                    onClick={() => setPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ⏮️ First
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ⬅️ Previous
                  </button>
                  
                  <div className="pagination-info">
                    <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
                  </div>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next ➡️
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Last ⏭️
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Categories;
