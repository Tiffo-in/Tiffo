import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PartnerUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'partner';
  businessName?: string;
}

export interface AuthState {
  user: PartnerUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const authService = {
  login: async (email: string, password: string): Promise<{ user: PartnerUser; token: string }> => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    if (user.role !== 'partner') {
      throw new Error('This app is for Tiffo kitchen partners only.');
    }
    await AsyncStorage.setItem('partner_auth_token', token);
    await AsyncStorage.setItem('partner_auth_user', JSON.stringify(user));
    return { user, token };
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    await AsyncStorage.removeItem('partner_auth_token');
    await AsyncStorage.removeItem('partner_auth_user');
  },

  restoreSession: async (): Promise<AuthState> => {
    const token = await AsyncStorage.getItem('partner_auth_token');
    const userStr = await AsyncStorage.getItem('partner_auth_user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr), isAuthenticated: true };
    }
    return { token: null, user: null, isAuthenticated: false };
  },
};

export default authService;
