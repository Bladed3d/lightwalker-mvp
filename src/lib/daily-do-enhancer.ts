// Claude-Powered Activity Enhancement Engine
// Purpose: Transform abstract role model activities into concrete Daily-Do items
// Safety: Handles failures gracefully, validates all outputs

import { 
  DailyDoItem, 
  EnhancementPrompt, 
  EnhancementResponse, 
  EnhancementQuality,
  AttributeEnhancement,
  EnhancementError,
  ENHANCEMENT_CONSTANTS,
  isDailyDoItem 
} from '@/types/daily-do-types';

interface ClaudeApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class DailyDoEnhancer {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly model = 'anthropic/claude-3.5-sonnet';
  
  // Rate limiting and retry configuration
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds
  private readonly requestDelay = 1500; // 1.5 seconds between requests
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new EnhancementError(
        'OpenRouter API key not found',
        'MISSING_API_KEY'
      );
    }
  }

  /**
   * Enhance a single activity with Claude
   */
  async enhanceActivity(prompt: EnhancementPrompt): Promise<EnhancementResponse> {
    const startTime = Date.now();
    let retryCount = 0;
    
    while (retryCount < this.maxRetries) {
      try {
        // Build the Claude prompt
        const claudePrompt = this.buildEnhancementPrompt(prompt);
        
        // Call Claude API
        const response = await this.callClaude(claudePrompt);
        
        // Parse and validate response
        const dailyDoItems = await this.parseClaudeResponse(response);
        
        // Validate quality of enhancements
        const qualityChecks = dailyDoItems.map(item => 
          this.validateEnhancement(item)
        );
        
        const allPassQuality = qualityChecks.every(check => 
          check.qualityScore >= 0.8
        );
        
        if (!allPassQuality) {
          throw new EnhancementError(
            'Generated items failed quality validation',
            'QUALITY_VALIDATION_FAILED',
            { qualityChecks }
          );
        }
        
        // Success!
        return {
          success: true,
          dailyDoItems,
          metadata: {
            tokensUsed: response.usage?.total_tokens || 0,
            processingTime: Date.now() - startTime,
            retryCount
          }
        };
        
      } catch (error) {
        retryCount++;
        console.warn(`Enhancement attempt ${retryCount} failed:`, error);
        
        if (retryCount < this.maxRetries) {
          // Wait before retrying
          await this.sleep(this.retryDelay * retryCount);
        } else {
          // All retries exhausted
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: {
              tokensUsed: 0,
              processingTime: Date.now() - startTime,
              retryCount
            }
          };
        }
      }
    }
    
    // Should never reach here, but TypeScript requires it
    return {
      success: false,
      error: 'Unexpected enhancement failure',
      metadata: { tokensUsed: 0, processingTime: 0, retryCount }
    };
  }

  /**
   * Build the enhancement prompt for Claude
   */
  private buildEnhancementPrompt(prompt: EnhancementPrompt): string {
    return `Transform this abstract role model activity into 2-3 concrete Daily-Do actions that users can immediately perform.

ROLE MODEL: ${prompt.roleModel}
ATTRIBUTE: ${prompt.attribute}  
ABSTRACT METHOD: "${prompt.originalMethod}"

USER CONTEXT:
- Experience Level: ${prompt.context.userLevel}
- Available Time: ${prompt.context.availableTime}
- Style Preference: ${prompt.context.preferredStyle}

CRITICAL REQUIREMENTS:
1. Each action must be IMMEDIATELY doable (no setup, no planning phase)
2. Clear success criteria so user knows when they've completed it
3. Specific tools/materials if needed (pen, paper, timer, phone, etc.)
4. First-person language ("I write down..." not "Write down...")
5. Concrete verb + specific object (not vague concepts like "think about")

DIFFICULTY SCALE (1-9):
- 1-3: Simple actions requiring minimal effort (breathing, basic writing, observation)
- 4-6: Moderate actions requiring focus or decision-making (planning, conversation, analysis)
- 7-9: Complex actions requiring significant mental energy or courage (difficult conversations, major decisions, challenging self-reflection)

DURATION GUIDELINES:
- ${prompt.context.availableTime === "2-5min" ? "Focus on quick, simple actions" : ""}
- ${prompt.context.availableTime === "5-15min" ? "Include moderate complexity actions" : ""}
- ${prompt.context.availableTime === "15-30min" ? "Can include more involved processes" : ""}

RETURN FORMAT (Valid JSON only):
{
  "dailyDoItems": [
    {
      "id": "unique-id-001",
      "action": "I write down exactly 10 current tasks on a piece of paper using a pen",
      "difficulty": 2,
      "duration": "3-5 minutes", 
      "timeOfDay": "morning",
      "category": "planning",
      "successCriteria": "I have a physical list with exactly 10 written items",
      "gamePoints": 2
    },
    {
      "id": "unique-id-002", 
      "action": "I set a 2-minute timer and ask myself 'Does this move my mission forward?' for each of the 3 highest priorities",
      "difficulty": 4,
      "duration": "2-3 minutes",
      "timeOfDay": "morning",
      "category": "decision-making",
      "successCriteria": "Each priority has a clear yes/no mission alignment answer",
      "gamePoints": 4
    }
  ]
}

IMPORTANT: 
- Make ${prompt.roleModel}'s wisdom immediately actionable in daily life
- Each action should feel like something ${prompt.roleModel} would actually do
- Success criteria must be observable and measurable
- Game points should equal difficulty rating
- Generate 2-3 items maximum (never more)
- Return ONLY the JSON object, no additional text

Focus on making the abstract wisdom of ${prompt.roleModel} concrete and immediately doable.`;
  }

  /**
   * Call Claude API through OpenRouter
   */
  private async callClaude(prompt: string): Promise<ClaudeApiResponse> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lightwalker-mvp.vercel.app',
        'X-Title': 'Lightwalker Daily-Do Enhancement'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent formatting
        top_p: 1.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new EnhancementError(
        `Claude API request failed: ${response.status} ${response.statusText}`,
        'API_REQUEST_FAILED',
        { status: response.status, body: errorText }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new EnhancementError(
        'Invalid Claude API response format',
        'INVALID_API_RESPONSE',
        { response: data }
      );
    }

    return data;
  }

  /**
   * Parse Claude's JSON response into DailyDoItem objects
   */
  private async parseClaudeResponse(response: ClaudeApiResponse): Promise<DailyDoItem[]> {
    const content = response.choices[0].message.content.trim();
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(content);
      
      if (!parsed.dailyDoItems || !Array.isArray(parsed.dailyDoItems)) {
        throw new EnhancementError(
          'Response missing dailyDoItems array',
          'INVALID_RESPONSE_STRUCTURE'
        );
      }
      
      // Validate each item
      const validItems: DailyDoItem[] = [];
      
      for (const item of parsed.dailyDoItems) {
        if (isDailyDoItem(item)) {
          validItems.push(item);
        } else {
          console.warn('Invalid Daily-Do item:', item);
        }
      }
      
      if (validItems.length === 0) {
        throw new EnhancementError(
          'No valid Daily-Do items in response',
          'NO_VALID_ITEMS'
        );
      }
      
      if (validItems.length > ENHANCEMENT_CONSTANTS.MAX_DAILY_DO_ITEMS_PER_ATTRIBUTE) {
        // Trim to max allowed
        return validItems.slice(0, ENHANCEMENT_CONSTANTS.MAX_DAILY_DO_ITEMS_PER_ATTRIBUTE);
      }
      
      return validItems;
      
    } catch (parseError) {
      throw new EnhancementError(
        'Failed to parse Claude response as JSON',
        'JSON_PARSE_ERROR',
        { content, parseError }
      );
    }
  }

  /**
   * Validate the quality of a single Daily-Do item
   */
  private validateEnhancement(item: DailyDoItem): EnhancementQuality {
    const issues: string[] = [];
    let score = 1.0; // Start with perfect score

    // Check for concrete verbs
    const concreteVerbs = ['write', 'set', 'call', 'walk', 'read', 'create', 'ask', 'choose', 'draw', 'speak'];
    const hasConcreteVerbs = concreteVerbs.some(verb => 
      item.action.toLowerCase().includes(verb)
    );
    if (!hasConcreteVerbs) {
      issues.push('Action lacks concrete verbs');
      score -= 0.2;
    }

    // Check for first-person language
    const usesFirstPerson = item.action.toLowerCase().startsWith('i ');
    if (!usesFirstPerson) {
      issues.push('Action not in first-person format');
      score -= 0.2;
    }

    // Check success criteria quality
    const hasSuccessCriteria = !!(item.successCriteria && item.successCriteria.length > 10);
    if (!hasSuccessCriteria) {
      issues.push('Success criteria too vague or missing');
      score -= 0.2;
    }

    // Check difficulty rating
    const hasDifficultyRating = item.difficulty >= 1 && item.difficulty <= 9;
    if (!hasDifficultyRating) {
      issues.push('Invalid difficulty rating');
      score -= 0.1;
    }

    // Check duration reasonableness
    const reasonableDurations = ENHANCEMENT_CONSTANTS.DURATION_OPTIONS as readonly string[];
    const hasReasonableDuration = reasonableDurations.includes(item.duration);
    if (!hasReasonableDuration) {
      issues.push('Unusual duration format');
      score -= 0.1;
    }

    // Check that action is immediately doable (no setup words)
    const setupWords = ['first', 'prepare', 'plan', 'organize', 'setup', 'arrange'];
    const isImmediatelyDoable = !setupWords.some(word => 
      item.action.toLowerCase().includes(word)
    );
    if (!isImmediatelyDoable) {
      issues.push('Action requires setup or preparation');
      score -= 0.2;
    }

    return {
      hasConcreteVerbs,
      hasSuccessCriteria,
      isImmediatelyDoable,
      usesFirstPerson,
      hasDifficultyRating,
      hasReasonableDuration,
      qualityScore: Math.max(0, score),
      issues
    };
  }

  /**
   * Create an AttributeEnhancement from successful enhancement response
   */
  createAttributeEnhancement(
    attributeId: string,
    originalMethod: string,
    dailyDoItems: DailyDoItem[]
  ): AttributeEnhancement {
    const difficulties = dailyDoItems.map(item => item.difficulty);
    const totalPoints = dailyDoItems.reduce((sum, item) => sum + item.gamePoints, 0);

    return {
      attributeId,
      originalMethod,
      dailyDoItems,
      enhancedAt: new Date().toISOString(),
      enhancedVersion: "1.0",
      difficultyRange: {
        min: Math.min(...difficulties),
        max: Math.max(...difficulties),
        average: difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length
      },
      totalGamePoints: totalPoints
    };
  }

  /**
   * Rate limiting helper
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Apply rate limiting between requests
   */
  async applyRateLimit(): Promise<void> {
    await this.sleep(this.requestDelay);
  }

  /**
   * Validate that enhancement prompt is properly formed
   */
  validatePrompt(prompt: EnhancementPrompt): boolean {
    return !!(
      prompt.roleModel &&
      prompt.attribute &&
      prompt.originalMethod &&
      prompt.context.userLevel &&
      prompt.context.availableTime &&
      prompt.context.preferredStyle
    );
  }
}

// Export a singleton instance for use throughout the app
export const dailyDoEnhancer = new DailyDoEnhancer();

// Export error types for error handling
export { EnhancementError };

// Export utility functions
export function generateUniqueId(roleModel: string, attribute: string, index: number): string {
  // Generate short, unique IDs like "sj-sf-001" (Steve Jobs - Strategic Focus - Item 1)
  const roleCode = roleModel
    .split(' ')
    .map(word => word[0].toLowerCase())
    .join('');
  
  const attrCode = attribute
    .split(' ')
    .map(word => word[0].toLowerCase())
    .join('')
    .substring(0, 2);
  
  return `${roleCode}-${attrCode}-${String(index + 1).padStart(3, '0')}`;
}

export function categorizeDifficulty(difficulty: number): 'easy' | 'moderate' | 'challenging' {
  if (difficulty <= ENHANCEMENT_CONSTANTS.DIFFICULTY_SCALE.EASY_THRESHOLD) {
    return 'easy';
  } else if (difficulty <= ENHANCEMENT_CONSTANTS.DIFFICULTY_SCALE.MODERATE_THRESHOLD) {
    return 'moderate';
  } else {
    return 'challenging';
  }
}

export function estimateEnhancementTime(activityCount: number): number {
  // Estimate total time needed including rate limiting and retries
  const baseTimePerActivity = 8; // seconds per activity (including API call)
  const rateLimitBuffer = 2; // seconds between calls
  const retryBuffer = 1.3; // 30% buffer for retries
  
  return Math.ceil((activityCount * (baseTimePerActivity + rateLimitBuffer)) * retryBuffer);
}