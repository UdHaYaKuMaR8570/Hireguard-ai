import api from './api';

/**
 * Auth Service communicating with Phase 2 AuthController endpoints:
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 */
const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export default authService;
