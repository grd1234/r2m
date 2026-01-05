'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { ArrowLeft, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUserStore()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with email:', email)

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      console.log('Authentication successful, fetching profile...')

      // Fetch user profile
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)

          // If profile doesn't exist, create a basic one
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating basic profile...')
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: authData.user.email?.split('@')[0] || 'User',
                user_type: 'researcher',
                company_name: '',
              })
              .select()
              .single()

            if (createError) {
              console.error('Failed to create profile:', createError)
              throw new Error('Failed to create user profile. Please contact support.')
            }

            console.log('Profile created successfully')
            setUser(newProfile)
            router.push('/dashboard')
            return
          }

          throw profileError
        }

        console.log('Profile fetched successfully')
        setUser(profileData)
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors text-base"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <Card className="p-10 bg-white backdrop-blur-sm border border-slate-200 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">R2M</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[var(--r2m-gray-900)] mb-3">
              Welcome Back
            </h1>
            <p className="text-lg text-[var(--r2m-gray-600)]">
              Login to your R2M account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--r2m-error-light)] border border-[var(--r2m-error)] rounded-lg">
              <p className="text-[var(--r2m-error)] text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-gray-200 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-14 pl-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-gray-200 mb-2"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-14 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-blue-600 border-slate-600 bg-slate-700/50 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-base text-gray-300 group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-base font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-base">
              <span className="px-4 bg-slate-800/90 text-gray-400">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-base text-gray-300">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>

            {/* Role-specific signup links */}
            <div className="mt-8 pt-8 border-t border-slate-600">
              <p className="text-sm text-gray-400 mb-4">Sign up as:</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/signup/innovator"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  I'm an Innovator
                </Link>
                <Link
                  href="/signup/investor"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-cyan-600/20 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors"
                >
                  I'm an Investor
                </Link>
                <Link
                  href="/signup/researcher"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600/20 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors"
                >
                  I'm a Researcher
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Security badge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your data is protected with enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  )
}
