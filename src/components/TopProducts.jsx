import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const TopProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No product data available
      </div>
    );
  }
  
  const maxRevenue = Math.max(...products.map(p => p.revenue));
  
  return (
    <div className="space-y-4">
      {products.map((product, index) => {
        const percentage = (product.revenue / maxRevenue) * 100;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="font-medium text-gray-800">{product.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Sales: {product.sales}</span>
                <span className="font-semibold text-primary-600">
                  Ksh {product.revenue.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopProducts;