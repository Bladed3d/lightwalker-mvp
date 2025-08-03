import { NextRequest, NextResponse } from 'next/server'

interface LLMTestCase {
  input: string
  expectedKeywords: string[]
  expectedIntent: string
}

interface LLMTestResult {
  model: string
  totalTests: number
  passedTests: number
  failedTests: number
  successRate: number
  avgResponseTime: number
  totalCost: number
  details: Array<{
    input: string
    expected: string[]
    actual: string[] | null
    passed: boolean
    error?: string
    responseTime: number
  }>
}

// Standard test cases for Lightwalker keyword extraction
const TEST_CASES: LLMTestCase[] = [
  {
    input: "I want to learn forgiveness",
    expectedKeywords: ["forgiving"],
    expectedIntent: "traits"
  },
  {
    input: "I need more patience with my kids", 
    expectedKeywords: ["patient"],
    expectedIntent: "traits"
  },
  {
    input: "I struggle with focus at work",
    expectedKeywords: ["focused"],
    expectedIntent: "problems"
  },
  {
    input: "I want to be like Steve Jobs",
    expectedKeywords: ["jobs"],
    expectedIntent: "people"
  },
  {
    input: "I need help with procrastination",
    expectedKeywords: ["procrastination"],
    expectedIntent: "problems"
  },
  {
    input: "I want to develop confidence",
    expectedKeywords: ["confident"],
    expectedIntent: "traits"
  },
  {
    input: "I need to manage my anger better",
    expectedKeywords: ["anger"],
    expectedIntent: "problems"
  },
  {
    input: "I want to be more empathetic",
    expectedKeywords: ["empathetic"],
    expectedIntent: "traits"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { model, testCount = 8 } = await request.json()
    
    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 })
    }

    console.log(`🧪 Testing LLM reliability for model: ${model}`)
    
    const testCases = TEST_CASES.slice(0, testCount)
    const results: LLMTestResult = {
      model,
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
      avgResponseTime: 0,
      totalCost: 0,
      details: []
    }

    const startTime = Date.now()
    
    for (const testCase of testCases) {
      const testStart = Date.now()
      
      try {
        const extractedData = await testKeywordExtraction(model, testCase.input)
        const testEnd = Date.now()
        const responseTime = testEnd - testStart
        
        // Check if extraction matches expected results
        const keywordsMatch = extractedData?.keywords && 
          extractedData.keywords.some((k: string) => 
            testCase.expectedKeywords.some(expected => 
              k.toLowerCase().includes(expected.toLowerCase()) ||
              expected.toLowerCase().includes(k.toLowerCase())
            )
          )
        
        const intentMatch = extractedData?.primaryIntent === testCase.expectedIntent
        const passed = keywordsMatch // Focus on keywords, intent is less critical
        
        if (passed) results.passedTests++
        else results.failedTests++
        
        results.details.push({
          input: testCase.input,
          expected: testCase.expectedKeywords,
          actual: extractedData?.keywords || null,
          passed,
          responseTime
        })
        
      } catch (error) {
        const testEnd = Date.now()
        const responseTime = testEnd - testStart
        
        results.failedTests++
        results.details.push({
          input: testCase.input,
          expected: testCase.expectedKeywords,
          actual: null,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime
        })
      }
    }
    
    const totalTime = Date.now() - startTime
    results.avgResponseTime = totalTime / testCases.length
    results.successRate = (results.passedTests / results.totalTests) * 100
    
    // Estimate cost (rough estimates per 1K tokens)
    const costPer1KTokens = getCostEstimate(model)
    const avgTokensPerRequest = 150 // Estimated
    results.totalCost = (testCases.length * avgTokensPerRequest * costPer1KTokens) / 1000
    
    console.log(`🧪 Test completed: ${results.passedTests}/${results.totalTests} passed (${results.successRate.toFixed(1)}%)`)
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('LLM reliability test failed:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function testKeywordExtraction(model: string, userInput: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OpenRouter API key not configured')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lightwalker-mvp.vercel.app',
      'X-Title': 'Lightwalker LLM Test'
    },
    body: JSON.stringify({
      model: model,
      messages: [{
        role: 'system',
        content: 'You extract keywords for character building. Only respond with valid JSON.'
      }, {
        role: 'user',
        content: `Extract keywords from: "${userInput}"\n\nFor personal development attributes, use adjective forms (forgiving not forgiveness, patient not patience, focused not focus).\n\nReturn only this JSON format: {"keywords": ["forgiving"], "primaryIntent": "traits", "confidence": 0.9}\n\nPrimaryIntent options: "problems", "traits", "people", "habits", "unclear"`
      }],
      max_tokens: 100,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  let content = data.choices[0]?.message?.content || ''
  
  // Handle DeepSeek R1 reasoning field
  if (!content && data.choices[0]?.message?.reasoning) {
    content = data.choices[0].message.reasoning
  }
  
  // Clean up markdown if present
  content = content.trim()
  if (content.startsWith('```json')) {
    content = content.slice(7)
  }
  if (content.endsWith('```')) {
    content = content.slice(0, -3)
  }
  content = content.trim()
  
  // Try to extract JSON from content
  const jsonMatch = content.match(/\{[^}]*\}/)
  if (jsonMatch) {
    content = jsonMatch[0]
  }
  
  return JSON.parse(content)
}

function getCostEstimate(model: string): number {
  // Cost per 1K tokens (USD) - rough estimates
  const costs: Record<string, number> = {
    'openai/gpt-4o-mini': 0.00015,
    'openai/gpt-4o': 0.0025,
    'anthropic/claude-3-haiku': 0.00025,
    'anthropic/claude-3-sonnet': 0.003,
    'deepseek/deepseek-r1:free': 0,
    'deepseek/deepseek-r1': 0.0001,
    'meta-llama/llama-3.2-3b': 0.0001,
    'google/gemini-flash-1.5': 0.0001
  }
  
  return costs[model] || 0.0005 // Default estimate
}

// GET endpoint for documentation
export async function GET() {
  return NextResponse.json({
    description: 'LLM Reliability Test for Lightwalker Keyword Extraction',
    usage: 'POST with {"model": "openai/gpt-4o-mini", "testCount": 8}',
    availableModels: [
      'openai/gpt-4o-mini',
      'openai/gpt-4o', 
      'anthropic/claude-3-haiku',
      'deepseek/deepseek-r1:free',
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.2-3b',
      'google/gemini-flash-1.5'
    ],
    testCases: TEST_CASES
  })
}