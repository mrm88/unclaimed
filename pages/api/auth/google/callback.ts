import { NextApiRequest, NextApiResponse } from 'next';
import { GmailService } from '../../../../lib/gmail-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { code, error } = req.query;

    if (error) {
      return res.redirect('/?error=access_denied');
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?error=invalid_code');
    }

    try {
      // Exchange code for tokens
      const tokens = await GmailService.getTokensFromCode(code);
      
      if (!tokens.access_token) {
        return res.redirect('/?error=no_access_token');
      }

      // Get user profile
      const profile = await GmailService.getUserProfile(tokens.access_token);
      
      if (!profile?.emailAddress) {
        return res.redirect('/?error=no_profile');
      }

      // Create session data
      const sessionData = {
        email: profile.emailAddress,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        authenticated: true
      };

      // Create JWT token
      const jwtToken = jwt.sign(sessionData, JWT_SECRET, { expiresIn: '24h' });

      // Set cookie and redirect to scanning
      res.setHeader('Set-Cookie', `auth-token=${jwtToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`);
      res.redirect('/?scanning=true');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/?error=auth_failed');
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}