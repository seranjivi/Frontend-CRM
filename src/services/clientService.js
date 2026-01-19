import api from '../utils/api';

const clientService = {
  // Get all clients
  getClients: async () => {
    try {
      const response = await api.get('/client');
      // The API returns data in format: { success: true, data: [...clients], pagination: {...} }
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },

  // Get a single client by ID
  getClientById: async (id) => {
    try {
      const response = await api.get(`/client/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new client
  createClient: async (clientData) => {
    try {
      const response = await api.post('/client', clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update an existing client
  updateClient: async (id, clientData) => {
    try {
      const response = await api.put(`/client/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a client
  deleteClient: async (id) => {
    try {
      await api.delete(`/client/${id}`);
    } catch (error) {
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  },

  // Export clients to CSV
  exportClients: (clients) => {
    if (clients.length === 0) {
      throw new Error('No clients to export');
    }

    // Get all unique keys from all clients
    const allKeys = new Set();
    clients.forEach(client => {
      Object.keys(client).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const csvContent = [
      headers.join(','),
      ...clients.map(client =>
        headers.map(header => {
          const value = client[header];
          if (value === null || value === undefined) return '';
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }
};

export default clientService;
