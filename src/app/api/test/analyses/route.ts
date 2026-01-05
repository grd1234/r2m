import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || 'grdes111@gmail.com'

    console.log('Test API: Fetching analyses for email:', email)

    const supabase = await createClient()

    // Get all analyses for this email
    const { data: analyses, error } = await supabase
      .from('cvs_analyses')
      .select('*')
      .eq('analyzed_by', email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Test API: Error fetching analyses:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 })
    }

    console.log('Test API: Found', analyses?.length || 0, 'analyses')

    // Add report availability info
    const analysesWithReportInfo = analyses?.map(a => ({
      ...a,
      has_email_body: !!a.email_body,
      email_body_length: a.email_body?.length || 0,
      has_email_report: !!a.email_report,
      email_report_length: a.email_report?.length || 0,
      // Don't include the actual HTML to keep response small
      email_body: undefined,
      email_report: undefined,
    }))

    return NextResponse.json({
      success: true,
      email: email,
      count: analyses?.length || 0,
      analyses: analysesWithReportInfo || [],
    })
  } catch (error: any) {
    console.error('Test API: Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
