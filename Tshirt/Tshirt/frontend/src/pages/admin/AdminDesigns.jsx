import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDesigns.css';

const AdminDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approveModal, setApproveModal] = useState({ show: false, design: null });
  const [formData, setFormData] = useState({
    price: '',
    category: 'unisex',
    stock: '50'
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('http://localhost:4999/api/admin/designs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch designs');
      }

      const data = await response.json();
      setDesigns(data.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDesign = (design) => {
    setApproveModal({ show: true, design });
    setFormData({
      price: '1499',
      category: 'unisex',
      stock: '50'
    });
  };

  const handleApproveSubmit = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:4999/api/admin/designs/${approveModal.design._id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Design approved and converted to product!');
        setApproveModal({ show: false, design: null });
        fetchDesigns(); // Refresh the list
      } else {
        alert('Failed to approve design. Please try again.');
      }
    } catch (error) {
      console.error('Error approving design:', error);
      alert('Error approving design. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && designs.length === 0) {
    return (
      <div className="admin-designs">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading customer designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-designs">
      <div className="designs-header">
        <div className="header-content">
          <h1>Customer Designs</h1>
          <p>Review and approve customer-submitted designs</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="designs-grid">
        {designs.length === 0 ? (
          <div className="empty-state">
            <h3>No Customer Designs</h3>
            <p>Customers haven't submitted any designs yet.</p>
          </div>
        ) : (
          designs.map((design) => (
            <div key={design._id} className="design-card">
              <div className="design-image">
                <img 
                  src={design.thumbnail || '/api/placeholder/200/200'} 
                  alt={design.name}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/200/200';
                  }}
                />
                <div className="design-badge">Customer Design</div>
              </div>
              <div className="design-info">
                <h3>{design.name}</h3>
                <p className="design-description">{design.description}</p>
                <div className="design-meta">
                  <span className="designer">By: {design.user?.name || 'Anonymous'}</span>
                  <span className="date">{formatDate(design.createdAt)}</span>
                </div>
                <div className="design-details">
                  <span className="email">{design.user?.email}</span>
                </div>
              </div>
              <div className="design-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleApproveDesign(design)}
                >
                  Approve & Add to Store
                </button>
                <button className="btn btn-secondary">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approve Modal */}
      {approveModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Approve Design & Add to Store</h2>
              <button 
                className="close-btn"
                onClick={() => setApproveModal({ show: false, design: null })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="design-preview">
                <img 
                  src={approveModal.design.thumbnail || '/api/placeholder/200/200'} 
                  alt={approveModal.design.name}
                />
                <div className="design-info">
                  <h3>{approveModal.design.name}</h3>
                  <p>{approveModal.design.description}</p>
                  <p><strong>Designer:</strong> {approveModal.design.user?.name}</p>
                </div>
              </div>
              <div className="form-group">
                <label>Price (₹):</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="1499"
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stock Quantity:</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setApproveModal({ show: false, design: null })}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleApproveSubmit}
              >
                Approve & Create Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDesigns;
