import { NextApiRequest, NextApiResponse } from 'next'
import { createRouteClient } from '../../../lib/supabase-client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const supabase = createRouteClient()
    
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user has premium subscription for export feature
    if (user.subscription_tier !== 'premium') {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        message: 'Export functionality is only available for Premium subscribers.'
      })
    }

    // Get user's rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', session.user.id)
      .order('balance', { ascending: false })

    if (rewardsError) {
      return res.status(500).json({ error: 'Failed to fetch rewards' })
    }

    // Generate CSV content
    const csvHeaders = ['Program Name', 'Type', 'Balance', 'Balance Text', 'Estimated Value', 'Last Updated', 'Email Date']
    const csvRows = (rewards || []).map(reward => [
      reward.program_name,
      reward.program_type,
      reward.balance.toString(),
      reward.balance_text || '',
      (reward.estimated_value || 0).toString(),
      reward.last_updated,
      reward.email_date || ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="rewards-export-${new Date().toISOString().split('T')[0]}.csv"`)
    
    res.send(csvContent)

  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Export failed' })
  }
}