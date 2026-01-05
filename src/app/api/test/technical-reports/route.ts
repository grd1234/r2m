import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || 'grdes111@gmail.com'

    console.log('Test API: Fetching technical reports for email:', email)

    const supabase = await createClient()

    // Get all technical analyses (no email filter to see structure)
    const { data: technicalReports, error } = await supabase
      .from('technical_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Test API: Error fetching technical reports:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 })
    }

    console.log('Test API: Found', technicalReports?.length || 0, 'technical reports')

    // Return summary with HTML report lengths instead of full HTML
    const summary = technicalReports?.map(report => ({
      id: report.id,
      analysis_id: report.analysis_id,
      title: report.title,
      query: report.query,
      status: report.status,
      analyzed_by: report.analyzed_by,
      created_at: report.created_at,
      has_html_report: !!report.html_report,
      html_report_length: report.html_report?.length || 0,
      has_email_body: !!report.email_body,
      email_body_length: report.email_body?.length || 0,
    }))

    return NextResponse.json({
      success: true,
      email: email,
      count: technicalReports?.length || 0,
      reports: summary || [],
    })
  } catch (error: any) {
    console.error('Test API: Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
