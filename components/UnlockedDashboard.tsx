import React from 'react';
import { 
  Plane, 
  Building, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface UnlockedDashboardProps {
  rewards: any[];
  totalValue: number;
  emailsProcessed: number;
}

const mockDetailedRewards = [
  { 
    icon: Plane, 
    name: 'Delta SkyMiles', 
    balance: '12,921 miles', 
    value: 387, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    lastUpdated: '2025-01-15',
    expirationDate: '2026-12-31',
    status: 'active'
  },
  { 
    icon: Building, 
    name: 'Marriott Bonvoy', 
    balance: '48,000 points', 
    value: 480, 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    lastUpdated: '2025-01-14',
    expirationDate: '2026-06-15',
    status: 'active'
  },
  { 
    icon: CreditCard, 
    name: 'Chase Ultimate Rewards', 
    balance: '35,420 points', 
    value: 420, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    lastUpdated: '2025-01-13',
    expirationDate: null,
    status: 'active'
  },
  { 
    icon: Building, 
    name: 'Hilton Honors', 
    balance: '22,100 points', 
    value: 221, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    lastUpdated: '2025-01-12',
    expirationDate: '2025-03-15',
    status: 'expiring'
  },
  { 
    icon: Plane, 
    name: 'United MileagePlus', 
    balance: '8,750 miles', 
    value: 175, 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    lastUpdated: '2025-01-11',
    expirationDate: '2025-04-20',
    status: 'expiring'
  },
  { 
    icon: DollarSign, 
    name: 'Capital One Venture', 
    balance: '$97.50', 
    value: 97, 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    lastUpdated: '2025-01-10',
    expirationDate: null,
    status: 'active'
  }
];

export default function UnlockedDashboard({ rewards, totalValue, emailsProcessed }: UnlockedDashboardProps) {
  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      ['Program', 'Type', 'Balance', 'Estimated Value', 'Last Updated', 'Expiration Date', 'Status'],
      ...mockDetailedRewards.map(reward => [
        reward.name,
        reward.name.includes('Miles') ? 'Miles' : reward.name.includes('Hotel') ? 'Hotel Points' : 'Credit Card Points',
        reward.balance,
        `$${reward.value}`,
        reward.lastUpdated,
        reward.expirationDate || 'No expiration',
        reward.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rewards-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const expiringRewards = mockDetailedRewards.filter(r => r.status === 'expiring');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
              <CheckCircle className="h-4 w-4 mr-2" />
              Dashboard Unlocked
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Complete Rewards Portfolio</h1>
            <p className="text-gray-600">
              Last scan: {format(new Date(), 'MMM d, yyyy h:mm a')} • {emailsProcessed} emails processed
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Scan
            </button>
            
            <button
              onClick={handleExport}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Alert for expiring rewards */}
        {expiringRewards.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  {expiringRewards.length} Reward{expiringRewards.length > 1 ? 's' : ''} Expiring Soon
                </h3>
                <div className="space-y-1">
                  {expiringRewards.map((reward, index) => (
                    <p key={index} className="text-yellow-700">
                      <strong>{reward.name}</strong> expires on {format(new Date(reward.expirationDate!), 'MMM d, yyyy')}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium text-sm">Total Estimated Value</p>
                <p className="text-3xl font-bold text-blue-900">${totalValue.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">Across all programs</p>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium text-sm">Active Programs</p>
                <p className="text-2xl font-bold text-gray-900">{mockDetailedRewards.length}</p>
                <p className="text-xs text-gray-500 mt-1">Tracking balances</p>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium text-sm">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{expiringRewards.length}</p>
                <p className="text-xs text-gray-500 mt-1">Next 90 days</p>
              </div>
              <div className="h-12 w-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium text-sm">Emails Scanned</p>
                <p className="text-2xl font-bold text-gray-900">{emailsProcessed || 847}</p>
                <p className="text-xs text-gray-500 mt-1">Last 2 years</p>
              </div>
              <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Rewards Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Detailed Rewards Breakdown</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900">Program</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Est. Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Expiration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockDetailedRewards.map((reward, index) => {
                  const Icon = reward.icon;
                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-4 ${reward.bgColor}`}>
                            <Icon className={`h-5 w-5 ${reward.color}`} />
                          </div>
                          <div className="font-medium text-gray-900">{reward.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{reward.balance}</td>
                      <td className="px-6 py-4 font-medium text-green-600">${reward.value}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(reward.lastUpdated), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {reward.expirationDate ? format(new Date(reward.expirationDate), 'MMM d, yyyy') : 'No expiration'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reward.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reward.status === 'active' ? 'Active' : 'Expiring Soon'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Want to track more rewards? We'll automatically scan for new balances weekly.
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            <RefreshCw className="h-4 w-4 mr-2" />
            Set Up Auto-Scan
          </button>
        </div>
      </div>
    </div>
  );
}