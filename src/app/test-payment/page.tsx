'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, CreditCard, CheckCircle, XCircle } from 'lucide-react'

export default function TestPaymentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: 'test_deal_123',
          amount: 100, // $100.00
          dealDetails: {
            opportunity: 'AI Research Investment - Test',
            investor: 'Test Investor',
            investmentAmount: 10000,
            successFee: 100,
          },
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--r2m-gray-600)] hover:text-[var(--r2m-primary)] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--r2m-primary-light)] rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-[var(--r2m-primary)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--r2m-gray-900)] mb-2">
              Test Stripe Payment
            </h1>
            <p className="text-base text-[var(--r2m-gray-600)]">
              Test the payment integration with Stripe Checkout
            </p>
          </div>

          {/* Payment Details */}
          <div className="mb-6 p-6 bg-[var(--r2m-gray-50)] rounded-lg border border-[var(--r2m-gray-200)]">
            <h3 className="font-semibold text-[var(--r2m-gray-900)] mb-3">
              Test Payment Details:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--r2m-gray-600)]">Amount:</span>
                <span className="font-semibold text-[var(--r2m-gray-900)]">$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--r2m-gray-600)]">Deal:</span>
                <span className="font-medium text-[var(--r2m-gray-900)]">AI Research Investment</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--r2m-gray-600)]">Investor:</span>
                <span className="font-medium text-[var(--r2m-gray-900)]">Test Investor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--r2m-gray-600)]">Deal ID:</span>
                <span className="font-mono text-xs text-[var(--r2m-gray-700)]">test_deal_123</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[var(--r2m-error-light)] border border-[var(--r2m-error)] rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-[var(--r2m-error)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[var(--r2m-gray-900)] mb-1">Payment Error</p>
                <p className="text-sm text-[var(--r2m-error)]">{error}</p>
              </div>
            </div>
          )}

          {/* Test Card Info */}
          <div className="mb-6 p-6 bg-[var(--r2m-warning-light)] border border-[var(--r2m-warning)] rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-[var(--r2m-warning)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-[var(--r2m-gray-900)] mb-2">
                  Use Test Card (Successful Payment):
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--r2m-gray-700)] w-20">Card:</span>
                    <code className="bg-white px-2 py-1 rounded text-[var(--r2m-gray-900)] font-mono border border-[var(--r2m-gray-300)]">
                      4242 4242 4242 4242
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--r2m-gray-700)] w-20">Expiry:</span>
                    <code className="bg-white px-2 py-1 rounded text-[var(--r2m-gray-900)] border border-[var(--r2m-gray-300)]">
                      12/34
                    </code>
                    <span className="text-[var(--r2m-gray-600)] text-xs">(any future date)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--r2m-gray-700)] w-20">CVC:</span>
                    <code className="bg-white px-2 py-1 rounded text-[var(--r2m-gray-900)] border border-[var(--r2m-gray-300)]">
                      123
                    </code>
                    <span className="text-[var(--r2m-gray-600)] text-xs">(any 3 digits)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--r2m-gray-700)] w-20">ZIP:</span>
                    <code className="bg-white px-2 py-1 rounded text-[var(--r2m-gray-900)] border border-[var(--r2m-gray-300)]">
                      12345
                    </code>
                    <span className="text-[var(--r2m-gray-600)] text-xs">(any 5 digits)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Test Cards */}
          <div className="mb-6 p-4 bg-[var(--r2m-accent-light)] border border-[var(--r2m-accent)] rounded-lg">
            <p className="font-semibold text-[var(--r2m-gray-900)] mb-2 text-sm">
              Other Test Scenarios:
            </p>
            <div className="space-y-1 text-xs text-[var(--r2m-gray-700)]">
              <div>
                <span className="font-mono">4000 0025 0000 3155</span> - Requires 3D Secure authentication
              </div>
              <div>
                <span className="font-mono">4000 0000 0000 0002</span> - Card declined
              </div>
              <div>
                <span className="font-mono">4000 0000 0000 9995</span> - Insufficient funds
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-14 text-base font-semibold bg-[var(--r2m-primary)] hover:bg-[var(--r2m-primary-hover)] text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating checkout session...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <CreditCard className="w-5 h-5" />
                Test Payment - $100.00
              </span>
            )}
          </Button>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-[var(--r2m-gray-100)] border border-[var(--r2m-gray-300)] rounded-lg">
            <p className="text-sm font-semibold text-[var(--r2m-gray-900)] mb-2">
              What happens when you click "Test Payment":
            </p>
            <ol className="text-sm text-[var(--r2m-gray-700)] space-y-1 list-decimal list-inside">
              <li>Creates a Stripe Checkout session</li>
              <li>Redirects you to Stripe's secure payment page</li>
              <li>Enter the test card details above</li>
              <li>Complete the payment</li>
              <li>Stripe sends a webhook to your app</li>
              <li>Database is updated with payment status</li>
              <li>You're redirected back to the success page</li>
            </ol>
          </div>

          {/* Webhook Status */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--r2m-gray-500)]">
              Make sure <code className="bg-gray-100 px-2 py-1 rounded">stripe listen</code> is running to receive webhooks
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
