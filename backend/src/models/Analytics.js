import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    revenue: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    dailyActiveUsers: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    topProducts: [{
      name: String,
      sales: Number,
      revenue: Number
    }],
    trafficSources: {
      direct: Number,
      organic: Number,
      social: Number,
      referral: Number
    }
  },
  source: {
    type: String,
    enum: ['manual', 'api', 'integration'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Indexes for performance
analyticsSchema.index({ tenantId: 1, date: -1 });
analyticsSchema.index({ date: -1 });

export default mongoose.model('Analytics', analyticsSchema);