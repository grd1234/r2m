'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, Lock } from 'lucide-react'

export default function InnovatorLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking existing session...')

        // Try to get session with a reasonable timeout
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session check error:', error)
          // Show login form on error
          setCheckingAuth(false)
          return
        }

        if (session) {
          console.log('Existing session found, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          console.log('No existing session, showing login form')
          setCheckingAuth(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Always show login form on any error
        setCheckingAuth(false)
      }
    }

    // Add a safety timeout to ensure UI shows even if check fails
    const safetyTimeout = setTimeout(() => {
      console.log('Auth check taking too long, showing login form')
      setCheckingAuth(false)
    }, 10000) // Increased to 10 seconds

    checkAuth().finally(() => {
      clearTimeout(safetyTimeout)
    })

    return () => clearTimeout(safetyTimeout)
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Add a timeout to prevent indefinite loading
    const loginTimeout = setTimeout(() => {
      setLoading(false)
      setError('Login is taking too long. Please try again or check your internet connection.')
    }, 30000) // 30 seconds timeout

    try {
      console.log('Attempting innovator login with email:', formData.email)
      console.log('Login attempt started at:', new Date().toISOString())

      const loginStartTime = Date.now()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      const loginDuration = Date.now() - loginStartTime
      console.log(`Login request completed in ${loginDuration}ms`)

      clearTimeout(loginTimeout)

      if (authError) {
        console.error('Auth error:', authError)
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        })

        // Handle email not confirmed error
        if (authError.message === 'Email not confirmed') {
          setError('Please confirm your email address. Check your inbox for the confirmation link we sent you.')
          setLoading(false)
          return
        }

        throw authError
      }

      console.log('Authentication successful, checking/creating profile...')

      // Check if user is an innovator
      if (data.user) {
        console.log('User ID:', data.user.id)
        console.log('Fetching profile from database...')

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        console.log('Profile fetch result:', { profile, profileError })

        // If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Profile not found, creating innovator profile...')
          // @ts-expect-error - Supabase types exclude id from Insert, but our schema requires it (FK to auth.users)
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.email?.split('@')[0] ?? 'User',
              user_type: 'startup',
              company_name: '',
            })

          if (createError) {
            console.error('Failed to create profile:', createError)
            throw new Error('Failed to create user profile. Please contact support.')
          }

          console.log('Innovator profile created successfully')
          console.log('Redirecting to dashboard...')
          router.push('/dashboard')
          return
        }

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          throw new Error('Failed to fetch profile: ' + profileError.message)
        }

        // If profile exists, check user type
        if (profile && !['startup', 'tto', 'innovation_hub'].includes(profile.user_type)) {
          console.log('User type mismatch:', profile.user_type)
          await supabase.auth.signOut()
          setError('This account is not registered as an innovator. Please use the correct login.')
          return
        }

        console.log('Profile verified, user_type:', profile?.user_type)
        console.log('Login successful, redirecting to dashboard...')
        router.push('/dashboard')
        console.log('Router.push called')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login')
      clearTimeout(loginTimeout)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center py-6 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-6 bg-white backdrop-blur-sm border border-slate-200 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R2M</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-medium mb-3">
              Innovator Login
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-base text-gray-600">
              Login to your innovator account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[var(--r2m-error-light)] border border-[var(--r2m-error)] rounded-lg text-[var(--r2m-error)] text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@university.edu"
                  required
                  className="h-11 pl-10 text-sm bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="h-11 text-sm bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 bg-gray-50 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-600">or</span>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-sm text-gray-700">
              Don't have an account?{' '}
              <Link
                href="/signup/innovator"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Sign up as Innovator
              </Link>
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Are you an investor?{' '}
              <Link
                href="/login/investor"
                className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </Card>

        {/* Security badge */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-300 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            Your data is protected with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  )
}
