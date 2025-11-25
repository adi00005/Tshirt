import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.data);
        setNewStatus(data.data.status);
        setTrackingNumber(data.data.trackingNumber || '');
      } else {
        setError('Failed to fetch order details');
      }
    } catch (error) {
      setError('Error fetching order: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id, fetchOrder]);

  const updateOrderStatus = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingNumber || undefined
        })
      });

      if (response.ok) {
        await fetchOrder(); // Refresh order data
        setShowStatusModal(false);
      } else {
        setError('Failed to update order status');
      }
    } catch (error) {
      setError('Error updating order: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      confirmed: '#27ae60',
      processing: '#3498db',
      shipped: '#9b59b6',
      delivered: '#2ecc71',
      cancelled: '#e74c3c',
      refunded: '#95a5a6'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
      refunded: '💰'
    };
    return icons[status] || '📋';
  };

  const getStatusTimeline = () => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(order?.status);
    
    return statuses.map((status, index) => ({
      status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      icon: getStatusIcon(status),
      completed: index <= currentIndex,
      active: index === currentIndex,
      color: getStatusColor(status)
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <span>Loading order details...</span>
      </div>
    );
  }
  
  if (error) return <div className="admin-error">{error}</div>;
  if (!order) return <div className="admin-error">Order not found</div>;

  const timeline = getStatusTimeline();

  return (
    <div className="admin-order-detail">
      <div className="order-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/admin/orders')} className="back-button">
              <span className="back-icon">←</span>
              Back to Orders
            </button>
            <div className="order-title">
              <h1>Order #{order.orderId}</h1>
              <div className="order-meta">
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowStatusModal(true)}
              className="update-status-btn"
            >
              <span className="btn-icon">⚡</span>
              Update Status
            </button>
          </div>
        </div>
      </div>

      <div className="order-content">
        {/* Status Timeline */}
        <div className="status-timeline-card">
          <h3>Order Progress</h3>
          <div className="status-timeline">
            {timeline.map((step, index) => (
              <div key={step.status} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                <div className="step-connector" style={{ display: index === 0 ? 'none' : 'block' }}></div>
                <div 
                  className="step-icon"
                  style={{ backgroundColor: step.completed ? step.color : '#e0e0e0' }}
                >
                  {step.icon}
                </div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="order-summary-grid">
          <div className="summary-card total-amount">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h4>Total Amount</h4>
              <div className="amount-value">{formatCurrency(order.totalAmount)}</div>
            </div>
          </div>
          
          <div className="summary-card payment-info">
            <div className="card-icon">💳</div>
            <div className="card-content">
              <h4>Payment</h4>
              <div className="payment-method">{order.paymentInfo?.method?.toUpperCase()}</div>
              <div className={`payment-status ${order.paymentInfo?.paymentStatus}`}>
                {order.paymentInfo?.paymentStatus?.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="summary-card items-count">
            <div className="card-icon">📦</div>
            <div className="card-content">
              <h4>Items</h4>
              <div className="items-value">{(order?.items || []).length} Products</div>
            </div>
          </div>
          
          {order.trackingNumber && (
            <div className="summary-card tracking-info">
              <div className="card-icon">🚚</div>
              <div className="card-content">
                <h4>Tracking</h4>
                <div className="tracking-number">{order.trackingNumber}</div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Information Grid */}
        <div className="order-info-grid">
          <div className="info-card customer-info">
            <div className="card-header">
              <h3><span className="header-icon">👤</span> Customer Information</h3>
            </div>
            <div className="card-body">
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{order.customerInfo?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value email">{order.customerInfo?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{order.customerInfo?.phone}</span>
              </div>
            </div>
          </div>

          <div className="info-card shipping-info">
            <div className="card-header">
              <h3><span className="header-icon">📍</span> Shipping Address</h3>
            </div>
            <div className="card-body">
              <div className="address-block">
                <div className="address-line">{order.shippingAddress?.street}</div>
                <div className="address-line">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </div>
                <div className="address-line country">{order.shippingAddress?.country}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <div className="card-header">
            <h3><span className="header-icon">🛍️</span> Order Items</h3>
          </div>
          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Specifications</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order?.items || []).map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-cell">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="product-image" />
                        )}
                        <div className="product-name">{item.name}</div>
                      </div>
                    </td>
                    <td><span className="sku-code">{item.sku}</span></td>
                    <td>
                      <div className="specifications">
                        <span className="spec-item">Size: {item.size}</span>
                        <span className="spec-item">Color: {item.color}</span>
                      </div>
                    </td>
                    <td><span className="quantity-badge">{item.quantity}</span></td>
                    <td><span className="price">{formatCurrency(item.price)}</span></td>
                    <td><span className="total-price">{formatCurrency(item.price * item.quantity)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="status-modal">
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button 
                className="close-modal"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>New Status:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="processing">⚙️ Processing</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">📦 Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                  <option value="refunded">💰 Refunded</option>
                </select>
              </div>
              
              {(newStatus === 'shipped' || newStatus === 'delivered') && (
                <div className="form-group">
                  <label>Tracking Number:</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="tracking-input"
                  />
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowStatusModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={updateOrderStatus}
                disabled={updating}
                className="btn-primary"
              >
                {updating ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;
