import api from '../utils/api';

const rfpService = {
  // Get all RFPs
  getRFPs: async () => {
    try {
      const response = await api.get('/rfps');
      return response.data;
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      throw error;
    }
  },

  // Get a single RFP by ID
  getRFPById: async (id) => {
    try {
      const response = await api.get(`/rfps/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching RFP ${id}:`, error);
      throw error;
    }
  },

  // Create a new RFP
  createRFP: async (rfpData) => {
    try {
      const response = await api.post('/rfps', rfpData);
      return response.data;
    } catch (error) {
      console.error('Error creating RFP:', error);
      throw error;
    }
  },

  // Update an existing RFP
  updateRFP: async (id, rfpData) => {
    try {
      const response = await api.put(`/rfps/${id}`, rfpData);
      return response.data;
    } catch (error) {
      console.error(`Error updating RFP ${id}:`, error);
      throw error;
    }
  },

  // Delete an RFP
  deleteRFP: async (id) => {
    try {
      const response = await api.delete(`/rfps/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting RFP ${id}:`, error);
      throw error;
    }
  },

  // Export RFPs
  exportRFPs: async () => {
    try {
      const response = await api.get('/rfps/export', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting RFPs:', error);
      throw error;
    }
  },

  // Import RFPs
  importRFPs: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/rfps/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing RFPs:', error);
      throw error;
    }
  },
  getRFPsByOpportunityId: async (opportunityId) => {
  try {
    const response = await api.get(`/rfps/by-opportunity/${opportunityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching RFPs for opportunity ${opportunityId}:`, error);
    throw error;
  }
},
};

export default rfpService;
