import api from '../utils/api';
//
const dashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  getSalesPerformance: async (presalesPocId) => {
    try {
      const response = await api.get(`/sales-performance?presales_poc=${presalesPocId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales performance:', error);
      throw error;
    }
  },
};

export default dashboardService;
