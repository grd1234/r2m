# LangGraph Progress Visualization - Real-time CVS Analysis Tracking
**Date:** December 28, 2025
**Purpose:** Show users live progress of CVS analysis with dynamic LangGraph visualization
**Status:** Design Complete - Ready to Implement

---

## Overview

**The Idea:** Convert your n8n CVS workflow into a visual LangGraph that updates in real-time as each agent completes its analysis.

**User Experience:**
```
User submits query → See animated graph showing:
  ✅ Discovery Agent (completed)
  🔄 Technical Analysis (in progress - 45%)
  ⏳ Market Sizing (waiting)
  ⏳ Competitive Analysis (waiting)
  ⏳ IP Analysis (waiting)
  ⏳ Final Report (waiting)
```

**Benefits:**
- ✅ Transparency: Users see what's happening during 2-3 minute analysis
- ✅ Engagement: Visual progress prevents "is it frozen?" anxiety
- ✅ Debugging: Easy to spot where workflow gets stuck
- ✅ Professional: Shows sophistication of your multi-agent system
- ✅ Demo-ready: Impressive for Sprint 4 presentation

---

## Architecture

### **Two Approaches:**

#### **Approach 1: Generate from Activity Logs (Recommended for Sprint 4)** ⭐
- Your n8n workflows already log to `user_activities` table
- Backend reads logs and constructs graph state
- Frontend polls for updates every 2 seconds
- Simple, works with existing infrastructure

#### **Approach 2: True LangGraph Integration (Phase 3)**
- Migrate n8n workflows to LangGraph Python/TypeScript
- LangGraph has built-in visualization
- More powerful but requires rewriting workflows

**We'll focus on Approach 1 for Sprint 4 MVP.**

---

## Current n8n Workflow Structure

Your CVS analysis workflow has these agents:

```
┌─────────────────────────────────────────────────────────┐
│        Current n8n CVS Workflow (5-7 agents)            │
└─────────────────────────────────────────────────────────┘

1. User Query Input & Validation
        │
        ▼
2. Discovery Agent (finds papers)
        │
        ├──────► Technical Validation Agent
        │
        ├──────► Market Sizing Agent
        │
        ├──────► Competitive Analysis Agent
        │
        └──────► IP Analysis Agent
                    │
                    ▼
               Business Strategy Agent
                    │
                    ▼
               Final CVS Report (email)
```

Each agent logs to Supabase:
```sql
INSERT INTO user_activities (
  user_id,
  activity_type,
  description,
  metadata
) VALUES (
  'user-123',
  'cvs_analysis_step',
  'Technical Validation Agent completed',
  '{"agent": "technical_validation", "status": "completed", "score": 22}'
);
```

---

## Implementation Plan

### **Part 1: Backend - Graph State Generator**

Create an API endpoint that reads activity logs and returns current graph state:

**File:** `src/app/api/analysis/[id]/progress/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const analysisId = params.id;

  // 1. Fetch all activity logs for this analysis
  const { data: activities, error } = await supabase
    .from('user_activities')
    .select('*')
    .eq('metadata->>analysis_id', analysisId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Build graph state from activities
  const graphState = buildGraphState(activities);

  return NextResponse.json(graphState);
}

// Helper function to construct graph state
function buildGraphState(activities: any[]) {
  const agents = [
    { id: 'validation', name: 'Query Validation', status: 'pending', progress: 0, duration: null },
    { id: 'discovery', name: 'Discovery Agent', status: 'pending', progress: 0, duration: null },
    { id: 'technical', name: 'Technical Analysis', status: 'pending', progress: 0, duration: null },
    { id: 'market', name: 'Market Sizing', status: 'pending', progress: 0, duration: null },
    { id: 'competitive', name: 'Competitive Analysis', status: 'pending', progress: 0, duration: null },
    { id: 'ip', name: 'IP Analysis', status: 'pending', progress: 0, duration: null },
    { id: 'strategy', name: 'Business Strategy', status: 'pending', progress: 0, duration: null },
    { id: 'report', name: 'Final Report', status: 'pending', progress: 0, duration: null },
  ];

  // Parse activities and update agent states
  activities.forEach((activity) => {
    const agentId = activity.metadata?.agent;
    const status = activity.metadata?.status; // 'started', 'in_progress', 'completed', 'failed'
    const progress = activity.metadata?.progress || 0;

    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      agent.status = status;
      agent.progress = progress;

      // Calculate duration if completed
      if (status === 'completed' && activity.metadata?.started_at) {
        const start = new Date(activity.metadata.started_at);
        const end = new Date(activity.created_at);
        agent.duration = (end.getTime() - start.getTime()) / 1000; // seconds
      }
    }
  });

  // Determine overall progress
  const completedCount = agents.filter(a => a.status === 'completed').length;
  const totalAgents = agents.length;
  const overallProgress = Math.round((completedCount / totalAgents) * 100);

  // Current agent (first one that's 'in_progress' or 'started')
  const currentAgent = agents.find(a => a.status === 'in_progress' || a.status === 'started');

  return {
    agents,
    overallProgress,
    currentAgent: currentAgent?.id || null,
    totalDuration: agents.reduce((sum, a) => sum + (a.duration || 0), 0),
    status: completedCount === totalAgents ? 'completed' : 'in_progress',
  };
}
```

---

### **Part 2: Frontend - React Progress Visualization**

Create a React component that visualizes the graph and polls for updates:

**File:** `src/components/analysis/CVSProgressGraph.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Circle, XCircle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'pending' | 'started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  duration: number | null;
}

interface GraphState {
  agents: Agent[];
  overallProgress: number;
  currentAgent: string | null;
  totalDuration: number;
  status: 'in_progress' | 'completed' | 'failed';
}

export function CVSProgressGraph({ analysisId }: { analysisId: string }) {
  const [graphState, setGraphState] = useState<GraphState | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // Initial fetch
    fetchProgress();

    // Poll every 2 seconds while analysis is running
    const interval = setInterval(() => {
      if (isPolling) {
        fetchProgress();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [analysisId, isPolling]);

  async function fetchProgress() {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/progress`);
      const data = await response.json();

      setGraphState(data);

      // Stop polling when completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        setIsPolling(false);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  }

  if (!graphState) {
    return <div>Loading analysis progress...</div>;
  }

  return (
    <Card className="p-6">
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">CVS Analysis Progress</h3>
          <span className="text-sm text-gray-500">
            {graphState.overallProgress}% Complete
          </span>
        </div>
        <Progress value={graphState.overallProgress} className="h-2" />
        <p className="text-xs text-gray-500 mt-1">
          Elapsed time: {Math.round(graphState.totalDuration)}s
        </p>
      </div>

      {/* Agent Graph Visualization */}
      <div className="space-y-4">
        {graphState.agents.map((agent, index) => (
          <div key={agent.id}>
            {/* Agent Card */}
            <div
              className={`border rounded-lg p-4 transition-all ${
                agent.status === 'in_progress' || agent.status === 'started'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : agent.status === 'completed'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : agent.status === 'failed'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Agent Name & Status */}
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  {agent.status === 'completed' && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                  {(agent.status === 'in_progress' || agent.status === 'started') && (
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  )}
                  {agent.status === 'failed' && (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  {agent.status === 'pending' && (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}

                  {/* Agent Name */}
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    {agent.duration && (
                      <p className="text-xs text-gray-500">
                        Completed in {agent.duration.toFixed(1)}s
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={
                    agent.status === 'completed'
                      ? 'default'
                      : agent.status === 'in_progress' || agent.status === 'started'
                      ? 'secondary'
                      : agent.status === 'failed'
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {agent.status === 'in_progress' && `${agent.progress}%`}
                  {agent.status === 'started' && 'Starting...'}
                  {agent.status === 'completed' && 'Completed'}
                  {agent.status === 'failed' && 'Failed'}
                  {agent.status === 'pending' && 'Waiting'}
                </Badge>
              </div>

              {/* Progress Bar (for in_progress agents) */}
              {(agent.status === 'in_progress' || agent.status === 'started') && (
                <Progress value={agent.progress} className="h-1 mt-3" />
              )}
            </div>

            {/* Connector Line (vertical line to next agent) */}
            {index < graphState.agents.length - 1 && (
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {graphState.status === 'completed' && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✅ Analysis completed successfully in {Math.round(graphState.totalDuration)}s!
          </p>
        </div>
      )}

      {graphState.status === 'failed' && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg">
          <p className="text-red-800 dark:text-red-200 font-medium">
            ❌ Analysis failed. Please try again.
          </p>
        </div>
      )}
    </Card>
  );
}
```

---

### **Part 3: Update n8n Workflows to Log Progress**

Modify your n8n workflows to log detailed progress:

**In each n8n agent (e.g., Technical Validation Agent):**

#### **Node 1: Log Start**
```javascript
// HTTP Request node to Supabase
// POST https://YOUR_SUPABASE_URL/rest/v1/user_activities

{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Technical Validation Agent started",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "technical",
    "status": "started",
    "progress": 0,
    "started_at": "{{ $now }}"
  }
}
```

#### **Node 2: Log Progress Updates (optional)**
```javascript
// During long-running operations
{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Technical Validation Agent - analyzing papers",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "technical",
    "status": "in_progress",
    "progress": 50,
    "current_step": "Evaluating TRL level"
  }
}
```

#### **Node 3: Log Completion**
```javascript
{
  "user_id": "{{ $json.user_id }}",
  "activity_type": "cvs_analysis_step",
  "description": "Technical Validation Agent completed",
  "metadata": {
    "analysis_id": "{{ $json.analysis_id }}",
    "agent": "technical",
    "status": "completed",
    "progress": 100,
    "started_at": "{{ $json.started_at }}",
    "score": "{{ $json.technical_score }}"
  }
}
```

---

### **Part 4: Integrate into Analysis Results Page**

**File:** `src/app/analysis/results/[id]/page.tsx`

```typescript
import { CVSProgressGraph } from '@/components/analysis/CVSProgressGraph';
import { Suspense } from 'react';

export default function AnalysisResultsPage({
  params
}: {
  params: { id: string }
}) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">CVS Analysis Results</h1>

      {/* Real-time Progress Graph */}
      <div className="mb-8">
        <Suspense fallback={<div>Loading progress...</div>}>
          <CVSProgressGraph analysisId={params.id} />
        </Suspense>
      </div>

      {/* Results will appear here once analysis completes */}
      <div className="grid gap-6">
        {/* CVS Score Card */}
        {/* Technical Analysis Card */}
        {/* Market Analysis Card */}
        {/* etc. */}
      </div>
    </div>
  );
}
```

---

## Enhanced Visualization with LangGraph Diagram

### **Option: Generate Mermaid Diagram**

For a more sophisticated graph visualization, generate a Mermaid diagram:

```typescript
function generateMermaidDiagram(graphState: GraphState): string {
  const { agents } = graphState;

  let mermaid = 'graph TD\n';

  agents.forEach((agent, index) => {
    const nodeId = agent.id;
    const nextNodeId = agents[index + 1]?.id;

    // Style based on status
    let nodeClass = '';
    if (agent.status === 'completed') nodeClass = ':::completed';
    else if (agent.status === 'in_progress') nodeClass = ':::active';
    else if (agent.status === 'failed') nodeClass = ':::failed';

    // Add node
    mermaid += `  ${nodeId}["${agent.name}"]${nodeClass}\n`;

    // Add edge to next node
    if (nextNodeId) {
      mermaid += `  ${nodeId} --> ${nextNodeId}\n`;
    }
  });

  // Define styles
  mermaid += `
  classDef completed fill:#d4edda,stroke:#28a745,stroke-width:2px
  classDef active fill:#d1ecf1,stroke:#17a2b8,stroke-width:3px
  classDef failed fill:#f8d7da,stroke:#dc3545,stroke-width:2px
  `;

  return mermaid;
}
```

**Render using Mermaid.js:**

```tsx
import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

export function MermaidGraph({ graphState }: { graphState: GraphState }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const diagram = generateMermaidDiagram(graphState);
      mermaid.render('mermaid-graph', diagram).then(({ svg }) => {
        containerRef.current!.innerHTML = svg;
      });
    }
  }, [graphState]);

  return <div ref={containerRef} className="w-full" />;
}
```

---

## Alternative: LangGraph Native Visualization (Phase 3)

If you migrate from n8n to LangGraph in the future, you get built-in visualization:

```python
# Python example (LangGraph has better Python support currently)
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

# Define your CVS workflow
workflow = StateGraph(CVSState)
workflow.add_node("discovery", discovery_agent)
workflow.add_node("technical", technical_agent)
workflow.add_node("market", market_agent)
# ... add all nodes

graph = workflow.compile()

# Generate visualization
graph.get_graph().draw_png("cvs_workflow.png")
```

**Benefits:**
- ✅ Auto-generated diagrams
- ✅ Built-in progress tracking
- ✅ Streaming support (see updates as they happen)
- ❌ Requires migrating from n8n to LangGraph

---

## WebSocket Alternative (Real-time Updates)

For instant updates without polling, use WebSockets:

**Backend (Next.js API Route):**

```typescript
// src/app/api/analysis/[id]/stream/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const analysisId = params.id;

  // Create a ReadableStream for Server-Sent Events (SSE)
  const stream = new ReadableStream({
    async start(controller) {
      // Poll Supabase for updates
      const interval = setInterval(async () => {
        const graphState = await fetchGraphState(analysisId);

        // Send update to client
        const message = `data: ${JSON.stringify(graphState)}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));

        // Stop streaming when completed
        if (graphState.status === 'completed' || graphState.status === 'failed') {
          clearInterval(interval);
          controller.close();
        }
      }, 2000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Frontend (React Component):**

```typescript
useEffect(() => {
  const eventSource = new EventSource(`/api/analysis/${analysisId}/stream`);

  eventSource.onmessage = (event) => {
    const graphState = JSON.parse(event.data);
    setGraphState(graphState);
  };

  eventSource.onerror = () => {
    eventSource.close();
  };

  return () => eventSource.close();
}, [analysisId]);
```

---

## Implementation Checklist

### **Week 1: Backend (2-3 days)**
- [ ] Create `/api/analysis/[id]/progress` endpoint
- [ ] Implement `buildGraphState()` function
- [ ] Test with existing activity logs
- [ ] Add error handling for missing logs

### **Week 2: Frontend (2-3 days)**
- [ ] Create `CVSProgressGraph.tsx` component
- [ ] Add polling mechanism (2-second interval)
- [ ] Style agent cards with status colors
- [ ] Add progress bars and animations
- [ ] Test with mock data

### **Week 3: n8n Integration (2-3 days)**
- [ ] Update n8n workflows to log "started" events
- [ ] Add progress updates for long-running agents
- [ ] Log "completed" events with duration
- [ ] Test end-to-end with real CVS analysis

### **Week 4: Polish (1-2 days)**
- [ ] Add loading states and error handling
- [ ] Optimize polling (stop when completed)
- [ ] Add smooth animations (CSS transitions)
- [ ] Mobile responsive design
- [ ] Demo preparation

---

## Demo Script for Sprint 4

**Scenario:** Show live CVS analysis progress

**Script:**
1. **Start:** "Let me submit a research query: 'AI-powered defect detection in manufacturing'"
2. **Show Graph:** "Watch as our multi-agent system analyzes this in real-time..."
3. **Narrate Progress:**
   - ✅ "Discovery Agent found 10 relevant papers from Semantic Scholar and arXiv"
   - 🔄 "Technical Analysis Agent is now evaluating TRL level and feasibility... 50%"
   - ⏳ "Market Sizing Agent will estimate TAM/SAM/SOM next"
4. **Highlight Speed:** "Notice each agent completes in 20-30 seconds - total analysis under 3 minutes"
5. **Show Result:** "And here's our CVS score: 82/100 - Excellent commercial viability!"

**Impact:**
- Shows transparency (not a black box)
- Demonstrates technical sophistication (5-7 specialized agents)
- Builds trust (users see what's happening)

---

## Cost & Performance

**Polling Approach:**
- Frontend polls every 2 seconds
- 90 requests over 3-minute analysis (3 min × 60 sec / 2 sec = 90)
- Negligible Supabase cost (well within free tier)

**WebSocket/SSE Approach:**
- Single persistent connection
- Lower overhead, more responsive
- Requires more server resources

**Recommendation:** Start with polling (simpler), upgrade to WebSockets if >1,000 concurrent analyses.

---

## Future Enhancements (Phase 3+)

### **1. Agent Details Modal**
Click on any agent to see:
- Full prompt used
- Papers analyzed
- Intermediate results
- Time breakdown

### **2. Graph Customization**
- Zoom in/out
- Expand/collapse agent groups
- Export as PNG for sharing

### **3. Historical Comparison**
- "This analysis was 20% faster than average"
- Show agent performance trends

### **4. Failure Recovery**
- If agent fails, show "Retry" button
- Resume from last successful agent

---

## Next Steps

1. **Read this document** and decide if you want this feature for Sprint 4
2. **Start with backend** - Implement `/api/analysis/[id]/progress`
3. **Build frontend component** - Create `CVSProgressGraph.tsx`
4. **Update n8n workflows** - Add progress logging
5. **Test end-to-end** with real analysis
6. **Demo prep** - Practice narrating the progress

**Estimated effort:** 1-2 weeks (well worth it for demo impact!)

---

## Questions?

**"Will this slow down our CVS analysis?"**
- No. Progress logging adds <100ms per agent (negligible).

**"What if activity logs are missing?"**
- Graceful degradation: Show "Unknown status" for missing agents.

**"Can we use this for other workflows?"**
- Yes! Same pattern works for any multi-step async process.

**"Do we need LangGraph Python library for this?"**
- No. We're just visualizing your existing n8n workflow as a graph.

---

**Ready to implement? This will make your Sprint 4 demo much more impressive!**
