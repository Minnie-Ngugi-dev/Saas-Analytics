import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

const useSubscriptionStore = create((set, get) => ({
  currentSubscription: null,
  plans: null,
  history: null,
  loading: false,
  
  fetchCurrentSubscription: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/subscriptions/current');
      set({ currentSubscription: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  },
  
  fetchPlans: async () => {
    try {
      const response = await api.get('/subscriptions/plans');
      set({ plans: response.data.data });
    } catch (error) {
      console.error(error);
    }
  },
  
  fetchHistory: async () => {
    try {
      const response = await api.get('/subscriptions/history');
      set({ history: response.data.data });
    } catch (error) {
      console.error(error);
    }
  },
  
  cancelSubscription: async () => {
    try {
      await api.post('/subscriptions/cancel');
      toast.success('Subscription cancelled');
      get().fetchCurrentSubscription();
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel');
      return { success: false };
    }
  },
  
  initiatePayment: async (plan, billingCycle, phoneNumber) => {
    set({ loading: true });
    try {
      const response = await api.post('/payments/subscribe', {
        plan,
        billingCycle,
        phoneNumber
      });
      set({ loading: false });
      return { success: true, data: response.data.data };
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || 'Payment failed');
      return { success: false };
    }
  }
}));

export default useSubscriptionStore;