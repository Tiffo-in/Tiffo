import api from './api';

export const partnerService = {
  // Get partner profile
  getProfile: async () => {
    try {
      const response = await api.get('/partner/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update partner profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/partner/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all customers
  getCustomers: async () => {
    try {
      const response = await api.get('/partner/customers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer details
  getCustomerDetails: async (customerId) => {
    try {
      const response = await api.get(`/partner/customers/${customerId}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default partnerService;