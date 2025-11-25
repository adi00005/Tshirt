// src/pages/Settings.jsx
import React, { useState } from 'react';
import './Settings.css';
// Static guest user data since auth is removed
const guestUser = {
  name: 'Guest',
  email: ''
};

const Settings = () => {
  const user = guestUser;
  const [activeTab, setActiveTab] = useState('account');
  const [settings, setSettings] = useState({
    // Account Settings
    account: {
      email: user?.email || 'john.doe@example.com',
      phone: '+91 9876543210',
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR'
    },
    
    // Privacy Settings
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowDataCollection: true,
      marketingEmails: true,
      orderUpdates: true,
      securityAlerts: true
    },
    
    // Notification Settings
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderUpdates: true,
      promotions: false,
      newArrivals: true,
      priceDrops: true,
      backInStock: true,
      newsletter: true
    },
    
    // Shopping Preferences
    shopping: {
      preferredSize: 'L',
      favoriteColors: ['Black', 'White', 'Navy'],
      preferredBrands: ['ActiveFit', 'EcoWear'],
      priceRange: { min: 1000, max: 5000 },
      autoSaveToWishlist: false,
      quickBuyEnabled: true,
      showRecommendations: true
    },
    
    // Security Settings
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordLastChanged: '2024-07-15',
      trustedDevices: 2
    },
    
    // App Preferences
    app: {
      theme: 'light',
      compactView: false,
      showPricesInGrid: true,
      autoPlayVideos: false,
      highQualityImages: true,
      offlineMode: false
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // API call to change password
    console.log('Changing password...');
    setShowPasswordChange(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    // API call to delete account
    console.log('Deleting account...');
  };

  const exportData = () => {
    // API call to export user data
    console.log('Exporting user data...');
    alert('Your data export will be sent to your email within 24 hours.');
  };

  const clearCache = () => {
    localStorage.removeItem('cartItems');
    localStorage.removeItem('recentlyViewed');
    alert('Cache cleared successfully');
  };

  const renderAccountSettings = () => (
    <div className="settings-section">
      <h3>Account Information</h3>
      
      <div className="setting-group">
        <label>Email Address</label>
        <input
          type="email"
          value={settings.account.email}
          onChange={(e) => updateSetting('account', 'email', e.target.value)}
          className="setting-input"
        />
      </div>

      <div className="setting-group">
        <label>Phone Number</label>
        <input
          type="tel"
          value={settings.account.phone}
          onChange={(e) => updateSetting('account', 'phone', e.target.value)}
          className="setting-input"
        />
      </div>

      <div className="setting-group">
        <label>Language</label>
        <select
          value={settings.account.language}
          onChange={(e) => updateSetting('account', 'language', e.target.value)}
          className="setting-select"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="bn">Bengali</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Timezone</label>
        <select
          value={settings.account.timezone}
          onChange={(e) => updateSetting('account', 'timezone', e.target.value)}
          className="setting-select"
        >
          <option value="Asia/Kolkata">India Standard Time</option>
          <option value="Asia/Dubai">UAE Time</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="Europe/London">GMT</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Currency</label>
        <select
          value={settings.account.currency}
          onChange={(e) => updateSetting('account', 'currency', e.target.value)}
          className="setting-select"
        >
          <option value="INR">Indian Rupee (₹)</option>
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">British Pound (£)</option>
        </select>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h3>Privacy & Data</h3>
      
      <div className="setting-group">
        <label>Profile Visibility</label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
          className="setting-select"
        >
          <option value="public">Public</option>
          <option value="friends">Friends Only</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.privacy.showEmail}
            onChange={(e) => updateSetting('privacy', 'showEmail', e.target.checked)}
          />
          Show email address in profile
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.privacy.showPhone}
            onChange={(e) => updateSetting('privacy', 'showPhone', e.target.checked)}
          />
          Show phone number in profile
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.privacy.allowDataCollection}
            onChange={(e) => updateSetting('privacy', 'allowDataCollection', e.target.checked)}
          />
          Allow data collection for personalization
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.privacy.marketingEmails}
            onChange={(e) => updateSetting('privacy', 'marketingEmails', e.target.checked)}
          />
          Receive marketing emails
        </label>
      </div>

      <div className="privacy-actions">
        <button onClick={exportData} className="btn-secondary">
          Export My Data
        </button>
        <button onClick={clearCache} className="btn-secondary">
          Clear Cache
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notifications</h3>
      
      <div className="notification-category">
        <h4>Delivery Methods</h4>
        
        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
            />
            Email Notifications
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
            />
            SMS Notifications
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
            />
            Push Notifications
          </label>
        </div>
      </div>

      <div className="notification-category">
        <h4>Notification Types</h4>
        
        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.orderUpdates}
              onChange={(e) => updateSetting('notifications', 'orderUpdates', e.target.checked)}
            />
            Order Updates
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.promotions}
              onChange={(e) => updateSetting('notifications', 'promotions', e.target.checked)}
            />
            Promotions & Deals
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.newArrivals}
              onChange={(e) => updateSetting('notifications', 'newArrivals', e.target.checked)}
            />
            New Arrivals
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.priceDrops}
              onChange={(e) => updateSetting('notifications', 'priceDrops', e.target.checked)}
            />
            Price Drops on Wishlist Items
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.backInStock}
              onChange={(e) => updateSetting('notifications', 'backInStock', e.target.checked)}
            />
            Back in Stock Alerts
          </label>
        </div>

        <div className="setting-toggle">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications.newsletter}
              onChange={(e) => updateSetting('notifications', 'newsletter', e.target.checked)}
            />
            Weekly Newsletter
          </label>
        </div>
      </div>
    </div>
  );

  const renderShoppingSettings = () => (
    <div className="settings-section">
      <h3>Shopping Preferences</h3>
      
      <div className="setting-group">
        <label>Preferred Size</label>
        <select
          value={settings.shopping.preferredSize}
          onChange={(e) => updateSetting('shopping', 'preferredSize', e.target.value)}
          className="setting-select"
        >
          <option value="XS">Extra Small (XS)</option>
          <option value="S">Small (S)</option>
          <option value="M">Medium (M)</option>
          <option value="L">Large (L)</option>
          <option value="XL">Extra Large (XL)</option>
          <option value="XXL">Double XL (XXL)</option>
        </select>
      </div>

      <div className="setting-group">
        <label>Price Range (₹)</label>
        <div className="price-range">
          <input
            type="number"
            value={settings.shopping.priceRange.min}
            onChange={(e) => updateSetting('shopping', 'priceRange', {
              ...settings.shopping.priceRange,
              min: parseInt(e.target.value)
            })}
            className="price-input"
            placeholder="Min"
          />
          <span>to</span>
          <input
            type="number"
            value={settings.shopping.priceRange.max}
            onChange={(e) => updateSetting('shopping', 'priceRange', {
              ...settings.shopping.priceRange,
              max: parseInt(e.target.value)
            })}
            className="price-input"
            placeholder="Max"
          />
        </div>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.shopping.autoSaveToWishlist}
            onChange={(e) => updateSetting('shopping', 'autoSaveToWishlist', e.target.checked)}
          />
          Auto-save viewed items to wishlist
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.shopping.quickBuyEnabled}
            onChange={(e) => updateSetting('shopping', 'quickBuyEnabled', e.target.checked)}
          />
          Enable quick buy (skip cart)
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.shopping.showRecommendations}
            onChange={(e) => updateSetting('shopping', 'showRecommendations', e.target.checked)}
          />
          Show personalized recommendations
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security</h3>
      
      <div className="security-info">
        <div className="info-item">
          <span className="label">Password last changed:</span>
          <span className="value">{settings.security.passwordLastChanged}</span>
        </div>
        <div className="info-item">
          <span className="label">Trusted devices:</span>
          <span className="value">{settings.security.trustedDevices}</span>
        </div>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
          />
          Enable Two-Factor Authentication
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.security.loginAlerts}
            onChange={(e) => updateSetting('security', 'loginAlerts', e.target.checked)}
          />
          Send login alerts
        </label>
      </div>

      <div className="setting-group">
        <label>Session Timeout (minutes)</label>
        <select
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className="setting-select"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={0}>Never</option>
        </select>
      </div>

      <div className="security-actions">
        <button 
          onClick={() => setShowPasswordChange(true)}
          className="btn-primary"
        >
          Change Password
        </button>
        <button className="btn-secondary">
          Manage Trusted Devices
        </button>
        <button className="btn-secondary">
          View Login History
        </button>
      </div>
    </div>
  );

  const renderAppSettings = () => (
    <div className="settings-section">
      <h3>App Preferences</h3>
      
      <div className="setting-group">
        <label>Theme</label>
        <select
          value={settings.app.theme}
          onChange={(e) => updateSetting('app', 'theme', e.target.value)}
          className="setting-select"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.app.compactView}
            onChange={(e) => updateSetting('app', 'compactView', e.target.checked)}
          />
          Compact view mode
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.app.showPricesInGrid}
            onChange={(e) => updateSetting('app', 'showPricesInGrid', e.target.checked)}
          />
          Show prices in product grid
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.app.autoPlayVideos}
            onChange={(e) => updateSetting('app', 'autoPlayVideos', e.target.checked)}
          />
          Auto-play product videos
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.app.highQualityImages}
            onChange={(e) => updateSetting('app', 'highQualityImages', e.target.checked)}
          />
          Load high-quality images
        </label>
      </div>

      <div className="setting-toggle">
        <label>
          <input
            type="checkbox"
            checked={settings.app.offlineMode}
            onChange={(e) => updateSetting('app', 'offlineMode', e.target.checked)}
          />
          Enable offline mode
        </label>
      </div>
    </div>
  );

  const renderPasswordChangeModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Change Password</h3>
          <button 
            onClick={() => setShowPasswordChange(false)}
            className="close-btn"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Change Password
            </button>
            <button 
              type="button" 
              onClick={() => setShowPasswordChange(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'app', label: 'App', icon: '⚙️' }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account and app preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              Delete Account
            </button>
          </div>
        </div>

        <div className="settings-main">
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'shopping' && renderShoppingSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'app' && renderAppSettings()}
          
          <div className="settings-actions">
            <button className="btn-primary">Save Changes</button>
            <button className="btn-secondary">Reset to Defaults</button>
          </div>
        </div>
      </div>

      {showPasswordChange && renderPasswordChangeModal()}
      
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="delete-warning">
              <p>⚠️ This action cannot be undone. All your data will be permanently deleted.</p>
              <p>Are you sure you want to delete your account?</p>
            </div>
            
            <div className="form-actions">
              <button 
                onClick={handleDeleteAccount}
                className="btn-danger"
              >
                Yes, Delete My Account
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
