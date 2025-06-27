import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Clear the auth cookie
  res.setHeader('Set-Cookie', 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.json({ success: true });
}