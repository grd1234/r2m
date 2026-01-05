import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { triggerN8nWorkflow } from '@/lib/ai/n8n-workflow'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CVS Analysis API called ===')
    const { analysisId, query, domain, user_email, max_papers } = await request.json()
    console.log('Analysis ID:', analysisId)
    console.log('Parameters:', { query, domain, user_email, max_papers })

    if (!analysisId) {
      console.error('No analysis ID provided')
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = await createClient()
    console.log('Supabase client created')

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    console.log('Authenticated user:', user.email)

    // Verify the user owns this analysis
    const { data: analysis, error: fetchError } = await supabase
      .from('cvs_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('analyzed_by', user.email)  // Use email instead of UUID
      .single()

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ error: 'Analysis not found or access denied' }, { status: 404 })
    }

    if (!analysis) {
      console.error('No analysis found or user does not have access')
      return NextResponse.json({ error: 'Analysis not found or access denied' }, { status: 404 })
    }

    console.log('Analysis found:', analysis.query)

    // Use authenticated user's email (from session) instead of request body
    // This prevents users from using someone else's email
    const authenticatedEmail = user.email || user_email

    if (!authenticatedEmail) {
      console.error('No email found for authenticated user')
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Use form parameters or fallback to defaults
    const workflowQuery = query || analysis.query
    const workflowDomain = domain || 'Computer Science'
    const workflowEmail = authenticatedEmail  // Use authenticated user's email

    // Trigger n8n workflow in the background (fire-and-forget)
    // Don't wait for response since workflow takes 4-6 minutes
    console.log('Triggering n8n workflow with params:', {
      query: workflowQuery,
      domain: workflowDomain,
      user_email: workflowEmail,
      analysis_id: analysisId,
      max_papers: 5,
    })

    // Fire and forget - don't await the response
    triggerN8nWorkflow({
      query: workflowQuery,
      user_email: workflowEmail,
      domain: workflowDomain,
      analysis_id: analysisId,
      max_papers: 5,
      min_citations: 0,
      min_year: 2015,
    }).catch((err) => {
      // Log error but don't fail the request
      console.error('n8n workflow error (background):', err)
      // Update analysis status to failed
      supabase
        .from('cvs_analyses')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)
        .then(() => console.log('Updated analysis status to failed'))
    })

    console.log('=== n8n workflow triggered (running in background) ===')
    console.log('Note: Results will be sent via email in 4-6 minutes')

    return NextResponse.json({
      success: true,
      message: 'Analysis started successfully',
      analysisId: analysisId,
      note: 'Your analysis is being processed. Results will be emailed to you in 4-6 minutes.'
    })
  } catch (error: any) {
    console.error('=== CVS Analysis API ERROR ===')
    console.error('Error details:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
