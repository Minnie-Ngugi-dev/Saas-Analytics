import React, { useState } from 'react';
import { FiX, FiSmartphone, FiLoader } from 'react-icons/fi';
import useSubscriptionStore from '../store/subscriptionStore';

const MPesaPayment = ({ plan, billingCycle, amount, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { initiatePayment } = useSubscriptionStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    const result = await initiatePayment(plan, billingCycle, phoneNumber);
    setLoading(false);
    
    if (result.success) {
      alert('M-Pesa STK Push sent! Please check your phone and enter PIN to complete payment.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-600">Plan: <strong>{plan.toUpperCase()}</strong></p>
          <p className="text-gray-600">Billing: <strong>{billingCycle}</strong></p>
          <p className="text-2xl font-bold text-primary-600 mt-2">Ksh {amount.toLocaleString()}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            M-Pesa Phone Number
          </label>
          <div className="relative">
            <FiSmartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-field pl-10"
              placeholder="0712345678"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You will receive an STK Push on this number to complete payment
          </p>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with M-Pesa'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MPesaPayment;