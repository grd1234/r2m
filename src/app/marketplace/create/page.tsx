'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react'

export default function MarketplaceCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [marketplaceDescription, setMarketplaceDescription] = useState('')
  const [techCategory, setTechCategory] = useState('')
  const [industry, setIndustry] = useState('')
  const [stage, setStage] = useState('')
  const [fundingGoal, setFundingGoal] = useState('')

  useEffect(() => {
    const id = searchParams.get('analysisId')
    if (!id) {
      setError('No analysis ID provided')
      setLoading(false)
      return
    }

    setAnalysisId(id)

    // Fetch analysis details
    const fetchAnalysis = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cvs_analyses')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError

        setAnalysis(data)
        // Pre-fill description with summary if available
        if (data.summary) {
          setMarketplaceDescription(data.summary)
        }
        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis')
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [searchParams, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPublishing(true)
    setError('')

    try {
      const response = await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          marketplaceDescription,
          techCategory,
          industry,
          stage,
          fundingGoal: fundingGoal ? parseFloat(fundingGoal) : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish')
      }

      setSuccess(true)

      // Redirect to marketplace after 2 seconds
      setTimeout(() => {
        router.push('/marketplace')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to publish to marketplace')
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--r2m-gray-100)]">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[var(--r2m-primary)] animate-spin mx-auto mb-4" />
            <p className="text-lg text-[var(--r2m-gray-600)]">Loading analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !analysis) {
    return (
      <div className="min-h-screen bg-[var(--r2m-gray-100)]">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <Card className="p-8 max-w-md text-center">
            <p className="text-lg text-[var(--r2m-error)] mb-4">{error}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--r2m-gray-100)]">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <Card className="p-12 max-w-md text-center">
            <CheckCircle2 className="w-16 h-16 text-[var(--r2m-success)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-2">
              Published Successfully!
            </h2>
            <p className="text-base text-[var(--r2m-gray-600)] mb-6">
              Your research is now live on the marketplace
            </p>
            <p className="text-sm text-[var(--r2m-gray-500)]">
              Redirecting to marketplace...
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--r2m-gray-100)]">
      <Navigation />

      <div className="max-w-[800px] mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[var(--r2m-primary)]" />
            <h1 className="text-4xl font-bold text-[var(--r2m-gray-900)]">
              Publish to Marketplace
            </h1>
          </div>
          <p className="text-lg text-[var(--r2m-gray-600)]">
            Add marketplace details for: <span className="font-semibold">{analysis?.title}</span>
          </p>
        </div>

        {/* Analysis Summary Card */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-[var(--r2m-gray-600)] mb-1">CVS Score</p>
              <p className="text-2xl font-bold text-[var(--r2m-primary)]">{analysis?.cvs_score}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--r2m-gray-600)] mb-1">TAM</p>
              <p className="text-2xl font-bold text-[var(--r2m-success)]">
                ${analysis?.tam?.toLocaleString()}M
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--r2m-gray-600)] mb-1">TRL</p>
              <p className="text-2xl font-bold text-[var(--r2m-gray-900)]">{analysis?.trl}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--r2m-gray-600)] mb-1">Market Score</p>
              <p className="text-2xl font-bold text-[var(--r2m-gray-900)]">
                {analysis?.market_score}
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-8">
            <div className="space-y-6">
              {/* Marketplace Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Marketplace Description *
                </Label>
                <p className="text-sm text-[var(--r2m-gray-500)] mb-2">
                  Describe your research for potential investors and partners
                </p>
                <Textarea
                  id="description"
                  value={marketplaceDescription}
                  onChange={(e) => setMarketplaceDescription(e.target.value)}
                  required
                  rows={6}
                  placeholder="Describe the commercial potential, applications, and unique value proposition..."
                  className="w-full"
                />
              </div>

              {/* Tech Category */}
              <div>
                <Label htmlFor="category" className="text-base font-semibold">
                  Technology Category *
                </Label>
                <Select value={techCategory} onValueChange={setTechCategory} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI/ML">AI/ML</SelectItem>
                    <SelectItem value="Biotech">Biotech</SelectItem>
                    <SelectItem value="Climate Tech">Climate Tech</SelectItem>
                    <SelectItem value="Quantum Computing">Quantum Computing</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Materials Science">Materials Science</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="AgTech">AgTech</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry" className="text-base font-semibold">
                  Target Industry *
                </Label>
                <Select value={industry} onValueChange={setIndustry} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Consumer">Consumer</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stage */}
              <div>
                <Label htmlFor="stage" className="text-base font-semibold">
                  Development Stage *
                </Label>
                <Select value={stage} onValueChange={setStage} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Concept">Concept</SelectItem>
                    <SelectItem value="Prototype">Prototype</SelectItem>
                    <SelectItem value="Pilot">Pilot</SelectItem>
                    <SelectItem value="Market-Ready">Market-Ready</SelectItem>
                    <SelectItem value="Scaling">Scaling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Funding Goal */}
              <div>
                <Label htmlFor="funding" className="text-base font-semibold">
                  Funding Goal (Optional)
                </Label>
                <p className="text-sm text-[var(--r2m-gray-500)] mb-2">
                  Amount in USD (e.g., 500000 for $500K)
                </p>
                <Input
                  id="funding"
                  type="number"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  placeholder="500000"
                  min="0"
                  step="1000"
                  className="w-full"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button
                type="submit"
                disabled={publishing}
                className="flex-1 h-12 text-base font-semibold bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Publish to Marketplace
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={publishing}
                className="px-8 h-12 text-base font-semibold"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
