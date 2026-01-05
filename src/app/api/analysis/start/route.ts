import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Analysis Start API called (after user paper selection) ===')
    const { analysisId, paperId, paperTitle } = await request.json()

    if (!analysisId || !paperId) {
      return NextResponse.json(
        { error: 'Analysis ID and Paper ID are required' },
        { status: 400 }
      )
    }

    console.log('Analysis ID:', analysisId)
    console.log('Selected Paper ID:', paperId)
    console.log('Paper Title:', paperTitle)

    // Get Supabase client
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authenticated user:', user.email)

    // Verify the user owns this analysis
    const { data: analysis, error: fetchError } = await supabase
      .from('cvs_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('analyzed_by', user.id)
      .single()

    if (fetchError || !analysis) {
      console.error('Analysis not found or access denied:', fetchError)
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      )
    }

    console.log('Analysis found:', analysis.query)
    console.log('User confirmed paper selection, triggering CVS analysis...')

    // Trigger n8n Orchestrator webhook to continue with CVS analysis
    // The orchestrator should poll for cvs_analyses records where:
    // - status = 'processing'
    // - paper_id IS NOT NULL
    // - analysis has not been completed yet

    const n8nWebhookUrl = process.env.N8N_ORCHESTRATOR_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL

    if (n8nWebhookUrl) {
      try {
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysisId,
            paperId,
            paperTitle,
            query: analysis.query,
            user_email: user.email,
            domain: analysis.domain,
            trigger: 'user_paper_selection'
          })
        })

        if (!webhookResponse.ok) {
          console.error('n8n webhook failed:', await webhookResponse.text())
          throw new Error('Failed to trigger n8n workflow')
        }

        console.log('n8n webhook triggered successfully')
      } catch (webhookError) {
        console.error('Error triggering n8n webhook:', webhookError)
        // Don't fail the request - the orchestrator can also poll for new analyses
      }
    } else {
      console.warn('N8N_ORCHESTRATOR_WEBHOOK_URL not configured - relying on polling')
    }

    return NextResponse.json({
      success: true,
      message: 'CVS analysis started for selected paper',
      analysisId,
      paperId
    })

  } catch (error: any) {
    console.error('=== Analysis Start API ERROR ===')
    console.error('Error details:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
