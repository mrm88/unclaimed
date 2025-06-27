'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSection from '../components/HeroSection';
import FeatureCards from '../components/FeatureCards';
import LockedDashboardPreview from '../components/LockedDashboardPreview';
import UnlockModal from '../components/UnlockModal';
import ShareToUnlockButton from '../components/ShareToUnlockButton';
import UnlockedDashboard from '../components/UnlockedDashboard';

type AppState = 'landing' | 'scanning' | 'preview' | 'unlocked' | 'checking';

interface ScanResults {
  rewards: any[];
  totalValue: number;
  programCount: number;
  emailsProcessed: number;
}

interface UnlockStatus {
  unlocked: boolean;
  unlockMethod?: 'paid' | 'shared' | null;
  email?: string;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [appState, setAppState] = useState<AppState>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockStatus, setUnlockStatus] = useState<UnlockStatus | null>(null);
  const [scanResults, setScanResults] = useState<ScanResults>({
    rewards: [],
    totalValue: 0,
    programCount: 0,
    emailsProcessed: 0
  });

  // Check unlock status on mount
  useEffect(() => {
    checkUnlockStatus();
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const handleUrlParams = async () => {
      // Check for Stripe success/cancel
      if (searchParams.get('payment') === 'success') {
        // Re-check unlock status after successful payment
        await checkUnlockStatus();
        router.push('/', { scroll: false });
      } else if (searchParams.get('payment') === 'cancelled') {
        setError('Payment was cancelled');
        router.push('/', { scroll: false });
      }
      
      // Check for share token
      const shareToken = searchParams.get('token');
      if (shareToken) {
        await verifyShareToken(shareToken);
      }
      
      // Check for scanning parameter
      if (searchParams.get('scanning') === 'true' && unlockStatus?.unlocked) {
        handleGmailScan();
      }
      
      // Check for error parameters
      const error = searchParams.get('error');
      if (error) {
        switch (error) {
          case 'access_denied':
            setError('Access was denied. Please try again.');
            break;
          case 'auth_failed':
            setError('Authentication failed. Please try again.');
            break;
          default:
            setError('An error occurred during login.');
        }
      }
    };

    if (unlockStatus !== null) {
      handleUrlParams();
    }
  }, [searchParams, unlockStatus]);

  const checkUnlockStatus = async () => {
    try {
      const response = await fetch('/api/unlock-status');
      if (response.ok) {
        const status = await response.json();
        setUnlockStatus(status);
        
        // If unlocked and we have a session, automatically scan
        if (status.unlocked) {
          const hasSession = document.cookie.includes('auth-token');
          if (hasSession && appState === 'checking') {
            setAppState('unlocked');
            // Auto-scan if we're returning from auth
            if (searchParams.get('scanning') === 'true') {
              await handleGmailScan();
            }
          } else {
            setAppState('unlocked');
          }
        } else {
          setAppState('landing');
        }
      } else {
        setAppState('landing');
      }
    } catch (error) {
      console.error('Failed to check unlock status:', error);
      setAppState('landing');
    }
  };

  const verifyShareToken = async (token: string) => {
    try {
      const response = await fetch('/api/share-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'verify' })
      });
      
      if (response.ok) {
        await checkUnlockStatus();
        router.push('/', { scroll: false });
      } else {
        setError('Invalid or expired share link');
      }
    } catch (error) {
      console.error('Share verification error:', error);
      setError('Failed to verify share link');
    }
  };

  const handleConnectGmail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError('Failed to initiate Gmail connection');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to Gmail');
      setIsLoading(false);
    }
  };

  const handleGmailScan = async () => {
    setAppState('scanning');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/gmail/scan', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setScanResults({
          rewards: data.rewards || [],
          totalValue: data.totalValue || 0,
          programCount: data.rewards?.length || 0,
          emailsProcessed: data.emailsProcessed || 0
        });
        
        // Show preview or unlocked dashboard based on unlock status
        if (unlockStatus?.unlocked) {
          setAppState('unlocked');
        } else {
          setAppState('preview');
        }
        
        // Update URL without scanning parameter
        router.push('/', { scroll: false });
      } else {
        setError(data.message || 'Failed to scan Gmail');
        setAppState('landing');
      }
    } catch (error) {
      console.error('Scan error:', error);
      setError('Failed to scan Gmail');
      setAppState('landing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    setShowUnlockModal(true);
  };

  const handlePurchase = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId: 'one_time_unlock' })
      });
      
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to start purchase process');
    }
  };

  const handleShare = async () => {
    try {
      const response = await fetch('/api/share-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      });
      
      if (response.ok) {
        const { token } = await response.json();
        const shareUrl = `${window.location.origin}/?token=${token}`;
        
        // The ShareToUnlockButton component will handle the actual sharing
        return shareUrl;
      } else {
        setError('Failed to generate share link');
        return null;
      }
    } catch (error) {
      console.error('Share generation error:', error);
      setError('Failed to generate share link');
      return null;
    }
  };

  const handleShareComplete = async () => {
    // After user shares, verify their share completion
    try {
      const response = await fetch('/api/share-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock' })
      });
      
      if (response.ok) {
        await checkUnlockStatus();
      } else {
        setError('Failed to unlock via sharing');
      }
    } catch (error) {
      console.error('Share unlock error:', error);
      setError('Failed to unlock via sharing');
    }
  };

  // Initial checking state
  if (appState === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Scanning state
  if (appState === 'scanning') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Scanning Your Gmail...
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Finding your hidden travel rewards
          </p>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Searching emails...</span>
                <span className="animate-pulse">Processing...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview state (locked dashboard)
  if (appState === 'preview') {
    return (
      <>
        <LockedDashboardPreview
          totalValue={scanResults.totalValue}
          programCount={scanResults.programCount}
          onUnlock={handleUnlock}
          onShare={handleShare}
          onShareComplete={handleShareComplete}
        />
        
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          onPurchase={handlePurchase}
          totalValue={scanResults.totalValue}
        />
      </>
    );
  }

  // Unlocked state
  if (appState === 'unlocked') {
    // If we have scan results, show them
    if (scanResults.rewards.length > 0) {
      return (
        <UnlockedDashboard 
          rewards={scanResults.rewards}
          totalValue={scanResults.totalValue}
          emailsProcessed={scanResults.emailsProcessed}
        />
      );
    }
    
    // Otherwise show a "ready to scan" state
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome back{unlockStatus?.email ? `, ${unlockStatus.email}` : ''}!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your account is unlocked. Ready to scan for rewards?
            </p>
            <button
              onClick={handleConnectGmail}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Scan Gmail for Rewards
                </>
              )}
            </button>
            {unlockStatus?.unlockMethod && (
              <p className="mt-4 text-sm text-gray-500">
                Unlocked via {unlockStatus.unlockMethod === 'paid' ? 'payment' : 'sharing'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen">
      {error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg z-50 max-w-sm">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex h-8 w-8"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <HeroSection onConnectGmail={handleConnectGmail} isLoading={isLoading} />
      <FeatureCards />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">RewardRadar</h3>
            <p className="text-gray-400 mb-6">
              Never lose track of your travel rewards again
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              © 2025 RewardRadar. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}