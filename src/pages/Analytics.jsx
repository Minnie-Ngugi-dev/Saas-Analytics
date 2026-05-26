import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import useAnalyticsStore from '../store/analyticsStore';
import { FiDownload, FiCalendar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const Analytics = () => {
  const { data, chartData, loading, dateRange, setDateRange, fetchAnalytics } = useAnalyticsStore();
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const metrics = [
    { key: 'revenue', label: 'Revenue', color: '#3B82F6' },
    { key: 'users', label: 'Users', color: '#10B981' },
    { key: 'orders', label: 'Orders', color: '#F59E0B' },
    { key: 'conversionRate', label: 'Conversion Rate', color: '#EF4444' }
  ];
  
  const handleExport = () => {
    const csvData = chartData.map(row => ({
      Date: row.date,
      Revenue: row.revenue,
      Users: row.users,
      Orders: row.orders
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0] || {}).join(",") + "\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your business performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>
      
      {/* Metric Selector */}
      <div className="flex gap-3 mb-6">
        {metrics.map(metric => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedMetric === metric.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>
      
      {/* Main Chart */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {metrics.find(m => m.key === selectedMetric)?.label} Over Time
        </h2>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={selectedMetric} 
                fill={metrics.find(m => m.key === selectedMetric)?.color} 
                name={metrics.find(m => m.key === selectedMetric)?.label}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Average Order Value</span>
              <span className="font-semibold">Ksh {data?.averageOrderValue?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Daily Active Users</span>
              <span className="font-semibold">{data?.dailyActiveUsers || 0}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Bounce Rate</span>
              <span className="font-semibold">{data?.bounceRate || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Traffic Sources</h3>
          {data?.trafficSources && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(data.trafficSources).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {Object.entries(data.trafficSources).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;