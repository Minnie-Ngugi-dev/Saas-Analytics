import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useAnalyticsStore from '../store/analyticsStore';
import useAuthStore from '../store/authStore';
import { FiTrendingUp, FiUsers, FiShoppingCart, FiDollarSign, FiPlusCircle } from 'react-icons/fi';

const Dashboard = () => {
  const { data, chartData, loading, summary, fetchAnalytics, fetchDashboardSummary } = useAnalyticsStore();
  const { user } = useAuthStore();
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [formData, setFormData] = useState({
    revenue: '',
    orders: '',
    users: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchAnalytics();
    fetchDashboardSummary();
  }, []);
  
  // Check if there's any real data (not zeros)
  const hasData = data?.revenue > 0 || data?.orders > 0 || data?.users > 0;
  
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
  
  const handleAddManualData = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
   const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/analytics/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          revenue: parseFloat(formData.revenue),
          orders: parseInt(formData.orders),
          users: parseInt(formData.users),
          date: new Date().toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        setShowAddDataModal(false);
        setFormData({ revenue: '', orders: '', users: '' });
        fetchAnalytics();
        fetchDashboardSummary();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add data');
      }
    } catch (error) {
      console.error('Error adding data:', error);
      alert('Failed to add data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Empty State UI (shown when no data exists)
  if (!loading && !hasData) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Let's get your analytics started.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-16 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiDollarSign className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No analytics data yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Add your first sales data to see revenue, user growth, and order trends in your dashboard.
          </p>
          <button
            onClick={() => setShowAddDataModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <FiPlusCircle /> Add Your First Data
          </button>
        </div>
        
        {/* Modal for adding data */}
        {showAddDataModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add Your First Analytics Data</h2>
              <form onSubmit={handleAddManualData}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue (Ksh)</label>
                  <input
                    type="number"
                    required
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 50000"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Orders</label>
                  <input
                    type="number"
                    required
                    value={formData.orders}
                    onChange={(e) => setFormData({...formData, orders: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Users</label>
                  <input
                    type="number"
                    required
                    value={formData.users}
                    onChange={(e) => setFormData({...formData, users: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 50"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddDataModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Normal dashboard (when data exists)
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
      </div>
      
      {/* Subscription Alert */}
      {summary?.subscriptionStatus === 'trial' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700">
            📊 You're on a <strong>14-day free trial</strong>. 
            <a href="/subscription" className="ml-2 font-semibold underline">Upgrade now</a> to unlock premium features.
          </p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-6">
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
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Revenue Trend</h2>
          <select
            onChange={(e) => fetchAnalytics(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        {loading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
          <div className="space-y-3">
            {data.topProducts.map((product, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{product.name}</span>
                <span className="text-gray-600">Sales: {product.sales}</span>
                <span className="text-blue-600 font-semibold">Ksh {product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add more data button (always visible) */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowAddDataModal(true)}
          className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1 mx-auto"
        >
          <FiPlusCircle /> Add more data
        </button>
      </div>
      
      {/* Modal for adding more data */}
      {showAddDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Analytics Data</h2>
            <form onSubmit={handleAddManualData}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Revenue (Ksh)</label>
                <input
                  type="number"
                  required
                  value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Orders</label>
                <input
                  type="number"
                  required
                  value={formData.orders}
                  onChange={(e) => setFormData({...formData, orders: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 25"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Users</label>
                <input
                  type="number"
                  required
                  value={formData.users}
                  onChange={(e) => setFormData({...formData, users: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDataModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;