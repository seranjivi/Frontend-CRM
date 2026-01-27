import api from '../utils/api';

const sowService = {
  // Create a new SOW with file upload support
  createSOW: async (sowData) => {
    try {
      const formData = new FormData();
      
      // Required fields with defaults if not provided
      const payload = {
        sow_title: sowData.title || sowData.sow_title || 'Untitled SOW',
        opportunity_id: sowData.opportunityId || sowData.opportunity_id || null,
        rfb_id: sowData.rfbId || sowData.rfb_id || null,
        user_id: sowData.userId || sowData.user_id || null,
        // Include all other fields from the original data
        ...sowData
      };
      
      // Append all SOW data fields
      Object.keys(payload).forEach(key => {
        if (key === 'documents') {
          // Handle file uploads
          (payload.documents || []).forEach((file) => {
            if (file instanceof File) {
              formData.append('documents', file);
            } else if (file.uri) {
              // Handle file objects from file picker
              const fileObj = {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                name: file.name || `document-${Date.now()}`,
              };
              formData.append('documents', fileObj);
            } else if (file) {
              // Handle case where file might be a path or other file reference
              formData.append('documents', file);
            }
          });
        } else if (!['title', 'opportunityId', 'rfbId', 'userId'].includes(key)) { // Skip already mapped fields
          formData.append(
            key, 
            payload[key] === null || payload[key] === undefined ? '' : 
            (typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : payload[key])
          );
        }
      });

      const response = await api.post('/sows', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating SOW:', error);
      throw error;
    }
  },

  // Update an existing SOW
  updateSOW: async (id, sowData) => {
    try {
      const response = await api.put(`/sows/${id}`, sowData);
      return response.data;
    } catch (error) {
      console.error(`Error updating SOW ${id}:`, error);
      throw error;
    }
  },

  // Get SOW by ID
  getSOW: async (id) => {
    try {
      const response = await api.get(`/api/sows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching SOW ${id}:`, error);
      throw error;
    }
  },

  // Get all SOWs
  getSOWs: async () => {
    try {
      const response = await api.get('/sows');
      return response.data;
    } catch (error) {
      console.error('Error fetching SOWs:', error);
      throw error;
    }
  },

  // Delete SOW
  deleteSOW: async (id) => {
    try {
      await api.delete(`/sows/${id}`);
    } catch (error) {
      console.error(`Error deleting SOW ${id}:`, error);
      throw error;
    }
  }
};

export default sowService;
