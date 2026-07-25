import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Always the live API, in dev as well as in release builds. To work against a
// local backend, temporarily change BASE_URL to `http://<your-lan-ip>:<port>`
// and revert before committing.
const BASE_URL = 'https://api.tiffo.in';

const API_URL = `${BASE_URL}/api`;

export const createApi = (tokenKey: string, userKey: string) => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  // Request interceptor: attach the JWT token from storage on every request
  api.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem(tokenKey);
      if (token) {
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          if (!config.headers) config.headers = {} as any;
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle global 401 (token expired) and network errors
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem(tokenKey);
        await AsyncStorage.removeItem(userKey);
      }
      if (!error.response) {
        error.message = 'Network error. Please check your internet connection and try again.';
      }
      return Promise.reject(error);
    }
  );

  return api;
};
