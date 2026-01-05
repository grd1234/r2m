'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'startup' as 'startup' | 'investor' | 'corporate_rd' | 'tto' | 'innovation_hub',
    companyName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            company_name: formData.companyName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.user.identities && authData.user.identities.length === 0) {
          // Email already exists
          setError('An account with this email already exists. Please login instead.')
        } else {
          // Signup successful
          setSuccess(true)
          // Note: User will need to confirm email before they can login
          // The confirmation email has been sent by Supabase
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8 shadow-xl shadow-black/50 bg-slate-800/90 border-slate-700">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-8 bg-[var(--r2m-primary)] rounded flex items-center justify-center text-white font-bold text-lg">
            R2M
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--r2m-gray-900)] mb-2">
            Create Account
          </h1>
          <p className="text-base text-[var(--r2m-gray-600)]">
            Start your R2M journey today
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-[var(--r2m-success-light)] border border-[var(--r2m-success)] rounded-lg">
            <p className="text-[var(--r2m-success)] font-semibold mb-2">
              Account Created Successfully!
            </p>
            <p className="text-sm text-[var(--r2m-gray-700)]">
              We've sent a confirmation email to <strong>{formData.email}</strong>.
              Please check your inbox and click the confirmation link to activate your account.
            </p>
            <p className="text-xs text-[var(--r2m-gray-600)] mt-2">
              Don't see the email? Check your spam folder.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--r2m-error-light)] border border-[var(--r2m-error)] rounded-lg text-[var(--r2m-error)] text-sm">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2"
            >
              Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="John Doe"
              required
              className="h-12"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@example.com"
              required
              className="h-12"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              required
              minLength={6}
              className="h-12"
              showIcon={false}
            />
          </div>

          <div>
            <label
              htmlFor="userType"
              className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2"
            >
              I am a...
            </label>
            <select
              id="userType"
              value={formData.userType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  userType: e.target.value as any,
                })
              }
              className="w-full h-12 px-3 border border-[var(--r2m-gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--r2m-primary)]"
              required
            >
              <option value="startup">Startup / Fresh Graduate</option>
              <option value="investor">Investor</option>
              <option value="corporate_rd">Corporate R&D</option>
              <option value="tto">Technology Transfer Office</option>
              <option value="innovation_hub">Innovation Hub</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2"
            >
              Company / Institution (Optional)
            </label>
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Your organization"
              className="h-12"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base font-semibold bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--r2m-gray-600)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--r2m-primary)] font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
