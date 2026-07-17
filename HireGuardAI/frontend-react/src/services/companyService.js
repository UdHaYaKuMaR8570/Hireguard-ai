import api from './api';

/**
 * Company and Complaint Service communicating with Phase 2 REST Controllers:
 * CompanyController (`/api/company/*`), ComplaintController (`/api/complaints*`), and TrustScoreController.
 */
const companyService = {
  verifyCompany: async (verifyData) => {
    const response = await api.post('/api/company/verify', verifyData);
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await api.get(`/api/company/${id}`);
    return response.data;
  },

  searchCompanies: async (name = '') => {
    const response = await api.get(`/api/company/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  submitComplaint: async (complaintData) => {
    const response = await api.post('/api/complaints', complaintData);
    return response.data;
  },

  getCompanyComplaints: async (companyId) => {
    const response = await api.get(`/api/company/${companyId}/complaints`);
    return response.data;
  },

  getComplaintById: async (complaintId) => {
    const response = await api.get(`/api/complaints/${complaintId}`);
    return response.data;
  },

  getCompanyTrustScore: async (companyId) => {
    const response = await api.get(`/api/company/${companyId}/trust-score`);
    return response.data;
  },
};

export default companyService;
