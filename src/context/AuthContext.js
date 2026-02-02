import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuthToken, getAuthUser, setAuthToken, setAuthUser, clearAuth } from '../utils/auth';
import api from '../utils/api';
import { toast } from 'sonner';

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
    try {
      const response = await api.post('/auth/login', { email, password });
      // Handle the nested response structure
      const { data } = response.data;
      const { token, user } = data || {};
      
      if (!token || !user) {
        throw new Error('Invalid response from server: Missing token or user data');
      }
      
      // Save token and user data
      setAuthToken(token);
      setAuthUser(user);
      setUser(user);
      
      return { token, user };
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
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