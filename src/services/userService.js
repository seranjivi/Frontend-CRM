// src/services/userService.js
import api from '../utils/api';

// Fetch all users
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get single user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    const userData = response.data;
    
    // Ensure we have a proper response structure
    if (!userData) {
      throw new Error('No user data received from server');
    }

    // Log the raw response for debugging

    // Return the user data in a consistent format
    return {
      ...userData,
      // Ensure these fields exist with defaults if not present
      id: userData.id || userId,
      full_name: userData.full_name || userData.name || '',
      email: userData.email || '',
      role: userData.role || (userData.roles && userData.roles[0]?.id) || '',
      role_id: userData.role_id || (userData.roles && userData.roles[0]?.id) || '',
      role_name: userData.role_name || (userData.roles && userData.roles[0]?.name) || '',
      status: (userData.status || 'active').toLowerCase(),
      regions: userData.regions || userData.assigned_regions || [],
      assigned_regions: userData.assigned_regions || userData.regions || []
    };
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    // Enhance the error with more context
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user';
    const enhancedError = new Error(errorMessage);
    enhancedError.status = error.response?.status;
    throw enhancedError;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};

// Toggle user status
export const toggleUserStatus = async (userId, newStatus) => {
  try {
    const endpoint = newStatus === 'Active' ? 'activate' : 'deactivate';
    const response = await api.post(`/users/${userId}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for user ${userId}:`, error);
    throw error;
  }
};