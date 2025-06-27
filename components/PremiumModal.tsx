import React from 'react'
import { X, Crown, Check, Zap } from 'lucide-react'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

const premiumFeatures = [
  'Unlimited Gmail scans',
  'Track 50+ reward programs',
  'Export to CSV/Google Sheets',
  'Expiration alerts',
  'Weekly auto-scans',
  'Priority support'
]

const freeFeatures = [
  'Limited to 1 scan per week',
  'Track up to 10 reward programs',
  'No export functionality',
  'No expiration alerts',
  'No auto-scans',
  'Basic support only'
]

export default function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-gray-600">
              Unlock unlimited scans and advanced features
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Limited Time Offer
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              $9.99<span className="text-lg font-normal text-gray-500">/month</span>
            </div>
            <p className="text-gray-600">or $99.99/year (save $20)</p>
          </div>

          {/* Feature Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Free Plan */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Free Plan</h3>
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center mb-4">
                <Crown className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Premium Plan</h3>
              </div>
              <ul className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Upgrade to Premium
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Cancel anytime. No long-term commitments.
          </p>
        </div>
      </div>
    </div>
  )
}