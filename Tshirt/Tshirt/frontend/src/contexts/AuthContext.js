// src/contexts/AuthContext.js
import React, { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultUser = {
  name: 'Guest',
  email: '',
};

export const AuthProvider = ({ children }) => {
  const [user] = useState(defaultUser);

  const value = useMemo(() => ({
    user,
    loading: false,
    error: null,
    login: () => false,
    logout: () => true,
    isAuthenticated: false,
    isAdmin: false,
    setError: () => {}
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
