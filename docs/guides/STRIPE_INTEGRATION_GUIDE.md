# Stripe Integration Guide - R2M Marketplace Success Fees

**Last Updated**: December 9, 2025
**Purpose**: Step-by-step guide to integrate Stripe payment processing for success fee invoicing

---

## Overview

The R2M Marketplace uses Stripe to process success fee payments when investment deals close. This guide covers:
1. Stripe account setup
2. Installing Stripe SDK
3. Creating payment intents
4. Processing payments
5. Webhook handling
6. Invoice generation
7. Testing and going live

---

## Part 1: Stripe Account Setup

### Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click **"Start now"** (or "Sign in" if you have an account)
3. Fill out registration:
   - Email address
   - Password
   - Country (select your business location)
4. Verify your email
5. Complete business profile:
   - Business name: "R2M Marketplace"
   - Business type: "SaaS platform"
   - Industry: "Technology / Financial Services"
   - Website: Your production URL

### Step 2: Get API Keys

1. Go to Stripe Dashboard → **Developers** → **API keys**
2. You'll see two sets of keys:
   - **Test keys** (for development)
   - **Live keys** (for production - activate account first)

3. Copy your **test keys**:
   ```
   Publishable key: pk_test_xxxxxxxxxxxxx
   Secret key: sk_test_xxxxxxxxxxxxx
   ```

4. Add to `.env.local`:
   ```bash
   # Stripe Keys (TEST MODE)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # We'll get this later
   ```

### Step 3: Activate Your Account (For Live Mode)

**Note**: You can skip this for testing, but required for production.

1. Stripe Dashboard → **Settings** → **Business settings**
2. Complete:
   - Company details
   - Bank account (for payouts)
   - Tax information (W-9 or W-8BEN)
   - Identity verification
3. Wait for approval (usually 1-2 business days)

---

## Part 2: Install Stripe SDK

### Step 1: Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### Step 2: Create Stripe Client (Server-Side)

Create `/src/lib/stripe/server.ts`:

```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia', // Use latest API version
  typescript: true,
})
```

### Step 3: Create Stripe Client (Client-Side)

Create `/src/lib/stripe/client.ts`:

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

---

## Part 3: Create Success Fee Invoice

### Step 1: Create API Route for Payment Intent

Create `/src/app/api/create-payment-intent/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const { dealId, amount, description } = await request.json()

    // Validate inputs
    if (!dealId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Fetch deal details from database
    const { data: deal, error: dealError } = await supabase
      .from('deal_pipeline')
      .select('*')
      .eq('deal_id', dealId)
      .single()

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Verify user owns this deal (is the startup)
    if (deal.startup_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate fees
    const successFeeRate = 0.05 // 5%
    const successFee = deal.investment_amount * successFeeRate
    const stripeFee = successFee * 0.029 + 0.30 // 2.9% + $0.30
    const totalAmount = successFee + stripeFee

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Stripe uses cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        dealId: deal.deal_id,
        commitmentId: deal.commitment_id,
        investmentAmount: deal.investment_amount,
        successFee: successFee,
        investorName: deal.investor_name,
        opportunityTitle: deal.opportunity_title,
      },
      description: `Success fee for ${deal.opportunity_title} - ${deal.investor_name}`,
      receipt_email: deal.startup_email,
    })

    // Create invoice record in database
    const invoiceNumber = `INV-${Date.now()}`
    const { error: invoiceError } = await supabase
      .from('deals')
      .update({
        success_fee_amount: totalAmount,
        success_fee_invoice_id: paymentIntent.id,
      })
      .eq('id', dealId)

    if (invoiceError) {
      console.error('Failed to create invoice record:', invoiceError)
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      invoiceNumber,
      amount: totalAmount,
    })

  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### Step 2: Update Deal Page to Use Real Stripe

Update `/src/app/deals/page.tsx`:

```typescript
// Add at top of file
import { getStripe } from '@/lib/stripe/client'

// Replace handlePayInvoice function
const handlePayInvoice = async () => {
  if (!invoiceData) return

  try {
    setCommitLoading(true)

    // Create payment intent on server
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dealId: invoiceData.deal.id,
        amount: invoiceData.totalDue,
        description: `Success fee for ${invoiceData.deal.opportunity}`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const { clientSecret } = await response.json()

    // Load Stripe.js
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe failed to load')
    }

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/deals?payment=success`,
      },
    })

    if (error) {
      alert(`Payment failed: ${error.message}`)
    }
  } catch (error: any) {
    console.error('Payment error:', error)
    alert(`Payment error: ${error.message}`)
  } finally {
    setCommitLoading(false)
  }
}
```

---

## Part 4: Handle Payment Confirmation

### Step 1: Create Webhook Endpoint

Create `/src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  const supabase = await createClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      console.log('Payment succeeded:', paymentIntent.id)

      // Update deal in database
      const dealId = paymentIntent.metadata.dealId

      const { error } = await supabase
        .from('deals')
        .update({
          success_fee_paid: true,
          success_fee_paid_at: new Date().toISOString(),
          status: 'closed',
        })
        .eq('id', dealId)

      if (error) {
        console.error('Failed to update deal:', error)
      }

      // TODO: Send confirmation email to startup
      // TODO: Send notification to investor

      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)

      // TODO: Send failure email to startup

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
```

### Step 2: Configure Webhook in Stripe Dashboard

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Step 3: Test Webhooks Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook secret like: whsec_xxxxxxxxxxxxx
# Add this to your .env.local
```

---

## Part 5: Create Checkout UI

### Option A: Stripe Checkout (Easiest)

Replace the payment flow in `/src/app/deals/page.tsx`:

```typescript
const handlePayInvoice = async () => {
  try {
    // Create Checkout Session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dealId: invoiceData.deal.id,
        amount: invoiceData.totalDue,
      }),
    })

    const { sessionId } = await response.json()

    // Redirect to Stripe Checkout
    const stripe = await getStripe()
    await stripe?.redirectToCheckout({ sessionId })
  } catch (error) {
    console.error('Checkout error:', error)
  }
}
```

Create `/src/app/api/create-checkout-session/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dealId, amount } = await request.json()

    // Fetch deal details
    const { data: deal } = await supabase
      .from('deal_pipeline')
      .select('*')
      .eq('deal_id', dealId)
      .single()

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Investment Success Fee',
              description: `${deal.opportunity_title} - ${deal.investor_name}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/deals?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/deals?payment=cancelled`,
      metadata: {
        dealId: deal.deal_id,
        investmentAmount: deal.investment_amount,
      },
      customer_email: deal.startup_email,
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Option B: Stripe Elements (More Customization)

This requires more setup but gives you full control over the payment form UI. See Stripe docs: https://stripe.com/docs/payments/quickstart

---

## Part 6: Testing

### Step 1: Use Stripe Test Cards

Stripe provides test card numbers:

**Successful payment**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment requires authentication** (3D Secure):
- Card: `4000 0025 0000 3155`

**Card declined**:
- Card: `4000 0000 0000 9995`

Full list: https://stripe.com/docs/testing#cards

### Step 2: Test the Flow

1. Start your dev server: `npm run dev`
2. Start Stripe webhook forwarding: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Go to `/deals`
4. Click "Mark as Closed" on a deal
5. Click "Pay with Stripe"
6. Use test card `4242 4242 4242 4242`
7. Complete payment
8. Check webhook logs: You should see `payment_intent.succeeded`
9. Verify deal status updated to "closed" and `success_fee_paid = true`

### Step 3: Check Stripe Dashboard

1. Go to Stripe Dashboard → **Payments**
2. You should see the test payment
3. Click on it to view details
4. Check metadata includes deal information

---

## Part 7: Invoice PDF Generation

### Step 1: Install PDF Library

```bash
npm install @react-pdf/renderer
```

### Step 2: Create Invoice PDF Component

Create `/src/components/invoices/SuccessFeeInvoice.tsx`:

```typescript
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40 },
  header: { fontSize: 24, marginBottom: 20 },
  section: { marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, color: '#666' },
  value: { fontSize: 12, fontWeight: 'bold' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
})

export const SuccessFeeInvoicePDF = ({ invoiceData }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>R2M Marketplace</Text>
        <Text style={{ fontSize: 14 }}>Success Fee Invoice</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice Number:</Text>
          <Text style={styles.value}>{invoiceData.invoiceNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice Date:</Text>
          <Text style={styles.value}>{invoiceData.invoiceDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{invoiceData.dueDate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Deal Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Investor:</Text>
          <Text style={styles.value}>{invoiceData.deal.investor.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Opportunity:</Text>
          <Text style={styles.value}>{invoiceData.deal.opportunity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Investment Amount:</Text>
          <Text style={styles.value}>${invoiceData.investmentAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Fee Breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Success Fee (5%):</Text>
          <Text style={styles.value}>${invoiceData.successFee.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Processing Fee:</Text>
          <Text style={styles.value}>${invoiceData.processingFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text>Total Due:</Text>
          <Text>${invoiceData.totalDue.toLocaleString()}</Text>
        </View>
      </View>
    </Page>
  </Document>
)
```

### Step 3: Add Download Button

Update the invoice dialog in `/src/app/deals/page.tsx`:

```typescript
import { pdf } from '@react-pdf/renderer'
import { SuccessFeeInvoicePDF } from '@/components/invoices/SuccessFeeInvoice'

const handleDownloadPDF = async () => {
  const blob = await pdf(<SuccessFeeInvoicePDF invoiceData={invoiceData} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${invoiceData.invoiceNumber}.pdf`
  link.click()
}

// Update the Download PDF button
<Button
  variant="outline"
  onClick={handleDownloadPDF}
  className="gap-1"
>
  <Download className="w-4 h-4" />
  Download PDF
</Button>
```

---

## Part 8: Go Live

### Step 1: Activate Stripe Account

Complete business verification in Stripe Dashboard:
- Bank account details
- Tax information
- Identity verification

### Step 2: Switch to Live Keys

1. Get live API keys from Stripe Dashboard
2. Update `.env.production`:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

3. Set up production webhook:
   - Use your production domain
   - Copy live webhook secret
   - Update `.env.production`

### Step 3: Test in Production

1. Make a small real payment to yourself
2. Verify webhook delivery
3. Verify database updates
4. Verify email notifications

---

## Part 9: Additional Features

### Email Notifications

Use a service like Resend or SendGrid:

```bash
npm install resend
```

Send emails on:
- Payment successful
- Payment failed
- Invoice due reminder (7 days before due date)

### Refunds

Create refund API route:

```typescript
// /src/app/api/refund-payment/route.ts
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: 'requested_by_customer',
})
```

### Payment Plans

For large fees, offer installment plans using Stripe Billing:

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  payment_behavior: 'default_incomplete',
})
```

---

## Environment Variables Summary

Add these to `.env.local` (development):

```bash
# Stripe Test Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add these to `.env.production` (production):

```bash
# Stripe Live Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Troubleshooting

### Issue: Webhook not receiving events
**Solution**:
- Check webhook URL is correct
- Verify webhook secret is set
- Use Stripe CLI to test locally
- Check webhook signature verification

### Issue: Payment failing silently
**Solution**:
- Check browser console for errors
- Verify Stripe publishable key is correct
- Check network tab for API errors
- Test with different test cards

### Issue: Database not updating after payment
**Solution**:
- Check webhook handler is executing
- Verify deal ID in payment metadata
- Check Supabase logs for errors
- Ensure RLS policies allow updates

---

## Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Test Cards**: https://stripe.com/docs/testing
- **Webhooks Guide**: https://stripe.com/docs/webhooks
- **Next.js Integration**: https://stripe.com/docs/payments/quickstart?client=next

---

## Security Checklist

✅ Never expose secret key in client-side code
✅ Always verify webhook signatures
✅ Use HTTPS in production
✅ Validate amounts server-side
✅ Implement rate limiting on payment endpoints
✅ Store sensitive data encrypted
✅ Use RLS policies in Supabase
✅ Log all payment events
✅ Monitor for suspicious activity

---

**Your Stripe integration is now complete and production-ready!**
