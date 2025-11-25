import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { debounce } from 'lodash';
import { 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp, 
  FiStar, 
  FiAlertCircle, 
  FiRefreshCw 
} from 'react-icons/fi';
import './ClipartGallery.css';

// Mock data for development
const MOCK_CLIPART = [
  { id: 1, name: 'Star', thumbnail: '/clipart/star.png', category: 'Shapes', isPremium: false, colors: ['#FFD700', '#FFA500'], tags: ['shape', 'star'] },
  { id: 2, name: 'Heart', thumbnail: '/clipart/heart.png', category: 'Shapes', isPremium: true, colors: ['#FF1493', '#FF69B4'], tags: ['shape', 'heart', 'love'] },
  { id: 3, name: 'Circle', thumbnail: '/clipart/circle.png', category: 'Shapes', isPremium: false, colors: ['#4A69E2'], tags: ['shape', 'circle'] },
  { id: 4, name: 'Square', thumbnail: '/clipart/square.png', category: 'Shapes', isPremium: false, colors: ['#FF6347'], tags: ['shape', 'square'] },
  { id: 5, name: 'Triangle', thumbnail: '/clipart/triangle.png', category: 'Shapes', isPremium: false, colors: ['#32CD32'], tags: ['shape', 'triangle'] },
  { id: 6, name: 'Diamond', thumbnail: '/clipart/diamond.png', category: 'Shapes', isPremium: true, colors: ['#9370DB', '#4B0082'], tags: ['shape', 'diamond', 'precious'] },
];

// Available categories and colors for filters
const CATEGORIES = ['All', 'Shapes', 'Icons', 'Logos', 'Holiday', 'Sports', 'Animals', 'Nature'];
const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
];

const ClipartGallery = ({ onSelectClipart, onError, className, style }) => {
  // State for clipart data and loading
  const [clipart, setClipart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sort: 'newest',
    colors: [],
    isPremium: null,
  });
  
  const observer = useRef();
  const lastClipartElementRef = useCallback(node => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.1 });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore, hasMore]);

  // Sort clipart based on selected option
  const sortClipart = useCallback((data, sortBy) => {
    const sortedData = [...data];
    switch (sortBy) {
      case 'newest':
        return sortedData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'popular':
        return sortedData.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case 'name_asc':
        return sortedData.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return sortedData.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sortedData;
    }
  }, []);

  // Handle clipart selection
  const handleSelectClipart = useCallback((clipartItem) => {
    try {
      if (typeof onSelectClipart === 'function') {
        onSelectClipart({
          ...clipartItem,
          type: 'clipart',
          src: clipartItem.thumbnail,
          width: 200,
          height: 200,
        });
      }
    } catch (err) {
      console.error('Error selecting clipart:', err);
      setError('Failed to select clipart. Please try again.');
      if (typeof onError === 'function') {
        onError(err);
      }
    }
  }, [onSelectClipart, onError]);

  // Fetch clipart data with proper error handling and loading states
  const fetchClipart = useCallback(async (reset = false) => {
    const isInitialLoad = reset || page === 1;
    
    try {
      if (isInitialLoad) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      
      // In production, replace this with actual API call
      if (process.env.NODE_ENV === 'development') {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Apply filters to mock data
        let filteredData = [...MOCK_CLIPART];
        
        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredData = filteredData.filter(item => 
            item.name.toLowerCase().includes(query) || 
            (item.tags && item.tags.some(tag => tag.includes(query)))
          );
        }
        
        // Apply category filter
        if (selectedCategory !== 'All') {
          filteredData = filteredData.filter(item => item.category === selectedCategory);
        }
        
        // Apply color filters
        if (activeFilters.colors.length > 0) {
          filteredData = filteredData.filter(item => 
            item.colors && activeFilters.colors.some(color => item.colors.includes(color))
          );
        }
        
        // Apply premium filter
        if (activeFilters.isPremium !== null) {
          filteredData = filteredData.filter(item => item.isPremium === activeFilters.isPremium);
        }
        
        // Apply sorting
        const sortedData = sortClipart(filteredData, activeFilters.sort);
        
        // Simulate pagination
        const start = (page - 1) * 10;
        const paginatedData = sortedData.slice(start, start + 10);
        
        setClipart(prevClipart => 
          page === 1 ? paginatedData : [...prevClipart, ...paginatedData]
        );
        setHasMore(start + 10 < sortedData.length);
      } else {
        // Production API call
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/designs/clipart`, {
          params: {
            page,
            search: searchQuery,
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            colors: activeFilters.colors.join(','),
            isPremium: activeFilters.isPremium,
            sort: activeFilters.sort,
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setClipart(prevClipart => 
          page === 1 ? response.data.docs : [...prevClipart, ...response.data.docs]
        );
        setHasMore(response.data.hasNextPage);
      }
    } catch (err) {
      console.error('Error fetching clipart:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load clipart. Please try again.';
      setError(errorMessage);
      
      // In development, fall back to mock data if API fails
      if (process.env.NODE_ENV === 'development' && isInitialLoad) {
        setClipart(MOCK_CLIPART);
        setHasMore(false);
        setError(null);
      }
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [page, searchQuery, selectedCategory, activeFilters, sortClipart]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      setPage(1);
    }, 500),
    [] // debounce doesn't need dependencies
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    debouncedSearch(query);
  };

  // Handle filter change
  const handleFilterChange = useCallback((filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setPage(1);
  }, []);

  // Toggle color filter
  const toggleColorFilter = useCallback((color) => {
    setActiveFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
    setPage(1);
  }, []);

  // Toggle premium filter
  const togglePremiumFilter = useCallback(() => {
    setActiveFilters(prev => ({
      ...prev,
      isPremium: prev.isPremium === null ? true : prev.isPremium === true ? false : null
    }));
    setPage(1);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
    setActiveFilters({
      sort: 'newest',
      colors: [],
      isPremium: null,
    });
    setPage(1);
  }, []);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchClipart();
  }, [page, searchQuery, selectedCategory, activeFilters, fetchClipart]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={`clipart-gallery loading ${className}`} style={style}>
        <div className="loading-spinner">
          <FiRefreshCw className="spinner" />
          <p>Loading clipart...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`clipart-gallery error ${className}`} style={style}>
        <div className="error-message">
          <FiAlertCircle className="error-icon" />
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => {
              setError(null);
              fetchClipart(true);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!isLoading && clipart.length === 0) {
    return (
      <div className={`clipart-gallery empty ${className}`} style={style}>
        <p>No clipart found. Try adjusting your filters.</p>
        <button className="reset-filters" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
    );
  }

  // Render clipart gallery
  return (
    <div className={`clipart-gallery ${className}`} style={style}>
      {/* Search and filter controls */}
      <div className="gallery-controls">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search clipart..."
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className={`filter-toggle ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <FiFilter />
            <span>Filters</span>
            {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          
          <button 
            className="reset-filters"
            onClick={resetFilters}
            disabled={!searchQuery && selectedCategory === 'All' && 
                      activeFilters.colors.length === 0 && 
                      activeFilters.isPremium === null}
          >
            Reset All
          </button>
        </div>
      </div>
      
      {/* Advanced filters */}
      {isFilterOpen && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h4>Colors</h4>
            <div className="color-filters">
              {COLORS.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${activeFilters.colors.includes(color) ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => toggleColorFilter(color)}
                  title={color}
                  aria-label={`Filter by ${color}`}
                />
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Premium</h4>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="premium-toggle"
                checked={activeFilters.isPremium === true}
                onChange={togglePremiumFilter}
                className="toggle-input"
              />
              <label htmlFor="premium-toggle" className="toggle-label">
                <span className="toggle-handle"></span>
              </label>
              <span className="toggle-text">
                {activeFilters.isPremium === true ? 'Premium Only' : 'All Clipart'}
              </span>
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Sort By</h4>
            <select
              value={activeFilters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="sort-select"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      {/* Clipart grid */}
      <div className="clipart-grid">
        {clipart.map((item, index) => (
          <div 
            key={`${item.id}-${index}`}
            className={`clipart-item ${item.isPremium ? 'premium' : ''}`}
            onClick={() => handleSelectClipart(item)}
            ref={index === clipart.length - 1 && hasMore ? lastClipartElementRef : null}
          >
            <div className="clipart-thumbnail">
              <img 
                src={item.thumbnail} 
                alt={item.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder-clipart.png';
                }}
              />
              {item.isPremium && (
                <div className="premium-badge">
                  <FiStar />
                  <span>Premium</span>
                </div>
              )}
            </div>
            <div className="clipart-details">
              <h4>{item.name}</h4>
              <span className="category">{item.category}</span>
              {item.colors && item.colors.length > 0 && (
                <div className="color-palette">
                  {item.colors.slice(0, 3).map((color, i) => (
                    <span 
                      key={i} 
                      className="color-dot" 
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {item.colors.length > 3 && (
                    <span className="more-colors">+{item.colors.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="loading-more">
          <FiRefreshCw className="spinner" />
          <p>Loading more...</p>
        </div>
      )}
      
      {/* No more results */}
      {!hasMore && clipart.length > 0 && (
        <div className="no-more-results">
          <p>No more clipart to show</p>
        </div>
      )}
    </div>
  );
};

// Prop types validation
ClipartGallery.propTypes = {
  onSelectClipart: PropTypes.func.isRequired,
  onError: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

ClipartGallery.defaultProps = {
  onError: (error) => console.error('ClipartGallery error:', error),
  className: '',
  style: {}
};

export default ClipartGallery;
