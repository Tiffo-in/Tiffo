import React, { createContext, useContext, useEffect, useState } from 'react';

import { initSocket, disconnectSocket } from '../../../shared-mobile/src/services/socketService';
import authService, { AuthState, PartnerUser } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    const restore = async () => {
      try {
        const session = await authService.restoreSession();
        setState(session);
        if (session.isAuthenticated) {
          initSocket('partner_auth_token');
        }
      } catch {
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
    initSocket('partner_auth_token');
  };

  const logout = async () => {
    await authService.logout();
    setState({ user: null, token: null, isAuthenticated: false });
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
