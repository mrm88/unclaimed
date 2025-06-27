import { NextApiRequest, NextApiResponse } from 'next'
import { createRouteClient, createAdminClient } from '../../../lib/supabase-client'
import { AuthService } from '../../../lib/auth'
import { GmailService } from '../../../lib/gmail-service'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const supabase = createRouteClient()
    
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user profile with tokens
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!user.google_access_token) {
      return res.status(400).json({ error: 'No Gmail access token' })
    }

    // Check if user can scan
    const { canScan, reason } = await AuthService.canUserScan(user.id)
    if (!canScan) {
      return res.status(429).json({ 
        error: 'Scan limit reached',
        message: reason
      })
    }

    // Scan Gmail for rewards
    const scanResults = await GmailService.scanGmailForRewards(
      user.google_access_token, 
      user.google_refresh_token
    )

    // Save rewards to database
    const adminSupabase = createAdminClient()
    
    // Clear existing rewards for this user
    await adminSupabase
      .from('rewards')
      .delete()
      .eq('user_id', user.id)

    // Insert new rewards
    if (scanResults.rewards.length > 0) {
      const rewardsToInsert = scanResults.rewards.map(reward => ({
        user_id: user.id,
        program_name: reward.program,
        program_type: reward.type,
        balance: reward.balance,
        balance_text: reward.balanceText,
        estimated_value: reward.estimatedValue,
        email_id: reward.emailId,
        email_date: reward.emailDate.toISOString(),
        last_updated: new Date().toISOString()
      }))

      await adminSupabase
        .from('rewards')
        .insert(rewardsToInsert)
    }

    // Save scan history
    await adminSupabase
      .from('scan_history')
      .insert({
        user_id: user.id,
        rewards_found: scanResults.rewards.length,
        emails_processed: scanResults.emailsProcessed,
        total_value: scanResults.totalValue,
        scanned_at: new Date().toISOString()
      })

    // Update user's last scan time
    await AuthService.updateLastScanTime(user.id)

    res.json({
      success: true,
      rewards: scanResults.rewards,
      emailsProcessed: scanResults.emailsProcessed,
      totalValue: scanResults.totalValue,
      message: `Found ${scanResults.rewards.length} rewards from ${scanResults.emailsProcessed} emails`
    })

  } catch (error) {
    console.error('Gmail scan error:', error)
    res.status(500).json({ 
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}