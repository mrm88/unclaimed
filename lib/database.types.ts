export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: 'free' | 'premium'
          stripe_customer_id: string | null
          google_access_token: string | null
          google_refresh_token: string | null
          last_scan_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          subscription_tier?: 'free' | 'premium'
          stripe_customer_id?: string | null
          google_access_token?: string | null
          google_refresh_token?: string | null
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: 'free' | 'premium'
          stripe_customer_id?: string | null
          google_access_token?: string | null
          google_refresh_token?: string | null
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          program_name: string
          program_type: 'Miles' | 'Hotel Points' | 'Credit Card Points' | 'Travel Credit' | 'Cash Back'
          balance: number
          balance_text: string | null
          estimated_value: number | null
          email_id: string | null
          email_date: string | null
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          program_name: string
          program_type: 'Miles' | 'Hotel Points' | 'Credit Card Points' | 'Travel Credit' | 'Cash Back'
          balance?: number
          balance_text?: string | null
          estimated_value?: number | null
          email_id?: string | null
          email_date?: string | null
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          program_name?: string
          program_type?: 'Miles' | 'Hotel Points' | 'Credit Card Points' | 'Travel Credit' | 'Cash Back'
          balance?: number
          balance_text?: string | null
          estimated_value?: number | null
          email_id?: string | null
          email_date?: string | null
          last_updated?: string
          created_at?: string
        }
      }
      scan_history: {
        Row: {
          id: string
          user_id: string
          rewards_found: number
          emails_processed: number
          total_value: number | null
          scanned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rewards_found?: number
          emails_processed?: number
          total_value?: number | null
          scanned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rewards_found?: number
          emails_processed?: number
          total_value?: number | null
          scanned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}