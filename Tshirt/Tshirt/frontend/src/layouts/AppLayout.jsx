import React from 'react';
import { Outlet } from 'react-router-dom';
import ModernNav from '../components/ModernNav';
import './AppLayout.css';

const AppLayout = () => {
  return (
    <div className="app-layout">
      <ModernNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
