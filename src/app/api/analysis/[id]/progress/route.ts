/**
 * CVS Analysis Progress API
 *
 * Reads activity logs from Supabase and constructs current graph state
 * showing which agents have completed, which are running, and overall progress.
 *
 * Used by: CVSProgressGraph component for real-time visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'; // Disable caching for real-time updates

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'started' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  duration: number | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

interface GraphState {
  analysisId: string;
  agents: Agent[];
  overallProgress: number;
  currentAgent: string | null;
  currentStep: string | null;
  totalDuration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
}

// Define the workflow structure (matches your n8n agents)
const AGENT_DEFINITIONS: Omit<Agent, 'status' | 'progress' | 'duration' | 'startedAt' | 'completedAt' | 'error'>[] = [
  {
    id: 'validation',
    name: 'Query Validation',
    description: 'Validating research query and parameters'
  },
  {
    id: 'discovery',
    name: 'Discovery Agent',
    description: 'Finding relevant research papers from academic databases'
  },
  {
    id: 'technical',
    name: 'Technical Validation',
    description: 'Analyzing TRL, feasibility, and technical merit'
  },
  {
    id: 'market',
    name: 'Market Sizing',
    description: 'Calculating TAM/SAM/SOM and market opportunity'
  },
  {
    id: 'competitive',
    name: 'Competitive Analysis',
    description: 'Evaluating competitive landscape and barriers to entry'
  },
  {
    id: 'ip',
    name: 'IP Analysis',
    description: 'Searching patents and identifying IP opportunities'
  },
  {
    id: 'strategy',
    name: 'Business Strategy',
    description: 'Generating go-to-market strategy and recommendations'
  },
  {
    id: 'report',
    name: 'Final Report',
    description: 'Compiling CVS score and generating report'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const analysisId = params.id;

    // Fetch the analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('cvs_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Fetch all activity logs for this analysis
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('metadata->>analysis_id', analysisId)
      .eq('activity_type', 'cvs_analysis_step')
      .order('created_at', { ascending: true });

    if (activitiesError) {
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }

    // Build graph state from activities
    const graphState = buildGraphState(analysisId, activities || [], analysis);

    return NextResponse.json(graphState);

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build graph state from activity logs
 */
function buildGraphState(
  analysisId: string,
  activities: any[],
  analysis: any
): GraphState {
  // Initialize agents with default pending state
  const agents: Agent[] = AGENT_DEFINITIONS.map(def => ({
    ...def,
    status: 'pending' as const,
    progress: 0,
    duration: null,
    startedAt: null,
    completedAt: null,
    error: null
  }));

  // Track overall workflow timestamps
  let workflowStartedAt: string | null = null;
  let workflowCompletedAt: string | null = null;

  // Parse activities and update agent states
  activities.forEach((activity) => {
    const agentId = activity.metadata?.agent;
    const status = activity.metadata?.status; // 'started', 'in_progress', 'completed', 'failed'
    const progress = activity.metadata?.progress || 0;
    const currentStep = activity.metadata?.current_step;
    const error = activity.metadata?.error;

    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    // Update agent state
    if (status === 'started') {
      agent.status = 'started';
      agent.startedAt = activity.created_at;
      agent.progress = 0;

      // Track overall workflow start
      if (!workflowStartedAt) {
        workflowStartedAt = activity.created_at;
      }
    } else if (status === 'in_progress') {
      agent.status = 'in_progress';
      agent.progress = progress;
      if (!agent.startedAt) {
        agent.startedAt = activity.created_at;
      }
    } else if (status === 'completed') {
      agent.status = 'completed';
      agent.progress = 100;
      agent.completedAt = activity.created_at;

      // Calculate duration
      if (agent.startedAt) {
        const start = new Date(agent.startedAt);
        const end = new Date(activity.created_at);
        agent.duration = (end.getTime() - start.getTime()) / 1000; // seconds
      }

      // Check if this is the last agent
      const isLastAgent = agent.id === agents[agents.length - 1].id;
      if (isLastAgent) {
        workflowCompletedAt = activity.created_at;
      }
    } else if (status === 'failed') {
      agent.status = 'failed';
      agent.error = error || 'Unknown error';
      agent.completedAt = activity.created_at;

      if (agent.startedAt) {
        const start = new Date(agent.startedAt);
        const end = new Date(activity.created_at);
        agent.duration = (end.getTime() - start.getTime()) / 1000;
      }
    }
  });

  // Determine overall status
  const completedCount = agents.filter(a => a.status === 'completed').length;
  const failedCount = agents.filter(a => a.status === 'failed').length;
  const inProgressCount = agents.filter(a => a.status === 'in_progress' || a.status === 'started').length;
  const totalAgents = agents.length;

  let overallStatus: GraphState['status'];
  if (failedCount > 0) {
    overallStatus = 'failed';
  } else if (completedCount === totalAgents) {
    overallStatus = 'completed';
  } else if (inProgressCount > 0 || completedCount > 0) {
    overallStatus = 'in_progress';
  } else {
    overallStatus = 'pending';
  }

  // Calculate overall progress (0-100)
  const overallProgress = Math.round((completedCount / totalAgents) * 100);

  // Find current agent (first one that's in_progress or started)
  const currentAgent = agents.find(a => a.status === 'in_progress' || a.status === 'started');

  // Calculate total duration
  const totalDuration = agents.reduce((sum, a) => sum + (a.duration || 0), 0);

  // Get current step description
  const currentStep = currentAgent?.description || null;

  return {
    analysisId,
    agents,
    overallProgress,
    currentAgent: currentAgent?.id || null,
    currentStep,
    totalDuration,
    status: overallStatus,
    startedAt: workflowStartedAt,
    completedAt: workflowCompletedAt
  };
}
