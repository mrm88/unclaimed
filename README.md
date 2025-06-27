# RewardsTracker - Gmail-Connected Rewards Dashboard

A full-stack SaaS application that automatically tracks airline miles, hotel points, and credit card rewards by parsing Gmail emails.

## Features

### Core Functionality
- **Gmail Integration**: Secure OAuth2 connection to Gmail accounts
- **Automatic Parsing**: Extracts reward balances from 50+ programs
- **Real-time Dashboard**: Beautiful charts and tables showing all rewards
- **Export Functionality**: CSV export for Premium users
- **Subscription Management**: Stripe-powered Premium subscriptions

### Supported Programs
- **Airlines**: Delta SkyMiles, United MileagePlus, American AAdvantage, Southwest, JetBlue, Alaska Airlines
- **Hotels**: Marriott Bonvoy, Hilton Honors, World of Hyatt, IHG One Rewards, Wyndham, Choice
- **Credit Cards**: Chase Ultimate Rewards, Amex Membership Rewards, Citi ThankYou, Capital One, Discover

### Premium Features
- Unlimited Gmail scans (Free: 1 per week)
- CSV/Google Sheets export
- Expiration alerts
- Weekly auto-scans
- Priority support

## Tech Stack

- **Frontend**: Next.js 13, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: Google OAuth2, JWT
- **Payments**: Stripe
- **Email Processing**: Gmail API

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd rewards-tracker
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth2 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback`
6. Copy Client ID and Secret to `.env.local`

### 4. Stripe Setup
1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Get your API keys from the dashboard
3. Create two products with recurring prices (monthly/yearly)
4. Copy price IDs to `.env.local`
5. Set up webhook endpoint: `http://localhost:3000/api/stripe/webhook`

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── dashboard/         # Dashboard page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard with charts
│   ├── Layout.tsx         # App layout wrapper
│   ├── Login.tsx          # Login/landing page
│   └── Paywall.tsx        # Subscription paywall
├── lib/                   # Core business logic
│   ├── database.ts        # SQLite database operations
│   ├── gmail.ts           # Gmail API integration
│   ├── parsingRules.ts    # Email parsing rules
│   └── stripe.ts          # Stripe payment processing
├── pages/api/             # API routes
│   ├── auth/              # Authentication endpoints
│   ├── rewards/           # Rewards management
│   └── stripe/            # Payment processing
└── public/                # Static assets
```

## Key Components

### Email Parsing Engine
The parsing engine uses domain-specific regex patterns to extract reward balances:

```typescript
{
  domain: 'delta.com',
  program: 'Delta SkyMiles',
  type: 'Miles',
  patterns: {
    balance: [
      /SkyMiles balance[:\s]*([\d,]+)/i,
      /You have ([\d,]+) SkyMiles/i
    ]
  }
}
```

### Database Schema
- **users**: User accounts and OAuth tokens
- **rewards**: Extracted reward balances
- **scan_history**: Tracking of scan operations

### Security Features
- OAuth2 for Gmail access (no password storage)
- JWT tokens for session management
- Rate limiting for free users
- Secure cookie handling
- Input validation and sanitization

## Deployment

### Environment Setup
1. Set up production environment variables
2. Configure Google OAuth with production URLs
3. Set up Stripe webhook endpoints
4. Deploy to your preferred platform (Vercel, Railway, etc.)

### Database Migration
The SQLite database will be created automatically on first run. For production, consider migrating to PostgreSQL.

## Business Model

- **Free Tier**: 1 scan per week, basic features
- **Premium**: $9.99/month or $99.99/year
  - Unlimited scans
  - Export functionality
  - Advanced features

## Privacy & Security

- Only accesses reward-related emails
- No storage of email content
- Encrypted token storage
- GDPR compliant data handling
- Clear privacy policy and terms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@rewardstracker.com or create an issue in the repository.