import api from '../utils/api';

const opportunityService = {
  // Get all opportunities
  getOpportunities: async () => {
    try {
      const response = await api.get('/opportunities');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  // Get a single opportunity by ID
  getOpportunityById: async (id) => {
    try {
      const response = await api.get(`/opportunities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  // Create a new opportunity
  createOpportunity: async (opportunityData) => {
    try {
      const response = await api.post('/opportunities', opportunityData);
      return response.data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  // Update an existing opportunity
  updateOpportunity: async (id, opportunityData) => {
    try {
      const response = await api.put(`/opportunities/${id}`, opportunityData);
      return response.data;
    } catch (error) {
      console.error(`Error updating opportunity ${id}:`, error);
      throw error;
    }
  },

  // Delete an opportunity
  deleteOpportunity: async (id) => {
    try {
      await api.delete(`/opportunities/${id}`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  }
};

export default opportunityService;
