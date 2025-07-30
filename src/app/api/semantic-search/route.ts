import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SemanticSearchRequest {
  keywords: string[]
  searchQuery: string
}

interface SearchResult {
  roleModel: string
  roleModelId: string
  attribute: string
  attributeId: string
  originalMethod: string
  dailyDoItems?: any[]
  relevanceScore: number
  matchReason: string
}

export async function POST(request: NextRequest) {
  try {
    const { keywords, searchQuery }: SemanticSearchRequest = await request.json()
    
    console.log('🔍 Semantic search called with:', { keywords, searchQuery })

    // Get all role models with attributes
    const roleModels = await prisma.roleModel.findMany({
      where: { isActive: true },
      select: {
        id: true,
        commonName: true,
        enhancedAttributes: true,
        dailyDoEnhanced: true
      }
    })
    
    console.log('📊 Found', roleModels.length, 'role models')
    console.log('📊 Sample role model attributes:', roleModels[0]?.enhancedAttributes?.length || 0)

    const results: SearchResult[] = []

    // Phase 1: Direct keyword matching (existing logic)
    const directMatches = await performDirectMatching(roleModels, keywords)
    console.log('📍 Direct matches:', directMatches.length)
    results.push(...directMatches)

    // Phase 2: AI semantic matching for unmatched terms
    if (results.length === 0) {
      console.log('🤖 Trying semantic matching...')
      const semanticMatches = await performSemanticMatching(roleModels, searchQuery, keywords)
      console.log('🤖 Semantic matches:', semanticMatches.length)
      results.push(...semanticMatches)
    }

    // Phase 3: Fuzzy text matching as final fallback
    if (results.length === 0) {
      console.log('🔤 Trying fuzzy matching...')
      const fuzzyMatches = await performFuzzyMatching(roleModels, searchQuery)
      console.log('🔤 Fuzzy matches:', fuzzyMatches.length)
      results.push(...fuzzyMatches)
    }

    // Sort by relevance and return top 8
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const topResults = results.slice(0, 8)

    // Determine which strategy was used
    let searchStrategy = 'none'
    if (results.length > 0) {
      if (directMatches.length > 0) {
        searchStrategy = 'direct'
      } else if (results.some(r => r.matchReason === 'semantic_ai')) {
        searchStrategy = 'semantic'
      } else {
        searchStrategy = 'fuzzy'
      }
    }

    return NextResponse.json({
      success: true,
      results: topResults,
      searchStrategy
    })

  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      { error: 'Search failed', success: false },
      { status: 500 }
    )
  }
}

async function performDirectMatching(roleModels: any[], keywords: string[]): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  
  console.log('📍 Direct matching for keywords:', keywords)
  
  roleModels.forEach(roleModel => {
    const attributes = roleModel.enhancedAttributes
    console.log(`📍 Checking ${roleModel.commonName}: attributes type=${typeof attributes}, isArray=${Array.isArray(attributes)}`)
    
    // Handle both JSON string and parsed object
    let parsedAttributes = []
    if (typeof attributes === 'string') {
      try {
        parsedAttributes = JSON.parse(attributes)
      } catch (e) {
        console.log(`❌ Failed to parse attributes for ${roleModel.commonName}`)
        return
      }
    } else if (Array.isArray(attributes)) {
      parsedAttributes = attributes
    }
    
    console.log(`📍 ${roleModel.commonName} has ${parsedAttributes.length} parsed attributes`)
    
    parsedAttributes.forEach((attribute: any, index: number) => {
      let relevanceScore = 0
      const attributeText = `${attribute.name} ${attribute.description} ${attribute.method}`.toLowerCase()
      
      if (index === 0) {
        console.log(`📍 Sample attribute: ${attribute.name}`)
        console.log(`📍 Sample text: ${attributeText.substring(0, 100)}...`)
      }
      
      keywords.forEach(keyword => {
        if (attribute.name.toLowerCase().includes(keyword)) {
          relevanceScore += 20
          console.log(`✅ Name match: ${attribute.name} contains ${keyword}`)
        }
        if (attribute.description?.toLowerCase().includes(keyword)) {
          relevanceScore += 15
          console.log(`✅ Description match: ${keyword}`)
        }
        if (attribute.method?.toLowerCase().includes(keyword)) {
          relevanceScore += 10
          console.log(`✅ Method match: ${keyword}`)
        }
      })

      if (relevanceScore > 0) {
        console.log(`✅ Found match: ${roleModel.commonName} - ${attribute.name} (score: ${relevanceScore})`)
        results.push({
          roleModel: roleModel.commonName,
          roleModelId: roleModel.id,
          attribute: attribute.name,
          attributeId: attribute.id,
          originalMethod: attribute.method,
          dailyDoItems: undefined,
          relevanceScore,
          matchReason: 'direct_keyword'
        })
      }
    })
  })

  console.log(`📍 Direct matching found ${results.length} total matches`)
  return results
}

async function performSemanticMatching(roleModels: any[], searchQuery: string, keywords: string[]): Promise<SearchResult[]> {
  // Use OpenRouter API to find semantic matches
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return []

  try {
    // Build a comprehensive content index from all attributes
    const allContent = roleModels.flatMap(roleModel => 
      (roleModel.enhancedAttributes || []).map((attr: any) => ({
        roleModel: roleModel.commonName,
        roleModelId: roleModel.id,
        attribute: attr.name,
        attributeId: attr.id,
        method: attr.method,
        content: `${attr.name}: ${attr.description} Method: ${attr.method}`
      }))
    )

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [{
          role: 'system',
          content: `You are a semantic search expert. Find the most relevant personal development attributes for the user's search.

User search: "${searchQuery}"
Keywords extracted: ${keywords.join(', ')}

From this content library, find the 3 most semantically relevant matches:
${allContent.map((item, i) => `${i}: ${item.content}`).join('\n')}

Return ONLY a JSON array of numbers (content indices) in order of relevance:
Example: [5, 12, 8]`
        }],
        max_tokens: 100,
        temperature: 0.1
      })
    })

    if (!response.ok) return []

    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    try {
      const indices = JSON.parse(content)
      if (!Array.isArray(indices)) return []

      const semanticResults: SearchResult[] = []
      
      indices.slice(0, 3).forEach((index: number, rank: number) => {
        const item = allContent[index]
        if (item) {
          semanticResults.push({
            roleModel: item.roleModel,
            roleModelId: item.roleModelId,
            attribute: item.attribute,
            attributeId: item.attributeId,
            originalMethod: item.method,
            dailyDoItems: undefined,
            relevanceScore: 15 - (rank * 2), // 15, 13, 11
            matchReason: 'semantic_ai'
          })
        }
      })
      
      return semanticResults

    } catch (parseError) {
      console.error('Failed to parse semantic search results:', parseError)
      return []
    }

  } catch (error) {
    console.error('Semantic matching failed:', error)
    return []
  }
}

async function performFuzzyMatching(roleModels: any[], searchQuery: string): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 2)

  roleModels.forEach(roleModel => {
    const attributes = Array.isArray(roleModel.enhancedAttributes) ? roleModel.enhancedAttributes : []
    
    attributes.forEach((attribute: any) => {
      let relevanceScore = 0
      const attributeText = `${attribute.name} ${attribute.description} ${attribute.method}`.toLowerCase()
      
      // Simple fuzzy matching - count how many search terms appear anywhere in the content
      searchTerms.forEach(term => {
        if (attributeText.includes(term)) {
          relevanceScore += 5
        }
        // Partial matches (at least 3 characters)
        if (term.length >= 4) {
          const partialMatch = attributeText.includes(term.substring(0, 4))
          if (partialMatch) relevanceScore += 2
        }
      })

      if (relevanceScore > 0) {
        results.push({
          roleModel: roleModel.commonName,
          roleModelId: roleModel.id,
          attribute: attribute.name,
          attributeId: attribute.id,
          originalMethod: attribute.method,
          dailyDoItems: undefined,
          relevanceScore,
          matchReason: 'fuzzy_text'
        })
      }
    })
  })

  return results
}