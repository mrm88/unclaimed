import React, { useState } from 'react';
import { X, CreditCard, Shield, Zap, Check } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  totalValue: number;
}

const features = [
  'Complete rewards dashboard',
  'Export to CSV & Google Sheets',
  'Expiration date tracking',
  'Historical balance changes',
  'Advanced filtering & search',
  'Priority email support'
];

export default function UnlockModal({ isOpen, onClose, onPurchase, totalValue }: UnlockModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      await onPurchase();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Your Dashboard
            </h2>
            <p className="text-gray-600">
              Get full access to your ${totalValue.toLocaleString()} in rewards
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Value proposition */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">You're unlocking</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                <p className="text-sm text-green-600">in travel rewards</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">One-time cost</p>
                <p className="text-2xl font-bold text-blue-600">$9</p>
                <p className="text-xs text-gray-500">ROI: {Math.round(totalValue / 9)}x</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What you get:</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security badges */}
          <div className="flex items-center justify-center gap-4 mb-6 text-xs text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              Instant Access
            </div>
          </div>

          {/* Purchase button */}
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Unlock Dashboard - $9'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Secure payment powered by Stripe. No recurring charges.
          </p>
        </div>
      </div>
    </div>
  );
}