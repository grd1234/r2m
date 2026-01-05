'use client'

import { Clock, Award, DollarSign, Database } from 'lucide-react'

export function WhyR2M() {
  const benefits = [
    {
      icon: Clock,
      title: '23-38x Faster',
      description: 'Find opportunities in 1 hour vs 23-38+ hours',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-400/30'
    },
    {
      icon: Award,
      title: 'CVS Scoring',
      description: 'Know commercial viability instantly',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-400/30'
    },
    {
      icon: DollarSign,
      title: 'Accessible Pricing',
      description: '$0-$5K vs $50K-$200K consultants',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-400/30'
    },
    {
      icon: Database,
      title: '100M+ Research Papers',
      description: 'Comprehensive research coverage',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-400/30'
    }
  ]

  return (
    <section className="relative bg-slate-900/50 py-20">
      <div className="max-w-[1600px] mx-auto px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why <span className="text-blue-400">R2M</span>?
          </h2>
          <p className="text-lg text-gray-300 max-w-[700px] mx-auto">
            Transform how you discover and evaluate academic research with AI-powered insights
          </p>
        </div>

        {/* Benefits Grid - 4 columns */}
        <div className="grid grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`${benefit.bgColor} ${benefit.borderColor} border rounded-xl p-6 hover:scale-105 transition-transform duration-300`}
            >
              <div className={`${benefit.color} mb-4`}>
                <benefit.icon className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
