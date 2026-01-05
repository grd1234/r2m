# Testing Guide - R2M Marketplace Investment Commitment System

**Last Updated**: December 9, 2025
**Purpose**: Step-by-step guide to test all the new features

---

## Prerequisites

1. ✅ Dev server is running: `npm run dev`
2. ✅ App is accessible at: http://localhost:3000
3. ✅ You have a user account (or can sign up)
4. ✅ You're logged in

---

## Test 1: Investment Commitment Modal

### What We're Testing:
The modal where investors commit to invest in opportunities

### Steps:

1. **Go to Marketplace**
   - Navigate to: http://localhost:3000/marketplace
   - You should see 6 opportunity cards

2. **Click "View Details" on any opportunity**
   - Example: Click on "Quantum computing for drug discovery"
   - You'll go to: http://localhost:3000/marketplace/1

3. **Look for the "Commit to Invest" button**
   - Location: Top right, next to "Request Introduction"
   - Color: Green button with dollar sign icon
   - Text: "Commit to Invest"

4. **Click "Commit to Invest"**
   - Modal should open
   - Title: "Commit to Invest"

5. **Test the Investment Amount Slider**
   - Default amount: $500K
   - Drag slider left: Goes down to $50K
   - Drag slider right: Goes up to $10M
   - Amount updates in real-time above slider

6. **Test Investment Type Dropdown**
   - Click the dropdown
   - Should see 5 options:
     - SAFE (Simple Agreement for Future Equity)
     - Convertible Note
     - Direct Equity
     - Revenue Share
     - Flexible / To Be Discussed
   - Select "SAFE"

7. **Test Timeline Dropdown**
   - Click the dropdown
   - Should see 4 options:
     - Within 30 days
     - Within 60 days
     - Within 90 days
     - Flexible timeline
   - Select "Within 60 days"

8. **Test Optional Message Field**
   - Type: "Very interested in this opportunity. Would like to schedule a DD call next week."
   - Field should accept text

9. **Check the Disclaimer**
   - Look for amber/yellow warning box
   - Should say "Non-Binding Commitment"
   - Explains this is indication of interest only

10. **Check Your Information Preview**
    - Should show your name, email, company
    - Pulled from your user profile

11. **Test Submit Button Validation**
    - Try clicking "Submit Commitment" without selecting investment type
    - Should be disabled (grayed out)
    - Select investment type and timeline
    - Button should enable (green)

12. **Submit the Commitment**
    - Click "Submit Commitment"
    - Should see loading state ("Submitting...")
    - After 1 second, success screen appears
    - Success message shows your commitment amount

13. **Close Modal**
    - Modal auto-closes after 2 seconds
    - Or click outside to close

### ✅ Success Criteria:
- Modal opens and closes smoothly
- All form fields work
- Validation prevents incomplete submissions
- Success screen shows confirmation

---

## Test 2: Committed Investors Section (Dashboard)

### What We're Testing:
The section where startups see investment commitments

### Steps:

1. **Go to Dashboard**
   - Navigate to: http://localhost:3000/dashboard
   - Wait for page to load

2. **Scroll to "Investment Commitments" Section**
   - Should be ABOVE "Introduction Requests"
   - Has green theme (vs blue for intro requests)

3. **Check Header Badges**
   - Top right should show:
     - "2 Commitments" badge (green)
     - "$1.2M Total" badge (green outline)

4. **Review First Commitment Card**
   - Investor: Sarah Chen • Quantum Ventures
   - Avatar: "SC" in green circle
   - Amount: $750K (large, green)
   - Type: SAFE
   - Timeline: Within 30 days
   - Message: "Ready to move forward with due diligence..."

5. **Check the 3-Column Grid**
   - Left: Amount ($750K)
   - Center: Type (SAFE)
   - Right: Timeline (Within 30 days)
   - All in white box inside green card

6. **Test Action Buttons**
   - Three buttons at bottom:
     1. "Accept & Start Due Diligence" (green, primary)
     2. "Decline" (red outline)
     3. "View Profile" (gray outline)
   - Hover over each - should show hover states

7. **Click "Accept & Start Due Diligence"**
   - Currently: Does nothing (mock data)
   - In production: Would create deal record

8. **Review Second Commitment Card**
   - Investor: Michael Roberts • Innovation Capital
   - Amount: $500K
   - Type: Convertible Note
   - Timeline: Within 60 days

9. **Check Next Steps Banner**
   - At bottom of section
   - Gray background
   - Text explains what to do next

### ✅ Success Criteria:
- Section appears on dashboard
- 2 commitment cards visible
- All data displays correctly
- Green visual theme distinguishes from intro requests

---

## Test 3: Deal Tracking System (Deals Page)

### What We're Testing:
The complete deal pipeline management page

### Steps:

1. **Navigate to Deals Page**
   - Click "Deals" in top navigation
   - Or go to: http://localhost:3000/deals

2. **Check Stats Dashboard**
   - Top of page, 4 stat cards:
     - Total Committed: $1.55M
     - Active Deals: 3
     - Avg Progress: 45%
     - Closed Deals: 0

3. **Test Filter Dropdown**
   - Click "Filter by status" dropdown
   - Should see options:
     - All Deals
     - Committed
     - Due Diligence
     - Term Sheet
     - Closing
     - Closed
   - Select "Due Diligence"
   - Only 1 deal should show (Sarah Chen)
   - Select "All Deals" to show all 3 again

4. **Review First Deal Card (Sarah Chen)**
   - Status: "Due Diligence" (yellow badge)
   - Amount: $750K
   - Progress bar: 45%
   - 4 Milestones:
     - ✅ Commitment (green, completed)
     - ⏰ Due Diligence (gray, in progress)
     - ⏰ Term Sheet (gray, pending)
     - ⏰ Closing (gray, pending)

5. **Check Required Documents**
   - Left side of card
   - 4 documents listed:
     - NDA.pdf ✅ (uploaded)
     - Financial Statements.xlsx ✅ (uploaded)
     - IP Portfolio.pdf ⏰ (not uploaded)
     - Term Sheet.docx ⏰ (not uploaded)

6. **Check Timeline Section**
   - Right side of card
   - Started: 2025-12-01
   - Expected Close: 2025-12-31
   - Last Update: 2 days ago

7. **Check Latest Notes**
   - Blue banner at bottom
   - "Investor team scheduled for site visit next week."

8. **Test "Update Status" Button**
   - Click "Update Status"
   - Modal opens
   - Shows deal information
   - Dropdown to select new status
   - Text area for notes

9. **Update Status**
   - Select "Term Sheet" from dropdown
   - Type note: "DD completed successfully. Moving to term sheet negotiation."
   - Click "Save Update"
   - Modal closes
   - (Note: Won't actually update since using mock data)

10. **Review Second Deal (Michael Roberts)**
    - Status: "Term Sheet" (purple badge)
    - Progress: 75%
    - More milestones completed
    - Different documents uploaded

11. **Check Third Deal (Lisa Park)**
    - Status: "Committed" (blue badge)
    - Progress: 15%
    - Just started (5 hours ago)

12. **Test Filter Again**
    - Filter by "Committed"
    - Should only show Lisa Park deal
    - Filter by "Term Sheet"
    - Should only show Michael Roberts deal

### ✅ Success Criteria:
- All 3 deals display correctly
- Filter works properly
- Progress bars show correct percentages
- Status badges have correct colors
- Update modal opens and closes
- All data is readable and well-formatted

---

## Test 4: Success Fee Invoice System

### What We're Testing:
The invoice that appears when marking a deal as closed

### Steps:

1. **Go to Deals Page**
   - Navigate to: http://localhost:3000/deals

2. **Find a Deal in "Closing" Status**
   - Currently in mock data: Michael Roberts (change his status to "closing" in the code, OR)
   - For this test, we'll manually trigger the invoice

3. **Look for "Mark as Closed" Button**
   - This button only appears when deal status = "closing"
   - For testing, you can click "Update Status" on any deal
   - Change status to "Closing"
   - The "Mark as Closed" button should appear

4. **Click "Mark as Closed"**
   - Green button with checkmark icon
   - Invoice modal should open immediately

5. **Check Invoice Header**
   - Invoice Number: INV-{timestamp}
   - Invoice Date: Today's date
   - Due Date: 30 days from today

6. **Review Deal Details Section**
   - Investor avatar and name
   - Opportunity title
   - Investment amount (large, green)

7. **Check Fee Breakdown**
   - Should show 3 rows:
     1. Success Fee (5% of investment) - Example: $37,500
     2. Processing Fee (Stripe 2.9% + $0.30) - Example: $1,088
     3. Total Due (in blue) - Example: $38,588

8. **Verify Calculation** (for $750K investment):
   ```
   Investment: $750,000
   Success Fee (5%): $37,500
   Stripe Fee (2.9% of $37,500 + $0.30): $1,088
   Total Due: $38,588
   ```

9. **Check Platform Revenue Section**
   - Green box showing 80% of success fee
   - Example: $30,000 (80% of $37,500)
   - Should say "Platform Revenue (Your Earnings)"

10. **Check Payment Info Banner**
    - Blue box at bottom
    - Explains Stripe processing
    - Mentions 2-3 business day payout

11. **Test Download PDF Button**
    - Click "Download PDF"
    - Currently: Shows alert (not implemented yet)
    - In production: Would download PDF invoice

12. **Test Pay with Stripe Button**
    - Click "Pay with Stripe"
    - Currently: Shows alert saying payment processed
    - In production: Would open Stripe checkout

13. **Close Modal**
    - Modal auto-closes after payment (mock)
    - Or click outside to close

### ✅ Success Criteria:
- Invoice modal opens when deal marked as closed
- All calculations are correct
- Fee breakdown is clear
- Platform revenue is displayed
- All amounts formatted as currency
- Modal is professional and polished

---

## Test 5: Navigation and Flow

### What We're Testing:
The complete user journey through all features

### Complete User Flow Test:

1. **Start at Landing Page**
   - http://localhost:3000
   - Click "Get Started" → Sign up

2. **Sign Up as Investor**
   - Email: investor@test.com
   - Password: test123456
   - User Type: Investor
   - Company: Test VC Fund
   - Click "Create Account"

3. **Go to Dashboard**
   - Should auto-redirect after signup
   - Or click "Dashboard" in nav

4. **Browse Marketplace**
   - Click "Marketplace" in nav
   - See 6 opportunities

5. **View Opportunity Details**
   - Click "View Details" on any opportunity
   - Read opportunity information

6. **Commit to Invest**
   - Click "Commit to Invest"
   - Fill out form
   - Submit commitment

7. **Check Deals Page**
   - Click "Deals" in nav
   - Should see your commitment (in mock data, won't show yet)

8. **Sign Up as Startup** (in new incognito window)
   - Email: startup@test.com
   - User Type: Startup
   - See commitments on dashboard

9. **Accept Commitment**
   - Click "Accept & Start Due Diligence"
   - Deal created (mock)

10. **Track Deal Progress**
    - Go to Deals page
    - Update status through pipeline
    - Add notes

11. **Close Deal**
    - Update to "Closing"
    - Click "Mark as Closed"
    - Review invoice
    - "Pay" with Stripe

### ✅ Success Criteria:
- All navigation links work
- User can complete entire flow
- No broken links or errors
- All pages load correctly

---

## Test 6: Visual and UI Testing

### What We're Testing:
Design, colors, spacing, responsiveness

### Steps:

1. **Check Color Coding**
   - Commitments: Green theme
   - Intro Requests: Blue theme
   - Status badges:
     - Committed: Blue
     - Due Diligence: Yellow
     - Term Sheet: Purple
     - Closing: Green
     - Closed: Gray

2. **Check Spacing**
   - All cards have consistent padding
   - Sections have proper margins
   - Text is readable

3. **Check Icons**
   - Dollar sign in "Commit to Invest"
   - Checkmarks for completed items
   - Clocks for pending items
   - Status icons in badges

4. **Check Hover States**
   - Buttons change on hover
   - Links change color
   - Cards lift slightly

5. **Test Responsive Design** (resize browser):
   - Desktop (1280px+): Full layout
   - Tablet (768px): Cards stack
   - Mobile (375px): Single column
   - (Note: Mobile optimization is TODO)

6. **Check Typography**
   - Headings are bold and clear
   - Body text is readable
   - No text overflow

### ✅ Success Criteria:
- Consistent color scheme
- Professional appearance
- Good spacing and alignment
- Readable typography

---

## Test 7: Error Handling

### What We're Testing:
How the app handles errors and edge cases

### Steps:

1. **Test Form Validation**
   - Try submitting commitment without investment type
   - Button should be disabled
   - Try with very low amount
   - Should work (minimum is $50K)

2. **Test Empty States**
   - Filter deals to show only "Closed"
   - Should see empty state message
   - "No deals found"

3. **Test Loading States**
   - Click "Submit Commitment"
   - Should see "Submitting..." text
   - Button should be disabled

4. **Test Modal Close Behavior**
   - Open commitment modal
   - Click outside modal
   - Should close
   - Press Escape key
   - Should close

### ✅ Success Criteria:
- Validation prevents bad data
- Empty states are friendly
- Loading states provide feedback
- Modals close properly

---

## Quick Test Checklist

Use this for rapid testing:

### Commitment Modal:
- [ ] Opens when button clicked
- [ ] Slider works ($50K - $10M)
- [ ] Investment type dropdown works
- [ ] Timeline dropdown works
- [ ] Message field accepts text
- [ ] Validation works
- [ ] Submit shows success
- [ ] Modal closes

### Dashboard Commitments:
- [ ] Section appears
- [ ] 2 commitment cards show
- [ ] Badges show correct totals
- [ ] Green theme applied
- [ ] Action buttons visible
- [ ] Next steps banner shows

### Deals Page:
- [ ] Stats show correctly
- [ ] Filter works
- [ ] All 3 deals display
- [ ] Progress bars show %
- [ ] Status badges colored correctly
- [ ] Milestones show checkmarks/clocks
- [ ] Documents show upload status
- [ ] Timeline shows dates
- [ ] Notes show in blue banner
- [ ] Update modal works

### Invoice Modal:
- [ ] Opens when "Mark as Closed" clicked
- [ ] Invoice number generated
- [ ] Dates show correctly
- [ ] Deal details display
- [ ] Fee calculation correct
- [ ] Platform revenue shown
- [ ] Buttons work
- [ ] Modal closes

---

## Screenshots to Take

For documentation/demo purposes:

1. **Commitment Modal**
   - Full modal with form filled out
   - Success state

2. **Dashboard Commitments**
   - Full section with 2 cards

3. **Deals Page**
   - Full page view with all 3 deals
   - Single deal card close-up
   - Update status modal

4. **Invoice Modal**
   - Full invoice with calculations

---

## Common Issues and Solutions

### Issue: "Module not found" error
**Solution**:
```bash
npm install
```

### Issue: Commitment modal doesn't open
**Solution**: Check browser console for errors

### Issue: Deals page is blank
**Solution**: Make sure you're logged in

### Issue: Styles look wrong
**Solution**:
```bash
npm run dev
# Restart dev server
```

### Issue: Can't see commitments on dashboard
**Solution**: Currently using mock data - they always show

---

## Next Steps After Testing

Once you've confirmed everything works:

1. **Run the SQL Schema**
   - Copy `/supabase/commitment_system_schema.sql`
   - Paste into Supabase SQL Editor
   - Execute
   - Verify tables created

2. **Connect to Real Data**
   - Update commitment modal to save to `investment_commitments` table
   - Update dashboard to fetch from database
   - Update deals page to fetch from database

3. **Set Up Stripe**
   - Follow `/STRIPE_INTEGRATION_GUIDE.md`
   - Get API keys
   - Implement payment processing

4. **Add Email Notifications**
   - When commitments are made
   - When status updates
   - When payments complete

---

## Testing Checklist Summary

✅ All tests passing means:
- UI works perfectly
- All features accessible
- Forms validate correctly
- Calculations are accurate
- User flow is smooth
- Design is professional

❌ If any tests fail:
- Check browser console
- Verify all components installed
- Restart dev server
- Check for typos in code

---

**Happy Testing! 🚀**

Your commitment system is ready to demo and use with mock data. Once connected to the database and Stripe, it will be production-ready!
