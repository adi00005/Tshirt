import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        console.error('Unauthorized access - please log in');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Design API functions
export const designAPI = {
  // Save a new design
  saveDesign: async (designData) => {
    try {
      const response = await api.post('/designs', designData);
      return response.data;
    } catch (error) {
      console.error('Error saving design:', error);
      throw error;
    }
  },

  // Get a single design by ID
  getDesign: async (designId) => {
    try {
      const response = await api.get(`/designs/${designId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching design:', error);
      throw error;
    }
  },

  // Get all designs for the current user
  getMyDesigns: async (page = 1, limit = 10, sort = '-createdAt') => {
    try {
      const response = await api.get('/designs', {
        params: { page, limit, sort },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching designs:', error);
      throw error;
    }
  },

  // Update a design
  updateDesign: async (designId, designData) => {
    try {
      const response = await api.put(`/designs/${designId}`, designData);
      return response.data;
    } catch (error) {
      console.error('Error updating design:', error);
      throw error;
    }
  },

  // Delete a design
  deleteDesign: async (designId) => {
    try {
      const response = await api.delete(`/designs/${designId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting design:', error);
      throw error;
    }
  },

  // Get all public templates
  getTemplates: async (category = null, page = 1, limit = 12) => {
    try {
      const response = await api.get('/designs/templates', {
        params: { category, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Apply a template to create a new design
  applyTemplate: async (templateId) => {
    try {
      const response = await api.post(`/designs/apply-template/${templateId}`);
      return response.data;
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  },

  // Upload a design image
  uploadDesignImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/design', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading design image:', error);
      throw error;
    }
  },

  // Generate a thumbnail from design data
  generateThumbnail: async (designData) => {
    try {
      const response = await api.post('/designs/generate-thumbnail', { designData });
      return response.data;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  },
};

export default designAPI;
