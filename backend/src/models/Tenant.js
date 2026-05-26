import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  companyEmail: {
    type: String,
    required: [true, 'Company email is required'],
    unique: true,
    lowercase: true
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'trial'],
    default: 'trial'
  },
  subscriptionExpiry: {
    type: Date,
    default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000)
  },
  dataRetentionDays: {
    type: Number,
    default: 30
  },
  maxUsers: {
    type: Number,
    default: 3
  },
  features: {
    type: Map,
    of: Boolean,
    default: {
      'realtime-analytics': false,
      'data-export': false,
      'multiple-users': false,
      'api-access': false,
      'priority-support': false
    }
  },
  settings: {
    currency: { type: String, default: 'KES' },
    timezone: { type: String, default: 'Africa/Nairobi' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('Tenant', tenantSchema);