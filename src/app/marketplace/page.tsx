'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Building2, Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MarketplaceListing {
  paper_id: string
  title: string
  cvs_score: number
  tam: number
  trl: number
  tech_category: string
  stage: string
  startup_company: string
}

export default function MarketplacePage() {
  const router = useRouter()
  const supabase = createClient()

  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log('=== MARKETPLACE FETCH START ===')

        // Try fetching from the view first
        console.log('Attempting to fetch from marketplace_opportunities view...')
        let { data, error: fetchError } = await supabase
          .from('marketplace_opportunities')
          .select('*')
          .order('cvs_score', { ascending: false })

        if (fetchError) {
          console.error('View fetch error:', fetchError)
          console.log('Fallback: Querying research_papers directly...')

          const { data: papersData, error: papersError } = await supabase
            .from('research_papers')
            .select(`
              id,
              title,
              tech_category,
              industry,
              stage,
              tam,
              funding_goal,
              marketplace_description,
              created_at,
              profiles:uploaded_by (
                company_name
              )
            `)
            .eq('is_published_to_marketplace', true)

          if (papersError) {
            console.error('Direct query error:', papersError)
            throw papersError
          }

          console.log('Papers fetched:', papersData?.length || 0)

          // Transform to match expected format
          const transformedData = (papersData || []).map((paper: any) => ({
            paper_id: paper.id,
            title: paper.title,
            cvs_score: 0,
            tam: paper.tam || 0,
            trl: 0,
            tech_category: paper.tech_category,
            stage: paper.stage,
            startup_company: paper.profiles?.company_name || 'Unknown',
          }))

          data = transformedData
        } else {
          console.log('View data fetched successfully:', data?.length || 0)
        }

        console.log('Final listings data:', data)
        console.log('=== MARKETPLACE FETCH END ===')

        setListings(data || [])
        setLoading(false)
      } catch (err: any) {
        console.error('=== MARKETPLACE FETCH ERROR ===')
        console.error('Error:', err)
        setError(err.message || 'Failed to load marketplace listings')
        setLoading(false)
      }
    }

    fetchListings()
  }, [supabase])

  const getCVSColor = (score: number) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
    if (score >= 80) return 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
    if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
    return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Quantum Computing': 'border-l-purple-500',
      'Biotech': 'border-l-green-500',
      'Climate Tech': 'border-l-teal-500',
      'Energy': 'border-l-yellow-500',
      'AI/ML': 'border-l-blue-500',
      'Materials Science': 'border-l-pink-500',
      'Healthcare': 'border-l-red-500',
      'FinTech': 'border-l-indigo-500',
      'AgTech': 'border-l-lime-500',
    }
    return colors[category] || 'border-l-gray-500'
  }

  const calculateStats = () => {
    if (listings.length === 0) return { avgScore: 0, totalTam: 0 }

    const avgScore = Math.round(
      listings.reduce((sum, l) => sum + (l.cvs_score || 0), 0) / listings.length
    )
    const totalTam = listings.reduce((sum, l) => sum + (l.tam || 0), 0)

    return { avgScore, totalTam }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--r2m-gray-100)]">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[var(--r2m-primary)] animate-spin mx-auto mb-4" />
            <p className="text-lg text-[var(--r2m-gray-600)]">Loading marketplace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--r2m-gray-100)]">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-[var(--r2m-primary)]" />
            <h1 className="text-4xl font-bold text-[var(--r2m-gray-900)]">
              Browse Marketplace
            </h1>
          </div>
          <p className="text-lg text-[var(--r2m-gray-600)]">
            Discover high-potential research opportunities with AI-powered CVS scores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
            <p className="text-sm text-[var(--r2m-gray-600)] mb-1">
              Total Opportunities
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {listings.length}
            </p>
          </Card>
          <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <p className="text-sm text-[var(--r2m-gray-600)] mb-1">
              Avg CVS Score
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {stats.avgScore || '-'}
            </p>
          </Card>
          <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <p className="text-sm text-[var(--r2m-gray-600)] mb-1">
              Total TAM
            </p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {stats.totalTam > 0 ? `$${(stats.totalTam / 1000).toFixed(1)}B` : '-'}
            </p>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-8 text-center mb-8 border-red-200 bg-red-50">
            <p className="text-lg text-red-600">{error}</p>
          </Card>
        )}

        {/* Listings Grid or Empty State */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-6">
            {listings.map((listing) => (
              <Card
                key={listing.paper_id}
                className={`p-6 hover:shadow-xl transition-all cursor-pointer border-l-4 ${getCategoryColor(listing.tech_category)}`}
              >
                {/* CVS Score Badge */}
                <div className="flex items-start justify-between mb-4">
                  <Badge className={`text-lg font-bold px-3 py-1 ${getCVSColor(listing.cvs_score)}`}>
                    CVS {listing.cvs_score}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    TRL {listing.trl}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-[var(--r2m-gray-900)] mb-3">
                  {listing.title}
                </h3>

                {/* Category & Stage */}
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {listing.tech_category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {listing.stage}
                  </Badge>
                </div>

                {/* Company */}
                {listing.startup_company && (
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-[var(--r2m-gray-400)]" />
                    <span className="text-sm text-[var(--r2m-gray-600)]">
                      {listing.startup_company}
                    </span>
                  </div>
                )}

                {/* TAM */}
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[var(--r2m-success)]" />
                  <span className="text-sm text-[var(--r2m-gray-600)]">
                    TAM: ${listing.tam?.toLocaleString() || 'N/A'}M
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/marketplace/${listing.paper_id}`)}
                    className="flex-1 bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
                  >
                    View Details
                  </Button>
                  <Button variant="outline" className="px-4">
                    Save
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 text-[var(--r2m-gray-400)] mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-[var(--r2m-gray-900)] mb-2">
              No Opportunities Yet
            </h3>
            <p className="text-base text-[var(--r2m-gray-600)] mb-6">
              Be the first to publish your research to the marketplace!
            </p>
            <Button
              onClick={() => router.push('/analysis/search')}
              className="bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
            >
              Start Analysis
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
