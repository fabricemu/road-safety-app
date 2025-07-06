import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiService from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  preferred_language: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  preferred_language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Fetch current user
          const response = await apiService.getCurrentUser();
          setUser(response);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      const { access_token } = response;
      
      // Store token
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Fetch user data
      const userResponse = await apiService.getCurrentUser();
      setUser(userResponse);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiService.register(userData);
      setUser(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.is_admin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 