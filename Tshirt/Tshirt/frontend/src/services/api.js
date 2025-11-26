import axios from 'axios';
import { getAuthToken } from '../utils/auth';

// Change this line:
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// To this:
// Change this:
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// To this:
const API_URL = 'https://tshirt-backend-nm5u.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
