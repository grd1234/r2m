import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, params is a Promise
    const { id: analysisId } = await params
    console.log('=== Delete CVS Analysis API called ===')
    console.log('Analysis ID:', analysisId)

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

    // Verify the user owns this analysis before deleting
    const { data: analysis, error: fetchError } = await supabase
      .from('cvs_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('analyzed_by', user.id)  // Ensure user owns this analysis
      .single()

    if (fetchError || !analysis) {
      console.error('Analysis not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Analysis not found or access denied' }, { status: 404 })
    }

    console.log('Analysis found, deleting:', analysis.title)

    // Delete the analysis
    const { error: deleteError } = await supabase
      .from('cvs_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('analyzed_by', user.id)  // Double-check ownership

    if (deleteError) {
      console.error('Error deleting analysis:', deleteError)
      return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 })
    }

    console.log('=== Analysis deleted successfully ===')

    return NextResponse.json({
      success: true,
      message: 'Analysis deleted successfully',
    })
  } catch (error: any) {
    console.error('=== Delete CVS Analysis API ERROR ===')
    console.error('Error details:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
