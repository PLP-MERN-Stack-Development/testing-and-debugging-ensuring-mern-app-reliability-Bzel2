import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and adding auth headers
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', error);
    
    const message = error.response?.data?.message || 
                   error.message || 
                   'An unexpected error occurred';
    
    // Show error toast for user feedback
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Bug API functions
export const bugAPI = {
  // Get all bugs with optional filters
  getAllBugs: async (params = {}) => {
    const response = await api.get('/bugs', { params });
    return response.data;
  },

  // Get bug by ID
  getBugById: async (id) => {
    const response = await api.get(`/bugs/${id}`);
    return response.data;
  },

  // Create new bug
  createBug: async (bugData) => {
    const response = await api.post('/bugs', bugData);
    toast.success('Bug created successfully!');
    return response.data;
  },

  // Update bug
  updateBug: async (id, updateData) => {
    const response = await api.patch(`/bugs/${id}`, updateData);
    toast.success('Bug updated successfully!');
    return response.data;
  },

  // Delete bug
  deleteBug: async (id) => {
    const response = await api.delete(`/bugs/${id}`);
    toast.success('Bug deleted successfully!');
    return response.data;
  },

  // Get bug statistics
  getBugStats: async () => {
    const response = await api.get('/bugs/stats');
    return response.data;
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;
