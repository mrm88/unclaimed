import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { unlockUserAccount, getUserByEmail } from '../../lib/supabase';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SHARE_SECRET = process.env.SHARE_SECRET || 'share-secret-key';

// Generate a time-limited share token
export function generateShareToken(email: string): string {
  const payload = {
    email,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  };
  
  // Token expires in 30 minutes
  return jwt.sign(payload, SHARE_SECRET, { expiresIn: '30m' });
}

// Verify share token
function verifyShareToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, SHARE_SECRET) as any;
    
    // Check if token is not too old (30 minutes)
    const tokenAge = Date.now() - decoded.timestamp;
    if (tokenAge > 30 * 60 * 1000) {
      return null;
    }
    
    return { email: decoded.email };
  } catch (error) {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Get auth token from cookie
      const authToken = req.cookies['auth-token'];
      if (!authToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Verify JWT token
      const decoded = jwt.verify(authToken, JWT_SECRET) as any;
      const userEmail = decoded.email;

      if (!userEmail) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      // Get share token from request
      const { shareToken, platform } = req.body;

      if (!shareToken || !platform) {
        return res.status(400).json({ error: 'Missing share token or platform' });
      }

      // Verify share token
      const shareData = verifyShareToken(shareToken);
      if (!shareData || shareData.email !== userEmail) {
        return res.status(400).json({ error: 'Invalid or expired share token' });
      }

      // Check if user is already unlocked
      const user = await getUserByEmail(userEmail);
      if (user?.unlocked) {
        return res.status(200).json({ 
          success: true, 
          message: 'Account already unlocked' 
        });
      }

      // Unlock user account with share method
      await unlockUserAccount(userEmail, 'shared');

      // Log the share for analytics (optional)
      console.log(`User ${userEmail} unlocked via share on ${platform}`);

      res.status(200).json({ 
        success: true,
        message: 'Account unlocked successfully'
      });

    } catch (error) {
      console.error('Share verification error:', error);
      res.status(500).json({ error: 'Failed to verify share' });
    }
  } else if (req.method === 'GET') {
    // Generate share token for authenticated user
    try {
      const authToken = req.cookies['auth-token'];
      if (!authToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const decoded = jwt.verify(authToken, JWT_SECRET) as any;
      const userEmail = decoded.email;

      if (!userEmail) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      // Generate share token
      const shareToken = generateShareToken(userEmail);
      
      res.status(200).json({ shareToken });

    } catch (error) {
      console.error('Share token generation error:', error);
      res.status(500).json({ error: 'Failed to generate share token' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}