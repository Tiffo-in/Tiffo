import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'partner' | 'admin';
  isVerified: boolean;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const authService = {
  /**
   * Login with email and password. Stores token in AsyncStorage.
   */
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    return { user, token };
  },

  /**
   * Register new account.
   */
  register: async (name: string, email: string, password: string, phone: string) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    const { token, user } = res.data;
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    return { user, token };
  },

  /**
   * Logout: remove all local credentials.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Ignore server errors on logout
    } finally {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_user');
    }
  },

  /**
   * Restore session from AsyncStorage on app launch.
   */
  restoreSession: async (): Promise<AuthState> => {
    const token = await AsyncStorage.getItem('auth_token');
    const userStr = await AsyncStorage.getItem('auth_user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr), isAuthenticated: true };
    }
    return { token: null, user: null, isAuthenticated: false };
  },

  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
};

export default authService;
