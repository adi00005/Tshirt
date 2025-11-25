import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaDollarSign, FaUsers, FaExclamationTriangle, FaSearch, FaFilter, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    sales: { today: 0, monthly: 0, trend: 'up' },
    orders: { total: 0, today: 0, pending: 0, completed: 0, cancelled: 0 },
    revenue: { total: 0, monthly: 0, trend: 'up' },
    products: { total: 0, active: 0, lowStock: 0 },
    users: { total: 0, active: 0, newToday: 0 },
    recentOrders: [],
    lowStockAlerts: []
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('http://localhost:4999/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      
      setStats(prev => ({
        ...prev,
        ...data.data,
        alerts: data.data.lowStockAlerts
      }));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to load dashboard data. Please refresh to try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return <span className={`badge bg-${statusMap[status] || 'secondary'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Overview</h1>
      
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="alerts-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.message}
              <button type="button" className="btn-close" onClick={() => 
                setAlerts(prev => prev.filter(a => a.id !== alert.id))} />
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-header">
            <h3>Today's Revenue</h3>
            <div className={`trend ${stats.revenue.trend}`}>
              {stats.revenue.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            </div>
          </div>
          <div className="metric-value">{formatCurrency(stats.revenue.today)}</div>
          <div className="metric-subtext">
            {stats.revenue.trend === 'up' ? '↑' : '↓'} {stats.revenue.monthly}% from last month
          </div>
        </div>

        <div className="metric-card orders">
          <div className="metric-header">
            <h3>New Orders</h3>
            <FaBox className="metric-icon" />
          </div>
          <div className="metric-value">{stats.orders.today}</div>
          <div className="metric-subtext">{stats.orders.pending} pending processing</div>
        </div>

        <div className="metric-card customers">
          <div className="metric-header">
            <h3>New Customers</h3>
            <FaUsers className="metric-icon" />
          </div>
          <div className="metric-value">{stats.users.newToday}</div>
          <div className="metric-subtext">{stats.users.active} active today</div>
        </div>

        <div className="metric-card alerts">
          <div className="metric-header">
            <h3>Alerts</h3>
            <FaExclamationTriangle className="metric-icon" />
          </div>
          <div className="metric-value">{stats.lowStockAlerts.length}</div>
          <div className="metric-subtext">Products with low stock</div>
        </div>
      </div>

      {/* Action Required Section */}
      <div className="action-required">
        <div className="section-header">
          <h2>Action Required</h2>
          <div className="section-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <FaFilter />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Awaiting Processing */}
        <div className="orders-table">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders
                .filter(order => 
                  (filter === 'all' || order.status === filter) &&
                  (searchTerm === '' || 
                    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(order => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/admin/orders/${order._id}`} className="order-link">
                        {order.orderId}
                      </Link>
                    </td>
                    <td>{order.customerName}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{order.items.length} items</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>
                      <Link to={`/admin/orders/${order._id}`} className="btn btn-sm btn-outline-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockAlerts.length > 0 && (
        <div className="alerts-section">
          <h2>Low Stock Alerts</h2>
          <div className="alerts-grid">
            {stats.lowStockAlerts.slice(0, 4).map(product => (
              <div key={product._id} className="alert-item">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <h4>{product.name}</h4>
                  <p>Only {product.stock} left in stock</p>
                  <div className="stock-bar">
                    <div 
                      className="stock-level" 
                      style={{ width: `${(product.stock / 10) * 100}%` }}
                    />
                  </div>
                </div>
                <Link to={`/admin/products/edit/${product._id}`} className="btn btn-sm btn-outline-warning">
                  Restock
                </Link>
              </div>
            ))}
          </div>
          {stats.lowStockAlerts.length > 4 && (
            <div className="text-end mt-3">
              <Link to="/admin/products?filter=low-stock" className="btn btn-link">
                View all {stats.lowStockAlerts.length} low stock items
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
