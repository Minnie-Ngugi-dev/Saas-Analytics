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
  
  // ✅ FIXED: This is the function your Dashboard calls
  addManualAnalytics: async (revenue, orders, users, date = null) => {
    try {
      const response = await api.post('/analytics/manual', {
        revenue,
        orders,
        users,
        date: date || new Date().toISOString().split('T')[0]
      });
      
      if (response.data.success) {
        // Refresh data after adding
        await get().fetchAnalytics();
        await get().fetchDashboardSummary();
        toast.success('Analytics data added successfully!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to add analytics data';
      toast.error(message);
      console.error(error);
      return { success: false, error: message };
    }
  }
}));

export default useAnalyticsStore;