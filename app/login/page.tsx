'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase-client'
import { 
  Mail, 
  Shield, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Plane,
  Building,
  CreditCard,
  DollarSign
} from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Mail,
      title: 'Gmail Integration',
      description: 'Securely connect your Gmail to automatically scan for reward statements and balances.',
      color: 'bg-blue-500'
    },
    {
      icon: BarChart3,
      title: '50+ Programs',
      description: 'Track miles, points, and rewards from all major airlines, hotels, and credit cards.',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get your complete rewards summary in under 30 seconds with smart parsing.',
      color: 'bg-purple-500'
    }
  ]

  const supportedPrograms = [
    { icon: Plane, name: 'Delta SkyMiles', type: 'Airline' },
    { icon: Plane, name: 'United MileagePlus', type: 'Airline' },
    { icon: Building, name: 'Marriott Bonvoy', type: 'Hotel' },
    { icon: Building, name: 'Hilton Honors', type: 'Hotel' },
    { icon: CreditCard, name: 'Chase UR', type: 'Credit Card' },
    { icon: CreditCard, name: 'Amex MR', type: 'Credit Card' },
    { icon: DollarSign, name: 'Capital One', type: 'Travel Credit' },
    { icon: DollarSign, name: 'Discover', type: 'Cash Back' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RewardRadar
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Find hidden rewards in seconds
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6">
              Track Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Hidden Rewards</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Never lose track of your airline miles, hotel points, and credit card rewards again. 
              Connect your Gmail and let us find all your balances automatically.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                  <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-2xl ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Login Card */}
          <div className="mt-16 bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Get Started</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Connect your Gmail account to start tracking your rewards. 
                We only read reward-related emails and never store your personal data.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
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

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="group w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Mail className="h-6 w-6 mr-3" />
                    Connect Gmail Account
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-xs text-gray-500 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-5 w-5 text-green-500 mb-1" />
                <span>Bank-level security</span>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="h-5 w-5 text-blue-500 mb-1" />
                <span>Rewards emails only</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="h-5 w-5 text-purple-500 mb-1" />
                <span>Results in 30s</span>
              </div>
            </div>
          </div>

          {/* Supported Programs */}
          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Supported Programs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm max-w-4xl mx-auto">
              {supportedPrograms.map((program, index) => {
                const Icon = program.icon
                return (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-600 mr-2 flex-shrink-0" />
                    <div className="text-left min-w-0">
                      <div className="font-medium text-gray-900 text-xs truncate">{program.name}</div>
                      <div className="text-xs text-gray-500">{program.type}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-gray-500 mt-4 text-sm">+ 42 more programs supported</p>
          </div>
        </div>
      </div>
    </div>
  )
}