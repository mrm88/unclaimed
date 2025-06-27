import { NextApiRequest, NextApiResponse } from 'next'
import { createAdminClient } from '../../../../lib/supabase-client'
import { AuthService } from '../../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { code, error, state } = req.query

  if (error) {
    console.error('OAuth error:', error)
    return res.redirect('/login?error=access_denied')
  }

  if (!code || typeof code !== 'string') {
    return res.redirect('/login?error=invalid_code')
  }

  try {
    // Exchange code for tokens
    const tokens = await AuthService.exchangeCodeForTokens(code)
    
    if (!tokens.access_token) {
      return res.redirect('/login?error=no_access_token')
    }

    // Get user info from Google
    const googleUser = await AuthService.getGoogleUserInfo(tokens.access_token)
    
    if (!googleUser.email) {
      return res.redirect('/login?error=no_email')
    }

    // Create or update user in our database
    const user = await AuthService.createOrUpdateUser(googleUser.email, tokens)

    // Sign in user with Supabase
    const supabase = createAdminClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: googleUser.email,
      email_confirm: true,
      user_metadata: {
        provider: 'google',
        google_id: googleUser.id
      }
    })

    if (authError && authError.message !== 'User already registered') {
      console.error('Supabase auth error:', authError)
      return res.redirect('/login?error=auth_failed')
    }

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: googleUser.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
      }
    })

    if (sessionError) {
      console.error('Session generation error:', sessionError)
      return res.redirect('/login?error=session_failed')
    }

    // Redirect to the magic link URL which will authenticate the user
    res.redirect(sessionData.properties.action_link)

  } catch (error) {
    console.error('OAuth callback error:', error)
    res.redirect('/login?error=auth_failed')
  }
}