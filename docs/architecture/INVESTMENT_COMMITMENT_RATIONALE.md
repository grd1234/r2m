# Investment Commitment System - Design Rationale

**Date**: December 9, 2025
**Decision**: Implement Non-Binding Commitment System (Phase 1)

---

## The Problem

**User Question**: "once the investor agrees to invest, how does the checkout process work??"

The marketplace needed a way to handle investment transactions between investors and startups, but there were three competing approaches, each with different legal, regulatory, and technical implications.

---

## Three Options Considered

### Option 1: Facilitator Model (Non-Binding Commitments)
**How it works**: Platform facilitates introductions and tracks commitments, but deals close offline

**Examples**: AngelList (early model), Crunchbase Pro

**Pros**:
- ✅ No SEC registration required (not a broker-dealer)
- ✅ No Reg CF/Reg A+ compliance needed
- ✅ Minimal legal overhead
- ✅ Fast to implement
- ✅ Lower liability exposure
- ✅ Can launch immediately

**Cons**:
- ❌ No direct revenue from transactions
- ❌ Harder to track deal completion
- ❌ Investors can back out easily

**Revenue Model**:
- Success fee (5%) charged when deal closes
- Platform revenue: 80% of success fee
- Payment via Stripe after closing

---

### Option 2: Direct Investment Platform (Regulated)
**How it works**: Platform processes actual investments, holds funds in escrow, handles securities

**Examples**: WeFunder, Republic, StartEngine

**Pros**:
- ✅ Complete control over transactions
- ✅ Higher trust from investors
- ✅ Can take transaction fees
- ✅ Full deal tracking

**Cons**:
- ❌ **SEC registration required** (Broker-Dealer license or Funding Portal)
- ❌ **Reg CF/Reg A+ compliance** (annual caps, disclosure requirements)
- ❌ **Legal costs**: $50K-$500K to set up
- ❌ **Escrow account** required
- ❌ **Background checks** for all team members
- ❌ **FINRA membership** required
- ❌ 6-12 months to launch

**Legal Requirements**:
- SEC Form Funding Portal registration
- FINRA membership ($5K-$10K/year)
- State-by-state "Blue Sky" filings
- Annual audits and reporting
- Investor accreditation verification
- Anti-money laundering (AML) compliance

---

### Option 3: Hybrid Model (Commitment + Facilitation)
**How it works**: Platform tracks commitments and provides closing tools, but doesn't hold funds

**Examples**: Carta (now), SeedInvest (early stage)

**Pros**:
- ✅ Better tracking than pure facilitation
- ✅ Can charge platform fees
- ✅ Professional closing experience
- ✅ Lower regulatory burden than full platform

**Cons**:
- ❌ Still requires some compliance (depends on features)
- ❌ More complex than simple facilitation
- ❌ Investors still close offline

---

## Why We Chose Option 1: Non-Binding Commitment System

### Strategic Reasoning

1. **Speed to Market**
   - Can launch immediately
   - No regulatory approval needed
   - Iterate and test with real users

2. **Legal Simplicity**
   - No SEC registration
   - No broker-dealer license
   - No securities law compliance (not handling securities)
   - Lower liability exposure

3. **Cost Efficiency**
   - No $50K-$500K legal setup costs
   - No annual compliance costs
   - Can bootstrap to profitability

4. **Validation First**
   - Test if startups and investors actually use the platform
   - Prove the marketplace model works
   - Then upgrade to regulated platform if needed

5. **Revenue Model**
   - Success fees still generate revenue
   - 5% of closed deals is competitive
   - Can scale to Reg CF later if needed

### Regulatory Considerations

**What makes this legal:**
- Platform is a "lead generator" or "advertising platform"
- Not taking custody of funds
- Not facilitating securities transactions directly
- Not providing investment advice
- Commitments are explicitly non-binding

**SEC Guidance**:
- SEC considers you a broker-dealer if you:
  - Handle customer funds or securities
  - Participate in negotiations
  - Receive transaction-based compensation for securities transactions

- **Our platform does NOT**:
  - Hold funds or securities
  - Negotiate deals (parties negotiate offline)
  - Earn fees on securities transactions (we charge for closed deals, not securities)

**Disclosure Requirements**:
- Must clearly state commitments are non-binding
- Must not represent platform as investment platform
- Must include disclaimers about risk

---

## How the Commitment System Works

### Phase 1: Commitment (Non-Binding)

**Investor Actions**:
1. Browse marketplace opportunities
2. Click "Commit to Invest" on opportunity page
3. Fill out commitment form:
   - Investment amount ($50K - $10M slider)
   - Investment type (SAFE, Convertible Note, Equity, Revenue Share, Flexible)
   - Expected timeline (30/60/90 days, Flexible)
   - Optional message (investment thesis, DD requirements)
4. See non-binding disclaimer
5. Submit commitment

**What happens**:
- Commitment record created in `investment_commitments` table
- Startup receives notification
- Commitment appears on startup dashboard
- Status: "Pending"

### Phase 2: Acceptance & Due Diligence

**Startup Actions**:
1. View commitment on dashboard
2. Review investor details and message
3. Click "Accept & Start Due Diligence" or "Decline"

**If accepted**:
- Deal record created in `deals` table
- Status: "Due Diligence"
- Progress: 25%
- Both parties contacted to begin DD offline

**Due Diligence Process (Offline)**:
- NDA signing
- Financial statement review
- IP portfolio review
- Team meetings
- Reference checks

### Phase 3: Term Sheet

**When DD is complete**:
- Startup updates deal status to "Term Sheet"
- Progress: 50%
- Parties negotiate terms offline:
  - Valuation cap (for SAFE/Convertible)
  - Discount rate
  - Interest rate (for notes)
  - Board seats
  - Information rights

### Phase 4: Closing

**When term sheet is signed**:
- Status updated to "Closing"
- Progress: 75%
- Parties complete closing documents:
  - Investment agreement
  - Subscription agreement
  - Shareholders' agreement
  - Board resolutions
- Wire transfer executed (offline, directly between parties)

### Phase 5: Success Fee Invoice

**When deal is closed**:
- Startup clicks "Mark as Closed" in deal pipeline
- Platform generates success fee invoice:
  - 5% of investment amount
  - Stripe processing fee (2.9% + $0.30)
  - Invoice number and due date (30 days)
- Startup pays via Stripe
- Platform receives 80% of success fee

**Example:**
- Investment: $500,000
- Success Fee (5%): $25,000
- Stripe Fee: $726.30
- **Total Due: $25,726.30**
- Platform Revenue (80%): $20,000
- Startup Cost: 5.15% of investment

---

## Revenue Projections

### Assumptions
- Average deal size: $500K
- Success fee: 5%
- Platform share: 80%
- Deal close rate: 30% of commitments

### Example Scenario (Year 1)
- 100 commitments made
- 30 deals close
- Average investment: $500K
- Total invested: $15M

**Revenue Calculation:**
- Total success fees: $15M × 5% = $750,000
- Platform revenue (80%): **$600,000**
- Stripe fees (paid by startups): ~$22K
- Net revenue: ~$600K

### Scaling Potential

**Year 2 (10x commitments)**:
- 1,000 commitments
- 300 deals close
- Total invested: $150M
- **Platform revenue: $6M**

---

## Future Evolution Path

### Phase 1: Commitment System (Current)
- Non-binding commitments
- Deal tracking
- Success fees
- **Regulatory**: None required

### Phase 2: Enhanced Tools (6-12 months)
- Document templates (NDA, term sheets)
- E-signature integration (DocuSign)
- Due diligence checklist
- Cap table integration
- **Regulatory**: Still just facilitation

### Phase 3: Reg CF Crowdfunding (18-24 months)
- If demand justifies it
- SEC Funding Portal registration
- Reg CF compliance ($1.07M annual cap per company)
- Direct investment processing
- **Regulatory**: SEC Form Funding Portal, FINRA membership

### Phase 4: Full Broker-Dealer (3+ years)
- Only if market proves need for larger deals
- SEC Broker-Dealer registration
- No investment caps
- Secondary market potential
- **Regulatory**: Full SEC compliance

---

## Competitive Analysis

### AngelList
- **Model**: Facilitator → Rolling Funds → Reg D funds
- Started with commitments, evolved to managed funds
- Took years to build regulatory framework

### Republic
- **Model**: Reg CF from day 1
- Heavy compliance costs
- Can process small investments ($10 minimum)
- Annual raise caps limit enterprise customers

### Carta
- **Model**: Cap table + late-stage platform
- Hybrid approach: software + facilitation
- Not handling early-stage investments directly

### **R2M Strategy**
- Start with facilitation (lowest friction)
- Focus on deep tech and research commercialization (niche)
- Build trust and deal flow
- Upgrade to Reg CF only if needed

---

## Risks and Mitigations

### Risk 1: Investors back out of commitments
**Mitigation**:
- Clear communication about non-binding nature
- Pre-qualify serious investors
- Reputation system (future)
- Multiple commitments per opportunity

### Risk 2: Platform liability for deals gone wrong
**Mitigation**:
- Strong Terms of Service
- Clear disclaimers
- No investment advice
- No negotiation participation
- Professional liability insurance

### Risk 3: SEC interprets as broker-dealer activity
**Mitigation**:
- Legal review of all features
- No handling of funds
- No negotiation of terms
- Success fee structured as "marketing fee"
- Consultation with securities attorney

### Risk 4: Low deal close rates
**Mitigation**:
- Focus on qualified investors
- Pre-DD for opportunities (CVS scores)
- Startup vetting process
- Investor education

---

## Legal Disclaimers (Required)

### On Platform
**Required text on all investment pages**:

> "R2M Marketplace is not a broker-dealer or funding portal. We provide a platform for startups and investors to connect. Investment commitments made through this platform are non-binding indications of interest only. R2M does not provide investment advice, does not participate in negotiations, and does not handle investor funds or securities. All investment decisions are made between parties independently. Investing in startups is risky and you could lose your entire investment."

### In Commitment Form
> "This is a non-binding commitment and does not constitute a legal agreement to invest. By submitting this form, you are expressing interest in learning more about this opportunity. Final investment terms will be negotiated directly with the startup. Either party may withdraw at any time before closing."

### In Terms of Service
- Platform is facilitator only
- No investment advice provided
- No guarantees of investment outcomes
- Investor and startup responsible for compliance
- Platform not liable for deal failures

---

## Technical Implementation

### Database Schema (New Tables)

**investment_commitments**:
```sql
CREATE TABLE investment_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES listings(id),
  investor_id UUID REFERENCES profiles(id),
  amount NUMERIC NOT NULL,
  investment_type TEXT, -- SAFE, Convertible, Equity, Revenue, Flexible
  timeline TEXT, -- 30, 60, 90, Flexible
  message TEXT,
  status TEXT, -- pending, accepted, declined, withdrawn
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**deals**:
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commitment_id UUID REFERENCES investment_commitments(id),
  status TEXT, -- committed, due_diligence, term_sheet, closing, closed
  progress INTEGER DEFAULT 0, -- 0-100
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  success_fee_paid BOOLEAN DEFAULT FALSE,
  success_fee_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Stripe Integration
- Use Stripe Checkout for success fee payment
- Webhook for payment confirmation
- Invoice generation via Stripe API
- Receipt emailing

---

## Success Metrics

### Phase 1 Goals (First 6 months)
- 50+ commitments made
- 10+ deals closed
- $5M+ total invested
- $200K+ in success fees collected

### Key Metrics to Track
- Commitment → Deal acceptance rate
- Deal acceptance → Close rate
- Time to close (average days)
- Average investment size
- Investor repeat rate
- Startup satisfaction score

---

## Conclusion

The non-binding commitment system is the optimal Phase 1 approach because it:
- ✅ Allows immediate launch
- ✅ Minimizes regulatory complexity
- ✅ Reduces legal costs
- ✅ Validates market demand
- ✅ Generates revenue through success fees
- ✅ Provides clear path to Reg CF if needed

We can always evolve to a more regulated model once we prove the marketplace works and justify the compliance investment.

---

## References

- SEC Broker-Dealer Registration Guide: https://www.sec.gov/divisions/marketreg/bdguide.htm
- FINRA Funding Portal Rules: https://www.finra.org/rules-guidance/key-topics/funding-portals
- Reg CF Overview: https://www.sec.gov/education/smallbusiness/exemptofferings/regcrowdfunding
- AngelList Evolution Case Study: https://angel.co/blog
- WeFunder Compliance Documentation: https://wefunder.com/faq/regulatory

---

**Document Owner**: R2M Development Team
**Last Updated**: December 9, 2025
**Next Review**: March 2026 (after 3 months of operation)
