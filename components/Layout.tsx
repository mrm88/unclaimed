import React from 'react';
import { User, LogOut, CreditCard, Settings, Star } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    email: string;
    subscription_status: string;
  } | null;
  onLogout?: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  RewardRadar
                </h1>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.subscription_status === 'premium' ? 'Premium Member' : 'Free Account'}
                      </p>
                    </div>
                  </div>
                  
                  {user.subscription_status === 'premium' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200">
                    <CreditCard className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                RewardRadar
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Never lose track of your travel rewards again
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-4">
              <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Support</a>
              <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
            </div>
            <p className="text-xs text-gray-400">
              © 2025 RewardRadar. All rights reserved. Securely track your rewards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}