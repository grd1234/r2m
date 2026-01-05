import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

// Initialize Claude model
const getModel = () => {
  return new ChatAnthropic({
    modelName: 'claude-3-5-sonnet-20240620',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.7,
  })
}

export interface CVSAnalysisResult {
  cvsScore: number
  technicalScore: number
  marketScore: number
  ipScore: number
  trl: number
  tam: number
  summary: string
  recommendations: string
  error?: string
}

// Run comprehensive CVS analysis
export async function runCVSAnalysis(query: string): Promise<CVSAnalysisResult> {
  const model = getModel()

  try {
    console.log('Starting CVS analysis for:', query)

    // Step 1: Comprehensive Analysis
    const analysisPrompt = `You are an expert research commercialization analyst. Analyze the following research topic comprehensively:

Research Topic: "${query}"

Provide a detailed analysis covering:
1. Technical feasibility and innovation
2. Market potential and applications
3. Intellectual property considerations
4. Technology readiness level
5. Total addressable market estimate

Be thorough and specific.`

    const analysisMessages = [
      new SystemMessage('You are an expert research commercialization analyst with deep knowledge of technology transfer, market analysis, and IP strategy.'),
      new HumanMessage(analysisPrompt),
    ]

    console.log('Running comprehensive analysis...')
    const analysisResponse = await model.invoke(analysisMessages)
    const analysisText = analysisResponse.content as string
    console.log('Analysis complete')

    // Step 2: Score Generation
    const scoringPrompt = `Based on this research analysis, provide scores for the following metrics:

${analysisText}

Provide ONLY a JSON object with these exact fields (no markdown, no explanation):
{
  "technicalScore": <number 0-100>,
  "marketScore": <number 0-100>,
  "ipScore": <number 0-100>,
  "trl": <number 1-9>,
  "tam": <number in millions USD>
}

Scoring guidelines:
- Technical Score: Technology maturity, scientific validity, implementation complexity
- Market Score: Market size, demand, competitive advantage
- IP Score: Patentability, novelty, defensibility
- TRL: 1-3 (basic research), 4-6 (proof of concept), 7-9 (deployment ready)
- TAM: Total addressable market in millions USD`

    const scoringMessages = [
      new SystemMessage('You are a scoring expert. Respond ONLY with valid JSON.'),
      new HumanMessage(scoringPrompt),
    ]

    console.log('Generating scores...')
    const scoringResponse = await model.invoke(scoringMessages)
    let scoringText = (scoringResponse.content as string).trim()

    // Remove markdown code blocks if present
    scoringText = scoringText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

    console.log('Raw scoring response:', scoringText)

    const scores = JSON.parse(scoringText)
    console.log('Parsed scores:', scores)

    // Calculate CVS Score
    const cvsScore = Math.round(
      scores.technicalScore * 0.3 +
        scores.marketScore * 0.35 +
        scores.ipScore * 0.25 +
        (scores.trl / 9) * 100 * 0.1
    )

    // Step 3: Executive Summary
    const summaryPrompt = `Based on this analysis, provide a concise 2-3 sentence executive summary:

Research: ${query}
CVS Score: ${cvsScore}/100
Technical Score: ${scores.technicalScore}/100
Market Score: ${scores.marketScore}/100
IP Score: ${scores.ipScore}/100
TRL: ${scores.trl}/9

Focus on commercial viability and key findings.`

    const summaryMessages = [
      new SystemMessage('You are a concise business writer.'),
      new HumanMessage(summaryPrompt),
    ]

    console.log('Generating summary...')
    const summaryResponse = await model.invoke(summaryMessages)
    const summary = summaryResponse.content as string

    // Step 4: Recommendations
    const recommendationsPrompt = `Based on this analysis, provide 3-5 specific, actionable commercialization recommendations:

CVS Score: ${cvsScore}/100
Technical Score: ${scores.technicalScore}/100
Market Score: ${scores.marketScore}/100
IP Score: ${scores.ipScore}/100
TRL: ${scores.trl}/9

Format as a numbered list. Be specific and actionable.`

    const recommendationsMessages = [
      new SystemMessage('You are a research commercialization strategist.'),
      new HumanMessage(recommendationsPrompt),
    ]

    console.log('Generating recommendations...')
    const recommendationsResponse = await model.invoke(recommendationsMessages)
    const recommendations = recommendationsResponse.content as string

    console.log('CVS analysis complete!')

    return {
      cvsScore,
      technicalScore: scores.technicalScore,
      marketScore: scores.marketScore,
      ipScore: scores.ipScore,
      trl: scores.trl,
      tam: scores.tam,
      summary,
      recommendations,
    }
  } catch (error: any) {
    console.error('CVS Analysis Error:', error)
    return {
      cvsScore: 0,
      technicalScore: 0,
      marketScore: 0,
      ipScore: 0,
      trl: 1,
      tam: 0,
      summary: 'Analysis failed',
      recommendations: 'Please try again',
      error: error.message || 'Analysis failed',
    }
  }
}
