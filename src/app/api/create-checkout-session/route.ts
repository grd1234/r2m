import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { dealId, amount, dealDetails } = await request.json()

    // Validate inputs
    if (!dealId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Check authentication (optional for test mode)
    const { data: { session } } = await supabase.auth.getSession()
    const isTestMode = dealId.startsWith('test_')

    // For production deals, require authentication
    if (!isTestMode && !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isTestMode ? 'Test Payment - Investment Success Fee' : 'Investment Success Fee',
              description: `Deal: ${dealDetails.opportunity} - Investor: ${dealDetails.investor}`,
              images: ['https://yourdomain.com/logo.png'], // Optional: Add your logo
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deals?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deals?payment=cancelled`,
      metadata: {
        dealId: dealId,
        investmentAmount: dealDetails.investmentAmount,
        successFee: dealDetails.successFee,
        userId: session?.user?.id || 'test_user',
      },
      customer_email: session?.user?.email || 'test@example.com',
    })

    return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
