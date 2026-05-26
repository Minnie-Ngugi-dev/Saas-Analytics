import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useAnalyticsStore = create((set, get) => ({
  data: null,
  chartData: [],
  loading: false,
  dateRange: '7d',
  summary: null,
  
  fetchAnalytics: async (range = null) => {
    const dateRange = range || get().dateRange;
    set({ loading: true });
    
    try {
      const response = await api.get(`/analytics?range=${dateRange}`);
      const { metrics, chartData } = response.data.data;
      
      set({
        data: metrics,
        chartData: chartData,
        loading: false
      });
    } catch (error) {
      set({ loading: false });
      toast.error('Failed to load analytics data');
      console.error(error);
    }
  },
  
  fetchDashboardSummary: async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      set({ summary: response.data.data });
    } catch (error) {
      console.error('Failed to load dashboard summary:', error);
    }
  },
  
  setDateRange: (range) => {
    set({ dateRange: range });
    get().fetchAnalytics(range);
  },
  
  addAnalytics: async (metrics, date = null) => {
    try {
      await api.post('/analytics', { metrics, date });
      get().fetchAnalytics();
      toast.success('Analytics data updated');
    } catch (error) {
      toast.error('Failed to update analytics');
    }
  }
}));

export default useAnalyticsStore;