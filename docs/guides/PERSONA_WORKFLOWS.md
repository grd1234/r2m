# R2M Marketplace - Complete Persona Workflows

## Two Personas Overview

### 1. **Innovators**
- Fresh Graduates
- Startups
- Technology Transfer Offices (TTOs)
- Innovation Hubs

### 2. **Investors**
- Venture Capitalists (VCs)
- Angel Investors
- Corporate R&D
- Strategic Partners

---

## Innovator Workflow

### Phase 1: Discovery & Signup

**Entry Point: Homepage**
- User visits http://localhost:3000
- Sees value proposition: "Transform Research into Market Opportunities"
- Views animated visualization: Research → AI Analysis → Investment

**Decision Point:**
- Clicks **"I'm an Innovator"** button (Blue-Indigo gradient)

**Signup Process:**
- Redirected to `/signup/innovator`
- Fills out form:
  - Full Name
  - Email (university/institution email)
  - Password
  - User Type (Startup/Fresh Graduate/TTO/Innovation Hub)
  - Organization/Institution name
- Reviews **Innovator Agreement**:
  - IP rights retention
  - 5% success fee structure
  - Confidentiality terms
  - Platform usage terms
- ✅ Checks "I agree to Terms of Service and Innovator Agreement"
- Clicks **"Create Innovator Account"**

**Email Confirmation:**
- Receives confirmation email from Supabase
- Clicks verification link
- Email confirmed → Account activated

### Phase 2: First Login & Onboarding

**Login:**
- Goes to `/login/innovator`
- Enters email and password
- System validates: user_type = 'startup' | 'tto' | 'innovation_hub'
- Redirects to `/dashboard`

**Dashboard Overview:**
- **Welcome message**: "Welcome back, [Name]!"
- **Quick Actions**:
  - 🔍 New Analysis (Blue card) → `/analysis/search`
  - 📊 Browse Marketplace (Cyan card)
- **Stats**:
  - Total Analyses: 0
  - Published Listings: 0
  - Intro Requests: 0
  - Active Connections: 0
- **Investment Commitments Section**: (Initially empty)

**Navigation Menu (Innovator-specific):**
- Dashboard
- Analyze Research
- My Deals

### Phase 3: Research Analysis

**Step 3.1: Search Research**
- Clicks "Analyze Research" in navigation
- Goes to `/analysis/search`
- Search interface:
  - Text search bar: "Search research papers, patents, or innovations"
  - Filter options:
    - Technology area
    - TRL level
    - Market size
    - Date range

**Step 3.2: Submit Research**
- Enters research details:
  - Paper title/URL
  - Abstract
  - Keywords
  - Technology category
  - Current TRL
- Uploads supporting documents (optional):
  - Research paper PDF
  - Patent documents
  - Technical specifications
- Clicks **"Analyze with AI"**

**Step 3.3: AI Processing**
- Platform shows: "Analyzing your research..."
- AI evaluates:
  - **Commercial Viability Score (CVS)**: 0-100
  - **Technical Readiness Level (TRL)**: 1-9
  - **Total Addressable Market (TAM)**: $XXX million
  - **Competitive Landscape**
  - **Market Positioning**
  - **Commercialization Pathways**
  - **Risk Assessment**
  - **Go-to-Market Recommendations**
- Processing time: 2-5 minutes

**Step 3.4: View Results**
- Redirected to `/analysis/results/[id]`
- Comprehensive report displayed:
  - **CVS Score Badge**: Color-coded (85+ = Green, 70-84 = Yellow, <70 = Red)
  - **Executive Summary**
  - **Market Analysis**
  - **Technical Assessment**
  - **Competitive Analysis**
  - **Commercialization Roadmap**
  - **Investment Readiness**
- Actions available:
  - 📥 Download Report (PDF)
  - ✏️ Edit Submission
  - 🚀 Publish to Marketplace
  - 🗑️ Delete

### Phase 4: Publishing to Marketplace

**Step 4.1: Prepare Listing**
- Clicks **"Publish to Marketplace"**
- Listing form:
  - Opportunity Title
  - Short Description (elevator pitch)
  - Detailed Description
  - Investment Stage (Pre-seed/Seed/Series A/Series B)
  - Funding Requested
  - Use of Funds
  - Team Information
  - Contact Preferences
  - Visibility Settings:
    - Public (all investors)
    - Private (selected investors only)
- Uploads additional materials:
  - Pitch deck
  - Financial projections
  - Team bios
  - Product demos

**Step 4.2: Review & Publish**
- Preview listing as investors will see it
- Confirms information accuracy
- Clicks **"Publish to Marketplace"**
- Listing goes live at `/marketplace/[id]`

### Phase 5: Investor Discovery & Engagement

**Step 5.1: Receive Interest**
- Returns to `/dashboard`
- Sees "Investment Commitments" section populated
- Example commitment card:
  - 👤 **Investor Name**: Sarah Chen
  - 🏢 **Firm**: Quantum Ventures
  - 💰 **Commitment Amount**: $750,000
  - 📊 **Investment Type**: SAFE
  - ⏰ **Timeline**: 60 days
  - 💬 **Message**: "Very interested in your quantum computing research..."
  - 📈 **Status**: Pending

**Step 5.2: Review Investor Profile**
- Clicks on investor name
- Views investor profile:
  - Investment focus areas
  - Portfolio companies
  - Investment stage preferences
  - Check size range
  - Geographic focus
  - Previous deep-tech investments

**Step 5.3: Accept or Decline**
- **Option 1: Accept**
  - Clicks **"Accept & Start Due Diligence"**
  - Modal appears: "Creating Deal Record..."
  - Deal created in system
  - Redirected to `/deals`

- **Option 2: Decline**
  - Clicks **"Decline"**
  - Optional: Provide reason
  - Investor notified

- **Option 3: Request More Info**
  - Clicks **"Request Meeting"**
  - Schedules call/meeting
  - Video conference link generated

### Phase 6: Deal Management

**Step 6.1: Deal Pipeline View**
- Navigates to **"My Deals"** (main workflow)
- `/deals` page shows:
  - **Pipeline Stats**:
    - Active Deals: 2
    - Total Value: $1.5M
    - Avg. CVS Score: 85
  - **Deal Cards** with stages:
    - 🔵 Committed (15% progress)
    - 🟡 Due Diligence (45% progress)
    - 🟢 Term Sheet (75% progress)
    - 🟠 Closing (90% progress)
    - ✅ Closed (100% progress)

**Step 6.2: Track Deal Progress**
Each deal card shows:
- Opportunity name
- Investor details
- Investment amount
- Current stage
- Progress bar
- Last update timestamp
- Next milestone
- Action buttons

**Step 6.3: Update Deal Status**
- Clicks **"Update Status"**
- Modal opens with:
  - Current status dropdown
  - Progress update notes
  - Milestone checklist:
    - ☐ NDA Signed
    - ☐ Data Room Shared
    - ☐ Management Presentation
    - ☐ Term Sheet Negotiation
  - Attach documents
- Clicks **"Save Update"**
- Progress bar animates to new percentage
- Timeline updated
- Investor notified

**Step 6.4: Document Management**
- **Data Room** section per deal:
  - Financial statements
  - IP documentation
  - Technical specifications
  - Team information
  - Customer references
- Upload/download documents
- Version control
- Access logs (who viewed what)

**Step 6.5: Communication**
- **Messages** tab per deal:
  - Direct messaging with investor
  - Threaded conversations
  - File sharing
  - Meeting scheduling
- **Activity Feed**:
  - Status changes
  - Document uploads
  - Messages
  - Meeting notes

### Phase 7: Closing the Deal

**Step 7.1: Final Steps**
- Deal status reaches **"Closing"** (90% progress)
- Checklist appears:
  - ☑️ Term sheet signed
  - ☑️ Legal documents prepared
  - ☑️ Bank details verified
  - ☐ Closing documents signed
  - ☐ Funds transfer initiated
- **"Mark as Closed"** button appears (green)

**Step 7.2: Mark as Closed**
- Clicks **"Mark as Closed"**
- Invoice modal opens automatically:

**Invoice Details:**
```
Investment Transaction Invoice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Deal: Quantum computing for drug discovery
Investor: Sarah Chen (Quantum Ventures)
Investment Amount: $750,000
Closing Date: December 9, 2025

Fee Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success Fee (5%):              $37,500
Stripe Processing Fee (2.9%):  $1,088
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Due:                     $38,588

Platform Share (80%):          $30,000
Your Net:                      $720,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Step 7.3: Payment Processing**
- Clicks **"Pay with Stripe"**
- Redirected to Stripe Checkout (hosted page)
- Payment form:
  - Card number
  - Expiration
  - CVC
  - Billing address
- Processes payment securely
- Redirected back: `/deals?payment=success`

**Step 7.4: Deal Completion**
- Deal marked as **"Closed"** (100% progress)
- Success notification
- Certificate/receipt generated
- Platform share transferred
- Deal archived in "Completed Deals"

### Phase 8: Post-Investment

**Step 8.1: Portfolio Management**
- Dashboard shows "Active Investments"
- Periodic update requests from investors
- Progress reporting interface
- Milestone tracking

**Step 8.2: Additional Rounds**
- Can list same opportunity for follow-on rounds
- Existing investors get first look
- Updated CVS scores based on progress

---

## Investor Workflow

### Phase 1: Discovery & Signup

**Entry Point: Homepage**
- User visits http://localhost:3000
- Sees value proposition
- Views animated visualization

**Decision Point:**
- Clicks **"I'm an Investor"** button (Cyan-Teal gradient)

**Signup Process:**
- Redirected to `/signup/investor`
- Fills out form:
  - Full Name
  - Email (VC firm email)
  - Password
  - User Type (VC/Angel/Corporate R&D)
  - Firm/Organization name
- Reviews **Investor Agreement**:
  - Accredited investor status
  - Due diligence responsibility
  - Confidentiality obligations
  - No broker-dealer disclaimer
  - No platform fees for investors
  - Securities law compliance
- ✅ Checks "I agree to Terms of Service and Investor Agreement"
- Clicks **"Create Investor Account"**

**Email Confirmation:**
- Receives confirmation email
- Clicks verification link
- Account activated

### Phase 2: First Login & Profile Setup

**Login:**
- Goes to `/login/investor`
- Enters credentials
- System validates: user_type = 'investor' | 'corporate_rd'
- Redirects to `/dashboard`

**Dashboard Overview:**
- **Welcome message**: "Welcome back, [Name]!"
- **Investor-specific Stats**:
  - Opportunities Viewed: 0
  - Commitments Made: 0
  - Deals in Progress: 0
  - Portfolio Size: 0
- **Quick Actions**:
  - 🔍 Browse Opportunities → `/marketplace`
  - 📊 My Investment Pipeline → `/deals`

**Navigation Menu (Investor-specific):**
- Dashboard
- Browse Opportunities
- My Investments

**Profile Setup:**
- Investment Preferences:
  - Focus areas (select multiple):
    - Quantum Computing
    - Biotech
    - Climate Tech
    - Energy
    - AI/ML
    - Materials Science
  - Investment stages:
    - Pre-seed
    - Seed
    - Series A
    - Series B
  - Check size range: $50K - $10M
  - Geographic preferences
  - TRL preferences: 4-9
  - Minimum CVS score: 70

### Phase 3: Opportunity Discovery

**Step 3.1: Browse Marketplace**
- Clicks **"Browse Opportunities"**
- Goes to `/marketplace`
- Sees marketplace dashboard:

**Marketplace Stats:**
```
Total Opportunities: 6
Avg CVS Score: 83 (Gradient text: Green-Emerald)
Total TAM: $27.6B (Gradient text: Blue-Cyan)
```

**Step 3.2: Filter & Search**
- **Filter Bar**:
  - Search: Text search
  - Category: Dropdown (All/Quantum/Biotech/Climate/etc.)
  - CVS Score: Slider (0-100)
  - TRL: Dropdown (All/1-3/4-6/7-9)
  - TAM: Range ($1M - $10B+)
  - Stage: Checkboxes (Pre-seed/Seed/Series A/Series B)
  - Sort: CVS Score/TAM/Recent/TRL

**Step 3.3: View Opportunity Cards**
Each card shows:
- **CVS Score Badge**: Gradient (85+ = Green→Emerald, 80-84 = Cyan→Blue)
- **Left Border**: Color-coded by category (Purple/Green/Teal/Yellow/Blue/Pink)
- **Title**: "Quantum computing for drug discovery"
- **Category Badge**: "Quantum Computing"
- **Stage Badge**: "Series A"
- **TRL Badge**: "TRL 7"
- **TAM**: "$4,500M"
- **Short Description**
- **"View Details"** button
- **"Save"** button (bookmark)

### Phase 4: Opportunity Evaluation

**Step 4.1: View Details**
- Clicks **"View Details"**
- Goes to `/marketplace/[id]`
- Comprehensive opportunity page:

**Page Layout:**
```
┌─────────────────────────────────────────────────┐
│ CVS Score: 87 (Large gradient badge)           │
│ TRL: 7 | TAM: $4.5B | Stage: Series A         │
├─────────────────────────────────────────────────┤
│ Quantum Computing for Drug Discovery           │
│                                                 │
│ Stanford University | Dr. Jane Smith           │
│ Seeking: $2M Series A                          │
├─────────────────────────────────────────────────┤
│ [Overview] [Market] [Technology] [Team] [Docs] │
├─────────────────────────────────────────────────┤
│                                                 │
│ Executive Summary:                              │
│ Revolutionary quantum algorithm...              │
│                                                 │
│ Market Opportunity:                             │
│ - TAM: $4.5B                                    │
│ - CAGR: 15%                                     │
│ - Target: Pharmaceutical companies             │
│                                                 │
│ Technology:                                     │
│ - Patent pending                                │
│ - Prototype tested                              │
│ - Performance: 100x faster...                   │
│                                                 │
│ Team:                                           │
│ - Dr. Jane Smith (PhD Quantum Physics)         │
│ - 15 years research experience                  │
│ - 3 previous startups                           │
│                                                 │
│ Traction:                                       │
│ - 2 LOIs from Fortune 500                      │
│ - $500K in grants                               │
│ - 5 research publications                       │
│                                                 │
│ Use of Funds:                                   │
│ - R&D: 60% ($1.2M)                             │
│ - Team expansion: 25% ($500K)                  │
│ - Marketing: 15% ($300K)                       │
│                                                 │
│ Documents Available:                            │
│ - Pitch Deck (12 slides)                       │
│ - Financial Projections                        │
│ - Patent Application                            │
│ - Team Bios                                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Step 4.2: Download Materials**
- Clicks on documents:
  - 📊 Pitch Deck → Downloads PDF
  - 📈 Financial Model → Downloads Excel
  - 🔬 Technical Whitepaper → Downloads PDF
  - 👥 Team Bios → Opens modal

**Step 4.3: AI Analysis Review**
- Tabs: **"AI Analysis"**
- Views R2M's AI-generated insights:
  - **Strengths**:
    - Strong technical foundation
    - Large addressable market
    - Experienced team
    - Early customer validation
  - **Risks**:
    - Technical complexity
    - Regulatory hurdles
    - Competition intensity
  - **Recommendations**:
    - Request customer references
    - Validate IP defensibility
    - Review competitive positioning
  - **Comparable Companies**:
    - Company A (exited for $50M)
    - Company B (raised Series B $10M)

### Phase 5: Investment Commitment

**Step 5.1: Express Interest**
- Clicks **"Commit to Invest"** button
- Modal opens: "Investment Commitment"

**Commitment Form:**
```
Investment Commitment
━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a non-binding expression of interest

Investment Amount: [Slider: $50K - $10M]
Current: $750,000

Investment Type:
[Dropdown]
- SAFE (Simple Agreement for Future Equity)
- Convertible Note
- Priced Equity Round
- Revenue Share
- Flexible

Investment Timeline:
[Dropdown]
- 30 days
- 60 days
- 90 days
- Flexible

Message to Innovator: [Text area]
"Very interested in your quantum computing
research. Would love to schedule a call to
discuss partnership opportunities..."

☐ Request NDA before detailed discussions

[Cancel] [Submit Commitment]
```

**Step 5.2: Submit Commitment**
- Clicks **"Submit Commitment"**
- Confirmation message:
  - "Commitment submitted successfully!"
  - "The innovator will review and respond within 48 hours"
  - "You'll receive an email notification when they respond"
- Commitment appears in **"My Investments"** as "Pending"

### Phase 6: Due Diligence Phase

**Step 6.1: Commitment Accepted**
- Receives email: "Your investment commitment has been accepted!"
- Notification in dashboard
- Goes to `/deals`

**Step 6.2: Deal Pipeline View**
- **"My Investments"** page shows:
  - **Pipeline Stats**:
    - Active Deals: 3
    - Total Committed: $2.5M
    - Deals Closing: 1
  - **Deal Cards** by stage:
    - 🔵 Committed
    - 🟡 Due Diligence ← Current
    - 🟢 Term Sheet
    - 🟠 Closing
    - ✅ Closed

**Step 6.3: Access Data Room**
- Clicks on deal card
- **Data Room** section:
  - 📁 Financial Documents
    - Cap table
    - Financial statements (3 years)
    - Projections (5 years)
    - Burn rate analysis
  - 📁 Legal Documents
    - Articles of incorporation
    - Previous funding rounds
    - Material contracts
    - IP assignments
  - 📁 Technical Documentation
    - Patent applications
    - Research papers
    - Technical specifications
    - Product roadmap
  - 📁 Customer Documentation
    - LOIs
    - Pilot agreements
    - Customer testimonials
    - Market validation studies

**Step 6.4: Request Information**
- **"Request Info"** button
- Modal for questions:
  - "What are your customer acquisition costs?"
  - "Can you provide references from pilot customers?"
  - "What is your IP defensibility strategy?"
- Submitted to innovator
- Tracked in activity feed

**Step 6.5: Schedule Meetings**
- **"Schedule Meeting"** button
- Integration with calendar
- Meeting types:
  - Management presentation
  - Technical deep dive
  - Customer references
  - Site visit
- Video conference link auto-generated

### Phase 7: Term Sheet & Negotiation

**Step 7.1: Move to Term Sheet Stage**
- Due diligence complete
- Updates status to **"Term Sheet"**
- Progress: 75%

**Step 7.2: Term Sheet Collaboration**
- Platform provides term sheet template
- Collaborative editing (both parties)
- Key terms:
  - Valuation: $10M pre-money
  - Investment amount: $750K
  - Equity %: 7.5%
  - Board seat: Yes
  - Liquidation preference: 1x
  - Anti-dilution: Broad-based weighted average
  - Vesting: 4 years, 1 year cliff
  - Options pool: 15%

**Step 7.3: Legal Review**
- Both parties involve lawyers
- Negotiate terms
- Track revisions
- Version control

**Step 7.4: Sign Term Sheet**
- Electronic signature via DocuSign integration
- Both parties sign
- Status moves to **"Closing"** (90%)

### Phase 8: Closing

**Step 8.1: Closing Checklist**
- Platform tracks closing tasks:
  - ☑️ Term sheet executed
  - ☑️ Stock purchase agreement drafted
  - ☑️ Investor rights agreement
  - ☑️ Right of first refusal agreement
  - ☑️ Voting agreement
  - ☐ Board consent
  - ☐ Shareholder approval (if needed)
  - ☐ Closing documents signed
  - ☐ Wire transfer initiated

**Step 8.2: Wire Transfer**
- Provides wire instructions
- Transfers $750,000 to company account
- Uploads proof of transfer

**Step 8.3: Platform Fee Payment**
- Innovator pays 5% success fee ($37,500) + Stripe fee
- Via Stripe Checkout
- Platform facilitates (not charged to investor)

**Step 8.4: Deal Closed**
- All documents signed
- Funds transferred
- Stock certificates issued
- Status: **"Closed"** (100%)
- Deal appears in "Portfolio"

### Phase 9: Portfolio Management

**Step 9.1: Portfolio Dashboard**
- **"My Investments"** → **"Portfolio"** tab
- Shows all closed deals:
  - Company name
  - Investment date
  - Amount invested
  - Equity %
  - Current valuation (if updated)
  - Performance metrics
  - Last update from company

**Step 9.2: Portfolio Company Updates**
- Quarterly update requests
- Metrics tracking:
  - Revenue
  - User growth
  - Milestones achieved
  - Burn rate
  - Runway
  - Key hires
- Document repository

**Step 9.3: Follow-on Investments**
- Company raises next round
- Investor gets notification
- Pro-rata rights exercised
- Simplified process (already verified)

---

## Key Differences Between Personas

### Innovator Focus:
1. **Create** opportunities (research analysis)
2. **Publish** to marketplace
3. **Receive** inbound interest
4. **Accept/Decline** commitments
5. **Manage** deals through closing
6. **Pay** success fees

### Investor Focus:
1. **Browse** marketplace opportunities
2. **Evaluate** using AI insights
3. **Commit** with non-binding interest
4. **Conduct** due diligence
5. **Negotiate** terms
6. **Close** deals
7. **Manage** portfolio

---

## Platform Revenue Model

### From Innovators:
- **Success Fee**: 5% of investment amount
- **Paid at closing** (when deal completes)
- **Example**: $750K investment → $37,500 fee
- **Platform Share**: 80% of success fee = $30,000
- **Payment**: Via Stripe Checkout

### From Investors:
- **No fees** charged to investors
- Free to browse and commit
- No subscription required
- Revenue comes from innovator side

---

## Technical Integration Points

### Email Notifications:
- **Innovators**:
  - New commitment received
  - Deal status updated by investor
  - Document uploaded
  - Message received
  - Payment reminder

- **Investors**:
  - Commitment accepted/declined
  - Data room updated
  - Deal status changed
  - Company update posted
  - Meeting scheduled

### Automation:
- Deal stage progression
- Milestone auto-completion
- Payment reminders
- Update requests
- Deadline notifications

### Security:
- Role-based access control (RBAC)
- Data room access logs
- NDA requirements
- Document encryption
- Secure wire instructions

---

## Success Metrics

### For Platform:
- Total deals facilitated
- Total capital raised
- Average time to close
- User satisfaction (NPS)
- Repeat usage rate

### For Innovators:
- CVS score improvement
- Number of commitments
- Conversion rate (commitment→close)
- Time to funding
- Deal size achieved

### For Investors:
- Deal flow quality
- Time saved in sourcing
- Portfolio performance
- Co-investment opportunities
- Early access to deals

---

## Support & Help

### For Both Personas:
- In-app chat support
- Email: support@r2mmarketplace.com
- Knowledge base: `/help`
- Video tutorials
- Weekly office hours
- Community forum

---

**Summary:**
- **Innovators** = Supply side (research opportunities)
- **Investors** = Demand side (capital)
- **Platform** = Matchmaking + facilitation
- **Revenue** = Success-based (5% of closed deals)
- **Value** = AI-powered analysis + efficient process

Both workflows are designed to be **transparent**, **efficient**, and **legally compliant**, with clear separation of personas to ensure proper legal agreements and tailored experiences.
