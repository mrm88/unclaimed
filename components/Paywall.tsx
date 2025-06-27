import React from 'react';
import { Check, X, Crown, Zap } from 'lucide-react';

interface PaywallProps {
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
}

const PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: '$9.99',
    interval: 'per month',
    popular: false,
    features: [
      'Unlimited Gmail scans',
      'Track 50+ reward programs',
      'Export to CSV/Google Sheets',
      'Expiration alerts',
      'Weekly auto-scans',
      'Priority support'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: '$99.99',
    interval: 'per year',
    popular: true,
    savings: 'Save $20/year',
    features: [
      'Unlimited Gmail scans',
      'Track 50+ reward programs',
      'Export to CSV/Google Sheets',
      'Expiration alerts',
      'Weekly auto-scans',
      'Priority support',
      '2 months free!'
    ]
  }
];

const FREE_LIMITATIONS = [
  'Limited to 3 Gmail scans per month',
  'Track up to 10 reward programs',
  'No export functionality',
  'No expiration alerts',
  'No auto-scans',
  'Basic support only'
];

export default function Paywall({ onSubscribe, isLoading }: PaywallProps) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Unlock Full Access
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get unlimited access to all features and track all your rewards without limits.
          </p>
        </div>

        {/* Free vs Premium Comparison */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">Free Plan</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
                <p className="text-sm text-gray-500">Current plan</p>
              </div>
              
              <ul className="mt-6 space-y-3">
                {FREE_LIMITATIONS.map((limitation, index) => (
                  <li key={index} className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border-2 border-blue-200">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Crown className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Premium Benefits</h3>
                </div>
                <p className="text-sm text-blue-600 mt-2">Everything you need</p>
              </div>
              
              <ul className="mt-6 space-y-3">
                {PLANS[0].features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg shadow-lg ${
                  plan.popular 
                    ? 'border-2 border-blue-500 bg-white' 
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                      <Zap className="h-4 w-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-base font-medium text-gray-500">/{plan.interval.split(' ')[1]}</span>
                    </div>
                    {plan.savings && (
                      <p className="text-sm font-medium text-green-600 mt-2">{plan.savings}</p>
                    )}
                  </div>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      onClick={() => onSubscribe(plan.id)}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        `Subscribe to ${plan.name}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Is my Gmail data secure?</h4>
              <p className="text-sm text-gray-600">
                Yes! We only read reward-related emails and never store your personal data. 
                All connections use secure OAuth2 authentication.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Absolutely! You can cancel your subscription at any time through your account settings. 
                No long-term commitments.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What programs do you support?</h4>
              <p className="text-sm text-gray-600">
                We support 50+ major airlines, hotels, and credit card programs including Delta, United, 
                Marriott, Hilton, Chase, Amex, and many more.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How often are rewards updated?</h4>
              <p className="text-sm text-gray-600">
                Premium users get weekly automatic scans plus unlimited manual refreshes. 
                Free users can scan up to 3 times per month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}