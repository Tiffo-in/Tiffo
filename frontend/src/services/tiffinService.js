import api from './api';

const getTiffins = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/tiffins?${queryString}`);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
};

const getTiffin = async (id) => {
  try {
    const response = await api.get(`/tiffins/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const createTiffin = async (tiffinData) => {
  try {
    const response = await api.post('/tiffins', tiffinData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const updateTiffin = async (id, tiffinData) => {
  try {
    // Validate ID format to prevent SSRF
    if (!id || typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id)) {
      throw new Error('Invalid tiffin ID format');
    }
    const response = await api.put(`/tiffins/${id}`, tiffinData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const deleteTiffin = async (id) => {
  try {
    const response = await api.delete(`/tiffins/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const tiffinService = {
  getTiffins,
  getTiffin,
  createTiffin,
  updateTiffin,
  deleteTiffin,
};

export default tiffinService;