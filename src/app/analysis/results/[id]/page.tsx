'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { PaperSelectionCheckpoint } from '@/components/analysis/PaperSelectionCheckpoint'
import {
  BarChart3,
  TrendingUp,
  FileText,
  Lightbulb,
  ArrowRight,
  Loader2,
  BookmarkPlus,
  CheckCircle2,
} from 'lucide-react'

interface Analysis {
  id: string
  title: string
  query: string
  cvs_score: number | null
  technical_score: number | null
  market_score: number | null
  ip_score: number | null
  tam: number | null
  trl: number | null
  summary: string | null
  recommendations: string | null
  status: string
  created_at: string
  paper_id: string | null
  analysis_notes: {
    technical_complete?: boolean
    market_complete?: boolean
    competitive_complete?: boolean
    ip_complete?: boolean
    user_confirmed?: boolean
  } | null
}

export default function AnalysisResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUserStore()
  const supabase = createClient()

  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPaperSelection, setShowPaperSelection] = useState(false)
  const [savingToWatchlist, setSavingToWatchlist] = useState(false)
  const [savedToWatchlist, setSavedToWatchlist] = useState(false)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cvs_analyses')
          .select('*')
          .eq('id', params.id)
          .single()

        if (fetchError) throw fetchError

        setAnalysis(data)

        // Check if we should show paper selection checkpoint
        // This happens when status is 'pending' and papers exist in papers_from_technical_analysis table
        if (data.status === 'pending') {
          const { data: papers, error: papersError } = await supabase
            .from('papers_from_technical_analysis')
            .select('id')
            .eq('analysis_id', params.id)
            .limit(1)

          if (!papersError && papers && papers.length > 0) {
            setShowPaperSelection(true)
          }
        }

        setLoading(false)

        // If status is processing, poll for updates every 3 seconds
        if (data.status === 'processing' || data.status === 'pending') {
          const pollInterval = setInterval(async () => {
            const { data: updatedData, error: pollError } = await supabase
              .from('cvs_analyses')
              .select('*')
              .eq('id', params.id)
              .single()

            if (!pollError && updatedData) {
              setAnalysis(updatedData)

              // Check if we should show paper selection checkpoint
              if (updatedData.status === 'pending' && !showPaperSelection) {
                const { data: papers } = await supabase
                  .from('papers_from_technical_analysis')
                  .select('id')
                  .eq('analysis_id', params.id)
                  .limit(1)

                if (papers && papers.length > 0) {
                  setShowPaperSelection(true)
                }
              }

              // Stop polling if analysis is complete or failed
              if (updatedData.status === 'completed' || updatedData.status === 'failed') {
                clearInterval(pollInterval)
              }
            }
          }, 3000)

          // Cleanup on unmount
          return () => clearInterval(pollInterval)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis')
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAnalysis()
    }
  }, [params.id, supabase])

  const handlePaperSelected = () => {
    // User selected a paper, hide checkpoint and show processing state
    setShowPaperSelection(false)
    // Refresh analysis to get updated status
    const refreshAnalysis = async () => {
      const { data } = await supabase
        .from('cvs_analyses')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) setAnalysis(data)
    }
    refreshAnalysis()
  }

  const handleSaveToWatchlist = async () => {
    if (!user || !analysis) return

    setSavingToWatchlist(true)

    try {
      const { error: saveError } = await supabase
        .from('saved_opportunities')
        .insert({
          user_id: user.id,
          paper_id: analysis.paper_id,
          analysis_id: analysis.id,
          notes: '',
        })

      if (saveError) {
        console.error('Error saving to watchlist:', saveError)
        alert('Failed to save to watchlist')
      } else {
        setSavedToWatchlist(true)
        setTimeout(() => setSavedToWatchlist(false), 3000)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Failed to save to watchlist')
    } finally {
      setSavingToWatchlist(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-300">Loading analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[var(--r2m-gray-100)]">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <Card className="p-8 max-w-md text-center">
            <p className="text-lg text-[var(--r2m-error)] mb-4">
              {error || 'Analysis not found'}
            </p>
            <Button onClick={() => router.push('/analysis/search')}>
              Start New Analysis
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Show paper selection checkpoint if papers are ready and user hasn't selected yet
  if (showPaperSelection && analysis.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
        <Navigation />
        <div className="py-12 px-6">
          <PaperSelectionCheckpoint
            analysisId={analysis.id}
            onPaperSelected={handlePaperSelected}
          />
        </div>
      </div>
    )
  }

  if (analysis.status === 'processing') {
    // Extract progress from analysis_notes
    const notes = analysis.analysis_notes || {}
    const technicalComplete = notes.technical_complete || false
    const marketComplete = notes.market_complete || false
    const competitiveComplete = notes.competitive_complete || false
    const ipComplete = notes.ip_complete || false

    // Calculate progress percentage (4 agents = 100%)
    const completedCount = [technicalComplete, marketComplete, competitiveComplete, ipComplete].filter(Boolean).length
    const progressPercentage = (completedCount / 4) * 100

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <Card className="p-12 max-w-lg text-center bg-slate-800/50 border-2 border-blue-400/50 backdrop-blur-sm shadow-2xl shadow-blue-500/20">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyzing Research
            </h2>
            <p className="text-base text-gray-300 mb-6">
              Our AI is analyzing "{analysis.title}"...
            </p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{Math.round(progressPercentage)}% Complete</p>
            </div>

            {/* Agent progress status */}
            <div className="flex flex-col gap-3 text-left text-sm">
              <div className="flex items-center gap-2">
                {technicalComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <span className={technicalComplete ? 'text-green-400' : 'text-blue-400'}>
                  Technical Validation
                </span>
              </div>

              <div className="flex items-center gap-2">
                {marketComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <span className={marketComplete ? 'text-green-400' : 'text-blue-400'}>
                  Market Sizing
                </span>
              </div>

              <div className="flex items-center gap-2">
                {competitiveComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <span className={competitiveComplete ? 'text-green-400' : 'text-blue-400'}>
                  Competitive Analysis
                </span>
              </div>

              <div className="flex items-center gap-2">
                {ipComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <span className={ipComplete ? 'text-green-400' : 'text-blue-400'}>
                  IP Analysis
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Failed state
  if (analysis.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <Card className="p-12 max-w-lg text-center bg-slate-800/50 border-2 border-red-400/50 backdrop-blur-sm shadow-2xl shadow-red-500/20">
            <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-400/50 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Analysis Failed
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              We encountered an error while analyzing this research
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => router.push('/analysis/search')}
                variant="outline"
                className="bg-transparent border-blue-400/50 text-blue-400 hover:bg-blue-500/20"
              >
                Try New Analysis
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const getCVSColor = (score: number) => {
    if (score >= 80) return 'var(--r2m-success)'
    if (score >= 60) return 'var(--r2m-warning)'
    return 'var(--r2m-error)'
  }

  const getCVSLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Fair'
  }

  return (
    <div className="min-h-screen bg-[var(--r2m-gray-100)]">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[var(--r2m-gray-500)] mb-2">
            <span>Analysis</span>
            <span>/</span>
            <span className="text-[var(--r2m-gray-900)]">{analysis.title}</span>
          </div>
          <h1 className="text-4xl font-bold text-[var(--r2m-gray-900)] mb-2">
            {analysis.title}
          </h1>
          <p className="text-lg text-[var(--r2m-gray-600)]">
            Analysis completed on {new Date(analysis.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* CVS Score Hero */}
        <Card className="p-8 mb-8 text-center bg-gradient-to-br from-white to-[var(--r2m-gray-100)]">
          <p className="text-sm text-[var(--r2m-gray-600)] mb-2">
            Commercial Viability Score
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <span
              className="text-7xl font-bold"
              style={{ color: getCVSColor(analysis.cvs_score || 0) }}
            >
              {analysis.cvs_score}
            </span>
            <div className="text-left">
              <p className="text-2xl font-semibold text-[var(--r2m-gray-900)]">
                / 100
              </p>
              <Badge
                className="text-white"
                style={{ backgroundColor: getCVSColor(analysis.cvs_score || 0) }}
              >
                {getCVSLabel(analysis.cvs_score || 0)}
              </Badge>
            </div>
          </div>
          <p className="text-base text-[var(--r2m-gray-600)]">
            This research shows {getCVSLabel(analysis.cvs_score || 0).toLowerCase()}{' '}
            commercial potential
          </p>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--r2m-gray-600)]">Technical</span>
              <BarChart3 className="w-4 h-4 text-[var(--r2m-gray-400)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--r2m-gray-900)]">
              {analysis.technical_score}
            </p>
            <div className="mt-2 h-2 bg-[var(--r2m-gray-200)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--r2m-primary)]"
                style={{ width: `${analysis.technical_score}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--r2m-gray-600)]">Market</span>
              <TrendingUp className="w-4 h-4 text-[var(--r2m-gray-400)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--r2m-gray-900)]">
              {analysis.market_score}
            </p>
            <div className="mt-2 h-2 bg-[var(--r2m-gray-200)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--r2m-success)]"
                style={{ width: `${analysis.market_score}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--r2m-gray-600)]">IP Strength</span>
              <FileText className="w-4 h-4 text-[var(--r2m-gray-400)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--r2m-gray-900)]">
              {analysis.ip_score}
            </p>
            <div className="mt-2 h-2 bg-[var(--r2m-gray-200)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--r2m-warning)]"
                style={{ width: `${analysis.ip_score}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--r2m-gray-600)]">TRL</span>
              <Lightbulb className="w-4 h-4 text-[var(--r2m-gray-400)]" />
            </div>
            <p className="text-3xl font-bold text-[var(--r2m-gray-900)]">
              {analysis.trl}
            </p>
            <p className="text-xs text-[var(--r2m-gray-500)] mt-1">
              Technology Readiness Level
            </p>
          </Card>
        </div>

        {/* Market Size */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--r2m-gray-600)] mb-1">
                Total Addressable Market (TAM)
              </p>
              <p className="text-4xl font-bold text-[var(--r2m-gray-900)]">
                ${analysis.tam?.toLocaleString()}M
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-[var(--r2m-success)]" />
          </div>
        </Card>

        {/* Summary & Recommendations */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[var(--r2m-gray-900)] mb-4">
              Summary
            </h2>
            <p className="text-base text-[var(--r2m-gray-600)] leading-relaxed">
              {analysis.summary}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-[var(--r2m-gray-900)] mb-4">
              Recommendations
            </h2>
            <div className="text-base text-[var(--r2m-gray-600)] leading-relaxed whitespace-pre-line">
              {analysis.recommendations}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push(`/marketplace/create?analysisId=${params.id}`)}
            className="h-12 px-8 text-base font-semibold bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
          >
            Publish to Marketplace
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            onClick={handleSaveToWatchlist}
            disabled={savingToWatchlist || savedToWatchlist}
            variant="outline"
            className={`h-12 px-8 text-base font-semibold ${
              savedToWatchlist
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-[var(--r2m-primary)] text-[var(--r2m-primary)] hover:bg-[var(--r2m-primary)] hover:text-white'
            }`}
          >
            {savingToWatchlist ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : savedToWatchlist ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Saved to Watchlist
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save for Later
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="h-12 px-8 text-base font-semibold"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
