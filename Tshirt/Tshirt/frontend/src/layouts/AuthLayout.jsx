import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  const location = useLocation();
  const isSignIn = location.pathname === '/signin';
  const isSignUp = location.pathname === '/signup';
  const isForgotPassword = location.pathname === '/forgot-password';

  const getHeaderText = () => {
    if (isSignIn) return 'Sign in to your account';
    if (isSignUp) return 'Create your account';
    if (isForgotPassword) return 'Reset your password';
    return 'Welcome to T-Shirt Store';
  };

  const getSubheaderText = () => {
    if (isSignIn) return 'Enter your credentials to access your account';
    if (isSignUp) return 'Join T-Shirt Store today';
    if (isForgotPassword) return 'Enter your email to receive a password reset link';
    return 'Create your account or sign in to continue';
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">T-Shirt Store</Link>
            <h2>{getHeaderText()}</h2>
            <p>{getSubheaderText()}</p>
          </div>
          <div className="auth-content">
            {children}
          </div>
          <div className="auth-footer">
            {isSignIn ? (
              <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
            ) : isSignUp ? (
              <p>Already have an account? <Link to="/signin" className="auth-link">Sign in</Link></p>
            ) : isForgotPassword ? (
              <p>Remember your password? <Link to="/signin" className="auth-link">Sign in</Link></p>
            ) : (
              <p>Already have an account? <Link to="/signin" className="auth-link">Sign in</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
