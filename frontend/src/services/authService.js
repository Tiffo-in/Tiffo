import api from './api';

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data.success) {
    // Sanitize user data before storing to prevent XSS
    const sanitizedUser = {
      ...response.data.user,
      name: response.data.user.name?.replace(/[<>"']/g, ''),
      email: response.data.user.email?.replace(/[<>"']/g, '')
    };
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
  }
  
  return response.data;
};

const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  
  if (response.data.success) {
    // Sanitize user data before storing to prevent XSS
    const sanitizedUser = {
      ...response.data.user,
      name: response.data.user.name?.replace(/[<>"']/g, ''),
      email: response.data.user.email?.replace(/[<>"']/g, '')
    };
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
  }
  
  return response.data;
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error UI side', err);
  }
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