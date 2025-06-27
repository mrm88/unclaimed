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

    const rewards = DatabaseService.getRewardsByUserId(user.id);
    const latestScan = DatabaseService.getLatestScan(user.id);

    res.json({
      rewards,
      latestScan,
      user: {
        email: user.email,
        subscription_status: user.subscription_status
      }
    });

  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
}