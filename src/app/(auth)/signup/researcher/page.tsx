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

export default function ResearcherSignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    institution: '',
    researchField: '',
    researchArea: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Researcher Agreement')
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
            user_type: 'researcher',
            company_name: formData.institution,
            research_field: formData.researchField,
            research_area: formData.researchArea,
            persona: 'researcher',
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
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--r2m-gray-600)] hover:text-emerald-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-8 shadow-xl shadow-black/50 bg-white border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-sm font-medium mb-4">
              Researcher Signup
            </div>
            <h1 className="text-3xl font-bold text-[var(--r2m-gray-900)] mb-2">
              Join as a Researcher
            </h1>
            <p className="text-base text-[var(--r2m-gray-600)]">
              For Academics, Scientists, and Research Professionals
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
                placeholder="Dr. Jane Smith"
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
                Institution / University
              </label>
              <Input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="MIT, Stanford, etc."
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Research Field
              </label>
              <Input
                type="text"
                value={formData.researchField}
                onChange={(e) => setFormData({ ...formData, researchField: e.target.value })}
                placeholder="e.g., Computer Science, Biomedical Engineering"
                required
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--r2m-gray-700)] mb-2">
                Research Area / Specialization
              </label>
              <Input
                type="text"
                value={formData.researchArea}
                onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                placeholder="e.g., Machine Learning, Cancer Genomics"
                required
                className="h-12"
              />
            </div>

            {/* Legal Agreement */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-[var(--r2m-gray-900)] mb-3">
                Researcher Agreement
              </h3>
              <div className="text-sm text-[var(--r2m-gray-700)] space-y-2 mb-4 max-h-48 overflow-y-auto">
                <p><strong>1. Intellectual Property Rights:</strong> You retain all ownership and intellectual property rights to your research. By using this platform, you grant R2M Marketplace a non-exclusive license to display and analyze your published research for commercialization matching purposes.</p>
                <p><strong>2. Publication Rights:</strong> You confirm that you have the right to share the research information submitted and that it does not violate any publication agreements, confidentiality obligations, or institutional policies.</p>
                <p><strong>3. Research Integrity:</strong> You warrant that all research data and findings submitted are accurate, properly attributed, and conducted in accordance with ethical research standards.</p>
                <p><strong>4. Collaboration Terms:</strong> Any commercialization opportunities or partnerships resulting from the platform will be negotiated separately. R2M Marketplace facilitates connections but is not a party to research collaboration agreements.</p>
                <p><strong>5. Attribution:</strong> Your research contributions will be properly attributed. You may request removal of your research from the platform at any time.</p>
                <p><strong>6. Platform Usage:</strong> You agree to use the platform ethically, respecting academic integrity and compliance with all applicable research regulations.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-600"
                />
                <span className="text-sm text-[var(--r2m-gray-700)]">
                  I have read and agree to the{' '}
                  <Link href="/terms" className="text-emerald-600 hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/researcher-agreement" className="text-emerald-600 hover:underline">
                    Researcher Agreement
                  </Link>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {loading ? 'Creating account...' : 'Create Researcher Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--r2m-gray-600)]">
              Already have an account?{' '}
              <Link href="/login/researcher" className="text-emerald-600 font-medium hover:underline">
                Login as Researcher
              </Link>
            </p>
            <p className="text-sm text-[var(--r2m-gray-600)] mt-2">
              Are you an innovator?{' '}
              <Link href="/signup/innovator" className="text-[var(--r2m-primary)] font-medium hover:underline">
                Sign up here
              </Link>
              {' '}or an investor?{' '}
              <Link href="/signup/investor" className="text-cyan-600 font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
