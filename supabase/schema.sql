-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  unlock_method TEXT CHECK (unlock_method IN ('paid', 'shared')),
  stripe_customer_id TEXT,
  shared_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  google_access_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('airline', 'hotel', 'credit_card')),
  balance INTEGER NOT NULL DEFAULT 0,
  value DECIMAL(10, 2),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  email_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user rewards lookup
CREATE INDEX idx_rewards_user_id ON rewards(user_id);

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rewards_found INTEGER NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for scan history
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Rewards policies
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Scan history policies
CREATE POLICY "Users can view own scan history" ON scan_history
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access rewards" ON rewards
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access scan_history" ON scan_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');