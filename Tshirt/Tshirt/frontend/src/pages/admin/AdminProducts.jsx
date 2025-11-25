import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './AdminProducts.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`${API_URL}/api/admin/products?${queryParams}` , {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data.products || []);
      setTotalPages(data.data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p._id !== productId));
      setDeleteModal({ show: false, product: null });
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { class: 'out-of-stock', text: 'Out of Stock' };
    if (stock <= 5) return { class: 'critical-stock', text: 'Critical' };
    if (stock <= 20) return { class: 'low-stock', text: 'Low Stock' };
    return { class: 'in-stock', text: 'In Stock' };
  };

  if (loading && products.length === 0) {
    return (
      <div className="admin-products">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="products-header">
        <div className="header-content">
          <h1>Product Management</h1>
          <p>Manage your T-shirt inventory and listings</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/designs" className="btn btn-secondary">
            <FiHeart /> Customer Designs
          </Link>
          <Link to="/admin/products/new" className="btn btn-primary">
            + Add New Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="products-filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.images?.[0] || '/api/placeholder/200/200'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/200/200';
                  }}
                />
                <div className={`stock-badge ${stockStatus.class}`}>
                  {stockStatus.text}
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-sku">SKU: {product.sku}</p>
                <div className="product-details">
                  <span className="price">₹{product.price?.toLocaleString()}</span>
                  <span className="stock">Stock: {product.stock}</span>
                </div>
                <div className="product-meta">
                  <span className="category">{product.category}</span>
                  <span className={`status status-${product.status}`}>
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="product-actions">
                <Link 
                  to={`/admin/products/edit/${product._id}`}
                  className="btn btn-secondary"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => setDeleteModal({ show: true, product })}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && !loading && (
        <div className="no-products">
          <div className="no-products-icon">👕</div>
          <h3>No products found</h3>
          <p>No products match your current filters</p>
          <Link to="/admin/products/new" className="btn btn-primary">
            Add Your First Product
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                onClick={() => setDeleteModal({ show: false, product: null })}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product?</p>
              <div className="product-preview">
                <img 
                  src={deleteModal.product?.images?.[0] || '/api/placeholder/60/60'} 
                  alt={deleteModal.product?.name}
                />
                <div>
                  <h4>{deleteModal.product?.name}</h4>
                  <p>SKU: {deleteModal.product?.sku}</p>
                </div>
              </div>
              <p className="warning">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setDeleteModal({ show: false, product: null })}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteProduct(deleteModal.product._id)}
                className="btn btn-danger"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
