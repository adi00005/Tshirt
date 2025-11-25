import React from 'react';
import { Outlet } from 'react-router-dom';
import ModernNav from '../components/ModernNav';
import './AdminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <ModernNav />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
