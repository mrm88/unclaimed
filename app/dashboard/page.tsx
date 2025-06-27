'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase-client'
import Layout from '../../components/Layout'
import Dashboard from '../../components/Dashboard'
import PremiumModal from '../../components/PremiumModal'

interface Reward {
  id: string
  program_name: string
  program_type: string
  balance: number
  balance_text?: string
  estimated_value?: number
  last_updated: string
  email_date?: string
}

interface User {
  id: string
  email: string
  subscription_tier: 'free' | 'premium'
  last_scan_at?: string
}

interface ScanHistory {
  scanned_at: string
  emails_processed: number
  rewards_found: number
  total_value?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [lastScan, setLastScan] = useState<ScanHistory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      await Promise.all([
        fetchUserProfile(),
        fetchRewards(),
        fetchLastScan()
      ])
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return
    }

    setUser(data)
  }

  const fetchRewards = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', authUser.id)
      .order('balance', { ascending: false })

    if (error) {
      console.error('Error fetching rewards:', error)
      return
    }

    setRewards(data || [])
  }

  const fetchLastScan = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('user_id', authUser.id)
      .order('scanned_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching scan history:', error)
      return
    }

    setLastScan(data)
  }

  const handleRefresh = async () => {
    if (!user) return

    setIsScanning(true)
    setError(null)
    
    try {
      const response = await fetch('/api/gmail/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        // Free user hit scan limit
        setShowPremiumModal(true)
        setError(data.message)
      } else if (response.ok) {
        await Promise.all([
          fetchRewards(),
          fetchLastScan(),
          fetchUserProfile()
        ])
      } else {
        setError(data.message || 'Scan failed')
      }
    } catch (error) {
      console.error('Scan error:', error)
      setError('Failed to scan emails')
    } finally {
      setIsScanning(false)
    }
  }

  const handleExport = async () => {
    if (user?.subscription_tier !== 'premium') {
      setShowPremiumModal(true)
      return
    }

    try {
      const response = await fetch('/api/rewards/export')
      
      if (response.status === 403) {
        setShowPremiumModal(true)
        return
      }
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rewards-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      setError('Failed to export data')
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

  const handleUpgrade = () => {
    router.push('/premium')
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
        user={user}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgrade}
      />
    </Layout>
  )
}