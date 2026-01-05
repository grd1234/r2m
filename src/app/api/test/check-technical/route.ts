import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const analysis_id = request.nextUrl.searchParams.get('analysis_id')

    if (!analysis_id) {
      return NextResponse.json({ error: 'analysis_id required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check technical_analyses
    const { data: techData, error: techError } = await supabase
      .from('technical_analyses')
      .select('*')
      .eq('analysis_id', analysis_id)
      .limit(1)

    // Check cvs_analyses
    const { data: cvsData, error: cvsError } = await supabase
      .from('cvs_analyses')
      .select('*')
      .eq('analysis_id', analysis_id)
      .limit(1)

    return NextResponse.json({
      analysis_id,
      technical_analyses: {
        found: !!techData && techData.length > 0,
        count: techData?.length || 0,
        has_html_report: !!(techData && techData[0]?.html_report),
        html_length: techData && techData[0]?.html_report ? techData[0].html_report.length : 0,
        error: techError?.message
      },
      cvs_analyses: {
        found: !!cvsData && cvsData.length > 0,
        count: cvsData?.length || 0,
        status: cvsData && cvsData[0]?.status,
        cvs_score: cvsData && cvsData[0]?.cvs_score,
        error: cvsError?.message
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
