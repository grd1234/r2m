'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { Search, Sparkles, TrendingUp } from 'lucide-react'

export default function AnalysisSearchPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const supabase = createClient()

  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [maxPapers, setMaxPapers] = useState('3')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Query options
  const queryOptions = [
    'NLP for ecommerce product recommendations',
    'Ai-powered defect detection in semi conductor manufacturing using computer vision',
    'Deep learning for image classification',
    'Neural networks for fraud detection',
    'Multi-agent systems for supply chain optimization',
  ]

  // Domain options - AI/ML focused
  const domains = [
    'AI/ML',
    'Machine Learning',
    'Deep Learning',
    'Reinforcement Learning',
    'Transfer Learning',
    'Computer Vision',
    'NLP',
    'Natural Language Processing',
    'Generative AI',
    'Robotics',
    'LLM Engineering',
  ]

  // Check authentication and populate email on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/login/innovator')
        } else if (session.user?.email) {
          // Populate email from session
          setUserEmail(session.user.email)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login/innovator')
      }
    }
    checkAuth()
  }, [router])

  // Also populate user email from store (backup method)
  useEffect(() => {
    if (user?.email && !userEmail) {
      setUserEmail(user.email)
    }
  }, [user, userEmail])

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please select a query')
      return
    }

    if (!domain) {
      setError('Please select a domain/tech')
      return
    }

    if (!userEmail.trim()) {
      setError('Please enter your email')
      return
    }

    // Check if user is logged in
    if (!user || !user.id) {
      setError('Please log in to submit an analysis')
      router.push('/login/innovator')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Generate unique analysis_id for tracking this analysis across all workflows
      const analysisId = crypto.randomUUID()
      console.log('Generated analysis_id:', analysisId)

      // Store analysis_id in localStorage for later retrieval
      localStorage.setItem(`analysis_${analysisId}`, JSON.stringify({
        analysisId,
        query: searchQuery,
        domain,
        userEmail,
        timestamp: Date.now()
      }))

      // Create analysis record with the analysis_id
      const { data: analysisData, error: analysisError } = await supabase
        .from('cvs_analyses')
        .insert({
          analyzed_by: user.email,
          title: searchQuery,
          query: searchQuery,
          status: 'processing',
          analysis_id: analysisId,  // Store the tracking ID
        })
        .select()
        .single()

      if (analysisError) {
        console.error('Analysis creation error:', analysisError)
        throw analysisError
      }

      // Trigger the CVS analysis workflow in the background with all parameters
      console.log('Triggering analysis workflow...')
      const apiResponse = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisId,  // Use the tracking ID, not database ID
          query: searchQuery,
          domain: domain,
          user_email: userEmail,
          max_papers: parseInt(maxPapers),
        }),
      })

      const apiResult = await apiResponse.json()
      console.log('API response:', apiResult)

      if (!apiResponse.ok) {
        throw new Error(apiResult.error || 'Failed to trigger analysis workflow')
      }

      // Redirect to confirmation page
      console.log('Analysis submitted successfully, redirecting to confirmation...')
      // Don't reset loading state here - let the redirect happen
      router.push(`/analysis/confirmation?email=${encodeURIComponent(userEmail)}`)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Failed to start analysis')
      setLoading(false)
    } finally {
      // Reset loading state after a short delay if still on the page
      // This handles cases where navigation might fail
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-16">
        {/* Search Form */}
        <Card className="max-w-[800px] mx-auto p-8 mb-12 bg-white border-0 shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Discover Research-Backed Opportunities
          </h1>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="space-y-6">
            {/* Query Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                query <span className="text-red-500">*</span>
              </label>
              <select
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-12 px-3 text-base bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a query</option>
                {queryOptions.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Domain/Tech Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                domain/tech <span className="text-red-500">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full h-12 px-3 text-base bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select domain</option>
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* User Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                user_email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-12 text-base bg-gray-100 border-gray-300 text-gray-900"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Research results will be sent to your account email.
              </p>
            </div>

            {/* Max Papers Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                max_papers
              </label>
              <select
                value={maxPapers}
                onChange={(e) => setMaxPapers(e.target.value)}
                className="w-full h-12 px-3 text-base bg-gray-100 border border-gray-300 rounded-md text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    You'll receive via email in 4-6 minutes:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Top 5-10 research papers with CVS scores</li>
                    <li>• TRL assessment and feasibility analysis</li>
                    <li>• Top 3 matched investors per paper (in future)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Analyzing...' : 'Search & Analyze Papers'}
            </Button>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Form automated with <span className="text-blue-600 font-medium">n8n</span>
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                View Setup Guide →
              </a>
            </div>
          </form>
        </Card>

        {/* How Analysis Works */}
        <div className="grid grid-cols-3 gap-8">
          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Search Database
            </h3>
            <p className="text-sm text-gray-300">
              Our AI searches millions of research papers, patents, and publications
              to find relevant work in your field
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              AI Analysis
            </h3>
            <p className="text-sm text-gray-300">
              Calculate CVS score (0-100) based on technical feasibility, market potential,
              IP strength, and Technology Readiness Level
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Get Insights
            </h3>
            <p className="text-sm text-gray-300">
              Receive detailed TAM estimates, competitive landscape analysis, and
              actionable commercialization recommendations
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
