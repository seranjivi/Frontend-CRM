import api from '../utils/api';

const roleService = {
  /**
   * Get all roles
   * @returns {Promise<Array>} List of roles
   */
  getRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Get role by ID
   * @param {string|number} roleId - The ID of the role to fetch
   * @returns {Promise<Object>} Role details
   */
  getRoleById: async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role ${roleId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new role
   * @param {Object} roleData - The role data to create
   * @returns {Promise<Object>} The created role
   */
  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  /**
   * Update an existing role
   * @param {string|number} roleId - The ID of the role to update
   * @param {Object} roleData - The updated role data
   * @returns {Promise<Object>} The updated role
   */
  updateRole: async (roleId, roleData) => {
    try {
      const response = await api.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      console.error(`Error updating role ${roleId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a role
   * @param {string|number} roleId - The ID of the role to delete
   * @returns {Promise<void>}
   */
  deleteRole: async (roleId) => {
    try {
      await api.delete(`/roles/${roleId}`);
    } catch (error) {
      console.error(`Error deleting role ${roleId}:`, error);
      throw error;
    }
  },

  /**
   * Get permissions for a role
   * @param {string|number} roleId - The ID of the role
   * @returns {Promise<Array>} List of permissions
   */
  getRolePermissions: async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching permissions for role ${roleId}:`, error);
      throw error;
    }
  },

  /**
   * Update role permissions
   * @param {string|number} roleId - The ID of the role
   * @param {Array} permissions - Array of permission IDs
   * @returns {Promise<Object>} Updated role with permissions
   */
  updateRolePermissions: async (roleId, permissions) => {
    try {
      const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error(`Error updating permissions for role ${roleId}:`, error);
      throw error;
    }
  }
};

export default roleService;
