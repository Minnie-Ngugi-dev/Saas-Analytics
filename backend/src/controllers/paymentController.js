import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import Tenant from '../models/Tenant.js';
import mpesaService from '../services/mpesaService.js';

// @desc    Initiate subscription payment
// @route   POST /api/payments/subscribe
export const initiateSubscription = async (req, res) => {
  try {
    const { plan, billingCycle, phoneNumber } = req.body;
    const tenantId = req.user.tenantId;
    
    const prices = {
      basic: { monthly: 2500, yearly: 25000 },
      pro: { monthly: 7500, yearly: 75000 },
      enterprise: { monthly: 25000, yearly: 250000 }
    };
    
    if (!prices[plan]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected'
      });
    }
    
    const amount = prices[plan][billingCycle];
    const accountReference = `SUB-${tenantId.toString().slice(-8)}-${Date.now()}`;
    
    // Initiate M-Pesa STK Push
    const mpesaResponse = await mpesaService.stkPush(
      phoneNumber,
      amount,
      accountReference,
      `${plan.toUpperCase()} ${billingCycle} subscription - InsightFlow`
    );
    
    // Save payment record
    const payment = await Payment.create({
      tenantId,
      amount,
      plan,
      billingCycle,
      transactionId: mpesaResponse.checkoutRequestId,
      status: 'pending',
      metadata: new Map([['checkoutRequestId', mpesaResponse.checkoutRequestId]])
    });
    
    res.json({
      success: true,
      data: {
        checkoutRequestId: mpesaResponse.checkoutRequestId,
        message: 'Enter M-Pesa PIN to complete payment',
        paymentId: payment._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    M-Pesa callback webhook
// @route   POST /api/payments/mpesa-callback
export const mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const { ResultCode, ResultDesc, CheckoutRequestID } = Body.stkCallback;
    
    const payment = await Payment.findOne({ 
      transactionId: CheckoutRequestID 
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (ResultCode === 0) {
      // Payment successful
      const mpesaReceipt = Body.stkCallback.CallbackMetadata.Item.find(
        item => item.Name === 'MpesaReceiptNumber'
      )?.Value;
      
      payment.status = 'completed';
      payment.mpesaReceipt = mpesaReceipt;
      payment.paymentDate = new Date();
      await payment.save();
      
      // Create subscription record
      const endDate = new Date();
      if (payment.billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      // Cancel any existing active subscription
      await Subscription.updateMany(
        { tenantId: payment.tenantId, status: 'active' },
        { status: 'expired' }
      );
      
      const subscription = await Subscription.create({
        tenantId: payment.tenantId,
        plan: payment.plan,
        price: payment.amount,
        billingCycle: payment.billingCycle,
        status: 'active',
        startDate: new Date(),
        endDate: endDate,
        autoRenew: true,
        features: new Map()
      });
      
      // Update tenant
      await Tenant.findByIdAndUpdate(payment.tenantId, {
        subscriptionTier: payment.plan,
        subscriptionStatus: 'active',
        subscriptionExpiry: endDate
      });
      
      // Update features based on plan
      const features = getFeaturesForPlan(payment.plan);
      await Tenant.findByIdAndUpdate(payment.tenantId, {
        features: features
      });
    } else {
      payment.status = 'failed';
      payment.failureReason = ResultDesc;
      await payment.save();
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
};

// @desc    Check payment status
// @route   GET /api/payments/status/:paymentId
export const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const tenantId = req.user.tenantId;
    
    const payment = await Payment.findOne({
      _id: paymentId,
      tenantId
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    // Query M-Pesa for status if still pending
    if (payment.status === 'pending') {
      const queryResult = await mpesaService.queryStatus(payment.transactionId);
      
      if (queryResult.ResultCode === 0) {
        payment.status = 'completed';
        await payment.save();
      } else if (queryResult.ResultCode !== '1037') { // 1037 = pending
        payment.status = 'failed';
        await payment.save();
      }
    }
    
    res.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        plan: payment.plan,
        mpesaReceipt: payment.mpesaReceipt,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

function getFeaturesForPlan(plan) {
  const features = new Map();
  
  switch(plan) {
    case 'basic':
      features.set('realtime-analytics', true);
      features.set('data-export', false);
      features.set('multiple-users', true);
      features.set('api-access', false);
      features.set('priority-support', false);
      break;
    case 'pro':
      features.set('realtime-analytics', true);
      features.set('data-export', true);
      features.set('multiple-users', true);
      features.set('api-access', true);
      features.set('priority-support', false);
      break;
    case 'enterprise':
      features.set('realtime-analytics', true);
      features.set('data-export', true);
      features.set('multiple-users', true);
      features.set('api-access', true);
      features.set('priority-support', true);
      break;
    default:
      features.set('realtime-analytics', false);
      features.set('data-export', false);
      features.set('multiple-users', false);
      features.set('api-access', false);
      features.set('priority-support', false);
  }
  
  return features;
}

export default { initiateSubscription, mpesaCallback, checkPaymentStatus };