import api from './api';

const getSubscriptions = async () => {
  const response = await api.get('/subscriptions');
  return response.data;
};

const getSubscription = async (id) => {
  // Validate ID format to prevent SSRF
  if (!id || typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) {
    throw new Error('Invalid subscription ID format');
  }
  const response = await api.get(`/subscriptions/${id}`);
  return response.data;
};

const getSubscriptionDetails = async (id) => {
  // Validate ID format to prevent SSRF
  if (!id || typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) {
    throw new Error('Invalid subscription ID format');
  }
  const response = await api.get(`/subscriptions/${id}`);
  return response.data;
};

const getOrderHistory = async () => {
  const response = await api.get('/subscriptions/history');
  return response.data;
};

const createSubscription = async (subscriptionData) => {
  const response = await api.post('/subscriptions', subscriptionData);
  return response.data;
};

const updateSubscription = async (id, subscriptionData) => {
  // Validate ID format to prevent SSRF
  if (!id || typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) {
    throw new Error('Invalid subscription ID format');
  }
  const response = await api.put(`/subscriptions/${id}`, subscriptionData);
  return response.data;
};

const cancelSubscription = async (id) => {
  // Validate ID format to prevent SSRF
  if (!id || typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) {
    throw new Error('Invalid subscription ID format');
  }
  const response = await api.patch(`/subscriptions/${id}/cancel`);
  return response.data;
};

const subscriptionService = {
  getSubscriptions,
  getSubscription,
  getSubscriptionDetails,
  getOrderHistory,
  createSubscription,
  updateSubscription,
  cancelSubscription,
};

export default subscriptionService;