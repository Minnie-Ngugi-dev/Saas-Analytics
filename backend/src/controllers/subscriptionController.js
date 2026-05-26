import Subscription from '../models/Subscription.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
export const getCurrentSubscription = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const subscription = await Subscription.findOne({
      tenantId,
      status: 'active'
    }).sort({ createdAt: -1 });
    
    const tenant = await Tenant.findById(tenantId);
    
    res.json({
      success: true,
      data: {
        subscription,
        tenant: {
          tier: tenant.subscriptionTier,
          status: tenant.subscriptionStatus,
          expiry: tenant.subscriptionExpiry,
          features: tenant.features
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get subscription history
// @route   GET /api/subscriptions/history
export const getSubscriptionHistory = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const subscriptions = await Subscription.find({ tenantId })
      .sort({ createdAt: -1 });
    
    const payments = await Payment.find({ tenantId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        subscriptions,
        payments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
export const cancelSubscription = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const subscription = await Subscription.findOne({
      tenantId,
      status: 'active'
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();
    
    // Update tenant but keep features until expiry
    await Tenant.findByIdAndUpdate(tenantId, {
      subscriptionStatus: 'cancelled'
    });
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully. You will have access until expiry date.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get available plans
// @route   GET /api/subscriptions/plans
export const getPlans = async (req, res) => {
  const plans = {
    free: {
      name: 'Free',
      price: 0,
      features: {
        'Basic Analytics': true,
        '30 Days Data Retention': true,
        '1 User': true,
        'Email Support': true,
        'Real-time Analytics': false,
        'Data Export': false,
        'API Access': false,
        'Priority Support': false
      }
    },
    basic: {
      name: 'Basic',
      price: { monthly: 2500, yearly: 25000 },
      features: {
        'Basic Analytics': true,
        '90 Days Data Retention': true,
        '3 Users': true,
        'Email Support': true,
        'Real-time Analytics': true,
        'Data Export': false,
        'API Access': false,
        'Priority Support': false
      }
    },
    pro: {
      name: 'Pro',
      price: { monthly: 7500, yearly: 75000 },
      features: {
        'Advanced Analytics': true,
        '1 Year Data Retention': true,
        '10 Users': true,
        'Priority Email Support': true,
        'Real-time Analytics': true,
        'Data Export': true,
        'API Access': true,
        'Priority Support': false
      }
    },
    enterprise: {
      name: 'Enterprise',
      price: { monthly: 25000, yearly: 250000 },
      features: {
        'Custom Analytics': true,
        'Unlimited Data Retention': true,
        'Unlimited Users': true,
        '24/7 Phone Support': true,
        'Real-time Analytics': true,
        'Data Export': true,
        'API Access': true,
        'Priority Support': true,
        'Custom Integration': true,
        'Dedicated Account Manager': true
      }
    }
  };
  
  res.json({ success: true, data: plans });
};

export default { getCurrentSubscription, getSubscriptionHistory, cancelSubscription, getPlans };