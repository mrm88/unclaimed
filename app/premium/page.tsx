'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase-client'
import Layout from '../../components/Layout'
import { Check, X, Crown, Zap, ArrowLeft } from 'lucide-react'

interface User {
  id: string
  email: string
  subscription_tier: 'free' | 'premium'
}

const PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: '$9.99',
    interval: 'per month',
    popular: false,
    stripePriceId: 'price_monthly_premium', // Replace with actual Stripe price ID
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
    stripePriceId: 'price_yearly_premium', // Replace with actual Stripe price ID
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
]

const FREE_LIMITATIONS = [
  'Limited to 1 Gmail scan per week',
  'Track up to 10 reward programs',
  'No export functionality',
  'No expiration alerts',
  'No auto-scans',
  'Basic support only'
]

export default function PremiumPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadUser()
  }, [])

  const checkAuthAndLoadUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        return
      }

      setUser(data)

      // If user is already premium, redirect to dashboard
      if (data?.subscription_tier === 'premium') {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setError('Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          planId,
          userId: user.id,
          userEmail: user.email
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setError('Failed to start subscription process')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unlock Full Access
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get unlimited access to all features and track all your rewards without limits.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Free vs Premium Comparison */}
        <div className="mb-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Free Plan</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">$0</p>
                <p className="text-sm text-gray-500">Current plan</p>
              </div>
              
              <ul className="space-y-3">
                {FREE_LIMITATIONS.map((limitation, index) => (
                  <li key={index} className="flex items-start">
                    <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center">
                  <Crown className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">Premium Benefits</h3>
                </div>
                <p className="text-sm text-blue-600 mt-2">Everything you need</p>
              </div>
              
              <ul className="space-y-3">
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
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-lg ${
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
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isProcessing}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
                      }`}
                    >
                      {isProcessing ? (
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
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">Is my Gmail data secure?</h4>
              <p className="text-sm text-gray-600">
                Yes! We only read reward-related emails and never store your personal data. 
                All connections use secure OAuth2 authentication.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">Can I cancel anytime?</h4>
              <p className="text-sm text-gray-600">
                Absolutely! You can cancel your subscription at any time through your account settings. 
                No long-term commitments.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">What programs do you support?</h4>
              <p className="text-sm text-gray-600">
                We support 50+ major airlines, hotels, and credit card programs including Delta, United, 
                Marriott, Hilton, Chase, Amex, and many more.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3">How often are rewards updated?</h4>
              <p className="text-sm text-gray-600">
                Premium users get weekly automatic scans plus unlimited manual refreshes. 
                Free users can scan once per week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}