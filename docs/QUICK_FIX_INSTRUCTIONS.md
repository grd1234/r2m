# Quick Fix Instructions
**Date**: December 15, 2025
**Issues Fixed**: Logout not working + Invalid email addresses

---

## ✅ Fix 1: Logout Now Works

**What was fixed**: Changed `router.push('/')` to `window.location.href = '/'` to force a hard refresh and clear all cached state.

**File**: `src/components/shared/Navigation.tsx` (line 16-21)

**Test it**:
1. Login to any account
2. Click "Logout" button in top right
3. Should redirect to homepage and clear session completely

---

## ✅ Fix 2: Create Real Test Accounts

### Problem
The old seed script used fake email addresses like:
- ❌ `demo+investor_ai_vc@infyra.ai` (doesn't exist)

### Solution
Use YOUR Gmail address with the `+` trick!

---

## 📧 Step-by-Step: Create Test Accounts

### Step 1: Open the SQL File

Open: `supabase/seed_investors_YOUR_EMAIL.sql`

### Step 2: Replace Email Placeholder

Find **every instance** of `YOUR_GMAIL_HERE` and replace with your actual Gmail address.

**Example**:

**If your email is**: `geeta.desara@gmail.com`

**Find** (3 places):
```sql
'YOUR_GMAIL_HERE+investor_ai@gmail.com'
'YOUR_GMAIL_HERE+investor_healthcare@gmail.com'
'YOUR_GMAIL_HERE+investor_climate@gmail.com'
'YOUR_GMAIL_HERE+innovator1@gmail.com'
```

**Replace with**:
```sql
'geeta.desara+investor_ai@gmail.com'
'geeta.desara+investor_healthcare@gmail.com'
'geeta.desara+investor_climate@gmail.com'
'geeta.desara+innovator1@gmail.com'
```

**Pro Tip**: Use Find & Replace (Cmd+F) to replace all at once:
- Find: `YOUR_GMAIL_HERE`
- Replace: `geeta.desara` (or whatever your Gmail username is)

### Step 3: Run in Supabase

1. **Copy the entire SQL file** (after replacing email)
2. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/vqgwzzzjlswyagncyhih
3. **Go to SQL Editor** (left sidebar)
4. **Paste the SQL**
5. **Click "Run"** (or press Cmd+Enter)

### Step 4: Verify Users Created

You should see output like:
```
| full_name      | email                                | user_type | company_name         | domains                          |
|----------------|--------------------------------------|-----------|----------------------|----------------------------------|
| Dr. Maria Chen | geeta.desara+investor_ai@gmail.com   | investor  | Catalyst Ventures    | ["AI/ML","Healthcare","DevTools"]|
| Dr. Raj Patel  | geeta.desara+investor_healthcare@... | investor  | Patel Family Office  | ["Healthcare","Biotech"]         |
| Sophie Anderson| geeta.desara+investor_climate@...    | investor  | GreenTech Ventures   | ["Climate Tech","Energy"]        |
| Alex Johnson   | geeta.desara+innovator1@gmail.com    | startup   | InnovateTech Startup | null                             |
```

✅ **4 rows** should appear

---

## 🔐 Login Credentials

After running the script, you can login with:

### Investor 1 (AI/ML Specialist)
- **Email**: `YOUR_EMAIL+investor_ai@gmail.com`
- **Password**: `demo123`
- **Role**: Partner @ Catalyst Ventures

### Investor 2 (Healthcare Angel)
- **Email**: `YOUR_EMAIL+investor_healthcare@gmail.com`
- **Password**: `demo123`
- **Role**: Managing Director @ Patel Family Office

### Investor 3 (Climate VC)
- **Email**: `YOUR_EMAIL+investor_climate@gmail.com`
- **Password**: `demo123`
- **Role**: Principal @ GreenTech Ventures

### Innovator (For Testing)
- **Email**: `YOUR_EMAIL+innovator1@gmail.com`
- **Password**: `demo123`
- **Role**: Founder @ InnovateTech Startup

**Note**: All emails will arrive at `YOUR_EMAIL@gmail.com` - this is how Gmail's `+` addressing works!

---

## 🧪 Test the Full Flow

### Test 1: Login as Investor
1. Go to: `http://localhost:3000/login/investor`
2. Enter email: `YOUR_EMAIL+investor_ai@gmail.com`
3. Enter password: `demo123`
4. Click "Sign In"
5. ✅ Should redirect to `/dashboard`
6. ✅ Should see "Dr. Maria Chen" in top right
7. ✅ Should see investor navigation (Dashboard, Browse Opportunities, My Investments)

### Test 2: Logout
1. Click "Logout" button (top right)
2. ✅ Should redirect to homepage `/`
3. ✅ Should see "Login" button (not logged in state)
4. ✅ Try going back to `/dashboard` → should redirect to `/login`

### Test 3: Login as Innovator
1. Go to: `http://localhost:3000/login/innovator`
2. Enter email: `YOUR_EMAIL+innovator1@gmail.com`
3. Enter password: `demo123`
4. ✅ Should see different navigation (Dashboard, Analyze Research, My Deals)

---

## 📧 How Gmail "+" Addressing Works

**What you send**:
```
geeta.desara+investor_ai@gmail.com
geeta.desara+investor_healthcare@gmail.com
geeta.desara+investor_climate@gmail.com
geeta.desara+test123@gmail.com
geeta.desara+anything@gmail.com
```

**Where it goes**:
```
ALL → geeta.desara@gmail.com (your inbox!)
```

**Benefits**:
- ✅ Track which test account received emails
- ✅ Filter emails by label (Gmail auto-labels by `+tag`)
- ✅ Create unlimited test accounts
- ✅ All go to ONE inbox (no need to check multiple)

---

## ❓ Troubleshooting

### "Invalid login credentials"
- ✅ **Check**: Did you replace `YOUR_GMAIL_HERE` in the SQL?
- ✅ **Check**: Did you run the SQL in Supabase?
- ✅ **Check**: Verify users exist with verification query at bottom of SQL file
- ✅ **Check**: Password is `demo123` (not `demo_password_123`)

### "Email not confirmed"
- The SQL script sets `email_confirmed_at = NOW()` so emails are pre-confirmed
- No need to check inbox for confirmation emails

### Logout still not working?
- Clear browser cache (Cmd+Shift+Delete)
- Try incognito window (Cmd+Shift+N)
- Check browser console for errors (F12)

### Dashboard not loading?
- You must be logged in first
- Go to `/login/investor` or `/login/innovator`
- After login, dashboard should load

---

## 🎯 Next Steps After This Works

Once login/logout is working:

1. ✅ Test voice search: `/analysis/search` → click mic button
2. ✅ Test marketplace: `/marketplace` (currently shows mock data)
3. ✅ Test deals pipeline: `/deals`
4. 🚧 Implement n8n integration (Step 1 Part B)
5. 🚧 Replace mock marketplace data with real Supabase queries

---

## 📝 Summary

**What we fixed**:
1. ✅ Logout now forces hard refresh to clear state
2. ✅ Created SQL script using YOUR real Gmail address
3. ✅ Simplified password to `demo123`
4. ✅ Pre-confirmed all emails (no inbox check needed)

**Files changed**:
- `src/components/shared/Navigation.tsx` (logout fix)
- `supabase/seed_investors_YOUR_EMAIL.sql` (new seed script)

**Action required**:
- Replace `YOUR_GMAIL_HERE` with your actual Gmail username
- Run the SQL in Supabase SQL Editor
- Test login with new credentials

---

**Last Updated**: December 15, 2025
**Status**: Ready to test! 🚀
