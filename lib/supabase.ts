import { createClient } from '@supabase/supabase-js'

// Database types
export interface User {
  id: string
  email: string
  unlocked: boolean
  unlock_method?: 'paid' | 'shared' | null
  stripe_customer_id?: string | null
  shared_at?: string | null
  paid_at?: string | null
  google_access_token?: string | null
  google_refresh_token?: string | null
  created_at: string
  updated_at: string
}

export interface Reward {
  id: string
  user_id: string
  program: string
  type: 'airline' | 'hotel' | 'credit_card'
  balance: number
  value?: number | null
  last_updated: string
  email_id?: string | null
  created_at: string
}

export interface ScanHistory {
  id: string
  user_id: string
  rewards_found: number
  total_value?: number | null
  scanned_at: string
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create admin client for server-side operations
export const getSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

// User operations
export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // Not found error
    console.error('Error fetching user:', error)
    throw error
  }

  return data as User | null
}

export const createOrUpdateUser = async (userData: Partial<User>) => {
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', userData.email!)
    .single()

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id)
      .select()
      .single()

    if (error) throw error
    return data as User
  } else {
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...userData,
        unlocked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as User
  }
}

export const unlockUserAccount = async (
  email: string, 
  method: 'paid' | 'shared',
  stripeCustomerId?: string
) => {
  const updateData: any = {
    unlocked: true,
    unlock_method: method,
    updated_at: new Date().toISOString()
  }

  if (method === 'paid') {
    updateData.paid_at = new Date().toISOString()
    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId
    }
  } else if (method === 'shared') {
    updateData.shared_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('email', email)
    .select()
    .single()

  if (error) throw error
  return data as User
}

// Rewards operations
export const saveUserRewards = async (userId: string, rewards: Partial<Reward>[]) => {
  // Delete existing rewards for the user
  await supabase
    .from('rewards')
    .delete()
    .eq('user_id', userId)

  // Insert new rewards
  const rewardsWithUserId = rewards.map(reward => ({
    ...reward,
    user_id: userId,
    created_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('rewards')
    .insert(rewardsWithUserId)
    .select()

  if (error) throw error
  return data as Reward[]
}

export const getUserRewards = async (userId: string) => {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_id', userId)
    .order('balance', { ascending: false })

  if (error) throw error
  return data as Reward[]
}

// Scan history operations
export const saveScanHistory = async (
  userId: string, 
  rewardsFound: number, 
  totalValue?: number
) => {
  const { data, error } = await supabase
    .from('scan_history')
    .insert({
      user_id: userId,
      rewards_found: rewardsFound,
      total_value: totalValue,
      scanned_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data as ScanHistory
}