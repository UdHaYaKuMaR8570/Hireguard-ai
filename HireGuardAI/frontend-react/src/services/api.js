import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

/**
 * Centralized Axios instance with automatic JWT interceptors and error handling.
 * Rule: Centralize all API calls in services/ — no direct axios calls inside components/pages.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory token reference synced from AuthContext
let inMemoryToken = null;

export const setApiToken = (token) => {
  inMemoryToken = token;
};

// Request Interceptor: Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    // Check in-memory token first, fallback to sessionStorage if needed for current session stability
    const token = inMemoryToken || sessionStorage.getItem('hireguard_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized by redirecting to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      inMemoryToken = null;
      sessionStorage.removeItem('hireguard_jwt');
      sessionStorage.removeItem('hireguard_user');
      // Only redirect if not already on login/register to prevent loops
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
