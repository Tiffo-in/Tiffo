import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In development, this is your Mac's IP when testing on a physical device.
const API_URL = 'https://api.tiffo.in/api'; 

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
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle global 401 (token expired)
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem(tokenKey);
        await AsyncStorage.removeItem(userKey);
      }
      return Promise.reject(error);
    }
  );

  return api;
};
