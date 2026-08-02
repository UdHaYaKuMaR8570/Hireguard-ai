import api from './api';

/**
 * Admin Service — API calls for /api/admin/** endpoints (ADMIN role required).
 * Used exclusively by the AdminDashboard page.
 */
const adminService = {
  /**
   * Fetches platform-wide aggregate statistics.
   * GET /api/admin/stats
   */
  getPlatformStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  /**
   * Fetches all indexed employer company documents.
   * GET /api/admin/companies
   */
  getAllCompanies: async () => {
    const response = await api.get('/api/admin/companies');
    return response.data;
  },

  /**
   * Fetches all submitted complaint reports.
   * GET /api/admin/complaints
   */
  getAllComplaints: async () => {
    const response = await api.get('/api/admin/complaints');
    return response.data;
  },
};

export default adminService;
