import React, { useContext } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarItems = [
    {
      path: '/admin/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Statistics'
    },
    {
      path: '/admin/orders',
      icon: '📦',
      label: 'Orders',
      description: 'Manage all orders'
    },
    {
      path: '/admin/products',
      icon: '👕',
      label: 'Products',
      description: 'Product management'
    },
    {
      path: '/admin/inventory',
      icon: '📋',
      label: 'Inventory',
      description: 'Stock management'
    },
    {
      path: '/admin/customers',
      icon: '👥',
      label: 'Customers',
      description: 'User management'
    },
    {
      path: '/admin/analytics',
      icon: '📈',
      label: 'Analytics',
      description: 'Sales & Reports'
    }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <h2>T-Shirt Store</h2>
            <span className="admin-badge">Admin Panel</span>
          </div>
        </div>

        <div className="admin-user-info">
          <div className="admin-avatar">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="admin-details">
            <h4>{user?.fullName || 'Administrator'}</h4>
            <p>{user?.email}</p>
            <span className="role-badge">Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {sidebarItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {sidebarItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h1>
            <p className="page-subtitle">
              {sidebarItems.find(item => item.path === location.pathname)?.description || 'Manage your store'}
            </p>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <Link to="/homepage" className="view-store-btn">
                <span>🏪</span>
                View Store
              </Link>
              <div className="notification-bell">
                <span>🔔</span>
                <span className="notification-count">3</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
