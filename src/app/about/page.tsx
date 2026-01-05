import { Navigation } from '@/components/shared/Navigation'
import { Footer } from '@/components/shared/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      <div className="max-w-[1200px] mx-auto px-12 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            About R2M Marketplace
          </h1>
          <p className="text-xl text-gray-200 max-w-[800px] mx-auto leading-relaxed">
            Connecting breakthrough research with investors and partners through AI-powered analysis.
          </p>
        </div>

        {/* Our Mission */}
        <div className="mb-16 bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-10">
          <h2 className="text-3xl font-bold text-white mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed mb-4">
            R2M Marketplace bridges the gap between cutting-edge research and market opportunities.
            We use AI-powered analysis to evaluate the Commercial Viability Score (CVS) of research,
            helping startups, investors, and corporate R&D teams make informed decisions.
          </p>
          <p className="text-lg text-gray-200 leading-relaxed">
            Our platform analyzes technical feasibility, market potential, intellectual property strength,
            and Technology Readiness Levels (TRL) to provide comprehensive insights that accelerate
            the research-to-market journey.
          </p>
        </div>

        {/* Why R2M Exists */}
        <div className="mb-16 bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-10">
          <h2 className="text-3xl font-bold text-white mb-6">
            Why R2M Exists
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed">
            Commercializing research is slow, costly, and often subjective. R2M Marketplace provides
            an objective, AI-driven framework that allows researchers and investors to quickly assess
            potential, reduce risk, and unlock new opportunities.
          </p>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-xl p-10">
          <h2 className="text-3xl font-bold text-white mb-6">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
              <p className="text-lg text-gray-200">
                AI-powered commercial viability scoring
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
              <p className="text-lg text-gray-200">
                Scalable analysis for researchers, R&D teams, and institutions
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
              <p className="text-lg text-gray-200">
                Transparent evaluation criteria
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
              <p className="text-lg text-gray-200">
                Designed to translate scientific innovation into market impact
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
