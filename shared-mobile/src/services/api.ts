import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

declare const __DEV__: boolean;

// In development, automatically point to the host machine's IP running Metro
// (its hostUri is the dev machine's LAN address, where the local backend on
// :5001 is reachable). Production builds always use the live API.
const getBaseUrl = () => {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(':')[0];
    if (host) return `http://${host}:5001`;
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
