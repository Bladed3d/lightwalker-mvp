// AI Service for Lightwalker Character Creation
// Uses cost-effective Kimi K2 via Openrouter for MVP

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
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://lightwalker-mvp.vercel.app',
          'X-Title': 'Lightwalker Character Creation'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat', // Cost-effective alternative to Kimi K2
          messages: [{
            role: 'system',
            content: `You are a keyword extraction expert for a personal development app. 
            
Extract 1-3 key terms from user input and determine their primary intent:
- "problems": challenges they face (distraction, overwhelm, anger, stress)
- "traits": strengths they want (focus, patience, confidence, wisdom) 
- "people": specific individuals they admire
- "habits": daily actions they want to develop

Return ONLY a JSON object with this exact format:
{
  "keywords": ["focus", "work"],
  "primaryIntent": "traits", 
  "confidence": 0.85
}

Focus on extracting the core meaning, not filler words.`
          },
          {
            role: 'user',
            content: userInput
          }],
          max_tokens: 150,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      try {
        return JSON.parse(content)
      } catch (parseError) {
        // Fallback parsing if JSON is malformed
        return this.fallbackKeywordExtraction(userInput)
      }

    } catch (error) {
      console.error('AI keyword extraction failed:', error)
      return this.fallbackKeywordExtraction(userInput)
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
    
    // Use templates for cost efficiency, add light AI personalization
    if (context.foundMatches === 0) {
      return {
        message: `I'm not finding exact matches for "${context.userInput}". Try simpler terms like "focus", "stress", "confidence", or "patience". What specific challenge or strength would you like to work on?`,
        suggestions: ['focus', 'stress', 'confidence', 'patience', 'anger', 'empathy']
      }
    }

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
    const traitWords = ['focus', 'confidence', 'patience', 'wisdom', 'empathy', 'courage', 'discipline']
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