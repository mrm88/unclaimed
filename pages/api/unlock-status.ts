import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../../lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
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

      // Get user from Supabase
      const user = await getUserByEmail(userEmail);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return unlock status
      res.status(200).json({
        unlocked: user.unlocked,
        unlockMethod: user.unlock_method,
        email: user.email
      });

    } catch (error) {
      console.error('Unlock status check error:', error);
      res.status(500).json({ error: 'Failed to check unlock status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}