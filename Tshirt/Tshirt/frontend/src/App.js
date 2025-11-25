import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { DesignProvider } from './contexts/DesignContext';

// Layouts
import AppLayout from './layouts/AppLayout';

// App Pages
import Homepage from './pages/homepage/homepage';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ProductDetails from "./pages/productdetails/productdetails";
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Categories from './pages/categories/Categories';
import Customize from './pages/Customize';
import DesignStudio from './pages/DesignStudio';
import DesignGallery from './pages/DesignGallery';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminInventory from './pages/admin/AdminInventory';
import AdminDesigns from './pages/admin/AdminDesigns';

// Styles
import './App.css';
import './styles/ModernNav.css';

// Main App Router
function AppRouter() {
  return (
    <Routes>
      {/* Auth Routes - No Layout */}
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Main App Layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/customize" element={<Customize />} />
        <Route path="/design-studio" element={<DesignStudio />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/designer" element={<DesignStudio />} />
        <Route path="/designer/:id" element={<DesignStudio />} />
        <Route path="/designs" element={<DesignGallery />} />
        <Route path="/shop" element={<Shop />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/designs" element={<AdminDesigns />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <CartProvider>
      <DesignProvider>
        <AppRouter />
      </DesignProvider>
    </CartProvider>
  );
}

export default App;
