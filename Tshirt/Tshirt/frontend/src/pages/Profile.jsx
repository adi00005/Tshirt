// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import './Profile.css';

// Static guest user data since auth is removed
const guestUser = {
  name: 'Guest',
  email: ''
};

const Profile = () => {
  const user = guestUser;
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Address Information
    addresses: [
      {
        id: 1,
        type: 'home',
        isDefault: true,
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: ''
      }
    ],
    
    // Preferences
    preferredSize: '',
    favoriteColors: [],
    newsletter: true,
    smsUpdates: false,
    
    // Account Settings
    profilePicture: '',
    bio: '',
    
    // Privacy Settings
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user profile data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressChange = (index, field, value) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  const addNewAddress = () => {
    setProfileData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        id: Date.now(),
        type: 'other',
        isDefault: false,
        firstName: '',
        lastName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: ''
      }]
    }));
  };

  const removeAddress = (index) => {
    setProfileData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call to save profile data
      console.log('Saving profile data:', profileData);
      // await updateProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={profileData.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            name="lastName"
            value={profileData.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleInputChange}
            disabled={!isEditing}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={profileData.dateOfBirth}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        
        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>
      
      <div className="form-group full-width">
        <label>Bio</label>
        <textarea
          name="bio"
          value={profileData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          placeholder="Tell us about yourself..."
          rows="3"
        />
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="profile-section">
      <div className="section-header">
        <h3>Addresses</h3>
        {isEditing && (
          <button type="button" onClick={addNewAddress} className="btn-secondary">
            + Add New Address
          </button>
        )}
      </div>
      
      {profileData.addresses.map((address, index) => (
        <div key={address.id} className="address-card">
          <div className="address-header">
            <div className="address-type">
              <select
                value={address.type}
                onChange={(e) => handleAddressChange(index, 'type', e.target.value)}
                disabled={!isEditing}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
              {address.isDefault && <span className="default-badge">Default</span>}
            </div>
            {isEditing && profileData.addresses.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeAddress(index)}
                className="btn-danger-small"
              >
                Remove
              </button>
            )}
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={address.firstName}
                onChange={(e) => handleAddressChange(index, 'firstName', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={address.lastName}
                onChange={(e) => handleAddressChange(index, 'lastName', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label>Address Line 1 *</label>
              <input
                type="text"
                value={address.addressLine1}
                onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                disabled={!isEditing}
                placeholder="House/Flat No, Building Name, Street"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label>Address Line 2</label>
              <input
                type="text"
                value={address.addressLine2}
                onChange={(e) => handleAddressChange(index, 'addressLine2', e.target.value)}
                disabled={!isEditing}
                placeholder="Landmark, Area"
              />
            </div>
            
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <select
                value={address.state}
                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                disabled={!isEditing}
                required
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>PIN Code *</label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => handleAddressChange(index, 'pincode', e.target.value)}
                disabled={!isEditing}
                pattern="[0-9]{6}"
                maxLength="6"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => handleAddressChange(index, 'phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={address.isDefault}
                  onChange={(e) => {
                    // Set this as default and remove default from others
                    setProfileData(prev => ({
                      ...prev,
                      addresses: prev.addresses.map((addr, i) => ({
                        ...addr,
                        isDefault: i === index ? e.target.checked : false
                      }))
                    }));
                  }}
                />
                Set as default address
              </label>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPreferences = () => (
    <div className="profile-section">
      <h3>Shopping Preferences</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Preferred T-Shirt Size</label>
          <select
            name="preferredSize"
            value={profileData.preferredSize}
            onChange={handleInputChange}
            disabled={!isEditing}
          >
            <option value="">Select Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label>Favorite Colors</label>
        <div className="color-options">
          {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray'].map(color => (
            <label key={color} className="color-option">
              <input
                type="checkbox"
                checked={profileData.favoriteColors.includes(color)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setProfileData(prev => ({
                      ...prev,
                      favoriteColors: [...prev.favoriteColors, color]
                    }));
                  } else {
                    setProfileData(prev => ({
                      ...prev,
                      favoriteColors: prev.favoriteColors.filter(c => c !== color)
                    }));
                  }
                }}
                disabled={!isEditing}
              />
              <span className="color-swatch" style={{ backgroundColor: color.toLowerCase() }}></span>
              {color}
            </label>
          ))}
        </div>
      </div>
      
      <h4>Communication Preferences</h4>
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="newsletter"
            checked={profileData.newsletter}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          Subscribe to newsletter for latest offers and updates
        </label>
      </div>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="smsUpdates"
            checked={profileData.smsUpdates}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          Receive SMS updates for order status
        </label>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="profile-section">
      <h3>Privacy Settings</h3>
      
      <div className="form-group">
        <label>Profile Visibility</label>
        <select
          name="profileVisibility"
          value={profileData.profileVisibility}
          onChange={handleInputChange}
          disabled={!isEditing}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
          <option value="friends">Friends Only</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="showEmail"
            checked={profileData.showEmail}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          Show email address on public profile
        </label>
      </div>
      
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="showPhone"
            checked={profileData.showPhone}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
          Show phone number on public profile
        </label>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-basic-info">
            <h2>{profileData.firstName} {profileData.lastName}</h2>
            <p>@{user?.username}</p>
            <p>{profileData.email}</p>
          </div>
        </div>
        
        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-primary">
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Addresses
          </button>
          <button 
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
        </div>
        
        <div className="profile-tab-content">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'addresses' && renderAddresses()}
          {activeTab === 'preferences' && renderPreferences()}
          {activeTab === 'privacy' && renderPrivacy()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
