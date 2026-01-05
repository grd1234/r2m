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

export default function InvestorSignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'investor' as 'investor' | 'corporate_rd',
    organization: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Investor Agreement')
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
            persona: 'investor',
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
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-full text-sm font-medium mb-4">
              Investor Signup
            </div>
            <h1 className="text-3xl font-bold text-[var(--r2m-gray-900)] mb-2">
              Join as an Investor
            </h1>
            <p className="text-base text-[var(--r2m-gray-600)]">
              For VCs, Angel Investors, and Corporate Partners
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
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Jane Smith"
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
                placeholder="you@vcfirm.com"
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
                className="w-full h-12 px-3 border border-[var(--r2m-gray-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600"
                required
              >
                <option value="investor">VC / Angel Investor</option>
                <option value="corporate_rd">Corporate R&D / Strategic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Firm / Organization
              </label>
              <Input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Your VC firm or company"
                required
                className="h-12"
              />
            </div>

            {/* Legal Agreement */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
              <h3 className="font-semibold text-[var(--r2m-gray-900)] mb-3">
                Investor Agreement
              </h3>
              <div className="text-sm text-[var(--r2m-gray-700)] space-y-2 mb-4 max-h-48 overflow-y-auto">
                <p><strong>1. Accredited Investor:</strong> You represent that you are an accredited investor as defined by applicable securities laws, or you are investing on behalf of an entity that meets such criteria.</p>
                <p><strong>2. Due Diligence:</strong> You agree to conduct your own independent due diligence on all investment opportunities. R2M Marketplace provides informational services only and does not provide investment advice.</p>
                <p><strong>3. Confidentiality:</strong> All information accessed through the platform is confidential and subject to NDAs where applicable. You agree not to disclose or misuse proprietary information.</p>
                <p><strong>4. No Broker-Dealer:</strong> R2M Marketplace is not a registered broker-dealer. All investments are made directly between investors and innovators.</p>
                <p><strong>5. Fees:</strong> No fees are charged to investors for accessing the platform or viewing opportunities. Platform fees are paid by innovators upon successful transactions.</p>
                <p><strong>6. Compliance:</strong> You agree to comply with all applicable securities laws and regulations in your jurisdiction.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-600"
                />
                <span className="text-sm text-[var(--r2m-gray-700)]">
                  I have read and agree to the{' '}
                  <Link href="/terms" className="text-cyan-600 hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/investor-agreement" className="text-cyan-600 hover:underline">
                    Investor Agreement
                  </Link>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
            >
              {loading ? 'Creating account...' : 'Create Investor Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--r2m-gray-600)]">
              Already have an account?{' '}
              <Link href="/login/investor" className="text-cyan-600 font-medium hover:underline">
                Login as Investor
              </Link>
            </p>
            <p className="text-sm text-[var(--r2m-gray-600)] mt-2">
              Are you an innovator?{' '}
              <Link href="/signup/innovator" className="text-[var(--r2m-primary)] font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
