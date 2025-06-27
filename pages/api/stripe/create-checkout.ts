import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Get user email from JWT token
    let customerEmail = '';
    const cookies = parseCookies({ req });
    const token = cookies['auth-token'];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        customerEmail = decoded.email || '';
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'RewardRadar Dashboard Unlock',
              description: 'One-time unlock for your complete rewards dashboard',
            },
            unit_amount: 900, // $9.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?payment=cancelled`,
      customer_email: customerEmail || undefined,
      metadata: {
        email: customerEmail,
      },
    });

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}