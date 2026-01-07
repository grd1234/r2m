import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { id } = await params

    console.log('=== CVS Report API called ===')
    console.log('Analysis ID:', id)

    const supabase = await createClient()

    // Check authentication with timeout
    console.log('Checking authentication...')
    let user = null
    let authError = null

    try {
      // Add timeout to auth check
      const authPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )

      const result = await Promise.race([authPromise, timeoutPromise]) as any
      user = result?.data?.user
      authError = result?.error
    } catch (err: any) {
      console.error('Auth check failed:', err.message)
      // If auth check fails, try to get session from cookies
      const { data: sessionData } = await supabase.auth.getSession()
      user = sessionData?.session?.user || null
    }

    console.log('Auth check result:', {
      hasUser: !!user,
      userEmail: user?.email,
      authError: authError?.message,
    })

    if (!user) {
      console.error('CVS Report: Unauthorized - no user session')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch the analysis using analysis_id (not the database id)
    console.log('Fetching CVS analysis using analysis_id:', id)
    const { data: analysis, error } = await supabase
      .from('cvs_analyses')
      .select('email_report, analyzed_by, title, status')
      .eq('analysis_id', id)
      .single()

    console.log('Database query result:', {
      found: !!analysis,
      error: error?.message,
      analyzedBy: analysis?.analyzed_by,
      hasReport: !!analysis?.email_report,
      status: analysis?.status,
    })

    if (error || !analysis) {
      console.error('CVS Report: Analysis not found:', error?.message || 'No data returned')
      return new NextResponse('Analysis not found', { status: 404 })
    }

    // Verify user owns this analysis
    if (analysis.analyzed_by !== user.email) {
      console.error('CVS Report: Forbidden - user does not own analysis')
      console.error('Analysis owner:', analysis.analyzed_by)
      console.error('Current user:', user.email)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Check if email_report exists
    if (!analysis.email_report) {
      console.error('CVS Report: Report not available yet for analysis:', analysis.title)
      return new NextResponse('CVS report not available yet', { status: 404 })
    }

    console.log('CVS Report: Successfully returning report for:', analysis.title)

    // Return the HTML report
    return new NextResponse(analysis.email_report, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('CVS Report: Unexpected error:', error)
    return new NextResponse('Internal server error: ' + error.message, { status: 500 })
  }
}
