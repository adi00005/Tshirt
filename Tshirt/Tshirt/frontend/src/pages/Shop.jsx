import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiFilter,
  FiX,
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import productsData from '../data/products';
import './Shop.css';

const ITEMS_PER_PAGE = 12;
const MAX_PRICE = 5000;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(productsData);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSizes, selectedColors, priceRange, sortBy]);

  useEffect(() => {
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [quickViewProduct]);

  const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const titleMatch = product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const brandMatch = product.brand
          ? product.brand.toLowerCase().includes(searchQuery.toLowerCase())
          : false;

        const matchesSearch = searchQuery ? titleMatch || brandMatch : true;

        const matchesSizes =
          selectedSizes.length === 0 ||
          (product.sizes && product.sizes.some((size) => selectedSizes.includes(size)));

        const matchesColors =
          selectedColors.length === 0 ||
          (product.colors &&
            product.colors.some((color) =>
              selectedColors.includes(String(color).toLowerCase())
            ));

        const saleOrRegular = product.sale_price || product.price || 0;
        const matchesPrice = saleOrRegular >= priceRange[0] && saleOrRegular <= priceRange[1];

        return matchesSearch && matchesSizes && matchesColors && matchesPrice;
      })
      .sort((a, b) => {
        const aPrice = a.sale_price || a.price || 0;
        const bPrice = b.sale_price || b.price || 0;
        const aRating = a.average_rating || 0;
        const bRating = b.average_rating || 0;

        switch (sortBy) {
          case 'price-low':
            return aPrice - bPrice;
          case 'price-high':
            return bPrice - aPrice;
          case 'rating':
            return bRating - aRating;
          default:
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
      });
  }, [products, searchQuery, selectedSizes, selectedColors, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const availableSizes = useMemo(() => {
    const sizes = new Set();
    products.forEach((product) => product.sizes?.forEach((size) => sizes.add(size)));
    return Array.from(sizes).sort();
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach((product) =>
      product.colors?.forEach((color) => colors.add(String(color).toLowerCase()))
    );
    return Array.from(colors);
  }, [products]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, MAX_PRICE]);
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formQuery = searchQuery.trim();
    if (formQuery) {
      setSearchParams({ search: formQuery });
    } else {
      setSearchParams({});
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    const normalized = color.toLowerCase();
    setSelectedColors((prev) =>
      prev.includes(normalized)
        ? prev.filter((c) => c !== normalized)
        : [...prev, normalized]
    );
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = new Set(prev);
      if (updated.has(productId)) {
        updated.delete(productId);
      } else {
        updated.add(productId);
      }
      return updated;
    });
  };

  const openQuickView = (product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  const handlePriceChange = (value, index) => {
    setPriceRange((prev) => {
      const updated = [...prev];
      updated[index] = Number(value);
      updated.sort((a, b) => a - b);
      return updated;
    });
  };

  const handlePageChange = (directionOrPage) => {
    if (typeof directionOrPage === 'number') {
      setCurrentPage(directionOrPage);
      return;
    }

    setCurrentPage((prev) => {
      if (directionOrPage === 'prev') {
        return Math.max(1, prev - 1);
      }
      return Math.min(totalPages, prev + 1);
    });
  };

  const renderRating = (ratingValue = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <FiStar
          key={i}
          className={i <= Math.round(ratingValue) ? 'star filled' : 'star'}
        />
      );
    }
    return stars;
  };

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <p className="eyebrow">New Season · New Arrivals</p>
        <h1>Find your next favorite tee</h1>
        <p className="subhead">
          Curated fits, premium cotton, and vibrant prints tailored for every mood.
        </p>
      </section>

      <div className="shop-content">
        <button className="mobile-filter-btn" onClick={() => setShowFilters(true)}>
          <FiFilter /> Filters
        </button>

        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filters-header">
            <div>
              <h3>Filters</h3>
              <p>Fine-tune your search</p>
            </div>
            <button className="close-filters" onClick={() => setShowFilters(false)}>
              <FiX />
            </button>
          </div>

          <div className="filter-section">
            <h4>Search</h4>
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search by name or brand"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-values">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
            <div className="double-slider">
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e.target.value, 0)}
              />
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e.target.value, 1)}
              />
            </div>
          </div>

          <div className="filter-section">
            <h4>Sizes</h4>
            <div className="chip-group">
              {availableSizes.length === 0 && <p className="muted">No sizes available</p>}
              {availableSizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={`chip ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h4>Colors</h4>
            <div className="color-grid">
              {availableColors.map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`color-dot ${selectedColors.includes(color) ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => toggleColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button className="clear-filters-btn" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </aside>

        <div className="products-area">
          <div className="sort-bar">
            <div>
              <p className="eyebrow">Results</p>
              <strong>
                Showing {filteredProducts.length} product
                {filteredProducts.length === 1 ? '' : 's'}
              </strong>
            </div>
            <div className="sort-controls">
              <label htmlFor="sort-select">Sort</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="product-skeleton" key={index}>
                  <div className="skeleton-image" />
                  <div className="skeleton-lines">
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting filters or search terms to discover more styles.</p>
              <button type="button" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {paginatedProducts.map((product) => {
                const id = product._id || product.id;
                const price = product.sale_price || product.price;
                const originalPrice = product.sale_price ? product.price : null;
                const rating = product.average_rating || 0;
                const isWishlisted = wishlist.has(id);

                return (
                  <div className="shop-card" key={id}>
                    <div className="card-media">
                      <img src={product.image_url} alt={product.name} />
                      <button
                        type="button"
                        className={`wishlist ${isWishlisted ? 'active' : ''}`}
                        onClick={() => toggleWishlist(id)}
                      >
                        <FiHeart />
                      </button>
                      <button type="button" className="quick-view" onClick={() => openQuickView(product)}>
                        Quick view
                      </button>
                    </div>

                    <div className="card-info">
                      <p className="brand">{product.brand || 'Tee Studio'}</p>
                      <h3>{product.name}</h3>
                      <div className="rating">
                        {renderRating(rating)} <span>{rating.toFixed(1)}</span>
                      </div>
                      <div className="pricing">
                        <span className="current">{formatCurrency(price)}</span>
                        {originalPrice && (
                          <span className="original">{formatCurrency(originalPrice)}</span>
                        )}
                      </div>
                      <div className="meta">
                        <div className="colors">
                          {product.colors?.slice(0, 3).map((color) => (
                            <span key={color} style={{ backgroundColor: color }} />
                          ))}
                          {product.colors && product.colors.length > 3 && (
                            <small>+{product.colors.length - 3}</small>
                          )}
                        </div>
                        <div className="sizes">
                          {product.sizes?.slice(0, 3).map((size) => (
                            <span key={size}>{size}</span>
                          ))}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button type="button" className="add-cart">
                          <FiShoppingCart /> Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredProducts.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button
                type="button"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  type="button"
                  key={index}
                  className={currentPage === index + 1 ? 'active' : ''}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePageChange('next')}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <div className="quick-view-modal">
          <div className="overlay" onClick={closeQuickView} />
          <div className="quick-view-card">
            <button className="close" onClick={closeQuickView}>
              <FiX />
            </button>
            <div className="quick-view-details">
              <img src={quickViewProduct.image_url} alt={quickViewProduct.name} />
              <div className="details">
                <p className="eyebrow">{quickViewProduct.brand || 'Tee Studio'}</p>
                <h2>{quickViewProduct.name}</h2>
                <div className="rating">
                  {renderRating(quickViewProduct.average_rating)}
                  <span>
                    {quickViewProduct.average_rating?.toFixed(1) || '0.0'} ·{' '}
                    {quickViewProduct.review_count || 0} reviews
                  </span>
                </div>
                <p className="description">
                  Premium cotton blend, ultra-soft feel, and breathable finishes for everyday comfort.
                </p>
                <div className="price-block">
                  <strong>{formatCurrency(quickViewProduct.sale_price || quickViewProduct.price)}</strong>
                  {quickViewProduct.sale_price && (
                    <span>{formatCurrency(quickViewProduct.price)}</span>
                  )}
                </div>
                <div className="quick-actions">
                  <button type="button" className="add-cart">
                    <FiShoppingCart /> Add to cart
                  </button>
                  <button
                    type="button"
                    className={`wishlist ${wishlist.has(quickViewProduct._id || quickViewProduct.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(quickViewProduct._id || quickViewProduct.id)}
                  >
                    <FiHeart />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
