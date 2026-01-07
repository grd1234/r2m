import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { id } = await params

    console.log('=== Technical Report API called ===')
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
      console.error('Technical Report: Unauthorized - no user session')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Use the ID directly as analysis_id (it's passed from the UI)
    // No need to look up CVS analysis first since technical_analyses is populated before cvs_analyses
    console.log('Fetching technical report directly using analysis_id:', id)

    const { data: technicalReport, error: techError } = await supabase
      .from('technical_analyses')
      .select('html_report')
      .eq('analysis_id', id)
      .single()

    console.log('Technical report query result:', {
      found: !!technicalReport,
      error: techError?.message,
      hasReport: !!technicalReport?.html_report,
      reportLength: technicalReport?.html_report?.length || 0,
    })

    if (techError || !technicalReport) {
      console.error('Technical Report: Technical analysis not found:', techError?.message || 'No data returned')
      return new NextResponse('Technical report not found', { status: 404 })
    }

    // Check if html_report exists
    if (!technicalReport.html_report) {
      console.error('Technical Report: Report not available yet for analysis_id:', id)
      return new NextResponse('Technical report not available yet', { status: 404 })
    }

    console.log('Technical Report: Successfully returning report for analysis_id:', id)
    console.log('Report length:', technicalReport.html_report.length, 'characters')

    // Return the HTML report
    return new NextResponse(technicalReport.html_report, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('Technical Report: Unexpected error:', error)
    return new NextResponse('Internal server error: ' + error.message, { status: 500 })
  }
}
