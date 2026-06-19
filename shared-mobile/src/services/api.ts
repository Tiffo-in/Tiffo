import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// In development, automatically point to the host machine's IP running Metro
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5005`;
  }
  
  return 'https://api.tiffo.in';
};

const API_URL = `${getBaseUrl()}/api`; 

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
