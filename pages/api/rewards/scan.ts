import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../lib/database';
import { GmailService } from '../../../lib/gmail';
import { getSearchQueries } from '../../../lib/parsingRules';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(req: NextApiRequest) {
  const token = req.cookies['auth-token'];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    return DatabaseService.getUserById(decoded.userId);
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!user.access_token) {
      return res.status(400).json({ error: 'No Gmail access token' });
    }

    // Check subscription limits for free users
    if (user.subscription_status === 'free') {
      const latestScan = DatabaseService.getLatestScan(user.id);
      if (latestScan) {
        const lastScanDate = new Date(latestScan.scan_date);
        const now = new Date();
        const daysSinceLastScan = (now.getTime() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Free users can only scan once per week
        if (daysSinceLastScan < 7) {
          return res.status(429).json({ 
            error: 'Scan limit reached',
            message: 'Free users can scan once per week. Upgrade to Premium for unlimited scans.',
            nextScanDate: new Date(lastScanDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          });
        }
      }
    }

    // Initialize Gmail service
    const gmailService = new GmailService(user.access_token, user.refresh_token);
    
    // Get search queries
    const queries = getSearchQueries();
    
    // Scan for rewards
    const { rewards, emailsProcessed } = await gmailService.scanForRewards(queries, 50);
    
    // Clear old rewards for this user
    DatabaseService.deleteOldRewards(user.id);
    
    // Save new rewards
    const savedRewards = rewards.map(reward => 
      DatabaseService.createReward({
        user_id: user.id,
        program_name: reward.program,
        program_type: reward.type,
        balance: reward.balance,
        balance_text: reward.balanceText,
        email_id: reward.emailId,
        email_date: reward.emailDate.toISOString()
      })
    );

    // Record scan history
    const scanHistory = DatabaseService.createScanHistory({
      user_id: user.id,
      emails_processed: emailsProcessed,
      rewards_found: rewards.length
    });

    res.json({
      success: true,
      rewards: savedRewards,
      scanHistory,
      message: `Found ${rewards.length} rewards from ${emailsProcessed} emails`
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}