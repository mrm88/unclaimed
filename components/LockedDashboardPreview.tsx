import React, { useState } from 'react';
import { 
  Lock, 
  Plane, 
  Building, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import ShareToUnlockButton from './ShareToUnlockButton';

interface LockedDashboardPreviewProps {
  totalValue: number;
  programCount: number;
  onUnlock: () => void;
  onShare: () => Promise<string | null>;
  onShareComplete: () => void;
}

const mockRewards = [
  { icon: Plane, name: 'Delta SkyMiles', balance: '12,921 miles', value: '$387', color: 'text-blue-600' },
  { icon: Building, name: 'Marriott Bonvoy', balance: '48,000 points', value: '$480', color: 'text-green-600' },
  { icon: CreditCard, name: 'Chase Ultimate Rewards', balance: '35,420 points', value: '$420', color: 'text-purple-600' },
  { icon: Building, name: 'Hilton Honors', balance: '22,100 points', value: '$221', color: 'text-orange-600' },
  { icon: Plane, name: 'United MileagePlus', balance: '8,750 miles', value: '$175', color: 'text-indigo-600' },
  { icon: DollarSign, name: 'Capital One Venture', balance: '$97.50', value: '$97', color: 'text-red-600' }
];

export default function LockedDashboardPreview({ 
  totalValue, 
  programCount, 
  onUnlock, 
  onShare,
  onShareComplete
}: LockedDashboardPreviewProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleShareClick = () => {
    setShowShareOptions(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4 mr-2" />
            Scan Complete!
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            You Have <span className="text-green-600">${totalValue.toLocaleString()}</span> in Rewards
          </h1>
          <p className="text-xl text-gray-600">
            Found across {programCount} programs in your Gmail inbox
          </p>
        </div>

        {/* Blurred Dashboard Preview */}
        <div className="relative">
          {/* Blur overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Unlock Your Complete Dashboard
              </h3>
              <p className="text-gray-600 mb-8">
                See detailed breakdowns, export options, expiration dates, and track changes over time.
              </p>
              
              {/* Action buttons */}
              <div className="space-y-4">
                <button
                  onClick={onUnlock}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-8 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  🔓 Unlock Dashboard - $9 One-Time
                </button>
                
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                
                {!showShareOptions ? (
                  <button
                    onClick={handleShareClick}
                    className="w-full bg-white text-gray-700 font-semibold py-4 px-8 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    🎁 Share to Unlock for Free
                  </button>
                ) : (
                  <ShareToUnlockButton
                    onShare={onShare} 
                    totalValue={totalValue}
                    onShareComplete={onShareComplete}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Blurred content behind */}
          <div className="bg-white rounded-2xl shadow-xl p-8 filter blur-sm">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Total Value</p>
                    <p className="text-3xl font-bold text-blue-900">${totalValue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Programs</p>
                    <p className="text-3xl font-bold text-green-900">{programCount}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Expiring Soon</p>
                    <p className="text-3xl font-bold text-purple-900">2</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Rewards table */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Rewards Breakdown</h3>
              {mockRewards.map((reward, index) => {
                const Icon = reward.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                        <Icon className={`h-6 w-6 ${reward.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{reward.name}</p>
                        <p className="text-gray-600">{reward.balance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{reward.value}</p>
                      <p className="text-sm text-gray-500">Est. value</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}