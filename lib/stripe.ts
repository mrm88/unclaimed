import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited Gmail scans',
      'Track 50+ reward programs',
      'Export to CSV/Google Sheets',
      'Expiration alerts',
      'Weekly auto-scans',
      'Priority support'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited Gmail scans',
      'Track 50+ reward programs',
      'Export to CSV/Google Sheets',
      'Expiration alerts',
      'Weekly auto-scans',
      'Priority support',
      '2 months free!'
    ]
  }
];

export class StripeService {
  static async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
    });
  }

  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });
  }

  static async createCustomerPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return null;
    }
  }

  static async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
      });
      return subscriptions.data;
    } catch (error) {
      console.error('Error retrieving customer subscriptions:', error);
      return [];
    }
  }

  static async handleWebhook(body: string, signature: string): Promise<Stripe.Event | null> {
    try {
      return stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }
}

export default stripe;