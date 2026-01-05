'use client'

import { Navigation } from '@/components/shared/Navigation'
import { HowItWorks } from '@/components/landing/HowItWorks'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      {/* Header Section */}
      <div className="py-20">
        <div className="max-w-[1600px] mx-auto px-12">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            How R2M Marketplace Works
          </h1>
          <p className="text-xl text-gray-200 max-w-[700px] mx-auto text-center">
            Transform your research into market opportunities in three simple steps.
            Our AI-powered platform connects breakthrough innovations with investors.
          </p>
        </div>
      </div>

      {/* How It Works Component */}
      <HowItWorks />

      {/* Additional Details Section */}
      <div className="py-20">
        <div className="max-w-[1600px] mx-auto px-12">
          <div className="grid grid-cols-2 gap-12">
            {/* For Researchers/Innovators */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                For Researchers & Innovators
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-400/30">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Submit Your Research
                    </h3>
                    <p className="text-gray-300">
                      Upload your research paper, patent, or innovation. Our AI analyzes
                      technical feasibility, market potential, and commercialization readiness.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-400/30">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Get Your CVS Score
                    </h3>
                    <p className="text-gray-300">
                      Receive a Commercial Viability Score (0-100) with detailed analysis
                      including TAM, TRL, competitive landscape, and go-to-market recommendations.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-400/30">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Publish to Marketplace
                    </h3>
                    <p className="text-gray-300">
                      List your opportunity on our marketplace where investors, corporate partners,
                      and licensors can discover and connect with you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Investors */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                For Investors & Partners
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-400/30">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Browse Opportunities
                    </h3>
                    <p className="text-gray-300">
                      Explore pre-vetted research opportunities with AI-powered CVS scores.
                      Filter by industry, stage, TAM, and technology readiness level.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-400/30">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Review Detailed Analysis
                    </h3>
                    <p className="text-gray-300">
                      Access comprehensive reports including market analysis, competitive positioning,
                      technical assessments, and commercialization pathways.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-400/30">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Connect & Invest
                    </h3>
                    <p className="text-gray-300">
                      Express interest and connect directly with researchers. Our platform
                      facilitates secure deal flow from commitment to closing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 border-t border-blue-400/20">
        <div className="max-w-[1600px] mx-auto px-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-[600px] mx-auto">
            Join R2M Marketplace today and transform research into market opportunities.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/signup/innovator">
              <button className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg transition-all">
                Start Free Trial
              </button>
            </a>
            <a href="/marketplace">
              <button className="h-14 px-8 text-lg font-semibold bg-transparent text-blue-400 border-2 border-blue-400/50 hover:bg-blue-500/20 rounded-lg transition-all">
                Browse Opportunities
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
