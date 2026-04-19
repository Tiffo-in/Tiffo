import api from './api';

export const customerService = {
  // Get all customers for a partner
  getPartnerCustomers: async () => {
    try {
      const response = await api.get('/partner/customers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer delivery calendar
  getCustomerCalendar: async (customerId, month, year) => {
    try {
      const response = await api.get(`/partner/customers/${customerId}/calendar`, {
        params: { month, year }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update delivery status
  updateDeliveryStatus: async (deliveryId, status) => {
    try {
      const response = await api.patch(`/deliveries/${deliveryId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get customer subscription details
  getCustomerSubscription: async (customerId) => {
    try {
      const response = await api.get(`/partner/customers/${customerId}/subscription`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default customerService;