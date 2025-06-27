'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import Dashboard from '../../components/Dashboard';
import Paywall from '../../components/Paywall';

interface Reward {
  id: number;
  program_name: string;
  program_type: string;
  balance: number;
  balance_text?: string;
  extracted_at: string;
  email_date?: string;
}

interface User {
  email: string;
  subscription_status: 'free' | 'premium';
}

interface ScanHistory {
  scan_date: string;
  emails_processed: number;
  rewards_found: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [lastScan, setLastScan] = useState<ScanHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards');
      if (response.status === 401) {
        router.push('/');
        return;
      }
      
      const data = await response.json();
      setUser(data.user);
      setRewards(data.rewards || []);
      setLastScan(data.latestScan);
      setError(null);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError('Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rewards/scan', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.status === 429) {
        // Free user hit scan limit
        setShowPaywall(true);
        setError(data.message);
      } else if (response.ok) {
        setRewards(data.rewards || []);
        setLastScan(data.scanHistory);
      } else {
        setError(data.message || 'Scan failed');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setError('Failed to scan emails');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = async () => {
    if (user?.subscription_status !== 'premium') {
      setShowPaywall(true);
      return;
    }

    try {
      const response = await fetch('/api/rewards/export');
      
      if (response.status === 403) {
        setShowPaywall(true);
        return;
      }
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rewards-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to start subscription process');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (showPaywall) {
    return (
      <Layout user={user} onLogout={handleLogout}>
        <Paywall onSubscribe={handleSubscribe} />
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
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
      
      <Dashboard
        rewards={rewards}
        isLoading={isScanning}
        onRefresh={handleRefresh}
        onExport={handleExport}
        lastScan={lastScan}
      />
    </Layout>
  );
}