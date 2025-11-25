// src/pages/MyOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MyOrders.css';
// Static guest user data since auth is removed
const guestUser = {
  name: 'Guest',
  email: ''
};

const MyOrders = () => {
  const user = guestUser;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Mock orders data - replace with API call
  const mockOrders = [
    {
      id: 'ORD-2024-001',
      orderNumber: 'TSH240001',
      orderDate: '2024-08-15T10:30:00Z',
      status: 'delivered',
      totalAmount: 4149,
      itemCount: 2,
      estimatedDelivery: '2024-08-18T18:00:00Z',
      actualDelivery: '2024-08-17T16:30:00Z',
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
      shippingAddress: {
        name: 'John Doe',
        addressLine1: '123 MG Road',
        addressLine2: 'Near City Mall',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91 9876543210'
      },
      items: [
        {
          id: 1,
          name: 'Athletic Performance Tee',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
          size: 'L',
          color: 'Black',
          quantity: 1,
          price: 4149,
          brand: 'ActiveFit'
        },
        {
          id: 2,
          name: 'Classic White T-Shirt',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          size: 'M',
          color: 'White',
          quantity: 1,
          price: 2074,
          brand: 'EcoWear'
        }
      ],
      tracking: {
        carrier: 'BlueDart',
        trackingNumber: 'BD123456789IN',
        currentStatus: 'Delivered',
        timeline: [
          { status: 'Order Placed', date: '2024-08-15T10:30:00Z', description: 'Your order has been confirmed' },
          { status: 'Payment Confirmed', date: '2024-08-15T10:35:00Z', description: 'Payment received successfully' },
          { status: 'Processing', date: '2024-08-15T14:00:00Z', description: 'Order is being prepared' },
          { status: 'Shipped', date: '2024-08-16T09:00:00Z', description: 'Package dispatched from warehouse' },
          { status: 'Out for Delivery', date: '2024-08-17T08:00:00Z', description: 'Package is out for delivery' },
          { status: 'Delivered', date: '2024-08-17T16:30:00Z', description: 'Package delivered successfully' }
        ]
      }
    },
    {
      id: 'ORD-2024-002',
      orderNumber: 'TSH240002',
      orderDate: '2024-08-14T15:45:00Z',
      status: 'shipped',
      totalAmount: 2904,
      itemCount: 1,
      estimatedDelivery: '2024-08-19T18:00:00Z',
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      shippingAddress: {
        name: 'John Doe',
        addressLine1: '123 MG Road',
        addressLine2: 'Near City Mall',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91 9876543210'
      },
      items: [
        {
          id: 3,
          name: 'Striped Long Sleeve Tee',
          image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500',
          size: 'L',
          color: 'Navy/White',
          quantity: 1,
          price: 2904,
          brand: 'ComfortWear'
        }
      ],
      tracking: {
        carrier: 'FedEx',
        trackingNumber: 'FX987654321IN',
        currentStatus: 'In Transit',
        timeline: [
          { status: 'Order Placed', date: '2024-08-14T15:45:00Z', description: 'Your order has been confirmed' },
          { status: 'Payment Confirmed', date: '2024-08-14T15:50:00Z', description: 'Payment received successfully' },
          { status: 'Processing', date: '2024-08-15T10:00:00Z', description: 'Order is being prepared' },
          { status: 'Shipped', date: '2024-08-16T11:00:00Z', description: 'Package dispatched from warehouse' }
        ]
      }
    },
    {
      id: 'ORD-2024-003',
      orderNumber: 'TSH240003',
      orderDate: '2024-08-13T12:20:00Z',
      status: 'processing',
      totalAmount: 3319,
      itemCount: 1,
      estimatedDelivery: '2024-08-20T18:00:00Z',
      paymentMethod: 'Net Banking',
      paymentStatus: 'paid',
      shippingAddress: {
        name: 'John Doe',
        addressLine1: '123 MG Road',
        addressLine2: 'Near City Mall',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        phone: '+91 9876543210'
      },
      items: [
        {
          id: 4,
          name: 'Navy Blue Polo Shirt',
          image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500',
          size: 'M',
          color: 'Navy',
          quantity: 1,
          price: 3319,
          brand: 'ClassicFit'
        }
      ],
      tracking: {
        carrier: 'Delhivery',
        trackingNumber: 'DL456789123IN',
        currentStatus: 'Processing',
        timeline: [
          { status: 'Order Placed', date: '2024-08-13T12:20:00Z', description: 'Your order has been confirmed' },
          { status: 'Payment Confirmed', date: '2024-08-13T12:25:00Z', description: 'Payment received successfully' },
          { status: 'Processing', date: '2024-08-14T09:00:00Z', description: 'Order is being prepared' }
        ]
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, [mockOrders]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'processing': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545',
      'returned': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌',
      'returned': '↩️'
    };
    return icons[status] || '📦';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card">
      <div className="order-header">
        <div className="order-info">
          <h3>Order #{order.orderNumber}</h3>
          <p className="order-date">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <div className="order-status">
          <span 
            className="status-badge" 
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {getStatusIcon(order.status)} {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="order-content">
        <div className="order-items">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="order-item-preview">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>Size: {item.size} | Color: {item.color}</p>
                <p>Qty: {item.quantity} | {formatPrice(item.price)}</p>
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <div className="more-items">
              +{order.items.length - 2} more items
            </div>
          )}
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Total Items:</span>
            <span>{order.itemCount}</span>
          </div>
          <div className="summary-row">
            <span>Payment:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="order-actions">
        <button 
          onClick={() => openOrderDetails(order)}
          className="btn-primary"
        >
          View Details
        </button>
        {order.status === 'delivered' && (
          <button className="btn-secondary">
            Rate & Review
          </button>
        )}
        {order.status === 'shipped' && (
          <button className="btn-secondary">
            Track Package
          </button>
        )}
        {(order.status === 'pending' || order.status === 'processing') && (
          <button className="btn-danger">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <div className="order-details-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Order Details - #{selectedOrder.orderNumber}</h2>
            <button onClick={closeOrderDetails} className="close-btn">×</button>
          </div>

          <div className="modal-body">
            <div className="details-section">
              <h3>Order Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Order Date:</label>
                  <span>{formatDate(selectedOrder.orderDate)}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(selectedOrder.status) }}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div className="info-item">
                  <label>Payment Method:</label>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
                <div className="info-item">
                  <label>Payment Status:</label>
                  <span className="payment-status paid">PAID</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Shipping Address</h3>
              <div className="address-details">
                <p><strong>{selectedOrder.shippingAddress.name}</strong></p>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <p>{selectedOrder.shippingAddress.addressLine2}</p>
                )}
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                <p>Phone: {selectedOrder.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="details-section">
              <h3>Items Ordered</h3>
              <div className="items-list">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="item-detail">
                    <img src={item.image} alt={item.name} className="item-image-large" />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Brand: {item.brand}</p>
                      <p>Size: {item.size} | Color: {item.color}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p className="item-price">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-section">
              <h3>Order Tracking</h3>
              <div className="tracking-info">
                <p><strong>Carrier:</strong> {selectedOrder.tracking.carrier}</p>
                <p><strong>Tracking Number:</strong> {selectedOrder.tracking.trackingNumber}</p>
                <p><strong>Current Status:</strong> {selectedOrder.tracking.currentStatus}</p>
              </div>
              
              <div className="tracking-timeline">
                {selectedOrder.tracking.timeline.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>{event.status}</h4>
                      <p>{event.description}</p>
                      <span className="timeline-date">{formatDate(event.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="details-section">
              <h3>Order Summary</h3>
              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(selectedOrder.totalAmount - 99)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>₹99</span>
                </div>
                <div className="total-row">
                  <span>Tax:</span>
                  <span>Included</span>
                </div>
                <div className="total-row final-total">
                  <span>Total:</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your T-shirt orders</p>
      </div>

      <div className="orders-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          Processing ({orders.filter(o => o.status === 'processing').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilter('shipped')}
        >
          Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          Delivered ({orders.filter(o => o.status === 'delivered').length})
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet.</p>
            <Link to="/homepage" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {showOrderDetails && renderOrderDetails()}
    </div>
  );
};

export default MyOrders;
