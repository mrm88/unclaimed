import React, { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Plane, 
  Building, 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Star,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface Reward {
  id: number;
  program_name: string;
  program_type: string;
  balance: number;
  balance_text?: string;
  extracted_at: string;
  email_date?: string;
}

interface DashboardProps {
  rewards: Reward[];
  isLoading?: boolean;
  onRefresh: () => void;
  onExport: () => void;
  lastScan?: {
    scan_date: string;
    emails_processed: number;
    rewards_found: number;
  } | null;
}

const COLORS = {
  'Miles': '#3B82F6',
  'Hotel Points': '#10B981',
  'Credit Card Points': '#8B5CF6',
  'Travel Credit': '#F59E0B',
  'Cash Back': '#EF4444'
};

const TYPE_ICONS = {
  'Miles': Plane,
  'Hotel Points': Building,
  'Credit Card Points': CreditCard,
  'Travel Credit': DollarSign,
  'Cash Back': DollarSign
};

export default function Dashboard({ rewards, isLoading, onRefresh, onExport, lastScan }: DashboardProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'program' | 'date'>('balance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort rewards
  const filteredRewards = useMemo(() => {
    let filtered = rewards;
    
    if (filterType !== 'all') {
      filtered = rewards.filter(reward => reward.program_type === filterType);
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'balance':
          comparison = a.balance - b.balance;
          break;
        case 'program':
          comparison = a.program_name.localeCompare(b.program_name);
          break;
        case 'date':
          comparison = new Date(a.extracted_at).getTime() - new Date(b.extracted_at).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [rewards, filterType, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = rewards.reduce((acc, reward) => {
      const type = reward.program_type;
      if (!acc[type]) {
        acc[type] = { count: 0, totalBalance: 0 };
      }
      acc[type].count += 1;
      acc[type].totalBalance += reward.balance;
      return acc;
    }, {} as Record<string, { count: number; totalBalance: number }>);

    return Object.entries(stats).map(([type, data]) => ({
      type,
      count: data.count,
      totalBalance: data.totalBalance,
      color: COLORS[type as keyof typeof COLORS] || '#6B7280'
    }));
  }, [rewards]);

  // Calculate total estimated value
  const totalEstimatedValue = useMemo(() => {
    return rewards.reduce((total, reward) => {
      // Simple estimation: 1 mile/point = $0.01, cash back as-is
      if (reward.program_type === 'Cash Back') {
        return total + (reward.balance / 100); // Convert cents to dollars
      }
      return total + (reward.balance * 0.01); // 1 cent per point/mile
    }, 0);
  }, [rewards]);

  // Prepare chart data
  const pieChartData = summaryStats.map(stat => ({
    name: stat.type,
    value: stat.count,
    balance: stat.totalBalance
  }));

  const barChartData = summaryStats.map(stat => ({
    type: stat.type.replace(' ', '\n'),
    count: stat.count,
    balance: stat.totalBalance
  }));

  const formatBalance = (balance: number, type: string) => {
    if (type === 'Cash Back') {
      return `$${(balance / 100).toFixed(2)}`;
    }
    return balance.toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || CreditCard;
    return <Icon className="h-5 w-5" />;
  };

  const uniqueTypes = [...new Set(rewards.map(r => r.program_type))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Rewards Dashboard</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {lastScan && (
              <>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Last scan: {format(new Date(lastScan.scan_date), 'MMM d, yyyy h:mm a')}
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {lastScan.emails_processed} emails • {lastScan.rewards_found} rewards found
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Scanning...' : 'Refresh'}
          </button>
          
          <button
            onClick={onExport}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-medium text-sm">Total Estimated Value</p>
              <p className="text-3xl font-bold text-blue-900">${totalEstimatedValue.toFixed(0)}</p>
              <p className="text-xs text-blue-600 mt-1">Across all programs</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {summaryStats.slice(0, 3).map((stat) => (
          <div key={stat.type} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium text-sm">{stat.type}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBalance(stat.totalBalance, stat.type)} total
                </p>
              </div>
              <div 
                className="h-12 w-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: stat.color }}
              >
                {getTypeIcon(stat.type)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {rewards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Programs by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS] || '#6B7280'} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Program Count by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Rewards Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-gray-900">All Rewards</h3>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="balance">Sort by Balance</option>
              <option value="program">Sort by Program</option>
              <option value="date">Sort by Date</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>
        </div>

        {filteredRewards.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Est. Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRewards.map((reward) => {
                  const estimatedValue = reward.program_type === 'Cash Back' 
                    ? reward.balance / 100 
                    : reward.balance * 0.01;
                  
                  return (
                    <tr key={reward.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div 
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-white mr-4"
                            style={{ backgroundColor: COLORS[reward.program_type as keyof typeof COLORS] || '#6B7280' }}
                          >
                            {getTypeIcon(reward.program_type)}
                          </div>
                          <div className="font-medium text-gray-900">
                            {reward.program_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {reward.program_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatBalance(reward.balance, reward.program_type)}
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        ${estimatedValue.toFixed(0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(reward.extracted_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards found</h3>
            <p className="text-gray-500 mb-6">
              {filterType === 'all' 
                ? 'Try refreshing to scan your Gmail for reward balances.'
                : `No rewards found for ${filterType}. Try a different filter.`
              }
            </p>
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Gmail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}