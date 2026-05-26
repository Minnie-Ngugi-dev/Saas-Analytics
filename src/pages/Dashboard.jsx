import React, { useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import useAnalyticsStore from '../store/analyticsStore';
import useAuthStore from '../store/authStore';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiDollarSign } from 'react-icons/fi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const { data, chartData, loading, summary, fetchAnalytics, fetchDashboardSummary } = useAnalyticsStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchAnalytics();
    fetchDashboardSummary();
  }, []);
  
  const stats = [
    {
      title: 'Total Revenue',
      value: `Ksh ${data?.revenue?.toLocaleString() || 0}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Users',
      value: data?.users?.toLocaleString() || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: data?.orders?.toLocaleString() || 0,
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      title: 'Conversion Rate',
      value: `${data?.conversionRate || 0}%`,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-purple-500'
    }
  ];
  
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
      </div>
      
      {/* Subscription Alert */}
      {summary?.subscriptionStatus === 'trial' && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-primary-700">
            📊 You're on a <strong>14-day free trial</strong>. 
            <a href="/subscription" className="ml-2 font-semibold underline">Upgrade now</a> to unlock premium features.
          </p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Revenue Chart */}
      <div className="card mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Revenue Trend</h2>
          <select
            onChange={(e) => fetchAnalytics(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `Ksh ${value?.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="users" stroke="#10B981" name="Users" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Top Products Section */}
      {data?.topProducts && data.topProducts.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
          <div className="space-y-3">
            {data.topProducts.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{product.name}</span>
                <span className="text-gray-600">Sales: {product.sales}</span>
                <span className="text-primary-600 font-semibold">Ksh {product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;