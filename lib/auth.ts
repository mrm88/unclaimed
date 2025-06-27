import { createRouteClient, createAdminClient } from './supabase-client'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
)

export interface UserProfile {
  id: string
  email: string
  subscription_tier: 'free' | 'premium'
  stripe_customer_id?: string
  google_access_token?: string
  google_refresh_token?: string
  last_scan_at?: string
  created_at: string
  updated_at: string
}

export class AuthService {
  static getGoogleAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  }

  static async exchangeCodeForTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  }

  static async getGoogleUserInfo(accessToken: string) {
    oauth2Client.setCredentials({ access_token: accessToken })
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const { data } = await oauth2.userinfo.get()
    return data
  }

  static async createOrUpdateUser(
    email: string, 
    googleTokens: { access_token?: string; refresh_token?: string }
  ): Promise<UserProfile> {
    const supabase = createAdminClient()
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Update existing user with new tokens
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          google_access_token: googleTokens.access_token,
          google_refresh_token: googleTokens.refresh_token || existingUser.google_refresh_token,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single()

      if (error) throw error
      return updatedUser
    } else {
      // Create new user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email,
          subscription_tier: 'free',
          google_access_token: googleTokens.access_token,
          google_refresh_token: googleTokens.refresh_token,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return newUser
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createRouteClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return data
  }

  static async updateSubscriptionTier(userId: string, tier: 'free' | 'premium', stripeCustomerId?: string) {
    const supabase = createAdminClient()
    
    const updateData: any = {
      subscription_tier: tier,
      updated_at: new Date().toISOString()
    }

    if (stripeCustomerId) {
      updateData.stripe_customer_id = stripeCustomerId
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async canUserScan(userId: string): Promise<{ canScan: boolean; reason?: string }> {
    const supabase = createRouteClient()
    
    const { data: user } = await supabase
      .from('users')
      .select('subscription_tier, last_scan_at')
      .eq('id', userId)
      .single()

    if (!user) {
      return { canScan: false, reason: 'User not found' }
    }

    // Premium users can always scan
    if (user.subscription_tier === 'premium') {
      return { canScan: true }
    }

    // Free users can scan once per week
    if (user.last_scan_at) {
      const lastScan = new Date(user.last_scan_at)
      const now = new Date()
      const daysSinceLastScan = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceLastScan < 7) {
        return { 
          canScan: false, 
          reason: `Free users can scan once per week. Next scan available in ${Math.ceil(7 - daysSinceLastScan)} days.` 
        }
      }
    }

    return { canScan: true }
  }

  static async updateLastScanTime(userId: string) {
    const supabase = createAdminClient()
    
    await supabase
      .from('users')
      .update({ 
        last_scan_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }
}