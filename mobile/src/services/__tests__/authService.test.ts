import AsyncStorage from '@react-native-async-storage/async-storage';

import authService from '../authService';
import api from '../api';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('authService', () => {
  afterEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('login', () => {
    it('stores token and user on success', async () => {
      const user = { _id: 'u1', name: 'Priya', email: 'p@t.in', role: 'user', isVerified: true };
      mockedApi.post.mockResolvedValue({ data: { success: true, token: 'jwt-1', user } });

      const result = await authService.login('p@t.in', 'password123');

      expect(result.token).toBe('jwt-1');
      expect(await AsyncStorage.getItem('auth_token')).toBe('jwt-1');
      expect(JSON.parse((await AsyncStorage.getItem('auth_user')) as string).email).toBe('p@t.in');
    });
  });

  describe('register', () => {
    // Regression: the backend requires email verification and returns NO
    // token/user on register. The old code tried to store `undefined` as the
    // token, which threw and made every successful signup look like a failure.
    it('returns the server message and stores no credentials', async () => {
      mockedApi.post.mockResolvedValue({
        data: { success: true, message: 'Registration successful! Please verify your email.' },
      });

      const result = await authService.register('Priya', 'p@t.in', 'password123', '9876543210');

      expect(result.message).toContain('Registration successful');
      expect(await AsyncStorage.getItem('auth_token')).toBeNull();
      expect(await AsyncStorage.getItem('auth_user')).toBeNull();
    });

    it('falls back to a default message when the server sends none', async () => {
      mockedApi.post.mockResolvedValue({ data: { success: true } });

      const result = await authService.register('Priya', 'p@t.in', 'password123', '9876543210');

      expect(result.message).toMatch(/verify your account/i);
    });
  });

  describe('restoreSession', () => {
    it('returns an authenticated state when credentials exist', async () => {
      await AsyncStorage.setItem('auth_token', 'jwt-2');
      await AsyncStorage.setItem('auth_user', JSON.stringify({ _id: 'u2', name: 'R' }));

      const session = await authService.restoreSession();

      expect(session.isAuthenticated).toBe(true);
      expect(session.token).toBe('jwt-2');
    });

    it('returns a logged-out state when storage is empty', async () => {
      const session = await authService.restoreSession();

      expect(session).toEqual({ token: null, user: null, isAuthenticated: false });
    });
  });

  describe('logout', () => {
    it('clears stored credentials even if the server call fails', async () => {
      await AsyncStorage.setItem('auth_token', 'jwt-3');
      await AsyncStorage.setItem('auth_user', '{}');
      mockedApi.post.mockRejectedValue(new Error('network down'));

      await authService.logout();

      expect(await AsyncStorage.getItem('auth_token')).toBeNull();
      expect(await AsyncStorage.getItem('auth_user')).toBeNull();
    });
  });
});
