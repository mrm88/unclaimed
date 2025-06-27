/*
  # Initial Schema for RewardRadar SaaS

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `subscription_tier` (text, default 'free')
      - `stripe_customer_id` (text, nullable)
      - `google_access_token` (text, nullable, encrypted)
      - `google_refresh_token` (text, nullable, encrypted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `rewards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `program_name` (text)
      - `program_type` (text)
      - `balance` (integer)
      - `balance_text` (text)
      - `estimated_value` (decimal)
      - `email_id` (text)
      - `last_updated` (timestamp)
      - `created_at` (timestamp)
    
    - `scan_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `rewards_found` (integer)
      - `emails_processed` (integer)
      - `total_value` (decimal)
      - `scanned_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Service role policies for backend operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  stripe_customer_id TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_type TEXT NOT NULL CHECK (program_type IN ('Miles', 'Hotel Points', 'Credit Card Points', 'Travel Credit', 'Cash Back')),
  balance INTEGER NOT NULL DEFAULT 0,
  balance_text TEXT,
  estimated_value DECIMAL(10, 2),
  email_id TEXT,
  email_date TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rewards_found INTEGER NOT NULL DEFAULT 0,
  emails_processed INTEGER NOT NULL DEFAULT 0,
  total_value DECIMAL(10, 2),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_rewards_user_id ON rewards(user_id);
CREATE INDEX idx_rewards_program_type ON rewards(program_type);
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for rewards table
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own rewards" ON rewards
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own rewards" ON rewards
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own rewards" ON rewards
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for scan_history table
CREATE POLICY "Users can view own scan history" ON scan_history
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own scan history" ON scan_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Service role policies (for backend operations)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access rewards" ON rewards
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access scan_history" ON scan_history
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');