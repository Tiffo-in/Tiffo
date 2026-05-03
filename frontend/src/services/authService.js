import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  // Return response data for Redux — auth token is in httpOnly cookie
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  // Return response data for Redux — auth token is in httpOnly cookie
  return response.data;
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Logout errors are non-critical; server clears the httpOnly cookie
  }
  // Clear any legacy user data from localStorage
  localStorage.removeItem('user');
};

const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;