'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoExpanded, setVideoExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }
    checkAuth()
  }, [])
  return (
    <section className="relative bg-transparent pt-8 pb-32">
      <div className="max-w-[1200px] mx-auto px-12">
        {/* Centered Hero Content - DeepL Style Layout with Dark Theme */}
        <div className="text-center mb-8">
          {/* Main Headline */}
          <h1 className="text-5xl font-bold text-white leading-[1.2] mb-4 max-w-[900px] mx-auto antialiased">
            Research 2 Market
            <br />
            <span className="text-blue-400">Commercialization Platform</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-200 leading-[1.5] mb-12 max-w-[800px] mx-auto antialiased">
            Transform academic research into market opportunities with AI-driven insights, Commercial Viability Scores, and validated research intelligence.
          </p>

          {/* CTA Buttons - Dark Theme */}
          <div className="flex justify-center gap-4">
            {isLoggedIn ? (
              <Button
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Link href="/signup/innovator">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/70 transition-all"
                  >
                    I'm an Innovator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup/investor">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white rounded-lg shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 transition-all"
                  >
                    I'm an Investor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup/researcher">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all"
                  >
                    I'm a Researcher
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Video - Collapsible with Enhanced Visuals */}
        <div className="max-w-[700px] mx-auto mb-16 mt-16 px-4 relative">
          {/* Subtle animated background glow */}
          <div className="absolute -inset-8 overflow-hidden pointer-events-none opacity-50">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {!videoExpanded ? (
            <button
              onClick={() => setVideoExpanded(true)}
              className="w-full relative flex items-center justify-center gap-2 py-4 px-6 bg-slate-800/50 hover:bg-slate-700/50 border-2 border-cyan-400/50 hover:border-cyan-400/80 rounded-lg transition-all group shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40"
            >
              <Play className="w-5 h-25 text-cyan-400 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
              <span className="text-base font-medium text-gray-200 group-hover:text-white">
                Watch: From Research Discovery to Investment - The R2M Journey
              </span>
              <ChevronDown className="w-5 h-25 text-cyan-400 group-hover:translate-y-0.5 transition-transform drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
            </button>
          ) : (
            <div className="space-y-3 relative">
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan-500/20 via-slate-800/50 to-blue-500/20 backdrop-blur-sm p-1 shadow-2xl shadow-cyan-500/30">
                {/* Animated border glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-indigo-500/50 rounded-xl opacity-75 blur animate-pulse"></div>

                <div className="relative rounded-lg overflow-hidden bg-slate-900 p-2 shadow-[0_8px_32px_rgba(34,211,238,0.3),0_-4px_16px_rgba(34,211,238,0.2),inset_0_0_24px_rgba(0,0,0,0.5)]">
                  {/* Corner decorations */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-cyan-400/60 rounded-tl-lg z-10"></div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-cyan-400/60 rounded-tr-lg z-10"></div>
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-cyan-400/60 rounded-bl-lg z-10"></div>
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-cyan-400/60 rounded-br-lg z-10"></div>

                  {/* Cloudflare Stream video - Fast loading with global CDN */}
                  <div className="relative w-full rounded-lg bg-slate-900 overflow-hidden border-2 border-cyan-400/40" style={{ aspectRatio: '16 / 9' }}>
                  <iframe
                    src="https://customer-oi2fd1n7c5lg0u3v.cloudflarestream.com/7f855657362eb4f3dd78c30a836cfe26/iframe?poster=https%3A%2F%2Fcustomer-oi2fd1n7c5lg0u3v.cloudflarestream.com%2F7f855657362eb4f3dd78c30a836cfe26%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                    onLoad={() => setVideoLoaded(true)}
                    onError={() => setVideoError(true)}
                  ></iframe>
                  {!videoLoaded && !videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-2 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                        <p className="text-sm text-gray-300">Loading video...</p>
                      </div>
                    </div>
                  )}
                  {videoError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900 rounded-lg p-8">
                      <div className="text-center px-4 max-w-md">
                        <div className="mb-6 p-6 bg-cyan-500/10 rounded-full inline-block">
                          <Play className="w-20 h-20 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Platform Demo Video</h3>
                        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                          See how R2M Marketplace transforms academic research into market opportunities with AI-driven insights.
                        </p>
                        <div className="text-left text-sm text-gray-300 bg-slate-800/60 rounded-lg p-4 mb-6 border border-cyan-500/30 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">✨</span>
                            <span>AI-Powered CVS Analysis</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">📊</span>
                            <span>Real-time Market Intelligence</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">🚀</span>
                            <span>Streamlined Commercialization</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Video temporarily unavailable. <Link href="/how-it-works" className="text-cyan-400 hover:text-cyan-300 underline">Learn more</Link> or <Link href="/signup/innovator" className="text-cyan-400 hover:text-cyan-300 underline">get started</Link>.
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setVideoExpanded(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm text-gray-400 hover:text-cyan-400 transition-colors hover:bg-slate-800/20 rounded-lg"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Collapse video</span>
              </button>
            </div>
          )}
        </div>

        {/* 4-Column Features Grid - DeepL Style Layout with Dark Theme */}
        <div className="grid grid-cols-4 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">23-38x Faster</h3>
            <p className="text-sm text-gray-300">
              Find and evaluate research opportunities in 1 hour vs 23-38+ hours manually
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 border border-purple-400/30 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">CVS Scoring</h3>
            <p className="text-sm text-gray-300">
              Commercial Viability Scores with explainable AI insights across 6 dimensions
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Accessible Pricing</h3>
            <p className="text-sm text-gray-300">
              From $0 to $5K/year vs $50K-$200K for traditional consultants
            </p>
          </div>

          {/* Feature 4 */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/20 border border-indigo-400/30 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">100M+ Papers</h3>
            <p className="text-sm text-gray-300">
              Comprehensive research coverage across all domains and institutions
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}
