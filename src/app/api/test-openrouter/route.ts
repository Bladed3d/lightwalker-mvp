import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    
    // Check if API key exists
    if (!apiKey) {
      return NextResponse.json({
        status: 'ERROR',
        issue: 'OPENROUTER_API_KEY not found in environment variables',
        solution: 'Add OPENROUTER_API_KEY to Vercel environment variables'
      })
    }

    // Test basic connectivity to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        status: 'ERROR',
        issue: `OpenRouter API returned ${response.status}: ${response.statusText}`,
        solution: 'Check if API key is valid and has not expired'
      })
    }

    const models = await response.json()
    
    // Check if DeepSeek R1 models are available
    const deepseekModels = models.data?.filter((model: any) => 
      model.id.includes('deepseek-r1')
    ) || []

    return NextResponse.json({
      status: 'SUCCESS',
      apiKeyExists: true,
      apiKeyPrefix: `${apiKey.substring(0, 8)}...`,
      totalModels: models.data?.length || 0,
      deepseekModels: deepseekModels.map((m: any) => m.id),
      solution: deepseekModels.length > 0 ? 'OpenRouter connection working!' : 'DeepSeek R1 models not found'
    })

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      issue: `Network or API error: ${error}`,
      solution: 'Check network connectivity and API key validity'
    })
  }
}