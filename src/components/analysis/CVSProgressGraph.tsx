/**
 * CVS Progress Graph Component
 *
 * Displays real-time progress of CVS analysis showing all agents,
 * their status, and overall completion percentage.
 *
 * Polls the /api/analysis/[id]/progress endpoint every 2 seconds
 * until analysis is completed or failed.
 *
 * Usage:
 *   <CVSProgressGraph analysisId="abc-123" />
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Loader2,
  Circle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

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

interface CVSProgressGraphProps {
  analysisId: string;
  onComplete?: (graphState: GraphState) => void;
  onError?: (error: string) => void;
  compact?: boolean; // Optional compact view for dashboard
}

export function CVSProgressGraph({
  analysisId,
  onComplete,
  onError,
  compact = false
}: CVSProgressGraphProps) {
  const [graphState, setGraphState] = useState<GraphState | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch progress from API
  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/analysis/${analysisId}/progress`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GraphState = await response.json();
      setGraphState(data);
      setFetchError(null);

      // Stop polling when completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        setIsPolling(false);

        // Call completion callback
        if (data.status === 'completed' && onComplete) {
          onComplete(data);
        } else if (data.status === 'failed' && onError) {
          const failedAgent = data.agents.find(a => a.status === 'failed');
          onError(failedAgent?.error || 'Analysis failed');
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setFetchError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  }, [analysisId, onComplete, onError]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchProgress();

    const interval = setInterval(() => {
      if (isPolling) {
        fetchProgress();
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [fetchProgress, isPolling]);

  // Track elapsed time
  useEffect(() => {
    if (graphState?.status === 'in_progress') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [graphState?.status]);

  // Format duration in seconds to readable format
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  // Loading state
  if (!graphState && !fetchError) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analysis progress...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <Card className="p-6 border-red-500 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">
              Failed to load progress
            </p>
            <p className="text-sm text-red-600 dark:text-red-300">
              {fetchError}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!graphState) return null;

  // Compact view for dashboard
  if (compact) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Analysis Progress</span>
            <Badge variant={
              graphState.status === 'completed' ? 'default' :
              graphState.status === 'in_progress' ? 'secondary' :
              graphState.status === 'failed' ? 'destructive' : 'outline'
            }>
              {graphState.overallProgress}%
            </Badge>
          </div>
          <Progress value={graphState.overallProgress} className="h-2" />
          {graphState.currentStep && (
            <p className="text-xs text-gray-500">{graphState.currentStep}</p>
          )}
        </div>
      </Card>
    );
  }

  // Full detailed view
  return (
    <Card className="p-6">
      {/* Header - Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              CVS Analysis Progress
              {graphState.status === 'in_progress' && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              )}
            </h3>
            {graphState.currentStep && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {graphState.currentStep}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {graphState.overallProgress}%
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(graphState.totalDuration || elapsedTime)}
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <Progress value={graphState.overallProgress} className="h-3" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {graphState.agents.filter(a => a.status === 'completed').length} of{' '}
            {graphState.agents.length} agents completed
          </span>
          {graphState.status === 'in_progress' && (
            <span>Estimated time remaining: ~{Math.max(0, 180 - elapsedTime)}s</span>
          )}
        </div>
      </div>

      {/* Agent Progress List */}
      <div className="space-y-3">
        {graphState.agents.map((agent, index) => {
          const isActive = agent.status === 'in_progress' || agent.status === 'started';
          const isCompleted = agent.status === 'completed';
          const isFailed = agent.status === 'failed';
          const isPending = agent.status === 'pending';

          return (
            <div key={agent.id}>
              {/* Agent Card */}
              <div
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isFailed
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Left: Icon + Info */}
                  <div className="flex items-start gap-3 flex-1">
                    {/* Status Icon */}
                    <div className="mt-0.5">
                      {isCompleted && (
                        <CheckCircle2 className="h-6 w-6 text-green-600 animate-in fade-in duration-500" />
                      )}
                      {isActive && (
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                      )}
                      {isFailed && (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      {isPending && (
                        <Circle className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* Agent Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{agent.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {agent.description}
                      </p>

                      {/* Duration (if completed) */}
                      {agent.duration !== null && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Completed in {formatDuration(agent.duration)}
                        </p>
                      )}

                      {/* Error message (if failed) */}
                      {agent.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {agent.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Badge */}
                  <Badge
                    variant={
                      isCompleted
                        ? 'default'
                        : isActive
                        ? 'secondary'
                        : isFailed
                        ? 'destructive'
                        : 'outline'
                    }
                    className="ml-2"
                  >
                    {agent.status === 'in_progress' && `${agent.progress}%`}
                    {agent.status === 'started' && 'Starting...'}
                    {agent.status === 'completed' && 'Done'}
                    {agent.status === 'failed' && 'Failed'}
                    {agent.status === 'pending' && 'Waiting'}
                  </Badge>
                </div>

                {/* Progress Bar (for active agents) */}
                {isActive && agent.progress > 0 && (
                  <div className="mt-3">
                    <Progress value={agent.progress} className="h-1.5" />
                  </div>
                )}
              </div>

              {/* Connector Line (vertical line to next agent) */}
              {index < graphState.agents.length - 1 && (
                <div className="flex justify-center py-1">
                  <div
                    className={`w-0.5 h-4 ${
                      isCompleted
                        ? 'bg-green-400'
                        : isActive
                        ? 'bg-blue-400 animate-pulse'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer - Completion/Failure Messages */}
      {graphState.status === 'completed' && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-lg animate-in fade-in slide-in-from-bottom duration-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                Analysis completed successfully!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                Total time: {formatDuration(graphState.totalDuration)} • All agents executed successfully
              </p>
            </div>
          </div>
        </div>
      )}

      {graphState.status === 'failed' && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-500 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Analysis failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                Please review the error details above and try again.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
