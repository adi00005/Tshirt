// Get authentication token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token') || null;
};

// Set authentication token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  // In a real app, you might want to verify the token's expiration
  return !!token;
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('token');
  // Clear any other auth-related data
  localStorage.removeItem('userInfo');
};

// Get user info from localStorage
export const getUserInfo = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

// Set user info in localStorage
export const setUserInfo = (userInfo) => {
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  } else {
    localStorage.removeItem('userInfo');
  }
};
