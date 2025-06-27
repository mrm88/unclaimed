# RewardRadar - Gmail-Connected Rewards SaaS

A production-ready SaaS application that automatically tracks airline miles, hotel points, and credit card rewards by parsing Gmail emails using Supabase authentication and Stripe payments.

## 🚀 Features

### Core Functionality
- **Supabase Google OAuth**: Secure authentication with Gmail access
- **Automatic Gmail Parsing**: Extracts reward balances from 50+ programs
- **Real-time Dashboard**: Beautiful charts and tables showing all rewards
- **Premium Features**: CSV export, unlimited scans, expiration alerts
- **Stripe Integration**: Subscription management with webhooks

### Supported Programs
- **Airlines**: Delta SkyMiles, United MileagePlus, American AAdvantage, Southwest, JetBlue, Alaska Airlines
- **Hotels**: Marriott Bonvoy, Hilton Honors, World of Hyatt, IHG One Rewards
- **Credit Cards**: Chase Ultimate Rewards, Amex Membership Rewards, Citi ThankYou, Capital One

### Subscription Tiers
- **Free**: 1 scan per week, basic dashboard
- **Premium**: Unlimited scans, CSV export, auto-scans, priority support

## 🛠 Tech Stack

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Authentication**: Supabase Auth with Google OAuth
- **Payments**: Stripe subscriptions with webhooks
- **Email Processing**: Gmail API with advanced parsing

## 📋 Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd rewardradar-saas
npm install
```

### 2. Environment Variables
```bash
cp .env.local.example .env.local
```

Fill in your credentials in `.env.local`:

### 3. Supabase Setup
1. Create a [Supabase project](https://supabase.com)
2. Run the migration in `supabase/migrations/20250627025724_jolly_cloud.sql`
3. Get your project URL and keys from Settings > API
4. Configure Google OAuth in Authentication > Providers

### 4. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
5. Copy Client ID and Secret to `.env.local`

### 5. Stripe Setup
1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Create two subscription products (monthly/yearly)
3. Copy price IDs to `.env.local`
4. Set up webhook endpoint: `http://localhost:3000/api/stripe/webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.deleted`

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗 Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── premium/          # Premium upgrade page
│   └── page.tsx          # Root redirect
├── components/           # React components
│   ├── Dashboard.tsx     # Main dashboard with charts
│   ├── Layout.tsx        # App layout wrapper
│   └── PremiumModal.tsx  # Upgrade modal
├── lib/                  # Core business logic
│   ├── auth.ts           # Authentication service
│   ├── supabase-client.ts # Supabase client setup
│   ├── gmail-service.ts  # Gmail API integration
│   └── parsingRules.ts   # Email parsing rules
├── pages/api/            # API routes
│   ├── auth/             # Authentication endpoints
│   ├── gmail/            # Gmail scanning
│   ├── rewards/          # Rewards management
│   └── stripe/           # Payment processing
└── supabase/             # Database migrations
```

## 🔐 Security Features

- **OAuth2**: No password storage, secure Gmail access
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure session management
- **Rate Limiting**: Free tier scan limitations
- **Webhook Verification**: Secure Stripe webhook handling

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Update Google OAuth redirect URIs with production URL
4. Update Stripe webhook endpoint with production URL

### Environment Variables for Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_live_monthly_id
STRIPE_YEARLY_PRICE_ID=price_live_yearly_id
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## 📊 Business Model

- **Free Tier**: 1 scan per week, basic features
- **Premium**: $9.99/month or $99.99/year
  - Unlimited scans
  - CSV export
  - Expiration alerts
  - Priority support

## 🔧 API Routes

- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/gmail/scan` - Scan Gmail for rewards
- `GET /api/rewards/export` - Export rewards to CSV
- `POST /api/stripe/create-checkout` - Create Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## 🧪 Testing

1. Test Google OAuth flow end-to-end
2. Make test Stripe payment in test mode
3. Verify webhook updates subscription tier
4. Test free tier limitations
5. Verify premium features unlock

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, create an issue in the repository or contact support@rewardradar.com.