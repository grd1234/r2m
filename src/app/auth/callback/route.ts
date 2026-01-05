import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      console.log('Email confirmed, checking/creating profile for:', data.user.email)

      // Check if profile exists, create if it doesn't
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it from user metadata
        console.log('Profile not found, creating from user metadata...')

        const userMetadata = data.user.user_metadata || {}
        const userType = userMetadata.user_type || userMetadata.persona || 'researcher'

        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: userMetadata.full_name || data.user.email?.split('@')[0] || 'User',
            user_type: userType,
            company_name: userMetadata.company_name || '',
          })

        if (createError) {
          console.error('Failed to create profile:', createError)
          return NextResponse.redirect(
            new URL('/login?error=Failed to create profile. Please contact support.', request.url)
          )
        }

        console.log('Profile created successfully')
      }

      // Redirect to the specified page or dashboard
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(
    new URL('/login?error=Could not verify email', request.url)
  )
}
