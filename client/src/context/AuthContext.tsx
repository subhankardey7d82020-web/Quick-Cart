import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('qc_token'));
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('qc_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getProfile();
      if (data && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('qc_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      localStorage.removeItem('qc_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('qc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success(`Welcome back, ${data.user.name}`);
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const data = await api.adminLogin({ email, password });
      localStorage.setItem('qc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success('Admin authenticated successfully.');
    } catch (err: any) {
      error(err.message || 'Admin authentication failed.');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const data = await api.register({ name, email, password, phone });
      localStorage.setItem('qc_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success('Account created! Welcome to Quick Cart Atelier.');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('qc_token');
    setToken(null);
    setUser(null);
    success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
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
