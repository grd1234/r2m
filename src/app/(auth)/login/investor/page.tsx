'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Lock, Mail } from 'lucide-react'

export default function InvestorLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting investor login with email:', formData.email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      console.log('Authentication successful, checking/creating profile...')

      // Check if user is an investor
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', data.user.id)
          .single()

        // If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Profile not found, creating investor profile...')
          // @ts-expect-error - Supabase types exclude id from Insert, but our schema requires it (FK to auth.users)
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.email?.split('@')[0] ?? 'User',
              user_type: 'investor',
              company_name: '',
            })

          if (createError) {
            console.error('Failed to create profile:', createError)
            throw new Error('Failed to create user profile. Please contact support.')
          }

          console.log('Investor profile created successfully')
          router.push('/dashboard')
          return
        }

        // If profile exists, check user type
        if (profile && !['investor', 'corporate_rd'].includes(profile.user_type)) {
          await supabase.auth.signOut()
          setError('This account is not registered as an investor. Please use the correct login.')
          return
        }

        console.log('Login successful, redirecting to dashboard')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors text-base">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <Card className="p-10 bg-white backdrop-blur-sm border border-slate-200 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">R2M</span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-full text-sm font-medium mb-4">
              Investor Login
            </div>
            <h1 className="text-4xl font-bold text-[var(--r2m-gray-900)] mb-3">
              Welcome Back
            </h1>
            <p className="text-lg text-[var(--r2m-gray-600)]">
              Login to your investor account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--r2m-error-light)] border border-[var(--r2m-error)] rounded-lg text-[var(--r2m-error)] text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@vcfirm.com"
                  required
                  className="h-14 pl-12 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-200 mb-2">
                Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="h-14 text-base bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-cyan-600 border-slate-600 bg-slate-700/50 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <span className="ml-2 text-base text-gray-300 group-hover:text-white transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-base font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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

          {/* Signup Link */}
          <div className="text-center">
            <p className="text-base text-gray-300">
              Don't have an account?{' '}
              <Link
                href="/signup/investor"
                className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Sign up as Investor
              </Link>
            </p>
            <p className="text-base text-gray-300 mt-3">
              Are you an innovator?{' '}
              <Link
                href="/login/innovator"
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
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
