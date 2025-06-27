import React from 'react';
import { Mail, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  isLoading?: boolean;
}

export default function Login({ onLogin, isLoading }: LoginProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-200 transition-all duration-300">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Gmail Integration</h3>
            <p className="text-gray-600 leading-relaxed">
              Securely connect your Gmail to automatically scan for reward statements and balances.
            </p>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-200 transition-all duration-300">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">50+ Programs</h3>
            <p className="text-gray-600 leading-relaxed">
              Track miles, points, and rewards from all major airlines, hotels, and credit cards.
            </p>
          </div>

          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center hover:shadow-xl hover:border-gray-200 transition-all duration-300">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Results</h3>
            <p className="text-gray-600 leading-relaxed">
              Get your complete rewards summary in under 30 seconds with smart parsing.
            </p>
          </div>
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

          <div className="space-y-4">
            <button
              onClick={onLogin}
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
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              'Delta SkyMiles', 'United MileagePlus', 'American AAdvantage', 
              'Marriott Bonvoy', 'Hilton Honors', 'Chase UR', 'Amex MR', '+ 40 more'
            ].map((program, index) => (
              <span 
                key={index}
                className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-gray-700 hover:border-gray-300 transition-colors"
              >
                {program}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}