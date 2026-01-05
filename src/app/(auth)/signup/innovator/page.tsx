'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'

export default function InnovatorSignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'startup' as 'startup' | 'tto' | 'innovation_hub',
    organization: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Innovator Agreement')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            company_name: formData.organization,
            persona: 'innovator',
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        if (authData.user.identities && authData.user.identities.length === 0) {
          setError('An account with this email already exists. Please login instead.')
        } else {
          setSuccess(true)
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--r2m-gray-600)] hover:text-[var(--r2m-primary)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-8 shadow-xl shadow-black/50 bg-white border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-medium mb-4">
              Innovator Signup
            </div>
            <h1 className="text-3xl font-bold text-[var(--r2m-gray-900)] mb-2">
              Join as an Innovator
            </h1>
            <p className="text-base text-[var(--r2m-gray-600)]">
              For Fresh Graduates, Startups, TTOs, and Innovation Hubs
            </p>
          </div>

          {/* Success Message */}
          {success ? (
            <div className="text-center">
              <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Account Created Successfully!
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  We've sent a confirmation email to <strong>{formData.email}</strong>.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Please check your inbox and click the confirmation link to activate your account.
                </p>
                <div className="space-y-3">
                  <Link href="/login/innovator">
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                      Go to Login
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500">
                    Didn't receive an email? Check your spam folder or{' '}
                    <button
                      onClick={() => {
                        setSuccess(false)
                        setFormData({ ...formData, email: '', password: '' })
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      try signing up again
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-[var(--r2m-error-light)] border border-[var(--r2m-error)] rounded-lg text-[var(--r2m-error)] text-sm">
                  {error}
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@university.edu"
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Password
              </label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12"
                showIcon={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                I am a...
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
                className="w-full h-12 px-3 border border-[var(--r2m-gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--r2m-primary)]"
                required
              >
                <option value="startup">Startup / Fresh Graduate</option>
                <option value="tto">Technology Transfer Office</option>
                <option value="innovation_hub">Innovation Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Organization / Institution
              </label>
              <Input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Your university or company"
                required
                className="h-12"
              />
            </div>

            {/* Legal Agreement */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-[var(--r2m-gray-900)] mb-3">
                Innovator Agreement
              </h3>
              <div className="text-sm text-[var(--r2m-gray-700)] space-y-2 mb-4 max-h-48 overflow-y-auto">
                <p><strong>1. Intellectual Property:</strong> You retain all rights to your research and innovations. By using this platform, you grant R2M Marketplace a non-exclusive license to display and promote your opportunities to potential investors.</p>
                <p><strong>2. Research Accuracy:</strong> You warrant that all information submitted is accurate and that you have the right to commercialize the research.</p>
                <p><strong>3. Success Fees:</strong> A 5% success fee applies to completed investment transactions facilitated through the platform.</p>
                <p><strong>4. Confidentiality:</strong> Sensitive information will only be shared with verified investors who have executed NDAs.</p>
                <p><strong>5. Platform Usage:</strong> You agree to use the platform ethically and in compliance with all applicable laws.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[var(--r2m-primary)] border-gray-300 rounded focus:ring-[var(--r2m-primary)]"
                />
                <span className="text-sm text-[var(--r2m-gray-700)]">
                  I have read and agree to the{' '}
                  <Link href="/terms" className="text-[var(--r2m-primary)] hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/innovator-agreement" className="text-[var(--r2m-primary)] hover:underline">
                    Innovator Agreement
                  </Link>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {loading ? 'Creating account...' : 'Create Innovator Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--r2m-gray-600)]">
              Already have an account?{' '}
              <Link href="/login/innovator" className="text-[var(--r2m-primary)] font-medium hover:underline">
                Login as Innovator
              </Link>
            </p>
            <p className="text-sm text-[var(--r2m-gray-600)] mt-2">
              Are you an investor?{' '}
              <Link href="/signup/investor" className="text-cyan-600 font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
          </>
          )}
        </Card>
      </div>
    </div>
  )
}
