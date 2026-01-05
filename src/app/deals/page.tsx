'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared/Navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  Upload,
  Download,
} from 'lucide-react'

export default function DealsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [updateNote, setUpdateNote] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([]) // State to track deals

  // Mock deals data
  const mockDeals = [
    {
      id: '1',
      investor: {
        name: 'Sarah Chen',
        company: 'AI Ventures',
        avatar: 'SC',
      },
      opportunity: 'AI-powered supply chain optimization platform',
      amount: 750000,
      type: 'SAFE',
      status: 'due_diligence',
      progress: 45,
      timeline: 'Within 30 days',
      startDate: '2025-12-01',
      expectedClose: '2025-12-31',
      milestones: [
        { name: 'Commitment', completed: true, date: '2025-12-01' },
        { name: 'Due Diligence', completed: false, date: null },
        { name: 'Term Sheet', completed: false, date: null },
        { name: 'Closing', completed: false, date: null },
      ],
      documents: [
        { name: 'NDA.pdf', uploaded: true },
        { name: 'Financial Statements.xlsx', uploaded: true },
        { name: 'IP Portfolio.pdf', uploaded: false },
        { name: 'Term Sheet.docx', uploaded: false },
      ],
      lastUpdate: '2 days ago',
      notes: 'Investor team scheduled for site visit next week.',
    },
    {
      id: '2',
      investor: {
        name: 'Michael Roberts',
        company: 'Innovation Capital',
        avatar: 'MR',
      },
      opportunity: 'Computer vision for defect detection in semiconductor manufacturing',
      amount: 500000,
      type: 'Convertible Note',
      status: 'term_sheet',
      progress: 75,
      timeline: 'Within 60 days',
      startDate: '2025-11-15',
      expectedClose: '2026-01-15',
      milestones: [
        { name: 'Commitment', completed: true, date: '2025-11-15' },
        { name: 'Due Diligence', completed: true, date: '2025-11-28' },
        { name: 'Term Sheet', completed: false, date: null },
        { name: 'Closing', completed: false, date: null },
      ],
      documents: [
        { name: 'NDA.pdf', uploaded: true },
        { name: 'Financial Statements.xlsx', uploaded: true },
        { name: 'IP Portfolio.pdf', uploaded: true },
        { name: 'Term Sheet.docx', uploaded: true },
      ],
      lastUpdate: '1 day ago',
      notes: 'Term sheet under review. Valuation cap discussions ongoing.',
    },
    {
      id: '3',
      investor: {
        name: 'Lisa Park',
        company: 'TechStar Partners',
        avatar: 'LP',
      },
      opportunity: 'NLP for ecommerce product recommendations',
      amount: 300000,
      type: 'SAFE',
      status: 'committed',
      progress: 15,
      timeline: 'Within 90 days',
      startDate: '2025-12-08',
      expectedClose: '2026-03-08',
      milestones: [
        { name: 'Commitment', completed: true, date: '2025-12-08' },
        { name: 'Due Diligence', completed: false, date: null },
        { name: 'Term Sheet', completed: false, date: null },
        { name: 'Closing', completed: false, date: null },
      ],
      documents: [
        { name: 'NDA.pdf', uploaded: false },
        { name: 'Financial Statements.xlsx', uploaded: false },
        { name: 'IP Portfolio.pdf', uploaded: false },
        { name: 'Term Sheet.docx', uploaded: false },
      ],
      lastUpdate: '5 hours ago',
      notes: 'Just committed. Awaiting NDA signature.',
    },
  ]

  // Initialize deals from mock data on component mount
  useEffect(() => {
    setDeals(mockDeals)
  }, [])

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      committed: { label: 'Committed', color: 'bg-[var(--r2m-primary)]', icon: CheckCircle },
      due_diligence: { label: 'Due Diligence', color: 'bg-[var(--r2m-warning)]', icon: Clock },
      term_sheet: { label: 'Term Sheet', color: 'bg-[var(--r2m-secondary)]', icon: FileText },
      closing: { label: 'Closing', color: 'bg-[var(--r2m-accent)]', icon: TrendingUp },
      closed: { label: 'Closed', color: 'bg-[var(--r2m-success)]', icon: CheckCircle },
    }
    return statusMap[status] || statusMap.committed
  }

  const filteredDeals = statusFilter === 'all'
    ? deals
    : deals.filter(deal => deal.status === statusFilter)

  const totalCommitted = mockDeals.reduce((sum, deal) => sum + deal.amount, 0)
  const activeDeals = mockDeals.filter(d => d.status !== 'closed').length
  const avgProgress = Math.round(mockDeals.reduce((sum, d) => sum + d.progress, 0) / mockDeals.length)

  const handleUpdateStatus = (deal: any) => {
    setSelectedDeal(deal)
    setNewStatus(deal.status)
    setShowUpdateDialog(true)
  }

  const handleSaveUpdate = () => {
    if (!selectedDeal) return

    // Update the deal in state
    setDeals(prevDeals =>
      prevDeals.map(deal =>
        deal.id === selectedDeal.id
          ? {
              ...deal,
              status: newStatus,
              progress: getProgressForStatus(newStatus),
              notes: updateNote || deal.notes,
              lastUpdate: 'Just now',
              milestones: updateMilestones(deal.milestones, newStatus),
            }
          : deal
      )
    )

    // Close dialog
    setShowUpdateDialog(false)
    setUpdateNote('')
    setSelectedDeal(null)
  }

  const getProgressForStatus = (status: string) => {
    const progressMap: Record<string, number> = {
      committed: 15,
      due_diligence: 45,
      term_sheet: 75,
      closing: 90,
      closed: 100,
    }
    return progressMap[status] || 0
  }

  const updateMilestones = (milestones: any[], status: string) => {
    const updated = [...milestones]
    if (status === 'due_diligence' || status === 'term_sheet' || status === 'closing' || status === 'closed') {
      updated[1] = { name: 'Due Diligence', completed: true, date: '2025-12-09' }
    }
    if (status === 'term_sheet' || status === 'closing' || status === 'closed') {
      updated[2] = { name: 'Term Sheet', completed: true, date: '2025-12-09' }
    }
    if (status === 'closed') {
      updated[3] = { name: 'Closing', completed: true, date: '2025-12-09' }
    }
    return updated
  }

  const handleMarkAsClosed = (deal: any) => {
    // Calculate success fee (5% of investment amount)
    const successFee = deal.amount * 0.05
    const platformFee = successFee * 0.8 // Platform keeps 80%
    const processingFee = successFee * 0.029 + 0.30 // Stripe fees

    setInvoiceData({
      deal,
      investmentAmount: deal.amount,
      successFeeRate: 0.05,
      successFee,
      platformFee,
      processingFee,
      totalDue: successFee + processingFee,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setShowInvoiceDialog(true)
  }

  const handlePayInvoice = async () => {
    if (!invoiceData) return

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: invoiceData.deal.id,
          amount: invoiceData.totalDue,
          dealDetails: {
            opportunity: invoiceData.deal.opportunity,
            investor: invoiceData.deal.investor.name,
            investmentAmount: invoiceData.investmentAmount,
            successFee: invoiceData.successFee,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(`Payment error: ${error.message}\n\nMake sure you have set up your Stripe API keys in .env.local`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800">
      <Navigation />

      <div className="max-w-[1280px] mx-auto px-20 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Deal Pipeline
          </h1>
          <p className="text-lg text-gray-300">
            Track your investment commitments from commitment to closing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[var(--r2m-success)]" />
              <p className="text-sm text-gray-300">Total Committed</p>
            </div>
            <p className="text-3xl font-bold text-white">
              ${(totalCommitted / 1000000).toFixed(2)}M
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--r2m-primary)]" />
              <p className="text-sm text-gray-300">Active Deals</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {activeDeals}
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-[var(--r2m-warning)]" />
              <p className="text-sm text-gray-300">Avg Progress</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {avgProgress}%
            </p>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-[var(--r2m-success)]" />
              <p className="text-sm text-gray-300">Closed Deals</p>
            </div>
            <p className="text-3xl font-bold text-white">
              0
            </p>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Label className="text-base font-medium text-white">Filter by status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-slate-800/90 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deals</SelectItem>
              <SelectItem value="committed">Committed</SelectItem>
              <SelectItem value="due_diligence">Due Diligence</SelectItem>
              <SelectItem value="term_sheet">Term Sheet</SelectItem>
              <SelectItem value="closing">Closing</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deals List */}
        <div className="space-y-6">
          {filteredDeals.map((deal) => {
            const statusInfo = getStatusInfo(deal.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card key={deal.id} className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${statusInfo.color} text-white flex items-center justify-center font-bold`}>
                      {deal.investor.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {deal.investor.name} • {deal.investor.company}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {deal.opportunity}
                      </p>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusInfo.color} text-white gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </Badge>
                        <span className="text-sm font-semibold text-[var(--r2m-success)]">
                          ${(deal.amount / 1000).toFixed(0)}K
                        </span>
                        <span className="text-sm text-gray-400">
                          {deal.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {deal.status === 'closing' && (
                      <Button
                        size="sm"
                        className="bg-[var(--r2m-success)] hover:bg-green-600 text-white gap-1"
                        onClick={() => handleMarkAsClosed(deal)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Closed
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(deal)}
                    >
                      Update Status
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Deal Progress
                    </span>
                    <span className="text-sm font-semibold text-[var(--r2m-primary)]">
                      {deal.progress}%
                    </span>
                  </div>
                  <Progress value={deal.progress} className="h-2" />
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {deal.milestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        milestone.completed
                          ? 'border-[var(--r2m-success)] bg-[var(--r2m-success)]/10'
                          : 'border-slate-600 bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {milestone.completed ? (
                          <CheckCircle className="w-4 h-4 text-[var(--r2m-success)]" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-xs font-semibold ${
                          milestone.completed ? 'text-[var(--r2m-success)]' : 'text-gray-200'
                        }`}>
                          {milestone.name}
                        </span>
                      </div>
                      {milestone.date && (
                        <p className="text-xs text-gray-400">{milestone.date}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Documents & Timeline */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-300" />
                      Required Documents
                    </h4>
                    <div className="space-y-2">
                      {deal.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600"
                        >
                          <span className={`text-sm ${
                            doc.uploaded ? 'text-white' : 'text-gray-300'
                          }`}>
                            {doc.name}
                          </span>
                          {doc.uploaded ? (
                            <CheckCircle className="w-4 h-4 text-[var(--r2m-success)]" />
                          ) : (
                            <Upload className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-300" />
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Started:</span>
                        <span className="font-semibold text-white">
                          {deal.startDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Expected Close:</span>
                        <span className="font-semibold text-white">
                          {deal.expectedClose}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Last Update:</span>
                        <span className="font-semibold text-white">
                          {deal.lastUpdate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg flex gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold mb-1 text-white">Latest Note</p>
                    <p>{deal.notes}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <Card className="p-12 text-center bg-slate-800/50 border-slate-700">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No deals found
            </h3>
            <p className="text-base text-gray-400">
              No deals match the selected filter.
            </p>
          </Card>
        )}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Update Deal Status</DialogTitle>
            <DialogDescription className="text-base">
              Update the status and add notes for this deal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Deal Info */}
            {selectedDeal && (
              <div className="p-3 bg-[var(--r2m-gray-100)] rounded-lg">
                <p className="font-semibold text-[var(--r2m-gray-900)]">
                  {selectedDeal.investor.name} • ${(selectedDeal.amount / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-[var(--r2m-gray-600)]">
                  {selectedDeal.opportunity}
                </p>
              </div>
            )}

            {/* New Status */}
            <div>
              <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                Update Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="committed">Committed</SelectItem>
                  <SelectItem value="due_diligence">Due Diligence</SelectItem>
                  <SelectItem value="term_sheet">Term Sheet</SelectItem>
                  <SelectItem value="closing">Closing</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium text-[var(--r2m-gray-700)] mb-2 block">
                Add Note
              </Label>
              <Textarea
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="Add any updates, next steps, or important information..."
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveUpdate}
              className="bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
            >
              Save Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Fee Invoice Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[var(--r2m-success)]" />
              Success Fee Invoice
            </DialogTitle>
            <DialogDescription className="text-base">
              Congratulations on closing this deal! Please review the success fee invoice below.
            </DialogDescription>
          </DialogHeader>

          {invoiceData && (
            <div className="space-y-6 py-4">
              {/* Invoice Header */}
              <div className="p-4 bg-[var(--r2m-gray-100)] rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[var(--r2m-gray-600)]">Invoice Number:</span>
                  <span className="text-sm font-semibold text-[var(--r2m-gray-900)]">
                    {invoiceData.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[var(--r2m-gray-600)]">Invoice Date:</span>
                  <span className="text-sm font-semibold text-[var(--r2m-gray-900)]">
                    {invoiceData.invoiceDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--r2m-gray-600)]">Due Date:</span>
                  <span className="text-sm font-semibold text-[var(--r2m-gray-900)]">
                    {invoiceData.dueDate}
                  </span>
                </div>
              </div>

              {/* Deal Details */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--r2m-gray-700)] mb-3">
                  Deal Details
                </h4>
                <div className="p-4 border border-[var(--r2m-gray-300)] rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${getStatusInfo('closed').color} text-white flex items-center justify-center font-bold text-sm`}>
                      {invoiceData.deal.investor.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--r2m-gray-900)]">
                        {invoiceData.deal.investor.name} • {invoiceData.deal.investor.company}
                      </p>
                      <p className="text-sm text-[var(--r2m-gray-600)]">
                        {invoiceData.deal.opportunity}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[var(--r2m-gray-200)]">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--r2m-gray-600)]">Investment Amount:</span>
                      <span className="text-lg font-bold text-[var(--r2m-success)]">
                        ${invoiceData.investmentAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--r2m-gray-700)] mb-3">
                  Fee Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-[var(--r2m-gray-100)] rounded">
                    <span className="text-sm text-[var(--r2m-gray-700)]">
                      Success Fee ({(invoiceData.successFeeRate * 100).toFixed(0)}% of investment)
                    </span>
                    <span className="text-sm font-semibold text-[var(--r2m-gray-900)]">
                      ${invoiceData.successFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-[var(--r2m-gray-100)] rounded">
                    <span className="text-sm text-[var(--r2m-gray-700)]">
                      Processing Fee (Stripe 2.9% + $0.30)
                    </span>
                    <span className="text-sm font-semibold text-[var(--r2m-gray-900)]">
                      ${invoiceData.processingFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 bg-[var(--r2m-primary)] text-white rounded-lg mt-3">
                    <span className="text-base font-bold">Total Due</span>
                    <span className="text-2xl font-bold">
                      ${invoiceData.totalDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Revenue */}
              <div className="p-4 bg-[var(--r2m-success-light)] border border-[var(--r2m-success)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[var(--r2m-success)]" />
                  <span className="text-sm font-semibold text-[var(--r2m-gray-900)]">
                    Platform Revenue (Your Earnings)
                  </span>
                </div>
                <p className="text-xs text-[var(--r2m-gray-700)] mb-2">
                  80% of success fee goes to R2M platform
                </p>
                <p className="text-2xl font-bold text-[var(--r2m-success)]">
                  ${invoiceData.platformFee.toLocaleString()}
                </p>
              </div>

              {/* Payment Info */}
              <div className="p-4 bg-[var(--r2m-primary-light)] border border-[var(--r2m-primary)] rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--r2m-primary)] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[var(--r2m-gray-900)]">
                  <p className="font-semibold mb-1">Payment Information</p>
                  <p className="text-xs text-[var(--r2m-gray-700)]">
                    Payment will be processed via Stripe. Funds will be available in your account
                    within 2-3 business days. An email receipt will be sent to your registered email.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInvoiceDialog(false)}
              className="gap-1"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              onClick={handlePayInvoice}
              className="bg-[var(--r2m-success)] hover:bg-green-600 text-white gap-1"
            >
              <DollarSign className="w-4 h-4" />
              Pay with Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
