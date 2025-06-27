import { NextApiRequest, NextApiResponse } from 'next';
import { GmailService } from '../../../lib/gmail-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(req: NextApiRequest) {
  const token = req.cookies['auth-token'];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
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
    if (!user || !user.authenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!user.accessToken) {
      return res.status(400).json({ error: 'No Gmail access token' });
    }

    // Scan Gmail for rewards
    const scanResults = await GmailService.scanGmailForRewards(
      user.accessToken, 
      user.refreshToken
    );

    res.json({
      success: true,
      ...scanResults,
      message: `Found ${scanResults.rewards.length} rewards from ${scanResults.emailsProcessed} emails`
    });

  } catch (error) {
    console.error('Gmail scan error:', error);
    res.status(500).json({ 
      error: 'Scan failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}