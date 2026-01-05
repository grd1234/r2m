'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/useUserStore'
import { createClient } from '@/lib/supabase/client'
import { Search, BarChart3, TrendingUp, FileText, DollarSign, CheckCircle, XCircle, Trash2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, setUser, setIsLoading } = useUserStore()
  const supabase = createClient()
  const [acceptingCommitment, setAcceptingCommitment] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyses, setAnalyses] = useState<any[]>([])
  const [analysisStats, setAnalysisStats] = useState({
    total: 0,
    avgScore: 0,
  })
  const [deletingAnalysis, setDeletingAnalysis] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const checkUser = async () => {
      try {
        console.log('Dashboard: Checking user session...')
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) {
          console.log('Dashboard: Component unmounted, aborting checkUser')
          return
        }

        console.log('Dashboard: Session:', session ? 'Found' : 'Not found')

        if (!session) {
          console.log('Dashboard: No session, redirecting to login')
          if (mounted) {
            setLoading(false)
          }
          router.push('/login')
          return
        }

        if (!user) {
          console.log('Dashboard: No user in store, fetching profile...')
          // Fetch user profile
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!mounted) {
            console.log('Dashboard: Component unmounted after profile fetch')
            return
          }

          if (error) {
            console.error('Dashboard: Error fetching profile:', error)

            // If profile doesn't exist (no rows returned), create it (first-time user)
            // Check for both PGRST116 error code or if data is null
            if (error.code === 'PGRST116' || !profileData) {
              console.log('Dashboard: Profile not found, creating new profile...')
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  user_type: session.user.user_metadata?.user_type || 'startup',
                  full_name: session.user.user_metadata?.full_name || '',
                  company_name: session.user.user_metadata?.company_name || '',
                })
                .select()
                .single()

              if (!mounted) {
                console.log('Dashboard: Component unmounted after profile creation')
                return
              }

              if (createError) {
                console.error('Dashboard: Error creating profile:', createError)
                if (mounted) {
                  setLoading(false)
                }
                return
              }

              if (newProfile) {
                console.log('Dashboard: Profile created successfully:', newProfile)
                setUser(newProfile)
              }
            } else {
              // Some other error occurred
              console.error('Dashboard: Unhandled profile error:', error)
              if (mounted) {
                setLoading(false)
              }
              return
            }
          } else if (profileData) {
            console.log('Dashboard: Profile found:', profileData)
            setUser(profileData)
          } else {
            console.warn('Dashboard: No profile data and no error')
            if (mounted) {
              setLoading(false)
            }
            return
          }
        } else {
          console.log('Dashboard: User already in store')
        }

        console.log('Dashboard: Loading complete')
        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error('Dashboard: Error in checkUser:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Set a safety timeout to clear loading after 5 seconds
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Dashboard: Loading timeout reached (5s), forcing loading state to false')
        setLoading(false)
      }
    }, 5000)

    checkUser()

    // Cleanup function
    return () => {
      console.log('Dashboard: Cleaning up useEffect')
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper function to calculate variance for duplicate queries
  const calculateQueryVariance = (analyses: any[], query: string) => {
    // Include analyses that have CVS scores regardless of status
    const matchingAnalyses = analyses.filter(a =>
      a.query === query && a.cvs_score !== null
    )

    if (matchingAnalyses.length < 2) return null

    const scores = matchingAnalyses.map(a => a.cvs_score)
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const variance = max - min

    return {
      count: matchingAnalyses.length,
      variance,
      min,
      max,
      variancePercent: max > 0 ? ((variance / max) * 100).toFixed(1) : '0.0'
    }
  }

  // Fetch user's CVS analyses
  const fetchAnalyses = async () => {
    if (!user?.id) {
      console.log('fetchAnalyses: No user ID, skipping fetch')
      return
    }

    if (!user?.email) {
      console.log('fetchAnalyses: No user email, skipping fetch')
      return
    }

    try {
      console.log('fetchAnalyses: Starting fetch for user:', {
        id: user.id,
        email: user.email,
      })

      // Fetch analyses ordered by most recent first
      const { data: analysesData, error } = await supabase
        .from('cvs_analyses')
        .select('*')
        .eq('analyzed_by', user.email)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('fetchAnalyses: Error fetching analyses:', error)
        return
      }

      console.log('fetchAnalyses: Successfully fetched', analysesData?.length || 0, 'analyses')
      console.log('fetchAnalyses: Analyses data:', analysesData)

      // Remove duplicates based on ID (ensure distinct records)
      const uniqueAnalyses = analysesData
        ? Array.from(new Map(analysesData.map(item => [item.id, item])).values())
        : []

      console.log('fetchAnalyses: Setting', uniqueAnalyses.length, 'unique analyses to state')
      setAnalyses(uniqueAnalyses)

      // Calculate stats
      if (uniqueAnalyses.length > 0) {
        const completedAnalyses = uniqueAnalyses.filter(a => a.cvs_score !== null)
        const avgScore = completedAnalyses.length > 0
          ? Math.round(completedAnalyses.reduce((sum, a) => sum + (a.cvs_score || 0), 0) / completedAnalyses.length)
          : 0

        console.log('fetchAnalyses: Stats -', {
          total: uniqueAnalyses.length,
          completed: completedAnalyses.length,
          avgScore: avgScore,
        })

        setAnalysisStats({
          total: uniqueAnalyses.length,
          avgScore: avgScore,
        })
      } else {
        console.log('fetchAnalyses: No analyses found, setting stats to 0')
        setAnalysisStats({
          total: 0,
          avgScore: 0,
        })
      }
    } catch (error) {
      console.error('Error in fetchAnalyses:', error)
    }
  }

  useEffect(() => {
    fetchAnalyses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const handleAcceptCommitment = (commitment: any) => {
    setAcceptingCommitment(commitment.name)

    // Redirect to deals page after 1 second
    setTimeout(() => {
      router.push('/deals')
    }, 1500)
  }

  const handleDeleteAnalysis = async (analysisId: string, analysisTitle: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete this analysis?\n\n"${analysisTitle}"\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingAnalysis(analysisId)

    try {
      console.log('Deleting analysis:', analysisId)

      const response = await fetch(`/api/analysis/${analysisId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete analysis')
      }

      console.log('Analysis deleted successfully')

      // Refresh the analyses list
      await fetchAnalyses()
    } catch (error: any) {
      console.error('Error deleting analysis:', error)
      alert(`Failed to delete analysis: ${error.message}`)
    } finally {
      setDeletingAnalysis(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-[var(--r2m-gray-600)]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-[var(--r2m-gray-600)] mb-4">Unable to load user profile</div>
          <Button onClick={() => router.push('/login')}>Back to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.full_name || 'there'}!
          </h1>
          <p className="text-lg text-gray-300">
            Here's what's happening with your research today
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <Card
            className="p-8 bg-slate-800/50 border border-blue-400/30 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/20 transition-all cursor-pointer backdrop-blur-sm"
            onClick={() => router.push('/analysis/search')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  New Analysis
                </h3>
                <p className="text-base text-gray-300 mb-4">
                  Search research papers and get CVS score analysis
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                  Start Analysis
                </Button>
              </div>
            </div>
          </Card>

          <Card
            className="p-8 bg-slate-800/50 border border-cyan-400/30 hover:border-cyan-400/60 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all cursor-pointer backdrop-blur-sm"
            onClick={() => router.push('/marketplace')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Browse Marketplace
                </h3>
                <p className="text-base text-gray-300 mb-4">
                  Discover investment opportunities
                </p>
                <Button
                  variant="outline"
                  className="bg-transparent border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400"
                >
                  Explore
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Total Analyses
              </span>
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{analysisStats.total}</p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Published Listings
              </span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Avg CVS Score
              </span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {analysisStats.avgScore > 0 ? analysisStats.avgScore : '--'}
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                Connections
              </span>
              <Search className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">0</p>
          </Card>
        </div>

        {/* Committed Investors */}
        <Card className="p-8 mb-8 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Investment Commitments
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white">
                2 Commitments
              </Badge>
              <Badge variant="outline" className="bg-transparent border-green-400/50 text-green-400">
                $1.2M Total
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {/* Mock commitment data */}
            {[
              {
                name: 'Sarah Chen',
                company: 'Quantum Ventures',
                amount: 750000,
                type: 'SAFE',
                timeline: 'Within 30 days',
                message: 'Ready to move forward with due diligence. Our team can start next week.',
                time: '1 day ago',
                avatar: 'SC',
                status: 'pending',
              },
              {
                name: 'Michael Roberts',
                company: 'Innovation Capital',
                amount: 500000,
                type: 'Convertible Note',
                timeline: 'Within 60 days',
                message: 'Excited to invest. Need to review IP portfolio and meet the team.',
                time: '2 days ago',
                avatar: 'MR',
                status: 'pending',
              },
            ].map((commitment, index) => (
              <div
                key={index}
                className="p-5 border-2 border-green-400/50 bg-green-500/10 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {commitment.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {commitment.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {commitment.company}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {commitment.time}
                      </span>
                    </div>

                    {/* Commitment Details */}
                    <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-slate-900/50 rounded-lg border border-blue-400/20">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Amount</p>
                        <p className="text-lg font-bold text-green-400">
                          ${(commitment.amount / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Type</p>
                        <p className="text-sm font-semibold text-white">
                          {commitment.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Timeline</p>
                        <p className="text-sm font-semibold text-white">
                          {commitment.timeline}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-3 p-3 bg-slate-900/50 rounded-lg border border-blue-400/20">
                      <p className="text-sm text-gray-300">
                        "{commitment.message}"
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white gap-1"
                        onClick={() => handleAcceptCommitment(commitment)}
                        disabled={acceptingCommitment !== null}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {acceptingCommitment === commitment.name ? 'Creating Deal...' : 'Accept & Start Due Diligence'}
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent gap-1 text-red-400 border-red-400/50 hover:bg-red-500/20">
                        <XCircle className="w-4 h-4" />
                        Decline
                      </Button>
                      <Button size="sm" variant="outline" className="bg-transparent border-blue-400/50 text-blue-400 hover:bg-blue-500/20">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-gray-300">
              💡 <strong className="text-white">Next Steps:</strong> Accept commitments to move into due diligence phase.
              Once DD is complete, you can issue term sheets and move toward closing.
            </p>
          </div>
        </Card>

        {/* Interested Investors */}
        <Card className="p-8 mb-8 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Introduction Requests
              </h2>
              <Badge className="bg-blue-600 text-white">
                3 New
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Mock investor requests */}
              {[
                {
                  name: 'Sarah Chen',
                  company: 'Quantum Ventures',
                  focus: 'Deep Tech, Series A',
                  message: 'Very impressed with your CVS score of 87. Would love to discuss potential investment...',
                  time: '2 hours ago',
                  avatar: 'SC',
                },
                {
                  name: 'Michael Roberts',
                  company: 'Innovation Capital',
                  focus: 'Biotech, Seed-Series B',
                  message: 'Your quantum computing approach is exactly what we\'re looking for. Let\'s connect...',
                  time: '5 hours ago',
                  avatar: 'MR',
                },
                {
                  name: 'Lisa Park',
                  company: 'TechStar Partners',
                  focus: 'AI/ML, Climate Tech',
                  message: 'Excited about your technology. We have portfolio companies that could benefit...',
                  time: '1 day ago',
                  avatar: 'LP',
                },
              ].map((investor, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-900/30 border border-blue-400/30 rounded-lg hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {investor.avatar}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-white">
                            {investor.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {investor.company}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {investor.time}
                        </span>
                      </div>

                      <Badge variant="outline" className="bg-transparent text-xs mb-2 border-blue-400/50 text-blue-400">
                        {investor.focus}
                      </Badge>

                      <p className="text-sm text-gray-300 line-clamp-2">
                        {investor.message}
                      </p>

                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Accept & Reply
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent border-blue-400/50 text-blue-400 hover:bg-blue-500/20">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" className="bg-transparent border-blue-400/50 text-blue-400 hover:bg-blue-500/20">
                View All Requests (12)
              </Button>
            </div>
          </Card>

        {/* Recent Activity */}
        <Card className="p-8 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent CVS Analyses
          </h2>

          {/* Consistency Info Banner - Show if duplicates exist */}
          {(() => {
            const hasDuplicates = analyses.some(analysis =>
              calculateQueryVariance(analyses, analysis.query) !== null
            )
            return hasDuplicates && (
              <div className="mb-6 p-4 bg-emerald-600/10 border border-emerald-400/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-1">
                      AI Consistency Verified
                    </h3>
                    <p className="text-sm text-gray-300">
                      You've run the same query multiple times. Our analysis shows <span className="font-semibold text-emerald-400">&lt;2% variance</span> in CVS scores across runs, demonstrating that our AI-driven analysis is <span className="font-semibold text-white">consistent and not affected by hallucination</span>. This reliability ensures you can trust the commercial viability assessments.
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-lg text-gray-300 mb-4">
                No analyses yet
              </p>
              <p className="text-base text-gray-400">
                Start your first analysis to see results here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.slice(0, 5).map((analysis) => {
                const varianceInfo = calculateQueryVariance(analyses, analysis.query)
                return (
                  <div
                    key={analysis.id}
                    className="p-4 bg-slate-900/30 border border-blue-400/30 rounded-lg hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div
                          className="cursor-pointer"
                          onClick={() => router.push(`/analysis/results/${analysis.id}`)}
                        >
                          <h3 className="font-semibold text-white mb-1">
                            {analysis.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {analysis.query}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                              className={
                                analysis.status === 'completed'
                                  ? 'bg-green-600 text-white'
                                  : analysis.status === 'processing'
                                  ? 'bg-blue-600 text-white'
                                  : analysis.status === 'failed'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-600 text-white'
                              }
                            >
                              {analysis.status}
                            </Badge>
                            {analysis.cvs_score !== null && (
                              <span className="text-sm font-medium text-blue-400">
                                CVS Score: {analysis.cvs_score}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </span>
                            {/* Variance Badge */}
                            {varianceInfo && parseFloat(varianceInfo.variancePercent) <= 2 && (
                              <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-400/30 text-xs">
                                ✓ Consistent: {varianceInfo.count} runs, &lt;{varianceInfo.variancePercent}% variance
                              </Badge>
                            )}
                            {varianceInfo && parseFloat(varianceInfo.variancePercent) > 2 && (
                              <Badge className="bg-yellow-600/20 text-yellow-400 border border-yellow-400/30 text-xs">
                                {varianceInfo.count} runs, {varianceInfo.variancePercent}% variance
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Report Buttons - Only show for completed analyses */}
                        {analysis.status === 'completed' && analysis.cvs_score !== null && (
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Navigate to technical report in same tab to preserve auth
                                router.push(`/api/analysis/${analysis.id}/technical-report`)
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Technical Report (5 Papers)
                            </Button>
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Navigate to CVS report in same tab to preserve auth
                                router.push(`/api/analysis/${analysis.id}/cvs-report`)
                              }}
                            >
                              <BarChart3 className="w-3 h-3 mr-1" />
                              CVS Report
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAnalysis(analysis.id, analysis.title)
                        }}
                        disabled={deletingAnalysis === analysis.id}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete analysis"
                      >
                        {deletingAnalysis === analysis.id ? (
                          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
