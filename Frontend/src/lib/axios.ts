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
      
      // If there's an obvious array (e.g. 'users', 'assets', 'departments')
      const arrayKey = keys.find(k => Array.isArray(rest[k]));
      if (arrayKey) {
        response.data.data = rest[arrayKey];
      } else if (keys.length === 1) {
        // Single object like 'user'
        response.data.data = rest[keys[0]];
      } else {
        // Multiple keys, like dashboard stats
        response.data.data = rest;
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
