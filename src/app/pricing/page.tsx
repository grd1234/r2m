'use client'

import { Navigation } from '@/components/shared/Navigation'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function PricingPage() {
  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for exploring the platform',
      features: [
        'Unlimited searches',
        '3 CVS reports/month',
        'Basic filters',
        'Read-only research summaries',
        'Community support',
      ],
      cta: 'Get Started',
      ctaLink: '/signup/innovator',
      highlight: false,
      colorClass: 'border-gray-200',
    },
    {
      name: 'Innovator Basic',
      price: '$100',
      period: 'per year',
      monthlyPrice: '$10/month',
      description: 'For fresh graduates & solo entrepreneurs',
      features: [
        'Everything in Free',
        '20 CVS reports/month',
        'Advanced filters (TRL, market size, IP)',
        'Save 50 papers to watchlist',
        'Email alerts (1 saved search)',
        'Export CVS reports (watermarked)',
        'Email support',
      ],
      cta: 'Start Basic',
      ctaLink: '/signup/innovator',
      highlight: false,
      colorClass: 'border-blue-200',
    },
    {
      name: 'Innovator Premium',
      price: '$300',
      period: 'per year',
      monthlyPrice: '$30/month',
      description: 'For active innovators & small teams',
      features: [
        'Everything in Basic',
        '50 CVS reports/month',
        'Save 200 papers to watchlist',
        'Email alerts (5 saved searches)',
        'Compare papers (up to 3)',
        'Export CVS reports (branded)',
        'Priority email support',
      ],
      cta: 'Start Premium',
      ctaLink: '/signup/innovator',
      highlight: true,
      colorClass: 'border-blue-500',
    },
    {
      name: 'Innovator Pro',
      price: '$500',
      period: 'per year',
      monthlyPrice: '$50/month',
      description: 'For tech leaders & pre-PMF startups',
      features: [
        'Everything in Premium',
        'Unlimited CVS reports',
        'Save unlimited papers',
        'Unlimited email alerts',
        'Compare papers (unlimited)',
        'Team collaboration (5 seats)',
        'Priority chat support',
        'Weekly trend reports',
      ],
      cta: 'Start Pro',
      ctaLink: '/signup/innovator',
      highlight: false,
      colorClass: 'border-indigo-200',
    },
    {
      name: 'Growth',
      price: '$5,000',
      period: 'per year',
      description: 'For scaling startups & companies',
      features: [
        'Everything in Innovator Pro',
        'Team collaboration (20 seats)',
        'Dedicated account manager',
        'API access (10K calls/month)',
        'Quarterly market intelligence',
        'Advanced analytics dashboard',
        'Integration support (Slack, Notion)',
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      highlight: false,
      colorClass: 'border-cyan-200',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For investors, VCs & Fortune 500',
      features: [
        'Everything in Growth',
        'Unlimited seats',
        'Unlimited API access',
        'White-label option',
        'Monthly market intelligence',
        'Direct researcher connections',
        'Custom integrations',
        'SLA guarantee',
        'Onboarding & training',
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      highlight: false,
      colorClass: 'border-purple-200',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      <section className="relative py-20 px-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              From free exploration to enterprise-grade innovation intelligence.
              Choose the plan that fits your journey.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/signup/innovator">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/50"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-lg font-semibold border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 rounded-lg"
                >
                  Try Our Prototype
                </Button>
              </Link>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-8 mb-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-400 mb-2">23-38x</div>
                <div className="text-gray-200">Faster than manual research</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-cyan-400 mb-2">$0-$10K</div>
                <div className="text-gray-200">vs $50K-$200K consultants</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">100M+</div>
                <div className="text-gray-200">Research papers analyzed</div>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative bg-slate-800/50 backdrop-blur-sm border-2 ${tier.colorClass} rounded-xl p-8 ${
                  tier.highlight ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20' : ''
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.period && (
                      <span className="text-gray-400 ml-2">/{tier.period}</span>
                    )}
                  </div>
                  {tier.monthlyPrice && (
                    <div className="text-sm text-gray-400">{tier.monthlyPrice}</div>
                  )}
                  <p className="text-gray-300 mt-3">{tier.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={tier.ctaLink}>
                  <Button
                    className={`w-full h-12 text-base font-semibold ${
                      tier.highlight
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                        : 'bg-slate-700 hover:bg-slate-600'
                    } text-white`}
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison Table Note */}
          <div className="text-center mb-12">
            <p className="text-gray-300 mb-4">
              Need help choosing? Compare all features side-by-side
            </p>
            <Button
              variant="outline"
              className="border-blue-400/50 text-blue-400 hover:bg-blue-500/20"
            >
              View Full Comparison
            </Button>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Can I upgrade or downgrade my plan?
                </h3>
                <p className="text-gray-300">
                  Yes! You can upgrade or downgrade at any time. Changes take effect immediately,
                  and we'll prorate your billing accordingly.
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What's a CVS report?
                </h3>
                <p className="text-gray-300">
                  A Commercial Viability Score (CVS) report is our AI-powered analysis that evaluates
                  research across 6 dimensions: Technical Merit, Commercial Potential, Market Opportunity,
                  Competitive Position, IP Landscape, and Risk Assessment.
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Do you offer discounts for students or nonprofits?
                </h3>
                <p className="text-gray-300">
                  Yes! We offer 50% discounts for verified students and educational institutions,
                  and 30% discounts for registered nonprofits. Contact us for verification.
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-300">
                  We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and wire transfers
                  for Enterprise plans. All payments are secured and encrypted.
                </p>
              </div>
            </div>
          </div>

          {/* Enterprise CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30 rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
              Enterprise plans include dedicated support, custom integrations, white-labeling,
              and unlimited team access. Let's discuss your specific needs.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/50"
              >
                Contact Sales Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
