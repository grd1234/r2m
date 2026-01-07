/**
 * n8n Workflow Integration
 * Handles CVS analysis via n8n webhook
 */

export interface N8nWorkflowRequest {
  query: string
  user_email?: string
  domain?: string
  analysis_id?: string  // Unique identifier for tracking this analysis across workflows
  num_papers?: number
  max_papers?: number
  min_citations?: number
  min_year?: number
}

export interface N8nWorkflowResponse {
  status: 'success' | 'error'
  workflow_id?: string
  message?: string
  error?: string
}

/**
 * Trigger n8n workflow for CVS analysis
 */
export async function triggerN8nWorkflow(
  request: N8nWorkflowRequest
): Promise<N8nWorkflowResponse> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('N8N_WEBHOOK_URL is not configured')
  }

  try {
    console.log('Triggering n8n workflow:', webhookUrl)
    console.log('Request payload:', request)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('n8n webhook error:', errorText)
      throw new Error(`n8n workflow failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('n8n workflow response:', result)

    return {
      status: 'success',
      workflow_id: result.workflow_id,
      message: result.message || 'Workflow started successfully',
    }
  } catch (error: any) {
    console.error('Error triggering n8n workflow:', error)
    return {
      status: 'error',
      error: error.message || 'Failed to trigger workflow',
    }
  }
}
