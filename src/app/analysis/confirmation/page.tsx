'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function AnalysisConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds

  // Auto-redirect to dashboard after 5 minutes of inactivity
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Separate effect for navigation when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard')
    }
  }, [countdown, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 bg-white border-0 shadow-2xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Analysis Started!
        </h1>

        {/* Dashboard Notification */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <LayoutDashboard className="w-5 h-5 text-gray-600" />
          <p className="text-gray-600">
            Check your dashboard in a few minutes
          </p>
        </div>

        {/* What Happens Next Section */}
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">
            What happens next:
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Our AI agents are searching through 100M+ research papers</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>11 specialized agents will analyze technical merit, market potential, and IP landscape</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>You'll receive detailed results with CVS scores and TRL assessments via email</span>
            </li>
          </ul>
        </div>

        {/* Query Submitted Toast */}
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Query Submitted!</p>
              <p className="text-xs text-green-700">
                Your research query has been submitted successfully and is being processed.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/analysis/search" className="flex-1">
            <Button
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Another Query
            </Button>
          </Link>
        </div>

        {/* Auto-redirect countdown */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Auto-redirecting to dashboard in <span className="font-medium text-gray-700">{formatTime(countdown)}</span>
          </p>
        </div>

        {/* Email Info */}
        {email && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Results will be sent to: <span className="font-medium text-gray-700">{email}</span>
          </p>
        )}
      </Card>
    </div>
  )
}
