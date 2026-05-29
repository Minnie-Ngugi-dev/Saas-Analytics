// Run this file with: node seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Analytics from './src/models/Analytics.js';
import User from './src/models/User.js';
import Tenant from './src/models/Tenant.js';

dotenv.config();

const seed = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get first user's tenantId
    const user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first by signing up.');
      console.log('Go to http://localhost:5173/register to create an account');
      process.exit(1);
    }
    
    const tenantId = user.tenantId;
    console.log(`Using tenantId: ${tenantId}`);
    
    // Check if analytics already exist
    const existingCount = await Analytics.countDocuments({ tenantId });
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing analytics records. Deleting...`);
      await Analytics.deleteMany({ tenantId });
      console.log('Cleared existing analytics data');
    }
    
    // Generate sample data for the last 7 days
    const sampleData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      // Create realistic increasing numbers (older days have lower numbers)
      const dayFromStart = 6 - i; // 0 = oldest, 6 = today
      const growthFactor = dayFromStart / 6; // 0 to 1
      
      const revenue = Math.round(20000 + (growthFactor * 180000));
      const orders = Math.round(10 + (growthFactor * 90));
      const users = Math.round(15 + (growthFactor * 135));
      const conversionRate = Math.round((orders / users) * 100 * 100) / 100;
      const averageOrderValue = Math.round((revenue / orders) * 100) / 100;
      const dailyActiveUsers = Math.round(users * 0.65);
      const bounceRate = Math.round(45 - (growthFactor * 15));
      
      sampleData.push({
        tenantId,
        date,
        metrics: {
          revenue,
          users,
          orders,
          conversionRate,
          averageOrderValue,
          dailyActiveUsers,
          bounceRate,
          topProducts: [
            { name: 'Premium Plan', sales: Math.round(orders * 0.45), revenue: Math.round(revenue * 0.55) },
            { name: 'Pro Plan', sales: Math.round(orders * 0.30), revenue: Math.round(revenue * 0.30) },
            { name: 'Basic Plan', sales: Math.round(orders * 0.25), revenue: Math.round(revenue * 0.15) }
          ],
          trafficSources: {
            direct: 40 + Math.round(growthFactor * 10),
            organic: 25 + Math.round(growthFactor * 10),
            social: 20 + Math.round(growthFactor * 5),
            referral: 15 - Math.round(growthFactor * 5)
          }
        },
        source: 'manual'
      });
    }
    
    await Analytics.insertMany(sampleData);
    console.log(`\n Added ${sampleData.length} days of sample data!\n`);
    
    // Display summary
    console.log(' Sample Data Summary:');
    console.log('─────────────────────────────────');
    sampleData.forEach((day, idx) => {
      const dateStr = day.date.toISOString().split('T')[0];
      const rev = day.metrics.revenue.toLocaleString();
      console.log(`${dateStr} | Revenue: Ksh ${rev} | Orders: ${day.metrics.orders} | Users: ${day.metrics.users}`);
    });
    console.log('─────────────────────────────────');
    console.log('\n Seeding complete! Refresh your dashboard to see the data.\n');
    
    process.exit(0);
  } catch (error) {
    console.error(' Seeding error:', error.message);
    if (error.message.includes('tenantId')) {
      console.log('\n Tip: Make sure you have a User in your database first.');
      console.log('   Register at: http://localhost:5173/register\n');
    }
    process.exit(1);
  }
};

seed();