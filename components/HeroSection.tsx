import React from 'react';
import { Plane, Shield, Zap, ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onConnectGmail: () => void;
  isLoading?: boolean;
}

export default function HeroSection({ onConnectGmail, isLoading }: HeroSectionProps) {
  const handleSeeHowItWorks = () => {
    // Scroll to features section or open demo modal
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
            <Zap className="h-4 w-4 mr-2" />
            Find hidden rewards in seconds
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Track Your Hidden
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Travel Rewards
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            We scan your inbox to find airline miles, hotel points, and travel credits 
            you forgot you had. Most people discover <span className="font-semibold text-gray-900">$1,000+</span> in unused rewards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onConnectGmail}
              disabled={isLoading}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              ) : (
                <Shield className="h-5 w-5 mr-3" />
              )}
              Connect Gmail Securely
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleSeeHowItWorks}
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              <Play className="h-5 w-5 mr-3" />
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              Bank-level security
            </div>
            <div className="flex items-center">
              <Plane className="h-4 w-4 mr-2 text-blue-500" />
              50+ programs supported
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-purple-500" />
              Results in 30 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}