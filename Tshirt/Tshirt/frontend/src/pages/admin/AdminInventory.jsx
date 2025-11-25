import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './AdminInventory.css';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/inventory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      } else {
        setError('Failed to fetch inventory data');
      }
    } catch (error) {
      setError('Error fetching inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateStock = async (productId, newStock) => {
    try {
      const response = await fetch(`/api/admin/inventory/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (response.ok) {
        fetchInventory(); // Refresh data
      } else {
        setError('Failed to update stock');
      }
    } catch (error) {
      setError('Error updating stock: ' + error.message);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'critical';
    if (stock <= 20) return 'low-stock';
    return 'in-stock';
  };

  const getStockFillWidth = (stock) => {
    const maxStock = 100; // Assume max stock for visualization
    return Math.min((stock / maxStock) * 100, 100);
  };

  const getStockFillClass = (stock) => {
    if (stock <= 5) return 'critical';
    if (stock <= 20) return 'low';
    return '';
  };

  const filteredProducts = (products || []).filter(product => {
    if (filter === 'all') return true;
    if (filter === 'low') return product.stock <= 20 && product.stock > 0;
    if (filter === 'critical') return product.stock <= 5 && product.stock > 0;
    if (filter === 'out') return product.stock === 0;
    return true;
  });

  const getInventoryStats = () => {
    const total = products.length;
    const critical = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const low = products.filter(p => p.stock <= 20 && p.stock > 5).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const good = total - critical - low - outOfStock;
    
    return { total, critical, low, outOfStock, good };
  };

  const stats = getInventoryStats();

  if (loading) return <div className="admin-loading"><div className="loading-spinner"></div>Loading inventory...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-inventory">
      <div className="inventory-header">
        <div className="header-content">
          <h1>Inventory Management</h1>
          <div className="inventory-stats">
            <div className="stat-chip">
              📦 {stats.total} Total Products
            </div>
            <div className={`stat-chip ${stats.critical > 0 ? 'critical' : ''}`}>
              🔴 {stats.critical} Critical Stock
            </div>
            <div className={`stat-chip ${stats.low > 0 ? 'low' : ''}`}>
              🟡 {stats.low} Low Stock
            </div>
            <div className={`stat-chip ${stats.good > 0 ? 'good' : ''}`}>
              🟢 {stats.good} Good Stock
            </div>
          </div>
        </div>
        <Link to="/admin/designs" className="btn btn-secondary">
          <FiHeart /> Customer Designs
        </Link>
      </div>

      <div className="inventory-filters">
        <div className="filters-row">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Products ({(products || []).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              Critical ({stats.critical})
            </button>
            <button 
              className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              Low Stock ({stats.low})
            </button>
            <button 
              className={`filter-btn ${filter === 'out' ? 'active' : ''}`}
              onClick={() => setFilter('out')}
            >
              Out of Stock ({stats.outOfStock})
            </button>
          </div>
        </div>
      </div>

      <div className="inventory-grid">
        {filteredProducts.map(product => (
          <div key={product._id} className={`inventory-card ${getStockStatus(product.stock)}`}>
            <div className="product-image">
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="no-image">📷</div>
              )}
            </div>
            
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-sku">SKU: {product.sku || 'N/A'}</div>
            </div>

            <div className="stock-info">
              <div className="stock-level">
                <span className="stock-label">Stock Level</span>
                <span className="stock-value">{product.stock}</span>
              </div>
              
              <div className="stock-bar">
                <div 
                  className={`stock-fill ${getStockFillClass(product.stock)}`}
                  style={{ width: `${getStockFillWidth(product.stock)}%` }}
                ></div>
              </div>
              
              <div className={`stock-status ${getStockStatus(product.stock)}`}>
                {product.stock === 0 ? 'Out of Stock' : 
                 product.stock <= 5 ? 'Critical Stock' :
                 product.stock <= 20 ? 'Low Stock' : 'In Stock'}
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="action-btn btn-update"
                onClick={() => {
                  const newStock = prompt('Enter new stock quantity:', product.stock);
                  if (newStock !== null && !isNaN(newStock)) {
                    updateStock(product._id, parseInt(newStock));
                  }
                }}
              >
                Update Stock
              </button>
              <button 
                className="action-btn btn-edit"
                onClick={() => {
                  // Navigate to edit product page
                  window.location.href = `/admin/products/edit/${product._id}`;
                }}
              >
                Edit Product
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <h3>📦 No products found</h3>
          <p>No products match the selected filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
