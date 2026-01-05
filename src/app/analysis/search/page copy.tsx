'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import { Search, Sparkles, TrendingUp, Mic, MicOff } from 'lucide-react'

export default function AnalysisSearchPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const supabase = createClient()

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [browserSupport, setBrowserSupport] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Sample suggestions
  const suggestions = [
    'Quantum computing for drug discovery',
    'CRISPR gene editing applications',
    'Carbon capture technologies',
    'Battery technology innovations',
    'Artificial photosynthesis',
  ]

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
          setError('')
        }

        recognition.onresult = (event: any) => {
          const rawTranscript = event.results[0][0].transcript

          // Clean up common filler phrases and conversational prefixes
          const cleanedQuery = rawTranscript
            .replace(/^(i want to|i need to|i would like to|can you|could you|please|help me) (search for|find|look up|analyze|research|get info on|get information on|show me) /i, '')
            .replace(/^(search for|find|look up|analyze|research|show me|get info on|get information on) /i, '')
            .replace(/^(about|on|regarding|related to) /i, '')
            .trim()

          setQuery(cleanedQuery)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please enable microphone permissions.')
          } else {
            setError('Voice recognition failed. Please try again.')
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      } else {
        setBrowserSupport(false)
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in your browser. Try Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch (err) {
        console.error('Failed to start recognition:', err)
        setError('Failed to start voice input. Please try again.')
      }
    }
  }

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('cvs_analyses')
        .insert({
          analyzed_by: user?.id,
          title: searchQuery,
          query: searchQuery,
          status: 'processing',
        })
        .select()
        .single()

      if (analysisError) throw analysisError

      // Trigger the CVS analysis workflow in the background
      fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisId: analysisData.id }),
      }).catch((err) => {
        console.error('Failed to trigger analysis:', err)
      })

      // Redirect to results page immediately (it will poll for updates)
      router.push(`/analysis/results/${analysisData.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Research Analysis
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Analyze Your Research
          </h1>
          <p className="text-xl text-gray-300 max-w-[700px] mx-auto">
            Search for research papers and get comprehensive CVS score analysis,
            market insights, and commercialization recommendations
          </p>
        </div>

        {/* Search Box */}
        <Card className="p-8 mb-12 bg-slate-800/50 border border-blue-400/30 backdrop-blur-sm shadow-2xl shadow-blue-500/10">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch(query)
                }}
                placeholder={isListening ? "Listening... Say your topic (e.g. 'quantum computing for drug discovery')" : "Enter research topic, keywords, or technology area..."}
                className="h-14 pl-12 pr-12 text-base bg-slate-900/50 border-blue-400/30 text-white placeholder:text-gray-400 focus:border-blue-400"
                disabled={loading}
              />
              <Button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loading || !browserSupport}
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-slate-700 hover:bg-blue-600 hover:text-white text-gray-400'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>
            <Button
              onClick={() => handleSearch(query)}
              disabled={loading}
              className="h-14 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Analyzing...' : 'Analyze Research'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-400/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Suggestions */}
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-3">
              Popular searches:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    handleSearch(suggestion)
                  }}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-400/50 text-gray-300 text-sm rounded-lg transition-colors border border-slate-600"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
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
