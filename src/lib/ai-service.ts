// AI Service for Lightwalker Character Creation  
// Uses DeepSeek R1 via OpenRouter for maximum cost efficiency

interface KeywordExtractionResult {
  keywords: string[]
  primaryIntent: 'problems' | 'traits' | 'people' | 'habits' | 'unclear'
  confidence: number
}

interface AIResponse {
  message: string
  keywords?: string[]
  suggestions?: string[]
}

class AIService {
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions'
  private apiKey = process.env.OPENROUTER_API_KEY

  /**
   * Extract keywords from user's natural language input
   * Cost-effective parsing for database search
   */
  async extractKeywords(userInput: string): Promise<KeywordExtractionResult> {
    try {
      // Use EXACT same configuration as working debug endpoint
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lightwalker-mvp.vercel.app',
          'X-Title': 'Lightwalker Character Creation'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'You extract keywords for character building. Only respond with valid JSON.'
          }, {
            role: 'user',
            content: `Extract keywords from: "${userInput}"\n\nOur database has: Steve Jobs, Einstein, Buddha, Newton, Leonardo da Vinci, Marcus Aurelius, Joan of Arc, Marie Curie, Maya Angelou, Martin Luther King Jr., Patanjali.\n\nFor personal development attributes, use adjective forms (forgiving not forgiveness, patient not patience, focused not focus).\n\nIf people are mentioned, map them to our similar role models:\n- Bill Gates/Tim Cook → "Steve Jobs" (tech innovator)\n- Gandhi/Mandela → "Martin Luther King Jr." (peaceful leader) \n- Oprah/Tony Robbins → "Maya Angelou" (inspiring communicator)\n- Any scientist → "Einstein", "Newton", or "Marie Curie"\n- Any philosopher → "Marcus Aurelius" or "Buddha"\n- Any artist → "Leonardo da Vinci"\n- Any warrior/leader → "Joan of Arc"\n\nReturn only this JSON format: {"keywords": ["focused", "Steve Jobs"], "primaryIntent": "traits", "confidence": 0.9}\n\nPrimaryIntent options: "problems", "traits", "people", "habits", "unclear"`
          }],
          max_tokens: 100,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      try {
        // Strip markdown code blocks if present - EXACT copy from working debug endpoint
        let cleanContent = content.trim()
        
        // Remove opening ```json and closing ```
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.slice(7) // Remove '```json'
        }
        if (cleanContent.endsWith('```')) {
          cleanContent = cleanContent.slice(0, -3) // Remove closing '```'
        }
        
        cleanContent = cleanContent.trim()
        console.log('🔧 Original content:', content)
        console.log('🔧 Cleaned content:', cleanContent)
        
        const parsed = JSON.parse(cleanContent)
        console.log('✅ SUCCESS: Parsed JSON:', parsed)
        return parsed
      } catch (parseError) {
        console.log('🚨 JSON Parse Error:', parseError)
        console.log('🚨 Raw content:', content)
        throw new Error(`OpenRouter JSON parse failed: ${parseError}`)
      }

    } catch (error) {
      console.error('🚨 OpenRouter API call completely failed:', error)
      throw error
    }
  }

  /**
   * Generate AI response for character creation flow
   * Templates + light personalization to minimize cost
   */
  async generateResponse(
    context: {
      userInput: string
      extractedKeywords: string[]
      foundMatches: number
      selectedAttributes: number
    }
  ): Promise<AIResponse> {
    
    // AI should extract keywords first, then search handles the "found matches" logic
    console.log('🚨 generateResponse called with context:', context)
    throw new Error('generateResponse should not be called - keywords should be extracted first!')

    if (context.foundMatches === 1) {
      return {
        message: `Perfect! I found exactly what you're looking for. I've highlighted the top recommendation below - check the box if it resonates with you.`,
        keywords: context.extractedKeywords
      }
    }

    if (context.foundMatches > 1) {
      return {
        message: `Great! I found several approaches that could help with ${context.extractedKeywords.join(' and ')}. I've highlighted the strongest match, but you can explore the other options below. Pick up to 2 that resonate most.`,
        keywords: context.extractedKeywords
      }
    }

    // Default template
    return {
      message: `I'm analyzing your input and finding the best matches for your Lightwalker™...`,
      keywords: context.extractedKeywords
    }
  }

  /**
   * Simple fallback when AI service is unavailable
   * Basic keyword matching without API calls
   */
  private fallbackKeywordExtraction(userInput: string): KeywordExtractionResult {
    const input = userInput.toLowerCase()
    
    // Simple keyword matching
    const problemWords = ['distract', 'stress', 'overwhelm', 'anger', 'anxiety', 'procrastinat', 'focus problem', 'can\'t concentrate']
    const traitWords = ['focus', 'confidence', 'patience', 'wisdom', 'empathy', 'courage', 'discipline', 'forgiveness', 'forgiving']
    const peopleWords = ['jobs', 'buddha', 'einstein', 'gandhi', 'aurelius', 'mandela']
    
    const keywords: string[] = []
    let primaryIntent: KeywordExtractionResult['primaryIntent'] = 'unclear'
    
    // Extract matching keywords
    if (problemWords.some(word => input.includes(word))) {
      primaryIntent = 'problems'
      if (input.includes('distract') || input.includes('focus problem')) keywords.push('focus')
      if (input.includes('stress') || input.includes('overwhelm')) keywords.push('stress') 
      if (input.includes('anger')) keywords.push('anger')
      if (input.includes('procrastinat')) keywords.push('procrastination')
    }
    
    if (traitWords.some(word => input.includes(word))) {
      primaryIntent = 'traits'
      traitWords.forEach(trait => {
        if (input.includes(trait)) keywords.push(trait)
      })
    }
    
    if (peopleWords.some(word => input.includes(word))) {
      primaryIntent = 'people'
      peopleWords.forEach(person => {
        if (input.includes(person)) keywords.push(person)
      })
    }

    return {
      keywords: keywords.slice(0, 3), // Limit to 3 keywords
      primaryIntent,
      confidence: keywords.length > 0 ? 0.7 : 0.3
    }
  }

  /**
   * Generate opening conversation starter
   * Template-based to minimize costs
   */
  getOpeningMessage(): string {
    return `I'm excited to help build your ideal future self! 

What feels most natural for you to think about:

🎯 **Challenges you face** (distraction, overwhelm, anger, stress)
✨ **Strengths you want** (focus, patience, confidence, wisdom)  
🎭 **People you admire** (Steve Jobs, Buddha, Einstein)
📋 **Daily habits you wish you had** (meditation, planning, exercise)

Just describe what you're working on, and I'll find the perfect attributes for your Lightwalker™!`
  }
}

// Export singleton instance
export const aiService = new AIService()
export type { KeywordExtractionResult, AIResponse }