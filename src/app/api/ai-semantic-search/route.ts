import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface AttributeMatch {
  roleModel: string
  roleModelId: string
  attribute: string
  attributeId: string
  description: string
  method: string
  relevanceScore: number
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const { searchQuery, availableAttributes } = await request.json()

    if (!searchQuery || !availableAttributes || !Array.isArray(availableAttributes)) {
      return NextResponse.json({ 
        error: 'Missing searchQuery or availableAttributes' 
      }, { status: 400 })
    }

    if (!OPENROUTER_API_KEY) {
      console.warn('⚠️ OPENROUTER_API_KEY not configured, using fallback logic')
      return NextResponse.json({ 
        matches: [],
        fallback: true,
        message: 'AI semantic search unavailable, using basic search'
      })
    }

    // Create a concise attribute list for AI analysis
    const attributeSummary = availableAttributes.map((attr: any, i: number) => ({
      index: i + 1,
      roleModel: attr.roleModel,
      roleModelId: attr.roleModelId,
      attribute: attr.attribute,  
      attributeId: attr.attributeId,
      description: attr.description?.substring(0, 100) || '',
      method: attr.method?.substring(0, 100) || ''
    }))

    // Create a simple mapping for AI to understand
    const simpleAttributes = attributeSummary.slice(0, 30).map((attr, i) => ({
      id: i + 1,
      roleModel: attr.roleModel,
      attribute: attr.attribute,
      description: attr.description
    }))
    
    const prompt = `User wants: "${searchQuery}"

Attributes:
${simpleAttributes.map(attr => 
  `${attr.id}. ${attr.roleModel} - ${attr.attribute}: ${attr.description}`
).join('\n')}

Return JSON with IDs of top 3 matches:
[{"id": 1, "score": 95}, {"id": 5, "score": 85}]

Only 70+ scores.`

    const response = await fetch(OPENROUTER_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://lightwalker-mvp.vercel.app',
        'X-Title': 'Lightwalker Semantic Search'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free', // Free DeepSeek R1 reasoning model - confirmed working
        messages: [
          {
            role: 'system',
            content: 'You are a semantic search engine. Return only valid JSON arrays with no additional text or formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content?.trim()

    if (!aiResponse) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    let matches: AttributeMatch[] = []
    try {
      // Clean the response to extract just the JSON array
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      let aiMatches = []
      
      if (jsonMatch) {
        aiMatches = JSON.parse(jsonMatch[0])
      } else {
        aiMatches = JSON.parse(aiResponse)
      }

      // Convert AI matches back to full attribute data
      matches = aiMatches
        .filter((match: any) => match.id && match.score >= 70)
        .map((match: any) => {
          const attr = attributeSummary[match.id - 1] // Convert back to 0-based index
          if (!attr) return null
          
          return {
            roleModel: attr.roleModel,
            roleModelId: attr.roleModelId,
            attribute: attr.attribute,
            attributeId: attr.attributeId,
            relevanceScore: match.score,
            reasoning: `Matched for ${searchQuery}`
          }
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5)

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', aiResponse)
      
      // Fallback: return empty matches
      matches = []
    }

    return NextResponse.json({
      success: true,
      matches,
      searchQuery,
      aiUsed: true
    })

  } catch (error) {
    console.error('AI semantic search error:', error)
    
    return NextResponse.json({
      success: false,
      matches: [],
      fallback: true,
      error: 'AI semantic search failed',
      message: 'Using basic search instead'
    })
  }
}