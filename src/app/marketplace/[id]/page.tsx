'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/useUserStore'
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  FileText,
  Lightbulb,
  Building2,
  Mail,
  Bookmark,
  CheckCircle,
  DollarSign,
  AlertCircle,
} from 'lucide-react'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUserStore()
  const supabase = createClient()

  const [showIntroDialog, setShowIntroDialog] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Commitment modal state
  const [showCommitDialog, setShowCommitDialog] = useState(false)
  const [commitAmount, setCommitAmount] = useState([500000]) // Default $500K
  const [investmentType, setInvestmentType] = useState('')
  const [timeline, setTimeline] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [commitLoading, setCommitLoading] = useState(false)
  const [commitSuccess, setCommitSuccess] = useState(false)

  // Mock data (in real app, fetch from database)
  const mockOpportunities: Record<string, any> = {
    '1': {
      title: 'Quantum computing for drug discovery',
      cvs_score: 87,
      technical_score: 85,
      market_score: 88,
      ip_score: 82,
      tam: 4500,
      trl: 7,
      category: 'Quantum Computing',
      stage: 'Series A',
      funding_goal: 5000000,
      description: 'Revolutionary quantum computing platform specifically designed for accelerating drug discovery processes. Our technology reduces computational time for molecular simulation by 1000x compared to classical methods.',
      highlights: [
        'Proprietary quantum algorithms for protein folding',
        '5 patents granted, 3 pending',
        'Partnership with 2 major pharmaceutical companies',
        'Team of 12 PhD researchers from MIT and Stanford',
      ],
      team: {
        company: 'QuantumPharma Inc.',
        founded: '2021',
        location: 'Boston, MA',
        team_size: 15,
      },
    },
    '2': {
      title: 'CRISPR gene editing for agriculture',
      cvs_score: 82,
      technical_score: 80,
      market_score: 84,
      ip_score: 78,
      tam: 3200,
      trl: 6,
      category: 'Biotech',
      stage: 'Seed',
      funding_goal: 2000000,
      description: 'Next-generation CRISPR technology for developing climate-resilient crops with 40% higher yield and reduced water requirements.',
      highlights: [
        'Novel CRISPR variant with improved precision',
        'Field trials showing 40% yield improvement',
        'Collaboration with USDA',
        'Addressing $3.2B market opportunity',
      ],
      team: {
        company: 'AgriGene Solutions',
        founded: '2022',
        location: 'Davis, CA',
        team_size: 8,
      },
    },
  }

  const opportunity = mockOpportunities[params.id as string] || mockOpportunities['1']

  const getCVSColor = (score: number) => {
    if (score >= 80) return 'var(--r2m-success)'
    if (score >= 60) return 'var(--r2m-warning)'
    return 'var(--r2m-error)'
  }

  const getCVSLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Fair'
  }

  const handleRequestIntroduction = async () => {
    if (!message.trim()) {
      alert('Please enter a message')
      return
    }

    setLoading(true)
    try {
      // In a real app, this would create a record in introduction_requests table
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess(true)
      setTimeout(() => {
        setShowIntroDialog(false)
        setSuccess(false)
        setMessage('')
      }, 2000)
    } catch (error) {
      console.error('Error requesting introduction:', error)
      alert('Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCommitInvestment = async () => {
    if (!investmentType || !timeline) {
      alert('Please select investment type and timeline')
      return
    }

    setCommitLoading(true)
    try {
      // In a real app, this would create a record in investment_commitments table
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCommitSuccess(true)
      setTimeout(() => {
        setShowCommitDialog(false)
        setCommitSuccess(false)
        setCommitAmount([500000])
        setInvestmentType('')
        setTimeline('')
        setCommitMessage('')
      }, 2000)
    } catch (error) {
      console.error('Error committing investment:', error)
      alert('Failed to commit investment. Please try again.')
    } finally {
      setCommitLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    return `$${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="min-h-screen bg-[var(--r2m-gray-100)]">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-[var(--r2m-gray-900)]">
                  {opportunity.title}
                </h1>
                <Badge
                  className="text-lg font-bold px-3 py-1 text-white"
                  style={{ backgroundColor: getCVSColor(opportunity.cvs_score) }}
                >
                  CVS {opportunity.cvs_score}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{opportunity.category}</Badge>
                <Badge variant="outline">{opportunity.stage}</Badge>
                <Badge variant="outline">TRL {opportunity.trl}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Bookmark className="w-4 h-4" />
                Save
              </Button>
              <Button
                onClick={() => setShowIntroDialog(true)}
                variant="outline"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Request Introduction
              </Button>
              <Button
                onClick={() => setShowCommitDialog(true)}
                className="gap-2 bg-[var(--r2m-success)] hover:bg-green-600 text-white"
              >
                <DollarSign className="w-4 h-4" />
                Commit to Invest
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-4">
                Overview
              </h2>
              <p className="text-base text-[var(--r2m-gray-600)] leading-relaxed">
                {opportunity.description}
              </p>
            </Card>

            {/* CVS Score Breakdown */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-4">
                Commercial Viability Analysis
              </h2>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--r2m-gray-600)]">Technical</span>
                    <BarChart3 className="w-4 h-4 text-[var(--r2m-gray-400)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-2">
                    {opportunity.technical_score}
                  </p>
                  <div className="h-2 bg-[var(--r2m-gray-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--r2m-primary)]"
                      style={{ width: `${opportunity.technical_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--r2m-gray-600)]">Market</span>
                    <TrendingUp className="w-4 h-4 text-[var(--r2m-gray-400)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-2">
                    {opportunity.market_score}
                  </p>
                  <div className="h-2 bg-[var(--r2m-gray-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--r2m-success)]"
                      style={{ width: `${opportunity.market_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--r2m-gray-600)]">IP</span>
                    <FileText className="w-4 h-4 text-[var(--r2m-gray-400)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-2">
                    {opportunity.ip_score}
                  </p>
                  <div className="h-2 bg-[var(--r2m-gray-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--r2m-warning)]"
                      style={{ width: `${opportunity.ip_score}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--r2m-gray-600)]">TRL</span>
                    <Lightbulb className="w-4 h-4 text-[var(--r2m-gray-400)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-2">
                    {opportunity.trl}
                  </p>
                  <p className="text-xs text-[var(--r2m-gray-500)]">
                    Ready for scale
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[var(--r2m-gray-100)] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--r2m-gray-600)] mb-1">
                      Total Addressable Market (TAM)
                    </p>
                    <p className="text-3xl font-bold text-[var(--r2m-gray-900)]">
                      ${opportunity.tam.toLocaleString()}M
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-[var(--r2m-success)]" />
                </div>
              </div>
            </Card>

            {/* Key Highlights */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-[var(--r2m-gray-900)] mb-4">
                Key Highlights
              </h2>
              <ul className="space-y-3">
                {opportunity.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--r2m-primary)] mt-2 flex-shrink-0" />
                    <span className="text-base text-[var(--r2m-gray-600)]">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-[var(--r2m-primary)]" />
                <h3 className="text-xl font-bold text-[var(--r2m-gray-900)]">
                  Company Info
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--r2m-gray-600)]">Company</p>
                  <p className="text-base font-semibold text-[var(--r2m-gray-900)]">
                    {opportunity.team.company}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--r2m-gray-600)]">Founded</p>
                  <p className="text-base font-semibold text-[var(--r2m-gray-900)]">
                    {opportunity.team.founded}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--r2m-gray-600)]">Location</p>
                  <p className="text-base font-semibold text-[var(--r2m-gray-900)]">
                    {opportunity.team.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--r2m-gray-600)]">Team Size</p>
                  <p className="text-base font-semibold text-[var(--r2m-gray-900)]">
                    {opportunity.team.team_size} members
                  </p>
                </div>
              </div>
            </Card>

            {/* Funding */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-[var(--r2m-gray-900)] mb-4">
                Funding Goal
              </h3>
              <p className="text-3xl font-bold text-[var(--r2m-primary)] mb-2">
                ${(opportunity.funding_goal / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-[var(--r2m-gray-600)]">
                Seeking {opportunity.stage} funding
              </p>
            </Card>

            {/* Contact CTA */}
            <Card className="p-6 bg-gradient-to-br from-[var(--r2m-primary)] to-[var(--r2m-primary-hover)]">
              <h3 className="text-xl font-bold text-white mb-2">
                Interested?
              </h3>
              <p className="text-sm text-white/90 mb-4">
                Request an introduction to connect with the founding team
              </p>
              <Button
                onClick={() => setShowIntroDialog(true)}
                className="w-full bg-white text-[var(--r2m-primary)] hover:bg-gray-100"
              >
                <Mail className="w-4 h-4 mr-2" />
                Request Introduction
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Request Introduction Dialog */}
      <Dialog open={showIntroDialog} onOpenChange={setShowIntroDialog}>
        <DialogContent className="sm:max-w-[500px]">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-[var(--r2m-success)] mx-auto mb-4" />
              <DialogTitle className="text-2xl mb-2">Request Sent!</DialogTitle>
              <DialogDescription className="text-base">
                Your introduction request has been sent to {opportunity.team.company}.
                They will receive your message and contact details.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Request Introduction</DialogTitle>
                <DialogDescription className="text-base">
                  Send a message to {opportunity.team.company}. Include why you're
                  interested and what value you can bring.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* User Info (read-only) */}
                <div>
                  <label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                    Your Information
                  </label>
                  <div className="p-3 bg-[var(--r2m-gray-100)] rounded-lg text-sm">
                    <p className="font-medium">{user?.full_name || 'Your Name'}</p>
                    <p className="text-[var(--r2m-gray-600)]">{user?.email}</p>
                    <p className="text-[var(--r2m-gray-600)]">
                      {user?.company_name || 'Your Company'}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block"
                  >
                    Your Message *
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi, I'm interested in learning more about your technology. I believe there could be synergies with..."
                    className="min-h-[150px]"
                    disabled={loading}
                  />
                  <p className="text-xs text-[var(--r2m-gray-500)] mt-2">
                    Tip: Mention specific aspects of the technology that interest you
                    and how you could help accelerate their growth.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowIntroDialog(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestIntroduction}
                  disabled={loading || !message.trim()}
                  className="bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Investment Commitment Dialog */}
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent className="sm:max-w-[600px]">
          {commitSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-[var(--r2m-success)] mx-auto mb-4" />
              <DialogTitle className="text-2xl mb-2">Commitment Received!</DialogTitle>
              <DialogDescription className="text-base">
                Your investment commitment of {formatCurrency(commitAmount[0])} has been sent to {opportunity.team.company}.
                This is a non-binding indication of interest. The startup will review and reach out to discuss next steps.
              </DialogDescription>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Commit to Invest</DialogTitle>
                <DialogDescription className="text-base">
                  Express your interest to invest in {opportunity.team.company}. This is a non-binding commitment to explore investment opportunities.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Investment Amount */}
                <div>
                  <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-3 block">
                    Investment Amount
                  </Label>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-[var(--r2m-primary)] mb-2">
                      {formatCurrency(commitAmount[0])}
                    </p>
                    <Slider
                      value={commitAmount}
                      onValueChange={setCommitAmount}
                      min={50000}
                      max={10000000}
                      step={50000}
                      className="w-full"
                      disabled={commitLoading}
                    />
                    <div className="flex justify-between text-xs text-[var(--r2m-gray-500)] mt-2">
                      <span>$50K</span>
                      <span>$10M</span>
                    </div>
                  </div>
                </div>

                {/* Investment Type */}
                <div>
                  <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                    Investment Type *
                  </Label>
                  <Select value={investmentType} onValueChange={setInvestmentType} disabled={commitLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select investment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safe">SAFE (Simple Agreement for Future Equity)</SelectItem>
                      <SelectItem value="convertible">Convertible Note</SelectItem>
                      <SelectItem value="equity">Direct Equity</SelectItem>
                      <SelectItem value="revenue">Revenue Share</SelectItem>
                      <SelectItem value="flexible">Flexible / To Be Discussed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expected Timeline */}
                <div>
                  <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                    Expected Timeline *
                  </Label>
                  <Select value={timeline} onValueChange={setTimeline} disabled={commitLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expected timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">Within 30 days</SelectItem>
                      <SelectItem value="60">Within 60 days</SelectItem>
                      <SelectItem value="90">Within 90 days</SelectItem>
                      <SelectItem value="flexible">Flexible timeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message (Optional) */}
                <div>
                  <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                    Message to Startup (Optional)
                  </Label>
                  <Textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Share your investment thesis, due diligence requirements, or any questions..."
                    className="min-h-[100px]"
                    disabled={commitLoading}
                  />
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Non-Binding Commitment</p>
                    <p className="text-xs">
                      This is an indication of interest only and does not constitute a binding investment agreement.
                      Final terms will be negotiated separately.
                    </p>
                  </div>
                </div>

                {/* Investor Info Preview */}
                <div>
                  <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                    Your Information
                  </Label>
                  <div className="p-3 bg-[var(--r2m-gray-100)] rounded-lg text-sm">
                    <p className="font-medium">{user?.full_name || 'Your Name'}</p>
                    <p className="text-[var(--r2m-gray-600)]">{user?.email}</p>
                    <p className="text-[var(--r2m-gray-600)]">
                      {user?.company_name || 'Your Company'}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCommitDialog(false)}
                  disabled={commitLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCommitInvestment}
                  disabled={commitLoading || !investmentType || !timeline}
                  className="bg-[var(--r2m-success)] hover:bg-green-600 text-white"
                >
                  {commitLoading ? 'Submitting...' : 'Submit Commitment'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
