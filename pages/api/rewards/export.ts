import { NextApiRequest, NextApiResponse } from 'next';
import { DatabaseService } from '../../../lib/database';
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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has premium subscription for export feature
    if (user.subscription_status !== 'premium') {
      return res.status(403).json({ 
        error: 'Premium subscription required',
        message: 'Export functionality is only available for Premium subscribers.'
      });
    }

    const rewards = DatabaseService.getRewardsByUserId(user.id);

    // Generate CSV content
    const csvHeaders = ['Program Name', 'Type', 'Balance', 'Balance Text', 'Last Updated', 'Email Date'];
    const csvRows = rewards.map(reward => [
      reward.program_name,
      reward.program_type,
      reward.balance.toString(),
      reward.balance_text || '',
      reward.extracted_at,
      reward.email_date || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="rewards-export-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
}