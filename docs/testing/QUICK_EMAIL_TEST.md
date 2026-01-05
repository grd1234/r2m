# Quick Email Confirmation Test (5 Minutes)

## 1. Enable in Supabase (2 minutes)

**Go to:** https://supabase.com/dashboard

1. Select your project
2. Click **Authentication** → **Providers**
3. Find **Email** provider
4. Toggle **"Enable Email Confirmations"** to **ON** ✅
5. Click **Save**

6. Click **URL Configuration**
7. **Site URL**: `http://localhost:3000`
8. **Redirect URLs** (add these):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   ```
9. Click **Save**

## 2. Test Signup (1 minute)

1. Go to: http://localhost:3000
2. Click **"I'm an Innovator"**
3. Fill form with **your real email**
4. Check agreement box ✅
5. Click **"Create Innovator Account"**

**Expected:** Green success message appears

## 3. Check Email (1 minute)

1. Open your email inbox
2. Look for email from Supabase
3. **Check spam if not in inbox**
4. Click **"Confirm your email"** link

**Expected:** Browser redirects to dashboard + you're logged in

## 4. Verify (1 minute)

- You should be at `/dashboard`
- Navigation shows: Dashboard | Analyze Research | My Deals
- User name appears in top right

## Done! ✅

If any step fails, see `EMAIL_CONFIRMATION_TEST.md` for full troubleshooting guide.

## Common Issues:

**No email received?**
- Wait 2-3 minutes (can be slow)
- Check spam folder
- Supabase free tier: 3 emails/hour max

**Confirmation link doesn't work?**
- Make sure you added redirect URLs in Step 1
- Check dev server is running: `npm run dev`

**Can login without confirming?**
- Email confirmations not enabled (go back to Step 1)
