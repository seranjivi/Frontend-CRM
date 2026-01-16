import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuthToken, getAuthUser, setAuthToken, setAuthUser, clearAuth } from '../utils/auth';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = getAuthToken();
    const savedUser = getAuthUser();
    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    setAuthToken(access_token);
    setAuthUser(userData);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, full_name, role) => {
    const response = await api.post('/auth/register', { email, password, full_name, role });
    return response.data;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};