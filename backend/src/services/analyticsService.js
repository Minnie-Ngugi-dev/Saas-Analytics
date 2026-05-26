import Analytics from '../models/Analytics.js';

export const processAnalyticsData = (rawData) => {
  const processed = {
    totalRevenue: 0,
    averageRevenue: 0,
    growth: 0,
    topPerformingDay: null,
    trends: {
      daily: [],
      weekly: [],
      monthly: []
    }
  };
  
  if (!rawData || rawData.length === 0) return processed;
  
  // Calculate total revenue
  processed.totalRevenue = rawData.reduce((sum, item) => sum + (item.metrics.revenue || 0), 0);
  processed.averageRevenue = processed.totalRevenue / rawData.length;
  
  // Find top performing day
  const sorted = [...rawData].sort((a, b) => (b.metrics.revenue || 0) - (a.metrics.revenue || 0));
  processed.topPerformingDay = sorted[0];
  
  // Calculate growth (compare first half vs second half)
  const midPoint = Math.floor(rawData.length / 2);
  const firstHalf = rawData.slice(0, midPoint);
  const secondHalf = rawData.slice(midPoint);
  
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + (item.metrics.revenue || 0), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + (item.metrics.revenue || 0), 0) / secondHalf.length;
  
  processed.growth = firstHalfAvg ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
  
  return processed;
};

export const generateForecast = (historicalData, days = 30) => {
  if (!historicalData || historicalData.length < 7) {
    return null;
  }
  
  // Simple linear regression for forecast
  const recentData = historicalData.slice(-30);
  const n = recentData.length;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  
  recentData.forEach((item, index) => {
    const x = index;
    const y = item.metrics.revenue || 0;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const forecast = [];
  for (let i = 1; i <= days; i++) {
    forecast.push({
      day: i,
      predictedRevenue: Math.max(0, Math.round(intercept + slope * (n + i)))
    });
  }
  
  return forecast;
};

export default { processAnalyticsData, generateForecast };