import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const { userInput, context } = await request.json()

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'User input is required' },
        { status: 400 }
      )
    }

    // Extract keywords from user input
    const keywordResult = await aiService.extractKeywords(userInput)

    // Generate contextual AI response
    const aiResponse = await aiService.generateResponse({
      userInput,
      extractedKeywords: keywordResult.keywords,
      foundMatches: context?.foundMatches || 0,
      selectedAttributes: context?.selectedAttributes || 0
    })

    return NextResponse.json({
      success: true,
      keywords: keywordResult.keywords,
      primaryIntent: keywordResult.primaryIntent,
      confidence: keywordResult.confidence,
      aiMessage: aiResponse.message,
      suggestions: aiResponse.suggestions || []
    })

  } catch (error) {
    console.error('AI character creation API error:', error)
    
    return NextResponse.json(
      { 
        error: 'AI processing failed',
        fallback: {
          keywords: [],
          aiMessage: "I'm having trouble processing that right now. Try using simple terms like 'focus', 'stress', or 'confidence'.",
          suggestions: ['focus', 'stress', 'confidence', 'patience']
        }
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}