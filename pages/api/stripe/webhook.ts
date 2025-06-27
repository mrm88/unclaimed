import { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'
import Stripe from 'stripe'
import { createAdminClient } from '../../../lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Disable body parser for webhook
export const config = {
  api: {
    bodyParser: false,
  },
}

// Convert request to buffer
async function buffer(readable: Readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const buf = await buffer(req)
    const sig = req.headers['stripe-signature']!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    const supabase = createAdminClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        try {
          const userId = session.metadata?.user_id
          const customerId = session.customer as string
          
          if (!userId) {
            console.error('No user ID found in session metadata:', session.id)
            return res.status(400).json({ error: 'No user ID found' })
          }

          // Update user subscription tier
          const { error } = await supabase
            .from('users')
            .update({ 
              subscription_tier: 'premium',
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) {
            console.error('Error updating user subscription:', error)
            return res.status(500).json({ error: 'Failed to update subscription' })
          }

          console.log(`Successfully upgraded user ${userId} to premium`)
        } catch (error) {
          console.error('Error processing successful payment:', error)
          return res.status(500).json({ error: 'Failed to process payment' })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        try {
          const customerId = subscription.customer as string
          
          // Find user by Stripe customer ID and downgrade to free
          const { error } = await supabase
            .from('users')
            .update({ 
              subscription_tier: 'free',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId)

          if (error) {
            console.error('Error downgrading user subscription:', error)
            return res.status(500).json({ error: 'Failed to downgrade subscription' })
          }

          console.log(`Successfully downgraded user with customer ID ${customerId} to free`)
        } catch (error) {
          console.error('Error processing subscription cancellation:', error)
          return res.status(500).json({ error: 'Failed to process cancellation' })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`Payment failed for customer ${invoice.customer}`)
        // You might want to send an email notification here
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}