import { ChatAnthropic } from '@langchain/anthropic'
import { StateGraph, END } from '@langchain/langgraph'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

// Define the state interface for our workflow
interface CVSAnalysisState {
  query: string
  researchPaper?: string
  technicalAnalysis?: string
  marketAnalysis?: string
  ipAnalysis?: string
  trlAnalysis?: string
  technicalScore?: number
  marketScore?: number
  ipScore?: number
  trl?: number
  cvsScore?: number
  tam?: number
  summary?: string
  recommendations?: string
  error?: string
}

// Initialize Claude model
const model = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  temperature: 0.7,
})

// Node 1: Research Paper Analysis
async function analyzeResearchPaper(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `You are a research analyst. Analyze the following research query and provide a comprehensive technical summary:

Query: ${state.query}

Provide:
1. A detailed technical overview of the research area
2. Key innovations and breakthroughs
3. Current state of the technology
4. Potential applications

Format your response as a structured analysis.`

    const messages = [new SystemMessage('You are an expert research analyst.'), new HumanMessage(prompt)]

    const response = await model.invoke(messages)

    return {
      researchPaper: response.content as string,
      technicalAnalysis: response.content as string,
    }
  } catch (error) {
    return { error: `Research analysis failed: ${error}` }
  }
}

// Node 2: Technical Feasibility Scoring
async function scoreTechnicalFeasibility(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `Based on this research analysis, score the technical feasibility from 0-100:

${state.technicalAnalysis}

Consider:
- Technology maturity
- Scientific validity
- Implementation complexity
- Resource requirements

Provide ONLY a number between 0-100 as your response.`

    const messages = [new SystemMessage('You are a technical assessment expert.'), new HumanMessage(prompt)]

    const response = await model.invoke(messages)
    const score = parseInt((response.content as string).trim())

    return {
      technicalScore: isNaN(score) ? 50 : Math.min(100, Math.max(0, score)),
    }
  } catch (error) {
    return { error: `Technical scoring failed: ${error}` }
  }
}

// Node 3: Market Potential Analysis
async function analyzeMarketPotential(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `Analyze the market potential for this research:

${state.technicalAnalysis}

Provide:
1. Market size analysis
2. Target industries
3. Competitive landscape
4. Market score (0-100)
5. TAM estimate in millions USD

Format:
Score: [number]
TAM: [number in millions]
Analysis: [detailed analysis]`

    const messages = [new SystemMessage('You are a market analysis expert.'), new HumanMessage(prompt)]

    const response = await model.invoke(messages)
    const content = response.content as string

    // Extract score and TAM
    const scoreMatch = content.match(/Score:\s*(\d+)/)
    const tamMatch = content.match(/TAM:\s*(\d+)/)

    return {
      marketAnalysis: content,
      marketScore: scoreMatch ? parseInt(scoreMatch[1]) : 50,
      tam: tamMatch ? parseInt(tamMatch[1]) : 100,
    }
  } catch (error) {
    return { error: `Market analysis failed: ${error}` }
  }
}

// Node 4: IP Strength Assessment
async function assessIPStrength(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `Assess the intellectual property strength for this research:

${state.technicalAnalysis}

Consider:
- Patentability
- Novelty
- Competitive advantage
- IP protection potential

Provide an IP strength score from 0-100.
Provide ONLY a number between 0-100 as your response.`

    const messages = [new SystemMessage('You are an IP assessment expert.'), new HumanMessage(prompt)]

    const response = await model.invoke(messages)
    const score = parseInt((response.content as string).trim())

    return {
      ipAnalysis: response.content as string,
      ipScore: isNaN(score) ? 50 : Math.min(100, Math.max(0, score)),
    }
  } catch (error) {
    return { error: `IP assessment failed: ${error}` }
  }
}

// Node 5: Technology Readiness Level (TRL) Assessment
async function assessTRL(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `Assess the Technology Readiness Level (TRL) for this research:

${state.technicalAnalysis}

TRL Scale:
1-3: Basic research
4-6: Proof of concept
7-9: Deployment ready

Provide ONLY a number between 1-9 as your response.`

    const messages = [new SystemMessage('You are a TRL assessment expert.'), new HumanMessage(prompt)]

    const response = await model.invoke(messages)
    const trl = parseInt((response.content as string).trim())

    return {
      trlAnalysis: response.content as string,
      trl: isNaN(trl) ? 5 : Math.min(9, Math.max(1, trl)),
    }
  } catch (error) {
    return { error: `TRL assessment failed: ${error}` }
  }
}

// Node 6: Calculate CVS Score
async function calculateCVSScore(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  const { technicalScore = 50, marketScore = 50, ipScore = 50, trl = 5 } = state

  // Weighted formula for CVS score
  const cvsScore = Math.round(
    technicalScore * 0.3 + marketScore * 0.35 + ipScore * 0.25 + (trl / 9) * 100 * 0.1
  )

  return { cvsScore }
}

// Node 7: Generate Summary
async function generateSummary(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `Based on this comprehensive analysis, provide a 2-3 sentence executive summary:

Research: ${state.query}
CVS Score: ${state.cvsScore}/100
Technical: ${state.technicalScore}/100
Market: ${state.marketScore}/100
IP: ${state.ipScore}/100
TRL: ${state.trl}/9

Provide a concise, professional summary highlighting the key findings and commercial viability.`

    const messages = [new SystemMessage('You are a research commercialization expert.'), new HumanMessage(prompt)]

    const response = await model.invoke(messages)

    return {
      summary: response.content as string,
    }
  } catch (error) {
    return { error: `Summary generation failed: ${error}` }
  }
}

// Node 8: Generate Recommendations
async function generateRecommendations(state: CVSAnalysisState): Promise<Partial<CVSAnalysisState>> {
  try {
    const prompt = `Based on this analysis, provide 3-5 actionable commercialization recommendations:

CVS Score: ${state.cvsScore}/100
Technical: ${state.technicalScore}/100
Market: ${state.marketScore}/100
IP: ${state.ipScore}/100
TRL: ${state.trl}/9

Provide specific, actionable steps for commercializing this research. Format as numbered list.`

    const messages = [
      new SystemMessage('You are a research commercialization strategist.'),
      new HumanMessage(prompt),
    ]

    const response = await model.invoke(messages)

    return {
      recommendations: response.content as string,
    }
  } catch (error) {
    return { error: `Recommendations generation failed: ${error}` }
  }
}

// Build the workflow graph
export function createCVSAnalysisWorkflow() {
  const workflow = new StateGraph({
    channels: {
      query: {
        value: (left?: string, right?: string) => right ?? left ?? '',
      },
      researchPaper: {
        value: (left?: string, right?: string) => right ?? left,
      },
      technicalAnalysis: {
        value: (left?: string, right?: string) => right ?? left,
      },
      marketAnalysis: {
        value: (left?: string, right?: string) => right ?? left,
      },
      ipAnalysis: {
        value: (left?: string, right?: string) => right ?? left,
      },
      trlAnalysis: {
        value: (left?: string, right?: string) => right ?? left,
      },
      technicalScore: {
        value: (left?: number, right?: number) => right ?? left,
      },
      marketScore: {
        value: (left?: number, right?: number) => right ?? left,
      },
      ipScore: {
        value: (left?: number, right?: number) => right ?? left,
      },
      trl: {
        value: (left?: number, right?: number) => right ?? left,
      },
      cvsScore: {
        value: (left?: number, right?: number) => right ?? left,
      },
      tam: {
        value: (left?: number, right?: number) => right ?? left,
      },
      summary: {
        value: (left?: string, right?: string) => right ?? left,
      },
      recommendations: {
        value: (left?: string, right?: string) => right ?? left,
      },
      error: {
        value: (left?: string, right?: string) => right ?? left,
      },
    },
  })

  // Add nodes
  workflow.addNode('analyzeResearchPaper', analyzeResearchPaper)
  workflow.addNode('scoreTechnicalFeasibility', scoreTechnicalFeasibility)
  workflow.addNode('analyzeMarketPotential', analyzeMarketPotential)
  workflow.addNode('assessIPStrength', assessIPStrength)
  workflow.addNode('assessTRL', assessTRL)
  workflow.addNode('calculateCVSScore', calculateCVSScore)
  workflow.addNode('generateSummary', generateSummary)
  workflow.addNode('generateRecommendations', generateRecommendations)

  // Define the flow
  workflow.setEntryPoint('analyzeResearchPaper')
  workflow.addEdge('analyzeResearchPaper', 'scoreTechnicalFeasibility')
  workflow.addEdge('scoreTechnicalFeasibility', 'analyzeMarketPotential')
  workflow.addEdge('analyzeMarketPotential', 'assessIPStrength')
  workflow.addEdge('assessIPStrength', 'assessTRL')
  workflow.addEdge('assessTRL', 'calculateCVSScore')
  workflow.addEdge('calculateCVSScore', 'generateSummary')
  workflow.addEdge('generateSummary', 'generateRecommendations')
  workflow.addEdge('generateRecommendations', END)

  return workflow.compile()
}

// Execute the CVS analysis
export async function runCVSAnalysis(query: string): Promise<CVSAnalysisState> {
  const app = createCVSAnalysisWorkflow()

  const initialState: CVSAnalysisState = {
    query,
  }

  const result = await app.invoke(initialState)

  return result as CVSAnalysisState
}
