# LangGraph Integration Architecture for R2M Marketplace
**Date:** December 11, 2024
**Purpose:** Define where and how to use LangGraph in R2M platform

---

## Overview: Why LangGraph for R2M?

LangGraph is ideal for R2M because:
- ✅ **Multi-agent workflows** - CVS scoring needs 11 specialized agents
- ✅ **Complex decision trees** - Different analysis paths based on research type
- ✅ **State management** - Track analysis progress across multiple steps
- ✅ **Human-in-the-loop** - Allow manual review before publishing scores
- ✅ **Conditional routing** - Route to different agents based on findings

---

## LangGraph Use Cases in R2M

### **Primary Use Case: CVS Scoring Engine** 🎯
**Status:** Core feature - MUST implement

The Commercial Viability Score (CVS) analysis is perfect for LangGraph because it requires:
1. Sequential analysis across 6 dimensions
2. Parallel execution of independent checks
3. Decision points based on intermediate results
4. Aggregation of multi-agent outputs

### **Secondary Use Cases:**
1. **Research Discovery Pipeline** - Search → Filter → Rank → Recommend
2. **Deal Flow Automation** - Qualify → Match → Notify → Track
3. **Investor Matching** - Analyze preferences → Find opportunities → Score fit
4. **IP Landscape Analysis** - Patent search → Freedom to operate → Risk assessment

---

## Architecture: CVS Scoring with LangGraph

### **High-Level Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     CVS Scoring Workflow                         │
│                        (LangGraph)                               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Input: Research    │
                    │   Paper (PDF/Text)   │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  1. Extract Metadata │
                    │     (Agent 1)        │
                    └──────────────────────┘
                               │
                   ┌───────────┴───────────┐
                   ▼                       ▼
        ┌──────────────────┐    ┌──────────────────┐
        │ 2. Technical     │    │ 3. Market        │
        │    Analysis      │    │    Analysis      │
        │    (Agent 2-4)   │    │    (Agent 5-7)   │
        └──────────────────┘    └──────────────────┘
                   │                       │
                   └───────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ 4. IP & Risk         │
                    │    Assessment        │
                    │    (Agent 8-10)      │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ 5. Score Aggregation │
                    │    & Explainability  │
                    │    (Agent 11)        │
                    └──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Output: CVS Score   │
                    │  0-100 + Breakdown   │
                    └──────────────────────┘
```

---

## Detailed LangGraph Implementation

### **File Structure:**

```
src/
├── lib/
│   ├── langgraph/
│   │   ├── cvs-scoring/
│   │   │   ├── graph.ts              # Main CVS workflow graph
│   │   │   ├── agents/
│   │   │   │   ├── metadata-extractor.ts    # Agent 1
│   │   │   │   ├── technical-analyzer.ts    # Agent 2-4
│   │   │   │   ├── market-analyzer.ts       # Agent 5-7
│   │   │   │   ├── ip-analyzer.ts           # Agent 8-9
│   │   │   │   ├── risk-analyzer.ts         # Agent 10
│   │   │   │   └── score-aggregator.ts      # Agent 11
│   │   │   ├── nodes/
│   │   │   │   ├── extract-metadata.ts
│   │   │   │   ├── analyze-technical.ts
│   │   │   │   ├── analyze-market.ts
│   │   │   │   ├── analyze-ip.ts
│   │   │   │   ├── assess-risk.ts
│   │   │   │   └── calculate-score.ts
│   │   │   ├── state.ts              # Workflow state definition
│   │   │   └── prompts.ts            # Agent prompts
│   │   │
│   │   ├── research-discovery/
│   │   │   └── graph.ts              # Research search workflow
│   │   │
│   │   └── deal-flow/
│   │       └── graph.ts              # Deal matching workflow
│   │
│   └── langchain/
│       ├── llm.ts                    # LLM configuration (Claude/GPT-4)
│       └── embeddings.ts             # Vector embeddings
│
└── app/
    └── api/
        └── cvs/
            └── analyze/
                └── route.ts          # API endpoint that invokes graph
```

---

## Implementation Details

### **1. State Definition** (`src/lib/langgraph/cvs-scoring/state.ts`)

```typescript
import { Annotation } from "@langchain/langgraph";

// Define the state that flows through the graph
export const CVSScoringState = Annotation.Root({
  // Input
  paperId: Annotation<string>(),
  paperTitle: Annotation<string>(),
  paperAbstract: Annotation<string>(),
  paperFullText: Annotation<string | null>(),

  // Metadata extraction
  authors: Annotation<string[]>({ default: () => [] }),
  publicationDate: Annotation<string | null>(),
  keywords: Annotation<string[]>({ default: () => [] }),
  researchField: Annotation<string | null>(),

  // Technical Analysis (Agents 2-4)
  trlLevel: Annotation<number | null>(), // 1-9
  technicalFeasibility: Annotation<string>(),
  innovationImpact: Annotation<string>(),
  technicalMerit: Annotation<number | null>(), // 0-25

  // Market Analysis (Agents 5-7)
  targetMarket: Annotation<string>(),
  tamEstimate: Annotation<number | null>(), // USD
  revenueModel: Annotation<string>(),
  timeToMarket: Annotation<string>(),
  marketOpportunity: Annotation<number | null>(), // 0-20
  commercialPotential: Annotation<number | null>(), // 0-25

  // Competitive Analysis
  competitiveAdvantages: Annotation<string[]>({ default: () => [] }),
  alternatives: Annotation<string[]>({ default: () => [] }),
  competitivePosition: Annotation<number | null>(), // 0-15

  // IP & Risk (Agents 8-10)
  patentStatus: Annotation<string>(),
  priorArt: Annotation<string[]>({ default: () => [] }),
  ipStrength: Annotation<number | null>(), // 0-10
  technicalRisks: Annotation<string[]>({ default: () => [] }),
  marketRisks: Annotation<string[]>({ default: () => [] }),
  riskScore: Annotation<number | null>(), // 0-5

  // Final Output (Agent 11)
  overallScore: Annotation<number | null>(), // 0-100
  recommendations: Annotation<string>(),
  keyStrengths: Annotation<string[]>({ default: () => [] }),
  keyWeaknesses: Annotation<string[]>({ default: () => [] }),

  // Workflow control
  errors: Annotation<string[]>({ default: () => [] }),
  currentStep: Annotation<string>(),
});

export type CVSScoringStateType = typeof CVSScoringState.State;
```

---

### **2. Main Graph** (`src/lib/langgraph/cvs-scoring/graph.ts`)

```typescript
import { StateGraph, END } from "@langchain/langgraph";
import { CVSScoringState, CVSScoringStateType } from "./state";

// Import nodes
import { extractMetadata } from "./nodes/extract-metadata";
import { analyzeTechnical } from "./nodes/analyze-technical";
import { analyzeMarket } from "./nodes/analyze-market";
import { analyzeIP } from "./nodes/analyze-ip";
import { assessRisk } from "./nodes/assess-risk";
import { calculateScore } from "./nodes/calculate-score";

// Create the graph
export function createCVSScoringGraph() {
  const workflow = new StateGraph(CVSScoringState)

    // Add nodes
    .addNode("extract_metadata", extractMetadata)
    .addNode("analyze_technical", analyzeTechnical)
    .addNode("analyze_market", analyzeMarket)
    .addNode("analyze_ip", analyzeIP)
    .addNode("assess_risk", assessRisk)
    .addNode("calculate_score", calculateScore)

    // Define edges
    .addEdge("__start__", "extract_metadata")
    .addEdge("extract_metadata", "analyze_technical")
    .addEdge("extract_metadata", "analyze_market") // Parallel execution
    .addEdge("analyze_technical", "analyze_ip")
    .addEdge("analyze_market", "analyze_ip")
    .addEdge("analyze_ip", "assess_risk")
    .addEdge("assess_risk", "calculate_score")
    .addEdge("calculate_score", END);

  return workflow.compile();
}

// Usage example
export async function runCVSAnalysis(
  paperId: string,
  paperTitle: string,
  paperAbstract: string,
  paperFullText: string | null
) {
  const graph = createCVSScoringGraph();

  const result = await graph.invoke({
    paperId,
    paperTitle,
    paperAbstract,
    paperFullText,
    currentStep: "starting",
  });

  return result;
}
```

---

### **3. Example Node Implementation** (`src/lib/langgraph/cvs-scoring/nodes/analyze-technical.ts`)

```typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { CVSScoringStateType } from "../state";
import { TECHNICAL_ANALYSIS_PROMPT } from "../prompts";

export async function analyzeTechnical(
  state: CVSScoringStateType
): Promise<Partial<CVSScoringStateType>> {

  const llm = new ChatAnthropic({
    modelName: "claude-3-5-sonnet-20241022",
    temperature: 0.3,
  });

  try {
    // Construct prompt with paper data
    const prompt = TECHNICAL_ANALYSIS_PROMPT
      .replace("{title}", state.paperTitle)
      .replace("{abstract}", state.paperAbstract)
      .replace("{keywords}", state.keywords.join(", "));

    // Invoke LLM
    const response = await llm.invoke(prompt);
    const analysis = JSON.parse(response.content as string);

    // Update state
    return {
      trlLevel: analysis.trl_level,
      technicalFeasibility: analysis.feasibility,
      innovationImpact: analysis.innovation_impact,
      technicalMerit: analysis.score, // 0-25
      currentStep: "technical_analysis_complete",
    };

  } catch (error) {
    console.error("Technical analysis failed:", error);
    return {
      errors: [...state.errors, `Technical analysis error: ${error.message}`],
      currentStep: "technical_analysis_failed",
    };
  }
}
```

---

### **4. API Route Integration** (`src/app/api/cvs/analyze/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runCVSAnalysis } from "@/lib/langgraph/cvs-scoring/graph";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { paperId } = await request.json();

    // Fetch paper from database
    const { data: paper, error: paperError } = await supabase
      .from("research_papers")
      .select("*")
      .eq("id", paperId)
      .single();

    if (paperError || !paper) {
      return NextResponse.json({ error: "Paper not found" }, { status: 404 });
    }

    // Check subscription limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("cvs_reports_used, cvs_reports_limit")
      .eq("id", user.id)
      .single();

    if (profile.cvs_reports_used >= profile.cvs_reports_limit) {
      return NextResponse.json(
        { error: "CVS report limit reached. Please upgrade." },
        { status: 403 }
      );
    }

    // Run LangGraph CVS analysis
    const result = await runCVSAnalysis(
      paper.id,
      paper.title,
      paper.abstract,
      null // Full text extraction to be added
    );

    // Save CVS score to database
    const { data: cvsScore, error: saveError } = await supabase
      .from("cvs_scores")
      .insert({
        paper_id: paper.id,
        analyzed_by: user.id,
        overall_score: result.overallScore,
        technical_merit: result.technicalMerit,
        commercial_potential: result.commercialPotential,
        market_opportunity: result.marketOpportunity,
        competitive_position: result.competitivePosition,
        ip_landscape: result.ipStrength,
        risk_assessment: result.riskScore,
        trl_level: result.trlLevel,
        tam_estimate: result.tamEstimate,
        recommendations: result.recommendations,
        key_strengths: result.keyStrengths,
        key_risks: [...result.technicalRisks, ...result.marketRisks],
        is_ai_generated: true,
        analysis_notes: {
          technical_feasibility: result.technicalFeasibility,
          revenue_model: result.revenueModel,
          competitive_advantages: result.competitiveAdvantages,
        },
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    // Increment usage counter
    await supabase
      .from("profiles")
      .update({ cvs_reports_used: profile.cvs_reports_used + 1 })
      .eq("id", user.id);

    // Return result
    return NextResponse.json({
      success: true,
      cvsScoreId: cvsScore.id,
      overallScore: result.overallScore,
      breakdown: {
        technicalMerit: result.technicalMerit,
        commercialPotential: result.commercialPotential,
        marketOpportunity: result.marketOpportunity,
        competitivePosition: result.competitivePosition,
        ipLandscape: result.ipStrength,
        riskAssessment: result.riskScore,
      },
    });

  } catch (error) {
    console.error("CVS analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze research paper" },
      { status: 500 }
    );
  }
}
```

---

## Additional LangGraph Use Cases

### **Use Case 2: Research Discovery Pipeline**

```typescript
// src/lib/langgraph/research-discovery/graph.ts

const workflow = new StateGraph(ResearchDiscoveryState)
  .addNode("parse_query", parseSearchQuery)
  .addNode("search_arxiv", searchArxiv)
  .addNode("search_semantic_scholar", searchSemanticScholar)
  .addNode("merge_results", mergeSearchResults)
  .addNode("rank_by_relevance", rankByRelevance)
  .addNode("filter_by_quality", filterByQuality)
  .addNode("generate_summaries", generateSummaries)
  .addEdge("__start__", "parse_query")
  .addEdge("parse_query", "search_arxiv")
  .addEdge("parse_query", "search_semantic_scholar")
  .addEdge("search_arxiv", "merge_results")
  .addEdge("search_semantic_scholar", "merge_results")
  .addEdge("merge_results", "rank_by_relevance")
  .addEdge("rank_by_relevance", "filter_by_quality")
  .addEdge("filter_by_quality", "generate_summaries")
  .addEdge("generate_summaries", END);
```

**Benefits:**
- Parallel search across multiple sources
- Intelligent ranking and deduplication
- AI-generated summaries for each result

---

### **Use Case 3: Investor Matching Agent**

```typescript
// src/lib/langgraph/investor-matching/graph.ts

const workflow = new StateGraph(InvestorMatchingState)
  .addNode("analyze_investor_preferences", analyzePreferences)
  .addNode("fetch_opportunities", fetchOpportunities)
  .addNode("score_fit", scoreFit)
  .addNode("rank_matches", rankMatches)
  .addNode("generate_explanation", explainMatch)
  .addConditionalEdges("score_fit", shouldNotify, {
    yes: "generate_explanation",
    no: END,
  });
```

**Benefits:**
- Personalized opportunity recommendations
- Explainable matching scores
- Automated notifications for high-fit deals

---

## Implementation Timeline

### **Phase 1: MVP CVS Scoring (Week 3)**
- [ ] Set up LangGraph + LangChain
- [ ] Implement basic 6-agent workflow
- [ ] Create technical + market analysis nodes
- [ ] Test with sample papers

### **Phase 2: Enhanced Analysis (Week 4)**
- [ ] Add IP landscape analysis
- [ ] Implement risk assessment
- [ ] Add human-in-the-loop review step
- [ ] Fine-tune prompts

### **Phase 3: Research Discovery (Week 5)**
- [ ] Build search pipeline graph
- [ ] Integrate multiple data sources
- [ ] Add semantic ranking

### **Phase 4: Advanced Features (Week 6+)**
- [ ] Investor matching agent
- [ ] Deal flow automation
- [ ] Multi-language support

---

## Cost Estimation

### **AI API Costs (Claude 3.5 Sonnet):**

**Per CVS Analysis:**
- Input tokens: ~5,000 (paper abstract + prompts across 11 agents)
- Output tokens: ~3,000 (detailed analysis)
- Cost per analysis: ~$0.04

**Monthly estimates:**
- Free tier (3 CVS/month): $0.12/user
- Basic tier (20 CVS/month): $0.80/user
- Premium tier (50 CVS/month): $2.00/user
- Pro tier (unlimited): ~$10-20/user (estimated 250 reports)

**Total monthly AI costs (1,000 users):**
- ~$2,000-$5,000 depending on usage

---

## Dependencies

```bash
# Install required packages
npm install @langchain/langgraph @langchain/anthropic @langchain/core @langchain/community
```

```json
// package.json additions
{
  "dependencies": {
    "@langchain/anthropic": "^0.3.0",
    "@langchain/core": "^0.3.0",
    "@langchain/langgraph": "^0.2.0",
    "@langchain/community": "^0.3.0"
  }
}
```

---

## Next Steps

1. **Set up database schema** (today - already created SQL scripts)
2. **Install LangGraph dependencies** (5 minutes)
3. **Implement basic CVS graph** (2-3 days)
4. **Test with sample papers** (1 day)
5. **Deploy to production** (1 day)

---

## Questions to Answer

1. **Which LLM to use?**
   - Claude 3.5 Sonnet (recommended for analysis quality)
   - GPT-4 Turbo (alternative, similar performance)
   - Mixtral (open source, cost-effective for high volume)

2. **Human-in-the-loop?**
   - Yes for high-stakes analysis (>$1M TAM)
   - Auto-approve for lower-value research

3. **Caching strategy?**
   - Cache CVS scores for 30 days
   - Invalidate on paper updates

**Ready to implement?** Let me know and I'll create the initial LangGraph setup files!
