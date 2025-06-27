import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { createRouteClient } from '../../../lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { planId, userId, userEmail } = req.body
    
    if (!planId || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const supabase = createRouteClient()
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get or create Stripe customer
    let customerId: string
    
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (user?.stripe_customer_id) {
      customerId = user.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          supabase_user_id: userId
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Map plan IDs to Stripe price IDs
    const priceMapping: Record<string, string> = {
      'premium_monthly': process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_premium',
      'premium_yearly': process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_premium'
    }

    const priceId = priceMapping[planId]
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan ID' })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/premium?payment=cancelled`,
      metadata: {
        user_id: userId,
        plan_id: planId
      },
      allow_promotion_codes: true,
    })

    res.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Checkout creation error:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}