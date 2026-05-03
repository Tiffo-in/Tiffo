import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { AuthState, User } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

import { initSocket, disconnectSocket } from '../../../shared-mobile/src/services/socketService';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  // Restore session from AsyncStorage on app launch
  useEffect(() => {
    // Safety timeout: if AsyncStorage hangs for any reason, unlock the app after 3s
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const restore = async () => {
      try {
        const session = await authService.restoreSession();
        setState(session);
        if (session.isAuthenticated) {
          initSocket('auth_token');
        }
      } catch (err) {
        // If session restore fails for any reason, default to logged-out state
        setState({ user: null, token: null, isAuthenticated: false });
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password);
    setState({ user, token, isAuthenticated: true });
    initSocket('auth_token');
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    const { user, token } = await authService.register(name, email, password, phone);
    setState({ user, token, isAuthenticated: true });
    initSocket('auth_token');
  };

  const logout = async () => {
    await authService.logout();
    setState({ user: null, token: null, isAuthenticated: false });
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
