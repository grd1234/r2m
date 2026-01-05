import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Publish to Marketplace API called ===')

    const body = await request.json()
    const {
      analysisId,
      marketplaceDescription,
      techCategory,
      industry,
      stage,
      fundingGoal,
    } = body

    console.log('Request body:', body)

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    console.log('Authenticated user:', user.email)

    // Get the analysis to find the associated paper
    const { data: analysis, error: analysisError } = await supabase
      .from('cvs_analyses')
      .select('paper_id, analyzed_by')
      .eq('id', analysisId)
      .single()

    if (analysisError || !analysis) {
      console.error('Analysis not found:', analysisError)
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    // Verify the user owns this analysis
    if (analysis.analyzed_by !== user.id) {
      console.error('User does not own this analysis')
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    console.log('Analysis found, paper_id:', analysis.paper_id)

    // If there's no paper_id, we need to create a research paper entry first
    if (!analysis.paper_id) {
      console.log('No paper linked to analysis, creating research paper entry...')

      // Get analysis details
      const { data: fullAnalysis, error: fullAnalysisError } = await supabase
        .from('cvs_analyses')
        .select('*')
        .eq('id', analysisId)
        .single()

      if (fullAnalysisError || !fullAnalysis) {
        console.error('Failed to get full analysis:', fullAnalysisError)
        return NextResponse.json({ error: 'Failed to get analysis details' }, { status: 500 })
      }

      // Create research paper from analysis
      const { data: newPaper, error: paperError } = await supabase
        .from('research_papers')
        .insert({
          uploaded_by: user.id,
          title: fullAnalysis.title,
          abstract: fullAnalysis.summary,
          source: 'user_upload',
          is_published_to_marketplace: true,
          marketplace_description: marketplaceDescription,
          tech_category: techCategory,
          industry: industry,
          stage: stage,
          funding_goal: fundingGoal ? parseFloat(fundingGoal) : null,
        })
        .select()
        .single()

      if (paperError || !newPaper) {
        console.error('Failed to create research paper:', paperError)
        return NextResponse.json({ error: 'Failed to create research paper' }, { status: 500 })
      }

      console.log('Research paper created:', newPaper.id)

      // Link the paper to the analysis
      const { error: linkError } = await supabase
        .from('cvs_analyses')
        .update({ paper_id: newPaper.id })
        .eq('id', analysisId)

      if (linkError) {
        console.error('Failed to link paper to analysis:', linkError)
        // Continue anyway as paper is created
      }

      console.log('=== Published to marketplace successfully ===')

      return NextResponse.json({
        success: true,
        message: 'Published to marketplace successfully',
        paperId: newPaper.id,
      })
    }

    // If paper exists, update it with marketplace details
    const { data: updatedPaper, error: updateError } = await supabase
      .from('research_papers')
      .update({
        is_published_to_marketplace: true,
        marketplace_description: marketplaceDescription,
        tech_category: techCategory,
        industry: industry,
        stage: stage,
        funding_goal: fundingGoal ? parseFloat(fundingGoal) : null,
      })
      .eq('id', analysis.paper_id)
      .eq('uploaded_by', user.id) // Verify ownership
      .select()
      .single()

    if (updateError || !updatedPaper) {
      console.error('Failed to update research paper:', updateError)
      return NextResponse.json({ error: 'Failed to publish to marketplace' }, { status: 500 })
    }

    console.log('=== Published to marketplace successfully ===')

    return NextResponse.json({
      success: true,
      message: 'Published to marketplace successfully',
      paperId: updatedPaper.id,
    })
  } catch (error: any) {
    console.error('=== Publish to Marketplace API ERROR ===')
    console.error('Error details:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
