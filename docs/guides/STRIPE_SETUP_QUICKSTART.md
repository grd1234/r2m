# Stripe Setup - Quick Start (5 Minutes)

**Get your R2M Marketplace accepting payments in 5 minutes!**

---

## Step 1: Create Stripe Account (2 minutes)

1. Go to **https://stripe.com**
2. Click **"Start now"** or **"Sign in"**
3. Fill out the form:
   - Email address
   - Password
   - Country (select your location)
4. Click **"Create account"**
5. Verify your email (check inbox)

✅ **You now have a Stripe account!**

---

## Step 2: Get Your Test API Keys (1 minute)

1. After logging in, you'll be in the Stripe Dashboard
2. Make sure you're in **TEST MODE** (toggle in top right should say "Test mode")
3. Click **"Developers"** in the left sidebar
4. Click **"API keys"**

You'll see two keys:

### Publishable Key (starts with `pk_test_`)
```
pk_test_51Abc123...
```

### Secret Key (starts with `sk_test_`)
```
sk_test_51Xyz789...
```

**Click "Reveal test key"** to see the secret key, then copy it.

---

## Step 3: Add Keys to Your Project (1 minute)

1. In your project, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your editor

3. Paste your keys:
   ```bash
   # Stripe Configuration (Test Keys)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   ```

4. Save the file

5. Restart your dev server:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

✅ **Stripe is now connected!**

---

## Step 4: Test a Payment (1 minute)

### Use Stripe Test Cards

Stripe provides test card numbers that won't charge real money:

#### ✅ Successful Payment:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

#### ❌ Card Declined:
- **Card Number**: `4000 0000 0000 9995`

#### 🔐 Requires Authentication (3D Secure):
- **Card Number**: `4000 0025 0000 3155`

---

## Step 5: Test the Flow

1. **Go to Deals Page**
   - http://localhost:3000/deals

2. **Update a deal to "Closing"**
   - Click "Update Status"
   - Select "Closing"
   - Save

3. **Click "Mark as Closed"**
   - Green button appears
   - Invoice modal opens

4. **Click "Pay with Stripe"**
   - You'll be redirected to Stripe Checkout
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - Click "Pay"

5. **Success!**
   - Redirected back to /deals page
   - URL shows `?payment=success`

✅ **Payment is working!**

---

## What Happens When You Pay?

### On Stripe Checkout Page:
- Professional payment form
- Your business name: "Investment Success Fee"
- Amount: Calculated success fee + processing fee
- Secure payment processing

### After Payment:
- Redirected to: `/deals?payment=success`
- In production: Deal would be marked as closed in database
- In production: Email receipt sent
- In production: Platform receives payout

---

## View Your Test Payment

1. Go to Stripe Dashboard
2. Click **"Payments"** in the left sidebar
3. You'll see your test payment!
4. Click on it to see details:
   - Amount
   - Customer email
   - Metadata (deal ID, investment amount)
   - Payment status

---

## Important Notes

### 🧪 Test Mode vs Live Mode

**Test Mode** (what you're using now):
- Fake card numbers
- No real money
- Perfect for development
- Data is separate from live

**Live Mode** (for production):
- Real card numbers
- Real money
- Requires business verification
- Only use when ready to launch

### 🔒 Keep Your Secret Key Secret!

- ❌ Never commit `.env.local` to git
- ❌ Never share your secret key
- ❌ Never use it in client-side code
- ✅ Only use on server (API routes)

### 💰 Fees

**Stripe Fees** (deducted automatically):
- 2.9% + $0.30 per successful charge
- Example: $1,000 payment = $29.30 fee
- You receive: $970.70

**How We Handle It**:
- We add Stripe fee to the invoice
- Startup pays: Success fee + Stripe fee
- Platform gets full 5% success fee
- Stripe gets their processing fee

---

## Troubleshooting

### Error: "Stripe publishable key not set"
**Solution**: Make sure you copied the keys to `.env.local` and restarted dev server

### Error: "Invalid API Key"
**Solution**:
- Check you copied the full key
- Make sure no extra spaces
- Confirm you're using TEST keys (start with `pk_test_` and `sk_test_`)

### Payment page doesn't load
**Solution**:
- Check browser console for errors
- Verify `.env.local` has correct keys
- Make sure you restarted dev server after adding keys

### Can't find API keys in Stripe Dashboard
**Solution**:
- Make sure you're in **Test mode** (toggle in top right)
- Go to Developers → API keys
- If you don't see them, refresh the page

---

## Next Steps

### For Testing:
1. ✅ Use test cards (4242 4242 4242 4242)
2. ✅ Test different scenarios (success, decline, 3D Secure)
3. ✅ View payments in Stripe Dashboard

### For Production:
1. ⏳ Complete Stripe business verification
2. ⏳ Get live API keys
3. ⏳ Set up webhooks (for payment confirmation)
4. ⏳ Test with small real payment
5. ⏳ Go live!

---

## Complete .env.local Example

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration (Test Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Abc123XyZ...
STRIPE_SECRET_KEY=sk_test_51Xyz789AbC...
STRIPE_WEBHOOK_SECRET=whsec_123abc... # (Add later for webhooks)
```

---

## Common Test Scenarios

### Test 1: Successful Payment
```
Card: 4242 4242 4242 4242
Result: ✅ Payment succeeds
```

### Test 2: Declined Card
```
Card: 4000 0000 0000 9995
Result: ❌ Payment declined
```

### Test 3: Insufficient Funds
```
Card: 4000 0000 0000 9995
Result: ❌ Card declined (insufficient funds)
```

### Test 4: 3D Secure Authentication
```
Card: 4000 0025 0000 3155
Result: 🔐 Shows authentication popup, then succeeds
```

---

## Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Test Cards**: https://stripe.com/docs/testing
- **API Docs**: https://stripe.com/docs/api
- **Checkout Docs**: https://stripe.com/docs/checkout

---

## You're All Set! 🎉

**Your marketplace can now accept payments!**

Test it out:
1. Mark a deal as closed
2. See the invoice
3. Click "Pay with Stripe"
4. Use test card 4242 4242 4242 4242
5. Complete payment
6. View in Stripe Dashboard

**Everything works! Ready to launch! 🚀**
