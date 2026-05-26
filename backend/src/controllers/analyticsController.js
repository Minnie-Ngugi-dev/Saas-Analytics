import Analytics from '../models/Analytics.js';

// @desc    Get analytics data
// @route   GET /api/analytics
export const getAnalytics = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { range = '7d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    if (range === '7d') startDate.setDate(startDate.getDate() - 7);
    if (range === '30d') startDate.setDate(startDate.getDate() - 30);
    if (range === '90d') startDate.setDate(startDate.getDate() - 90);
    if (range === '1y') startDate.setFullYear(startDate.getFullYear() - 1);
    
    const analytics = await Analytics.find({
      tenantId,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    // Calculate aggregated metrics
    const metrics = {
      revenue: analytics.reduce((sum, item) => sum + (item.metrics?.revenue || 0), 0),
      users: analytics.reduce((sum, item) => sum + (item.metrics?.users || 0), 0),
      orders: analytics.reduce((sum, item) => sum + (item.metrics?.orders || 0), 0),
      conversionRate: 0,
      averageOrderValue: 0,
      dailyActiveUsers: analytics[analytics.length - 1]?.metrics?.dailyActiveUsers || 0,
      bounceRate: 0,
      topProducts: [],
      trafficSources: {
        direct: 45,
        organic: 30,
        social: 15,
        referral: 10
      }
    };
    
    if (analytics.length > 0) {
      const totalConversion = analytics.reduce((sum, item) => sum + (item.metrics?.conversionRate || 0), 0);
      metrics.conversionRate = totalConversion / analytics.length;
    }
    
    if (metrics.orders > 0) {
      metrics.averageOrderValue = metrics.revenue / metrics.orders;
    }
    
    // Get top products from recent analytics
    const recentAnalytics = analytics.slice(0, 7);
    const productMap = new Map();
    recentAnalytics.forEach(item => {
      if (item.metrics?.topProducts) {
        item.metrics.topProducts.forEach(product => {
          if (productMap.has(product.name)) {
            const existing = productMap.get(product.name);
            productMap.set(product.name, {
              name: product.name,
              sales: existing.sales + (product.sales || 0),
              revenue: existing.revenue + (product.revenue || 0)
            });
          } else {
            productMap.set(product.name, {
              name: product.name,
              sales: product.sales || 0,
              revenue: product.revenue || 0
            });
          }
        });
      }
    });
    
    metrics.topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Prepare chart data
    const chartData = analytics.map(item => ({
      date: item.date.toISOString().split('T')[0],
      revenue: item.metrics?.revenue || 0,
      users: item.metrics?.users || 0,
      orders: item.metrics?.orders || 0
    })).reverse();
    
    res.json({
      success: true,
      data: {
        metrics,
        chartData: chartData.length ? chartData : [
          { date: new Date().toISOString().split('T')[0], revenue: 0, users: 0, orders: 0 }
        ]
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/analytics/dashboard
export const getDashboardSummary = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAnalytics = await Analytics.findOne({
      tenantId,
      date: today
    });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30Days = await Analytics.aggregate([
      {
        $match: {
          tenantId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$metrics.revenue' },
          totalUsers: { $sum: '$metrics.users' },
          totalOrders: { $sum: '$metrics.orders' },
          avgConversion: { $avg: '$metrics.conversionRate' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        subscriptionExpiry: new Date(+new Date() + 14 * 24 * 60 * 60 * 1000),
        today: {
          revenue: todayAnalytics?.metrics?.revenue || 0,
          users: todayAnalytics?.metrics?.users || 0,
          orders: todayAnalytics?.metrics?.orders || 0
        },
        last30Days: last30Days[0] || {
          totalRevenue: 0,
          totalUsers: 0,
          totalOrders: 0,
          avgConversion: 0
        }
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};