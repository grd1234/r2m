'use client'

import { ArrowRight } from 'lucide-react'

export function MarketplaceBridge() {
  return (
    <section className="relative bg-transparent py-20">
      <div className="max-w-[1600px] mx-auto px-12">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-400/30 rounded-3xl p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              How R2M Bridges the Gap as a <span className="text-blue-400">Marketplace</span>
            </h2>
            <p className="text-2xl italic text-gray-200">
              A Unified Platform Connecting Research, Innovation, and Investment
            </p>
          </div>

          {/* Description */}
          <div className="max-w-[900px] mx-auto mb-10">
            <p className="text-lg text-gray-100 leading-relaxed text-center mb-6">
              R2M acts as a commercialization marketplace where academic discoveries, entrepreneurial vision,
              and investor capital converge.
            </p>
            <p className="text-lg text-gray-100 leading-relaxed text-center">
              By centralizing research insights, commercialization analytics, and opportunity matchmaking,
              the platform reduces friction across the ecosystem—transforming academic knowledge into
              market-ready innovations and accelerating the pathway from discovery to deployment.
            </p>
          </div>

          {/* Visual Flow - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-6 max-w-[1000px] mx-auto">
            {/* Researchers */}
            <div className="bg-purple-500/20 border border-purple-400/40 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">🔬</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Researchers</h3>
              <p className="text-gray-300 text-sm">
                Publish breakthrough discoveries with commercial potential
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-blue-400" />
            </div>

            {/* Innovators */}
            <div className="bg-blue-500/20 border border-blue-400/40 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Innovators</h3>
              <p className="text-gray-300 text-sm">
                Discover and build market-ready products from research
              </p>
            </div>
          </div>

          {/* Bottom Arrow */}
          <div className="flex justify-center my-6">
            <ArrowRight className="w-8 h-8 text-blue-400 rotate-90" />
          </div>

          {/* Investors */}
          <div className="max-w-[320px] mx-auto">
            <div className="bg-cyan-500/20 border border-cyan-400/40 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Investors</h3>
              <p className="text-gray-300 text-sm">
                Fund validated opportunities with data-driven confidence
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
