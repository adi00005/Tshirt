import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
// Static guest user data since auth is removed
const guestUser = {
  name: 'Guest',
  email: ''
};

const AdminDashboard = () => {
  const user = guestUser;
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      };

      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`, config),
        axios.get(`${API_URL}/api/admin/users`, config)
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      setError('Failed to fetch admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(`${API_URL}/api/admin/users/${userId}`, 
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>Welcome, {user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p className="stat-number">{stats.activeUsers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Admins</h3>
              <p className="stat-number">{stats.totalAdmins || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Inactive Users</h3>
              <p className="stat-number">{stats.inactiveUsers || 0}</p>
            </div>
          </div>

          <div className="recent-users">
            <h3>Recent Users</h3>
            <div className="users-list">
              {stats.recentUsers?.map(user => (
                <div key={user._id} className="user-item">
                  <span className="user-name">{user.username}</span>
                  <span className="user-email">{user.email}</span>
                  <span className={`user-role ${user.role}`}>{user.role}</span>
                  <span className="user-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <div className="users-header">
            <h3>All Users ({users.length})</h3>
          </div>
          
          <div className="users-table">
            <div className="table-header">
              <span>Username</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
              <span>Actions</span>
            </div>
            
            {users.map(user => (
              <div key={user._id} className="table-row">
                <span className="user-username">{user.username}</span>
                <span className="user-email">{user.email}</span>
                <span className={`user-role ${user.role}`}>{user.role}</span>
                <span className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="user-created">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <div className="user-actions">
                  <button 
                    onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                    className={`toggle-btn ${user.isActive ? 'deactivate' : 'activate'}`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
