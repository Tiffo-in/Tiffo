import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We no longer manually inject Authorization Bearer from localStorage.
// The browser will automatically attach HttpOnly cookies to the request 
// due to withCredentials: true.
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user'); // only clear user UX, cookies are handled by backend
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;