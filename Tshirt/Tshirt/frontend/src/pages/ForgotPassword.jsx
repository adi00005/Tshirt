import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Choose method, 2: Enter details, 3: Verify, 4: Reset password
  const [method, setMethod] = useState(''); // 'email' or 'mobile'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4999";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(2);
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = method === 'email' 
        ? { email: formData.email, method: 'email' }
        : { mobile: formData.mobile, method: 'mobile' };

      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, payload);
      
      if (response.data.success) {
        setSuccess(`OTP sent to your ${method === 'email' ? 'email' : 'mobile number'}`);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to send OTP to ${method}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        otp: formData.otp,
        method,
        [method]: method === 'email' ? formData.email : formData.mobile
      };

      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, payload);
      
      if (response.data.success) {
        setSuccess('OTP verified successfully');
        setStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        newPassword: formData.newPassword,
        method,
        [method]: method === 'email' ? formData.email : formData.mobile,
        otp: formData.otp
      };

      const response = await axios.post(`${API_URL}/api/auth/reset-password`, payload);
      
      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="forgot-password-step">
      <h2>Reset Your Password</h2>
      <p>Choose how you'd like to reset your password:</p>
      
      <div className="method-selection">
        <button 
          className="method-btn email-btn"
          onClick={() => handleMethodSelect('email')}
        >
          <div className="method-icon">📧</div>
          <div className="method-text">
            <h3>Email Authentication</h3>
            <p>Reset via email verification</p>
          </div>
        </button>

        <button 
          className="method-btn mobile-btn"
          onClick={() => handleMethodSelect('mobile')}
        >
          <div className="method-icon">📱</div>
          <div className="method-text">
            <h3>Mobile Authentication</h3>
            <p>Reset via SMS verification</p>
          </div>
        </button>
      </div>

      <button 
        className="back-btn"
        onClick={() => navigate('/signin')}
      >
        Back to Login
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="forgot-password-step">
      <h2>{method === 'email' ? 'Email' : 'Mobile'} Verification</h2>
      <p>Enter your {method === 'email' ? 'email address' : 'mobile number'} to receive an OTP:</p>
      
      <form onSubmit={handleSendOTP}>
        {method === 'email' ? (
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        ) : (
          <div className="input-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading} className="send-otp-btn">
          {loading ? 'Sending...' : `Send OTP via ${method === 'email' ? 'Email' : 'SMS'}`}
        </button>

        <button 
          type="button"
          className="back-btn"
          onClick={() => setStep(1)}
        >
          Back
        </button>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="forgot-password-step">
      <h2>Enter Verification Code</h2>
      <p>Enter the OTP sent to your {method === 'email' ? 'email' : 'mobile number'}:</p>
      
      <form onSubmit={handleVerifyOTP}>
        <div className="input-group">
          <label>Verification Code</label>
          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleInputChange}
            maxLength="6"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading} className="verify-btn">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <button 
          type="button"
          className="resend-btn"
          onClick={handleSendOTP}
          disabled={loading}
        >
          Resend OTP
        </button>

        <button 
          type="button"
          className="back-btn"
          onClick={() => setStep(2)}
        >
          Back
        </button>
      </form>
    </div>
  );

  const renderStep4 = () => (
    <div className="forgot-password-step">
      <h2>Create New Password</h2>
      <p>Enter your new password:</p>
      
      <form onSubmit={handleResetPassword}>
        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleInputChange}
            minLength="6"
            required
          />
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            minLength="6"
            required
          />
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={loading} className="reset-btn">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>4</div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default ForgotPassword;
