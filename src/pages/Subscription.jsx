import React, { useEffect, useState } from 'react';
import useSubscriptionStore from '../store/subscriptionStore';
import useAuthStore from '../store/authStore';
import MPesaPayment from '../components/MPesaPayment';
import { FiCheck, FiX, FiLoader } from 'react-icons/fi';

const Subscription = () => {
  const { currentSubscription, plans, fetchCurrentSubscription, fetchPlans, cancelSubscription, initiatePayment } = useSubscriptionStore();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPayment, setShowPayment] = useState(false);
  
  useEffect(() => {
    fetchCurrentSubscription();
    fetchPlans();
  }, []);
  
  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };
  
  const handlePaymentComplete = () => {
    setShowPayment(false);
    fetchCurrentSubscription();
  };
  
  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      await cancelSubscription();
    }
  };
  
  const getPlanBadge = (tier) => {
    const badges = {
      free: 'bg-gray-100 text-gray-600',
      basic: 'bg-blue-100 text-blue-600',
      pro: 'bg-purple-100 text-purple-600',
      enterprise: 'bg-gold-100 text-gold-600'
    };
    return badges[tier] || badges.free;
  };
  
  return (
    <div className="p-6">
      {/* Current Subscription */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your plan and billing</p>
      </div>
      
      {/* Current Plan Card */}
      <div className="card mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Current Plan</h3>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPlanBadge(currentSubscription?.tenant?.tier)}`}>
                {currentSubscription?.tenant?.tier?.toUpperCase() || 'FREE'}
              </span>
            </div>
            <p className="text-gray-600 mt-3">
              {currentSubscription?.subscription?.status === 'active' 
                ? `Valid until ${new Date(currentSubscription.tenant.expiry).toLocaleDateString()}`
                : 'No active subscription'}
            </p>
          </div>
          {currentSubscription?.subscription?.status === 'active' && (
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700"
            >
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
      
      {/* Available Plans */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Plans</h2>
      
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'monthly'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            billingCycle === 'yearly'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Yearly <span className="text-sm ml-1">(Save 20%)</span>
        </button>
      </div>
      
      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans && Object.entries(plans).map(([key, plan]) => {
          const price = plan.price?.[billingCycle] || 0;
          const isCurrentPlan = currentSubscription?.tenant?.tier === key;
          
          return (
            <div key={key} className={`card ${isCurrentPlan ? 'border-2 border-primary-500' : ''}`}>
              {isCurrentPlan && (
                <div className="bg-primary-500 text-white text-center py-1 rounded-t-lg -mt-6 mb-4">
                  Current Plan
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">Ksh {price.toLocaleString()}</span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              
              <ul className="mt-6 space-y-3">
                {Object.entries(plan.features).map(([feature, included]) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    {included ? (
                      <FiCheck className="text-green-500 flex-shrink-0" />
                    ) : (
                      <FiX className="text-gray-400 flex-shrink-0" />
                    )}
                    <span className={included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribe(key)}
                disabled={isCurrentPlan}
                className={`w-full mt-6 py-2 rounded-lg font-medium transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <MPesaPayment
          plan={selectedPlan}
          billingCycle={billingCycle}
          amount={plans[selectedPlan].price[billingCycle]}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default Subscription;