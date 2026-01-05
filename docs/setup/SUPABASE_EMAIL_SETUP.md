# Supabase Email Confirmation Setup Guide

## Problem
After creating an account, users are not receiving confirmation emails from Supabase.

## Solution

### Step 1: Configure Supabase Email Settings

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your R2M Marketplace project

2. **Navigate to Authentication Settings**
   - Click **Authentication** in the left sidebar
   - Click **Providers**
   - Scroll to **Email** provider

3. **Enable Email Confirmations**
   - Toggle **Enable Email Confirmations** to ON
   - This requires users to verify their email before accessing the app

### Step 2: Configure Email Templates (Optional but Recommended)

1. **Go to Email Templates**
   - Click **Authentication** → **Email Templates**

2. **Customize Confirmation Email**
   - Select **Confirm signup** template
   - Edit the template to match your branding
   - Make sure the confirmation link is present: `{{ .ConfirmationURL }}`

Example template:
```html
<h2>Confirm your R2M Marketplace signup</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

3. **Update Redirect URLs**
   - Go to **Authentication** → **URL Configuration**
   - Add your site URL: `http://localhost:3000` (development)
   - Add redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/login`
     - Your production URL when deployed

### Step 3: Set Up Custom SMTP (For Production - Optional)

By default, Supabase uses their email service (limited to 3 emails per hour in development).

For production or higher limits:

1. **Go to Project Settings**
   - Click **Settings** → **Project Settings**
   - Click **Auth** tab
   - Scroll to **SMTP Settings**

2. **Configure Your Email Provider**

   **Using SendGrid:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   Pass: YOUR_SENDGRID_API_KEY
   Sender email: noreply@yourdomain.com
   Sender name: R2M Marketplace
   ```

   **Using Gmail:**
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Pass: your-app-specific-password
   Sender email: your-email@gmail.com
   Sender name: R2M Marketplace
   ```

   **Using AWS SES:**
   ```
   Host: email-smtp.us-east-1.amazonaws.com
   Port: 587
   User: YOUR_SMTP_USERNAME
   Pass: YOUR_SMTP_PASSWORD
   Sender email: noreply@yourdomain.com
   Sender name: R2M Marketplace
   ```

### Step 4: Disable Email Confirmation (For Development Only)

If you want to test without email confirmation during development:

1. **Go to Authentication Settings**
   - **Authentication** → **Providers** → **Email**
   - Toggle **Enable Email Confirmations** to OFF
   - **Note**: Users can login immediately without verifying email

2. **Not Recommended for Production**
   - This allows fake/spam accounts
   - Email verification is a security best practice

### Step 5: Test Email Confirmation Flow

1. **Sign Up with Real Email**
   - Go to http://localhost:3000/signup
   - Enter your actual email address
   - Complete signup form

2. **Check Your Inbox**
   - Look for email from Supabase
   - Check spam folder if not received
   - **Development limit**: 3 emails per hour with default Supabase SMTP

3. **Click Confirmation Link**
   - Opens: `http://localhost:3000/auth/callback?token=...`
   - Should redirect to login or dashboard
   - User's email is now verified

### Step 6: Handle Unverified Users in App

Update your login flow to handle unverified emails:

The signup page has been updated to:
- Show a success message after signup
- Prompt user to check email
- Prevent login until email is verified

## Troubleshooting

### Email Not Received

**Check Supabase Logs:**
1. Go to **Logs** → **Auth Logs** in Supabase dashboard
2. Look for signup events
3. Check if email was sent

**Common Issues:**
- Rate limit exceeded (3 emails/hour in development)
- Email in spam folder
- Wrong email address
- Email confirmations disabled
- SMTP configuration error

**Solutions:**
- Wait an hour and try again
- Check all email folders
- Verify email address is correct
- Enable email confirmations in settings
- Test SMTP connection

### Confirmation Link Not Working

**Check URL Configuration:**
1. **Authentication** → **URL Configuration**
2. Make sure `http://localhost:3000` is in Site URL
3. Add `http://localhost:3000/auth/callback` to Redirect URLs

**Check Token Expiration:**
- Default: Tokens expire after 24 hours
- User must click link before expiration
- Request new confirmation email if expired

### User Can't Login After Confirming

**Check Email Verification Status:**
```sql
-- Run in Supabase SQL Editor
SELECT
  id,
  email,
  email_confirmed_at,
  confirmed_at
FROM auth.users
WHERE email = 'user@example.com';
```

If `email_confirmed_at` is NULL:
- Confirmation didn't work
- User needs to confirm again
- Check auth logs for errors

## Production Checklist

Before going live:

- [ ] Enable email confirmations
- [ ] Set up custom SMTP (SendGrid, AWS SES, etc.)
- [ ] Customize email templates with your branding
- [ ] Add production URLs to URL Configuration
- [ ] Test signup flow end-to-end
- [ ] Test password reset flow
- [ ] Set up email rate limiting/monitoring
- [ ] Configure SPF, DKIM for email domain
- [ ] Test email deliverability

## Email Rate Limits

**Supabase Default SMTP:**
- Development: 3 emails per hour
- Production: Contact Supabase for limits

**Custom SMTP Limits:**
- SendGrid Free: 100 emails/day
- SendGrid Essentials: $19.95/month, 50K emails/month
- AWS SES: $0.10 per 1,000 emails
- Gmail: Not recommended for production

## Environment Variables

Make sure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_APP_URL` to your live domain.

## Support

If emails still aren't working:
1. Check Supabase status: https://status.supabase.com
2. Review auth logs in Supabase dashboard
3. Check Supabase Discord: https://discord.supabase.com
4. Contact Supabase support

---

**Current Status:**
- Email confirmations may be disabled in your Supabase project
- Follow Step 1 above to enable them
- For development, you can disable confirmations (Step 4)
- For production, always enable confirmations + custom SMTP
