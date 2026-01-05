'use client'

import { Search, BarChart3, Handshake } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Analyze Your Research',
    description:
      'Upload your research or search our database. Our AI evaluates CVS scores, market potential, and technical readiness.',
    color: 'var(--r2m-primary)',
    bgGradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: BarChart3,
    title: 'Get Detailed Insights',
    description:
      'Receive comprehensive analysis including TAM, TRL scores, competitive landscape, and commercialization recommendations.',
    color: 'var(--r2m-secondary)',
    bgGradient: 'from-purple-500 to-violet-600',
  },
  {
    icon: Handshake,
    title: 'Connect with Partners',
    description:
      'Publish to our marketplace and get matched with investors, corporate partners, or licensing opportunities.',
    color: 'var(--r2m-accent)',
    bgGradient: 'from-cyan-500 to-teal-600',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-[1280px] mx-auto px-20">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[var(--r2m-gray-900)] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[var(--r2m-gray-600)] max-w-[600px] mx-auto">
            Three simple steps to transform your research into market opportunities
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-[var(--r2m-gray-200)] flex items-center justify-center text-[var(--r2m-gray-600)] font-bold text-lg z-10">
                  {index + 1}
                </div>

                {/* Icon Container */}
                <div
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl bg-gradient-to-br ${step.bgGradient}`}
                >
                  <Icon
                    className="w-12 h-12 text-white"
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[var(--r2m-gray-900)] mb-3">
                  {step.title}
                </h3>
                <p className="text-base text-[var(--r2m-gray-600)] leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-6 w-12 h-0.5 bg-[var(--r2m-gray-300)]">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[var(--r2m-gray-300)]"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
