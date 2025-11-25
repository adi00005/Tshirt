import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiMenu, FiX, FiChevronDown, FiSettings, FiHeart, FiPackage, FiUserCheck, FiBox, FiShoppingBag } from 'react-icons/fi';
import '../styles/ModernNav.css';

const ModernNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Mock cart items count
  const cartItemCount = 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/customize', label: 'Customize' },
    { path: '/design-studio', label: 'Design Studio' }
  ];

  const handleLogout = () => {
    console.log('Logout clicked'); // Debug log
    // Clear all auth data and local storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Redirect to sign in page using React Router
    navigate('/signin');
  };

  // Read user data from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const displayName = user?.name || 'Guest';
  const email = user?.email || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : 'G';

  const userMenuItems = [
    { path: '/my-orders', label: 'My Orders', icon: <FiPackage /> },
    { path: '/wishlist', label: 'Wishlist', icon: <FiHeart /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings /> },
    ...(user?.isAdmin ? [{ path: '/admin', label: 'Admin Dashboard', icon: <FiSettings /> }] : []),
    { path: '/logout', label: 'Logout', icon: <FiUserCheck /> }
  ];

  const adminMenuItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: <FiSettings /> },
    { path: '/admin/orders', label: 'Orders', icon: <FiPackage /> },
    { path: '/admin/products', label: 'Products', icon: <FiShoppingBag /> },
    { path: '/admin/inventory', label: 'Inventory', icon: <FiBox /> },
    { path: '/admin/designs', label: 'Customer Designs', icon: <FiHeart /> },
    { path: '/logout', label: 'Logout', icon: <FiUserCheck /> }
  ];

  return (
    <nav className="modern-nav" ref={menuRef}>
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/">T-Shirt Store</Link>
        </div>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          {/* Hide regular nav links for admin users on admin pages */}
          {!user?.isAdmin && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {/* Hide cart for admin users */}
          {!user?.isAdmin && (
            <Link to="/cart" className="nav-icon cart-icon">
              <FiShoppingCart />
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
          )}

          <div className="user-dropdown" ref={dropdownRef}>
            <button className="user-btn" onClick={toggleDropdown}>
              <div className="user-avatar small">{initials}</div>
              <span className="user-name">{displayName}</span>
              <FiChevronDown className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-avatar large">{initials}</div>
                  <div className="user-info">
                    <h4>{displayName}</h4>
                    {email && <p>{email}</p>}
                  </div>
                </div>

                <div className="dropdown-content">
                  {(user?.isAdmin ? adminMenuItems : userMenuItems).map((item) => (
                    item.path === '/logout' ? (
                      <button
                        key={item.path}
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        <span className="item-icon">{item.icon}</span>
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="item-icon">{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ModernNav;