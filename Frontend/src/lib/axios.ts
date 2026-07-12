import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    // Automatically map backend responses to a standard { data } envelope
    // so frontend components using `data.data` continue to work.
    if (response.data && response.data.success) {
      const { success, message, ...rest } = response.data;
      const keys = Object.keys(rest);
      
      const isComplexPayload = response.config.url?.includes('/dashboard') || 
                               response.config.url?.includes('/reports') ||
                               response.config.url?.includes('/audit-cycles');

      if (isComplexPayload) {
        // Return full object for dashboard, reports, and audit details endpoints
        response.data.data = rest;
      } else {
        // Automatically map backend responses to a standard { data } envelope
        // so frontend components using `data.data` continue to work.
        const arrayKey = keys.find(k => Array.isArray(rest[k]));
        if (arrayKey) {
          response.data.data = rest[arrayKey];
        } else if (keys.length === 1) {
          response.data.data = rest[keys[0]];
        } else {
          response.data.data = rest;
        }
      }
    }
    return response;
  },
  (error) => {
    // Handle global errors here (e.g. 401 Unauthorized -> redirect to login)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
