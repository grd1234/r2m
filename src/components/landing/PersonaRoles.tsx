'use client'

import { Lightbulb, TrendingUp, BookOpen } from 'lucide-react'

export function PersonaRoles() {
  const roles = [
    {
      icon: Lightbulb,
      title: 'Innovator Role',
      subtitle: 'Advance Ideas with Validated Research Insights',
      process: 'Discover → Analyze → Build → Launch',
      description: 'Innovators use the R2M platform to identify research aligned with their domain expertise and strategic interests. With AI-driven assessments—including market viability, technical feasibility, IP positioning, and Commercial Viability Scores (CVS)—innovators gain the clarity needed to refine concepts, reduce uncertainty, and accelerate product-development pathways.',
      color: 'blue',
      gradient: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-400/30',
      iconColor: 'text-blue-400'
    },
    {
      icon: TrendingUp,
      title: 'Investor Role',
      subtitle: 'Access Vetted, High-Confidence Innovation Opportunities',
      process: 'Browse → Evaluate → Connect → Invest',
      description: 'Investors leverage R2M to discover research-backed opportunities supported by objective, data-driven analysis. The platform delivers structured due diligence insights, enabling investors to evaluate potential ventures efficiently and make informed capital allocation decisions based on validated commercial indicators.',
      color: 'cyan',
      gradient: 'from-cyan-500/20 to-teal-500/20',
      borderColor: 'border-cyan-400/30',
      iconColor: 'text-cyan-400'
    },
    {
      icon: BookOpen,
      title: 'Researcher Role',
      subtitle: 'Showcase Research with Measurable Commercial Potential',
      process: 'Publish → Analyze → Connect → License',
      description: 'Researchers use R2M to highlight the real-world applicability of their work. Through automated analysis and commercialization scoring, the platform elevates visibility, connects research with relevant innovators and investors, and opens pathways for technology transfer, licensing, and industry collaboration.',
      color: 'purple',
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/30',
      iconColor: 'text-purple-400'
    }
  ]

  return (
    <section className="relative bg-slate-900/50 py-20">
      <div className="max-w-[1600px] mx-auto px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Built for Every Role in the <span className="text-blue-400">Innovation Ecosystem</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-[800px] mx-auto">
            Whether you're building, investing, or researching—R2M provides the tools and insights you need
          </p>
        </div>

        {/* Roles Grid - 3 columns */}
        <div className="grid grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${role.gradient} ${role.borderColor} border rounded-2xl p-6 hover:scale-105 transition-transform duration-300`}
            >
              {/* Icon */}
              <div className={`${role.iconColor} mb-4`}>
                <role.icon className="w-10 h-10" />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {role.title}
              </h3>

              {/* Subtitle */}
              <p className={`${role.iconColor} font-semibold mb-3 text-sm`}>
                {role.subtitle}
              </p>

              {/* Process Flow */}
              <div className="bg-black/30 rounded-lg px-3 py-2 mb-4">
                <p className="text-gray-200 font-mono text-sm text-center">
                  {role.process}
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
