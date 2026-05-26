import React, { useState } from 'react';
import { FiX, FiCheck, FiInfo } from 'react-icons/fi';
import MPesaPayment from './MPesaPayment';

const SubscriptionModal = ({ plan, billingCycle, amount, features, onClose, onSuccess }) => {
  const [showPayment, setShowPayment] = useState(false);
  
  const handleUpgrade = () => {
    setShowPayment(true);
  };
  
  if (showPayment) {
    return (
      <MPesaPayment
        plan={plan}
        billingCycle={billingCycle}
        amount={amount}
        onClose={() => setShowPayment(false)}
        onSuccess={onSuccess}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Upgrade to {plan.toUpperCase()}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-primary-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-primary-600">Ksh {amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{billingCycle === 'monthly' ? 'per month' : 'per year'}</p>
            </div>
            <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-primary-600">
              14-day trial included
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FiInfo className="text-primary-500" />
            What's included:
          </h3>
          <ul className="space-y-2">
            {Object.entries(features || {}).map(([feature, included]) => (
              included && (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                  <FiCheck className="text-green-500" />
                  {feature}
                </li>
              )
            ))}
          </ul>
        </div>
        
        <button
          onClick={handleUpgrade}
          className="btn-primary w-full"
        >
          Continue to Payment
        </button>
        
        <p className="text-center text-xs text-gray-500 mt-4">
          You will receive an M-Pesa STK Push to complete payment
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;