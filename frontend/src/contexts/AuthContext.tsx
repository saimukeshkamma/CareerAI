import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  demoLogin: (userId?: number) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (googleData: { credential?: string; email?: string; name?: string; picture?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocal: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('careerai_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (token) {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
      }
    } catch (err) {
      console.error("Failed to load authenticated user:", err);
      // If token invalid, clear
      localStorage.removeItem('careerai_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('careerai_token', data.access_token);
      setToken(data.access_token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (userId: number = 1) => {
    setIsLoading(true);
    try {
      const data = await authApi.demoLogin(userId);
      localStorage.setItem('careerai_token', data.access_token);
      setToken(data.access_token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(userData);
      localStorage.setItem('careerai_token', data.access_token);
      setToken(data.access_token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleData: { credential?: string; email?: string; name?: string; picture?: string }) => {
    setIsLoading(true);
    try {
      const data = await authApi.googleAuth(googleData);
      localStorage.setItem('careerai_token', data.access_token);
      setToken(data.access_token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('careerai_token');
    setToken(null);
    setUser(null);
  };

  const updateUserLocal = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        demoLogin,
        register,
        googleLogin,
        logout,
        refreshUser,
        updateUserLocal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
