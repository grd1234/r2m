'use client'

import { CheckCircle, AlertCircle } from 'lucide-react'

export function CVSExplainer() {
  return (
    <section className="relative bg-transparent py-20">
      <div className="max-w-[1600px] mx-auto px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Commercial Viability Score <span className="text-blue-400">(CVS)</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-[800px] mx-auto">
            AI-driven scoring system that evaluates research across 6 dimensions to determine commercial potential
          </p>
        </div>

        {/* CVS Example Card - 2 Column Grid */}
        <div className="grid grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {/* Left: Score Display */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30 rounded-2xl p-8 flex flex-col items-center justify-center">
            <div className="text-7xl font-bold text-white mb-2">74</div>
            <div className="text-2xl font-semibold text-blue-400 mb-4">CVS Score</div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">High Commercial Potential</span>
            </div>
          </div>

          {/* Right: Breakdown */}
          <div className="bg-slate-800/50 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Technical Merit</span>
                <span className="text-white font-semibold">20/25</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{width: '80%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Market Opportunity</span>
                <span className="text-white font-semibold">16/20</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{width: '80%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Commercial Potential</span>
                <span className="text-white font-semibold">19/25</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-cyan-400 h-2 rounded-full" style={{width: '76%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">IP Landscape</span>
                <span className="text-white font-semibold">9/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{width: '90%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Competitive Position</span>
                <span className="text-white font-semibold">8/15</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{width: '53%'}}></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-300">Risk Assessment</span>
                <span className="text-white font-semibold">2/5</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{width: '40%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
