'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, FileText } from 'lucide-react'

interface AnalysisPaper {
  id: string
  analysis_id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  citations: number
  relevance_score: number
  paper_id: string
  url?: string
  metadata?: {
    trl?: number
    feasibility?: number
    commercial_potential?: number
    auto_selected?: boolean
    selection_rationale?: string
  }
}

interface PaperSelectionCheckpointProps {
  analysisId: string
  onPaperSelected: () => void
}

export function PaperSelectionCheckpoint({ analysisId, onPaperSelected }: PaperSelectionCheckpointProps) {
  const supabase = createClient()
  const [papers, setPapers] = useState<AnalysisPaper[]>([])
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null)
  const [autoSelectedPaperId, setAutoSelectedPaperId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch papers from papers_from_technical_analysis table
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('papers_from_technical_analysis')
          .select('*')
          .eq('analysis_id', analysisId)
          .order('relevance_score', { ascending: false })

        if (fetchError) {
          console.error('Error fetching papers:', fetchError)
          setError('Failed to load papers. Please try again.')
          setLoading(false)
          return
        }

        if (!data || data.length === 0) {
          console.log('No papers found yet, will retry...')
          // Retry after 2 seconds
          setTimeout(fetchPapers, 2000)
          return
        }

        console.log(`Found ${data.length} papers`)
        setPapers(data)

        // Find auto-selected paper (highest TRL + feasibility, or first one)
        const autoSelected = data.find(p => p.metadata?.auto_selected === true) || data[0]
        if (autoSelected) {
          setAutoSelectedPaperId(autoSelected.id)
          setSelectedPaperId(autoSelected.id)
        }

        setLoading(false)
      } catch (err: any) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchPapers()
  }, [analysisId, supabase])

  const handleConfirmSelection = async () => {
    if (!selectedPaperId) {
      setError('Please select a paper')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Find selected paper
      const selectedPaper = papers.find(p => p.id === selectedPaperId)
      if (!selectedPaper) {
        throw new Error('Selected paper not found')
      }

      // Update cvs_analyses with selected paper
      const { error: updateError } = await supabase
        .from('cvs_analyses')
        .update({
          paper_id: selectedPaper.paper_id,
          auto_selected_paper_id: autoSelectedPaperId === selectedPaperId ? selectedPaper.paper_id : null,
          user_overrode_selection: autoSelectedPaperId !== selectedPaperId,
          status: 'processing',
          analysis_notes: {
            user_confirmed: true,
            auto_selection: autoSelectedPaperId === selectedPaperId,
            selected_paper_title: selectedPaper.title,
          }
        })
        .eq('id', analysisId)

      if (updateError) {
        throw updateError
      }

      // Trigger n8n webhook to continue analysis
      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          paperId: selectedPaper.paper_id,
          paperTitle: selectedPaper.title
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start analysis')
      }

      console.log('Analysis started successfully')
      onPaperSelected()

    } catch (err: any) {
      console.error('Error confirming selection:', err)
      setError(err.message || 'Failed to start analysis')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Finding research papers...</p>
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          Our AI is searching through 100M+ papers to find the best matches
        </p>
      </Card>
    )
  }

  if (papers.length === 0 && !loading) {
    return (
      <Card className="p-8 max-w-4xl mx-auto border-red-200 bg-red-50">
        <p className="text-lg text-red-600 text-center">
          No papers found for your query. Please try a different search.
        </p>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Select Research Paper for Analysis
        </h2>
        <p className="text-gray-600">
          We found {papers.length} relevant {papers.length === 1 ? 'paper' : 'papers'}.
          Choose one to analyze for commercial viability.
        </p>
      </div>

      {/* Papers List */}
      <div className="space-y-4">
        {papers.map((paper, index) => {
          const isRecommended = paper.id === autoSelectedPaperId
          const isSelected = paper.id === selectedPaperId
          const trl = paper.metadata?.trl
          const feasibility = paper.metadata?.feasibility
          const commercialPotential = paper.metadata?.commercial_potential

          return (
            <Card
              key={paper.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-2 border-blue-500 bg-blue-50/50'
                  : 'border border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedPaperId(paper.id)}
            >
              <div className="flex items-start gap-4">
                {/* Radio Button */}
                <div className="pt-1">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedPaperId(paper.id)}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                </div>

                {/* Paper Content */}
                <div className="flex-1">
                  {/* Title and Badges */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {index + 1}. {paper.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {isRecommended && (
                          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            RECOMMENDED
                          </Badge>
                        )}
                        {trl && (
                          <Badge variant="outline" className="text-xs">
                            TRL: {trl}/9
                          </Badge>
                        )}
                        {feasibility && (
                          <Badge variant="outline" className="text-xs">
                            Feasibility: {feasibility}/10
                          </Badge>
                        )}
                        {commercialPotential && (
                          <Badge variant="outline" className="text-xs">
                            Commercial: {commercialPotential}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Authors and Year */}
                  <p className="text-sm text-gray-600 mb-2">
                    {paper.authors?.slice(0, 3).join(', ')}
                    {paper.authors?.length > 3 && ` +${paper.authors.length - 3} more`}
                    {paper.year && ` • ${paper.year}`}
                    {paper.citations && ` • ${paper.citations.toLocaleString()} citations`}
                  </p>

                  {/* Abstract */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {paper.abstract}
                  </p>

                  {/* Recommendation Rationale */}
                  {isRecommended && paper.metadata?.selection_rationale && (
                    <div className="mt-3 p-3 bg-blue-100 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Why recommended:</strong> {paper.metadata.selection_rationale}
                      </p>
                    </div>
                  )}

                  {/* Paper Link */}
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FileText className="w-4 h-4" />
                      View full paper
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {/* Confirmation Button */}
      <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedPaperId === autoSelectedPaperId ? (
              <span>Proceeding with AI recommended paper</span>
            ) : (
              <span className="text-amber-600">You've overridden the AI recommendation</span>
            )}
          </div>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedPaperId || submitting}
            className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Analysis...
              </>
            ) : (
              <>
                Proceed with {selectedPaperId === autoSelectedPaperId ? 'Recommended' : 'Selected'} Paper
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
