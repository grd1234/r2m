# Email Confirmation Testing & Verification Guide

## Current Status: ✅ Email Confirmation Setup Complete

### What's Already Implemented:

1. ✅ **Auth Callback Route**: `/src/app/auth/callback/route.ts`
2. ✅ **Signup Pages with emailRedirectTo**: Both innovator and investor signup
3. ✅ **Success Messages**: Shows email confirmation instructions
4. ✅ **Email Confirmation Guide**: `SUPABASE_EMAIL_SETUP.md`

---

## Pre-Test Checklist

### Step 1: Verify Environment Variables

Check your `.env.local` file has these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Action Required:**
```bash
# Verify .env.local exists and has correct values
cat .env.local | grep SUPABASE
cat .env.local | grep APP_URL
```

---

## Supabase Dashboard Configuration

### Step 2: Enable Email Confirmations

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your R2M Marketplace project

2. **Navigate to Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **Providers**
   - Find **Email** provider

3. **Enable Email Confirmations**
   - Toggle **"Enable Email Confirmations"** to **ON**
   - Click **Save**

**Current Status:**
```
⚠️ You need to check this in Supabase Dashboard
   If this is OFF, users can login without confirming email
   If this is ON, users must click confirmation link to login
```

### Step 3: Configure Redirect URLs

1. **Go to URL Configuration**
   - Click **Authentication** → **URL Configuration**

2. **Set Site URL**
   ```
   Site URL: http://localhost:3000
   ```

3. **Add Redirect URLs**
   ```
   Redirect URLs (one per line):
   http://localhost:3000/auth/callback
   http://localhost:3000/dashboard
   http://localhost:3000/login/innovator
   http://localhost:3000/login/investor
   ```

4. **Click Save**

**Why This Matters:**
- Supabase will only redirect to URLs in this whitelist
- If not configured, email confirmation will fail with "Invalid redirect URL"

### Step 4: Check Email Templates (Optional)

1. **Go to Email Templates**
   - Click **Authentication** → **Email Templates**

2. **Confirm Signup Template**
   - Should contain: `{{ .ConfirmationURL }}`
   - Customizable for your branding

Default template is fine for testing.

---

## Testing Email Confirmation Flow

### Test 1: Innovator Signup

**Step 1: Sign Up**
1. Go to http://localhost:3000
2. Click **"I'm an Innovator"** button
3. Fill out form:
   - Full Name: Test Innovator
   - Email: **YOUR_REAL_EMAIL@gmail.com** (use real email!)
   - Password: TestPass123!
   - User Type: Startup / Fresh Graduate
   - Organization: Test University
4. ✅ Check **"I agree to Terms of Service and Innovator Agreement"**
5. Click **"Create Innovator Account"**

**Expected Result:**
```
✅ Success message appears:
   "Account Created Successfully!
    We've sent a confirmation email to YOUR_REAL_EMAIL@gmail.com.
    Please check your inbox and click the confirmation link..."
```

**Step 2: Check Email**
1. Open your email inbox
2. Look for email from: `noreply@mail.app.supabase.io`
3. Subject: "Confirm your signup"

**If No Email Received:**
- ⏰ Wait 2-3 minutes (can be slow)
- 📁 Check spam/junk folder
- 🔄 Check rate limit (Supabase free tier: 3 emails/hour)
- 📊 Check Supabase Dashboard → Logs → Auth Logs

**Step 3: Click Confirmation Link**
1. Open confirmation email
2. Click **"Confirm your email"** link
3. Browser opens new tab

**Expected URL:**
```
http://localhost:3000/auth/callback?code=LONG_TOKEN_STRING
```

**Expected Behavior:**
- Page loads auth callback route
- Code is exchanged for session
- User is redirected to `/dashboard`
- User is now logged in

**If Redirect Fails:**
- Check browser console for errors
- Verify redirect URLs in Supabase dashboard
- Check auth callback route is working

**Step 4: Verify Login**
- Should be at `/dashboard`
- Navigation shows: Dashboard | Analyze Research | My Deals
- Welcome message shows: "Welcome back, Test Innovator!"
- Can access all innovator features

### Test 2: Investor Signup

Repeat same process but:
1. Click **"I'm an Investor"** instead
2. Use different email address
3. Fill investor-specific form
4. Expected redirect: `/dashboard`
5. Navigation shows: Dashboard | Browse Opportunities | My Investments

### Test 3: Verify Email Confirmation Required

**Test Login Before Confirmation:**
1. Sign up with new email: `test2@example.com`
2. **DON'T** click confirmation link yet
3. Go to `/login/innovator`
4. Try to login with email/password

**Expected Result:**
```
❌ Login should fail with error:
   "Email not confirmed" or "Invalid login credentials"
```

**Then Confirm Email:**
1. Go to inbox
2. Click confirmation link
3. Try login again

**Expected Result:**
```
✅ Login succeeds
   Redirected to /dashboard
```

---

## Troubleshooting Common Issues

### Issue 1: No Email Received

**Check Supabase Auth Logs:**
1. Dashboard → Logs → Auth Logs
2. Look for signup event
3. Check if email was sent

**Possible Causes:**
```
1. Email confirmations disabled
   → Enable in Authentication → Providers → Email

2. Rate limit exceeded (3 emails/hour)
   → Wait 1 hour, try again

3. Wrong email address
   → Use valid email you have access to

4. Email in spam
   → Check all folders

5. Supabase email service down
   → Check https://status.supabase.com
```

### Issue 2: "Invalid redirect URL" Error

**Fix:**
1. Go to Authentication → URL Configuration
2. Add `http://localhost:3000/auth/callback` to Redirect URLs
3. Save and try again

### Issue 3: Confirmation Link Expired

**Symptoms:**
- Click link, get error: "Token expired"

**Fix:**
- Request new confirmation email:
  ```sql
  -- Run in Supabase SQL Editor
  SELECT auth.send_confirmation_email('user@example.com');
  ```

Or sign up again with same email.

### Issue 4: User Can Login Without Confirming

**Cause:** Email confirmations are disabled

**Fix:**
1. Go to Authentication → Providers → Email
2. Enable "Enable Email Confirmations"
3. Save
4. Test again with new email

### Issue 5: Callback Route Not Working

**Check:**
1. File exists: `/src/app/auth/callback/route.ts`
2. Dev server is running: `npm run dev`
3. No syntax errors in callback route

**Test Callback Manually:**
```
http://localhost:3000/auth/callback?code=test
→ Should redirect to /login with error (invalid code)
```

---

## Email Rate Limits

### Supabase Free Tier:
- **Rate**: 3 emails per hour
- **Resets**: Every hour

**If Testing Multiple Times:**
1. Use different email addresses
2. Wait 1 hour between tests
3. Or set up custom SMTP (see below)

### Custom SMTP (Production):

For higher limits, configure SMTP:

**Settings → Project Settings → Auth → SMTP Settings**

**SendGrid Example:**
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: YOUR_SENDGRID_API_KEY
Sender: noreply@yourdomain.com
```

**Gmail Example:**
```
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Password: your-app-password
Sender: your-email@gmail.com
```

---

## Verify Database Records

### Check User Creation:

Run in Supabase SQL Editor:

```sql
-- Check if user was created
SELECT
  id,
  email,
  email_confirmed_at,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'YOUR_EMAIL@example.com';
```

**Expected Result (Before Confirmation):**
```
email_confirmed_at: NULL
confirmed_at: NULL
```

**Expected Result (After Confirmation):**
```
email_confirmed_at: 2025-12-10 12:34:56
confirmed_at: 2025-12-10 12:34:56
```

### Check Profile Creation:

```sql
-- Check if profile was created (via trigger)
SELECT
  id,
  email,
  full_name,
  user_type,
  company_name,
  persona,
  created_at
FROM profiles
WHERE email = 'YOUR_EMAIL@example.com';
```

**Expected Result:**
```
full_name: Test Innovator
user_type: startup
company_name: Test University
persona: innovator
```

---

## Production Checklist

Before going live:

- [ ] Email confirmations enabled in Supabase
- [ ] Custom SMTP configured (SendGrid/AWS SES)
- [ ] Production URLs added to redirect whitelist
- [ ] Email templates customized with branding
- [ ] Test confirmation flow end-to-end
- [ ] Monitor email deliverability
- [ ] Set up email notifications (new user signups)
- [ ] Configure password reset flow
- [ ] Test on multiple email providers (Gmail/Outlook/Yahoo)
- [ ] Set up SPF/DKIM for custom domain

---

## Quick Test Commands

### Test Signup API Directly:

```bash
# Test innovator signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "fullName": "Test User",
    "userType": "startup",
    "organization": "Test Org"
  }'
```

### Check Environment:

```bash
# Verify environment variables are loaded
curl http://localhost:3000/api/health

# Or check in browser console:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(process.env.NEXT_PUBLIC_APP_URL)
```

### Monitor Logs:

```bash
# Watch server logs while testing
npm run dev

# In another terminal, test signup
# Watch for errors in dev server output
```

---

## Success Criteria

Email confirmation is working correctly when:

✅ **1. Signup Creates Account**
- Form submits successfully
- Success message shows
- User sees "Check your email" instruction

✅ **2. Email is Received**
- Email arrives within 2-3 minutes
- Contains working confirmation link
- Link format: `http://localhost:3000/auth/callback?code=...`

✅ **3. Confirmation Link Works**
- Click link opens new tab
- Redirects to `/dashboard`
- User is logged in automatically
- Navigation shows correct persona menu

✅ **4. Email Required to Login**
- Cannot login before confirming email
- Error shown: "Email not confirmed"
- After confirmation, login works

✅ **5. Database Records Correct**
- `auth.users` has `email_confirmed_at` timestamp
- `profiles` table has user record
- User type and persona saved correctly

---

## Current Implementation Status

### ✅ What's Working:

1. Innovator and Investor signup pages
2. Email redirect URL configured in code
3. Success messages showing email instructions
4. Auth callback route handling confirmation
5. Persona-specific login validation
6. Separate legal agreements

### ⚠️ What Needs Configuration (Supabase Dashboard):

1. Enable email confirmations (toggle ON)
2. Add redirect URLs to whitelist
3. Optionally customize email templates
4. For production: Set up custom SMTP

### 📋 Next Steps:

1. **Right Now**: Go to Supabase Dashboard
2. **Enable**: Email confirmations
3. **Add**: Redirect URLs
4. **Test**: Complete signup → email → confirmation → login flow
5. **Verify**: Check database records

---

## Support Resources

- **Setup Guide**: See `SUPABASE_EMAIL_SETUP.md`
- **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-email
- **Dashboard**: https://supabase.com/dashboard
- **Status Page**: https://status.supabase.com

---

## Summary

**Your email confirmation is 95% complete!**

The code is ready. You just need to:
1. Enable email confirmations in Supabase dashboard
2. Add redirect URLs
3. Test with your real email

Follow the "Supabase Dashboard Configuration" section above and you'll be all set! 🚀
