# Template System Architecture - Enhanced
## Lightwalker™ Technical Implementation Design

**Lead Programmer Agent Deliverable**  
**Date**: July 25, 2025  
**Building on**: Sprint 1 architecture decisions, database schema, tRPC patterns  
**Purpose**: Design technical architecture for Lightwalker™ template personality system

---

## Executive Summary

This architecture enhances Sprint 1's proven technical foundation to support Lightwalker™'s template personality system. The design ensures consistent AI personalities across conversations while maintaining cost efficiency and system performance through intelligent prompt engineering and caching strategies.

**Architecture Philosophy**: Extend Sprint 1 patterns rather than rebuild  
**Performance Target**: Template personality consistency with <5 second response times  
**Cost Optimization**: Smart model selection and response caching to maintain <$2.50/user/month

---

## System Architecture Overview

### **Integration with Sprint 1 Foundation**

**Existing Sprint 1 Infrastructure** (direct reuse):
```typescript
// Sprint 1 foundation that Lightwalker extends
interface Sprint1Foundation {
  authentication: {
    wordpressJWT: boolean;
    sessionManagement: boolean;
    userPreferences: boolean;
  };
  database: {
    postgresql: boolean;
    prismaORM: boolean;
    userManagement: boolean;
    conversationHistory: boolean;
  };
  aiIntegration: {
    openaiAPI: boolean;
    costTracking: boolean;
    modelSelection: boolean;
    errorHandling: boolean;
  };
  deployment: {
    vercelPlatform: boolean;
    supabaseDatabase: boolean;
    realtimeFeatures: boolean;
  };
}
```

**Lightwalker Extensions** (new systems building on Sprint 1):
```typescript
interface LightwalkerExtensions {
  templateSystem: {
    personalityEngine: TemplatePersonalityEngine;
    consistencyManager: PersonalityConsistencyManager;
    customizationEngine: TemplateCustomizationEngine;
    routineScheduler: DailyRoutineScheduler;
  };
  progressTracking: {
    activityLogger: CopyingActivityLogger;
    metricsCalculator: ProgressMetricsCalculator;
    chartDataGenerator: ChartDataGenerator;
  };
  notificationSystem: {
    scheduleManager: NotificationScheduleManager;
    contentGenerator: NotificationContentGenerator;
    deliveryEngine: NotificationDeliveryEngine;
  };
}
```

### **Enhanced Database Schema** (extending Sprint 1)

**Sprint 1 Tables** (reused directly):
```sql
-- Existing Sprint 1 tables that Lightwalker leverages
users (id, email, wordpress_id, preferences, created_at, updated_at)
conversations (id, user_id, title, created_at, updated_at, message_count)
messages (id, conversation_id, role, content, model_used, tokens, cost, created_at)
ai_usage_logs (id, user_id, model, tokens, cost_usd, created_at)
```

**New Lightwalker Tables** (extending Sprint 1 schema):
```sql
-- Template personality definitions
CREATE TABLE lightwalker_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  tagline VARCHAR(200),
  description TEXT NOT NULL,
  personality_prompt TEXT NOT NULL, -- Core AI personality prompt
  communication_style JSONB NOT NULL, -- Tone, language patterns, etc.
  core_traits VARCHAR[] NOT NULL,
  daily_routines JSONB NOT NULL, -- Structured daily activity schedules
  challenge_responses JSONB NOT NULL, -- How template handles specific challenges
  sample_activities TEXT[] NOT NULL,
  icon VARCHAR(10) DEFAULT '✨',
  color_scheme JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User's personalized Lightwalker instance
CREATE TABLE user_lightwalkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES lightwalker_templates(id),
  custom_name VARCHAR(100), -- User's name for their Lightwalker
  customizations JSONB, -- User-specific personality adjustments
  problem_focus TEXT, -- Main challenge user wants to address
  creation_completed_at TIMESTAMP,
  last_interaction_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, is_active) WHERE is_active = true -- One active Lightwalker per user
);

-- Enhanced conversation tracking for templates
CREATE TABLE lightwalker_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_lightwalker_id UUID REFERENCES user_lightwalkers(id),
  personality_version INTEGER DEFAULT 1, -- Track personality prompt versions
  consistency_score DECIMAL(3,2), -- AI personality consistency rating
  created_at TIMESTAMP DEFAULT NOW()
);

-- Template personality consistency tracking
CREATE TABLE personality_consistency_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id),
  template_id UUID REFERENCES lightwalker_templates(id),
  consistency_score DECIMAL(3,2), -- 0.00-1.00 consistency rating
  detected_traits VARCHAR[], -- AI-detected personality traits in response
  deviation_notes TEXT, -- Issues with personality consistency
  created_at TIMESTAMP DEFAULT NOW()
);

-- Copying activity tracking
CREATE TABLE copying_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_lightwalker_id UUID REFERENCES user_lightwalkers(id),
  activity_description TEXT NOT NULL,
  activity_type VARCHAR(50), -- 'morning_routine', 'decision_making', etc.
  template_source VARCHAR(100), -- Which template inspired this
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  date_copied DATE NOT NULL DEFAULT CURRENT_DATE,
  time_logged TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Progress metrics calculation cache
CREATE TABLE progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  daily_activity_count INTEGER DEFAULT 0,
  consistency_score DECIMAL(5,2) DEFAULT 0, -- 0-100 percentage
  weekly_average DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  activity_diversity INTEGER DEFAULT 0, -- Number of different activity types
  calculated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Notification scheduling
CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_lightwalker_id UUID REFERENCES user_lightwalkers(id),
  notification_type VARCHAR(50) NOT NULL, -- 'morning_routine', 'afternoon_update', etc.
  scheduled_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  message_template TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_lightwalkers_user_active ON user_lightwalkers(user_id, is_active);
CREATE INDEX idx_copying_activities_user_date ON copying_activities(user_id, date_copied);
CREATE INDEX idx_progress_metrics_user_date ON progress_metrics(user_id, date);
CREATE INDEX idx_notification_schedules_time ON notification_schedules(scheduled_time, is_active);
CREATE INDEX idx_personality_consistency_template ON personality_consistency_logs(template_id, consistency_score);
```

---

## Template Personality Engine

### **Core Personality Management**

**Template Personality Interface**:
```typescript
interface TemplatePersonality {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  description: string;
  personalityPrompt: string;
  communicationStyle: {
    tone: 'encouraging' | 'direct' | 'gentle' | 'enthusiastic' | 'calm';
    energyLevel: 'high' | 'moderate' | 'calm' | 'variable';
    sharingStyle: 'detailed' | 'brief' | 'story-based' | 'practical';
    languagePatterns: string[];
    forbiddenPhrases: string[];
  };
  coreTraits: string[];
  dailyRoutines: DailyRoutineSchedule;
  challengeResponses: Record<string, ChallengeResponsePattern>;
  sampleActivities: string[];
  visualIdentity: {
    icon: string;
    colorScheme: TemplateColorScheme;
  };
}

interface DailyRoutineSchedule {
  morning: RoutineActivity[];
  afternoon: RoutineActivity[];
  evening: RoutineActivity[];
  weekend: RoutineActivity[];
}

interface RoutineActivity {
  time: string; // "06:00", "14:30", etc.
  activity: string;
  description: string;
  sharingTemplate: string; // How the template shares this activity
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly';
}

interface ChallengeResponsePattern {
  challengeType: string; // 'stress', 'confidence', 'motivation', etc.
  responsePattern: string;
  exampleResponses: string[];
  escalationGuidance: string;
}
```

**Template Storage and Retrieval** (extending Sprint 1 patterns):
```typescript
// Building on Sprint 1 database patterns
class TemplatePersonalityManager {
  constructor(
    private db: PrismaClient, // Sprint 1 database connection
    private aiService: AIService // Sprint 1 AI service
  ) {}

  async getTemplate(templateId: string): Promise<TemplatePersonality> {
    const template = await this.db.lightwalkerTemplate.findUnique({
      where: { id: templateId },
      include: {
        userLightwalkers: {
          where: { isActive: true },
          select: { customizations: true }
        }
      }
    });

    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    return this.mapToTemplatePersonality(template);
  }

  async createUserLightwalker(
    userId: string,
    templateId: string,
    customizations: TemplateCustomizations
  ): Promise<UserLightwalker> {
    // Deactivate any existing Lightwalker for this user
    await this.db.userLightwalker.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false }
    });

    // Create new Lightwalker with customizations
    const userLightwalker = await this.db.userLightwalker.create({
      data: {
        userId,
        templateId,
        customName: customizations.customName,
        customizations: customizations,
        problemFocus: customizations.problemFocus,
        creationCompletedAt: new Date(),
        isActive: true
      },
      include: {
        template: true,
        user: true
      }
    });

    // Set up default notification schedule
    await this.setupDefaultNotificationSchedule(userLightwalker);

    return userLightwalker;
  }

  private async setupDefaultNotificationSchedule(
    userLightwalker: UserLightwalker
  ): Promise<void> {
    const template = userLightwalker.template;
    const defaultSchedules = this.generateDefaultSchedules(template);

    await this.db.notificationSchedule.createMany({
      data: defaultSchedules.map(schedule => ({
        userId: userLightwalker.userId,
        userLightwalkerId: userLightwalker.id,
        notificationType: schedule.type,
        scheduledTime: schedule.time,
        timezone: userLightwalker.user.timezone || 'UTC',
        messageTemplate: schedule.template,
        isActive: true
      }))
    });
  }
}
```

### **AI Prompt Engineering for Consistency**

**Dynamic Prompt Generation** (building on Sprint 1 AI patterns):
```typescript
class PersonalityPromptEngine {
  constructor(private aiService: AIService) {}

  generateSystemPrompt(
    template: TemplatePersonality,
    userCustomizations: TemplateCustomizations,
    conversationContext: ConversationContext
  ): string {
    const basePrompt = this.buildBasePersonalityPrompt(template);
    const customizationLayer = this.buildCustomizationLayer(userCustomizations);
    const contextLayer = this.buildContextLayer(conversationContext);
    const consistencyGuards = this.buildConsistencyGuards(template);

    return `${basePrompt}\n\n${customizationLayer}\n\n${contextLayer}\n\n${consistencyGuards}`;
  }

  private buildBasePersonalityPrompt(template: TemplatePersonality): string {
    return `
You are ${template.displayName}, a ${template.description}

CORE PERSONALITY TRAITS:
${template.coreTraits.map(trait => `- ${trait}`).join('\n')}

COMMUNICATION STYLE:
- Tone: ${template.communicationStyle.tone}
- Energy Level: ${template.communicationStyle.energyLevel}
- Sharing Style: ${template.communicationStyle.sharingStyle}

KEY LANGUAGE PATTERNS:
${template.communicationStyle.languagePatterns.map(pattern => `- "${pattern}"`).join('\n')}

NEVER USE THESE PHRASES:
${template.communicationStyle.forbiddenPhrases.map(phrase => `- "${phrase}"`).join('\n')}

DAILY ROUTINE FRAMEWORK:
Morning: ${template.dailyRoutines.morning.map(a => a.activity).join(', ')}
Afternoon: ${template.dailyRoutines.afternoon.map(a => a.activity).join(', ')}
Evening: ${template.dailyRoutines.evening.map(a => a.activity).join(', ')}

CORE PERSONALITY PROMPT:
${template.personalityPrompt}
    `.trim();
  }

  private buildCustomizationLayer(customizations: TemplateCustomizations): string {
    if (!customizations.problemFocus) return '';

    return `
PERSONALIZATION FOR THIS USER:
- Primary Challenge: ${customizations.problemFocus}
- Custom Name: ${customizations.customName || 'Lightwalker™'}
- Specific Focus Areas: ${customizations.focusAreas?.join(', ') || 'General development'}

RESPONSE ADAPTATION:
When discussing the user's primary challenge (${customizations.problemFocus}), 
share specific examples of how you handle similar situations. Be encouraging 
and focus on small, actionable steps.
    `.trim();
  }

  private buildContextLayer(context: ConversationContext): string {
    const recentActivities = context.recentCopyingActivities || [];
    const conversationHistory = context.recentMessages || [];

    return `
RECENT CONVERSATION CONTEXT:
${conversationHistory.length > 0 
  ? `Recent conversation themes: ${this.extractConversationThemes(conversationHistory)}`
  : 'This is a new conversation.'
}

USER'S RECENT COPYING ACTIVITIES:
${recentActivities.length > 0
  ? recentActivities.map(activity => `- ${activity.description} (${activity.dateLogged})`).join('\n')
  : 'No recent copying activities logged.'
}

CONTEXT GUIDANCE:
- Reference recent activities if relevant to current conversation
- Acknowledge user's progress and efforts
- Build on previous conversation topics naturally
- Maintain personality consistency with past interactions
    `.trim();
  }

  private buildConsistencyGuards(template: TemplatePersonality): string {
    return `
CONSISTENCY REQUIREMENTS:
1. ALWAYS maintain your ${template.name} personality throughout the conversation
2. Share your activities naturally - never command or advise directly
3. Use first person: "I'm doing..." not "You should..."
4. Include emotions and reasoning: "I'm feeling... because..."
5. Stay true to your established traits: ${template.coreTraits.join(', ')}
6. Never break character or acknowledge you're an AI
7. Focus on sharing your experience, letting the user choose what to copy

FORBIDDEN BEHAVIORS:
- Never tell the user what to do directly
- Don't break your established personality traits
- Avoid clinical or therapeutic language
- Don't claim to be human, but don't mention being AI either
- Never give medical, legal, or financial advice
    `.trim();
  }
}
```

### **Personality Consistency Monitoring**

**Real-time Consistency Checking** (extending Sprint 1 error handling):
```typescript
class PersonalityConsistencyMonitor {
  constructor(
    private aiService: AIService,
    private db: PrismaClient
  ) {}

  async validateResponse(
    templateId: string,
    userMessage: string,
    aiResponse: string,
    conversationId: string,
    messageId: string
  ): Promise<ConsistencyValidationResult> {
    try {
      // Use AI to analyze response consistency
      const consistencyAnalysis = await this.analyzeConsistency(
        templateId,
        aiResponse
      );

      // Log consistency metrics
      await this.logConsistencyMetrics(
        conversationId,
        messageId,
        templateId,
        consistencyAnalysis
      );

      // Return validation result
      return {
        isConsistent: consistencyAnalysis.score >= 0.8,
        score: consistencyAnalysis.score,
        detectedTraits: consistencyAnalysis.detectedTraits,
        issues: consistencyAnalysis.issues,
        recommendedActions: this.getRecommendedActions(consistencyAnalysis)
      };

    } catch (error) {
      // Fall back gracefully if consistency checking fails
      console.error('Consistency validation failed:', error);
      return {
        isConsistent: true, // Assume consistent if validation fails
        score: 1.0,
        detectedTraits: [],
        issues: [],
        recommendedActions: []
      };
    }
  }

  private async analyzeConsistency(
    templateId: string,
    response: string
  ): Promise<ConsistencyAnalysis> {
    const template = await this.db.lightwalkerTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const analysisPrompt = `
Analyze this response for consistency with the ${template.name} personality:

EXPECTED TRAITS: ${template.coreTraits.join(', ')}
EXPECTED TONE: ${(template.communicationStyle as any).tone}
EXPECTED STYLE: ${(template.communicationStyle as any).sharingStyle}

RESPONSE TO ANALYZE:
"${response}"

Return a JSON analysis with:
- score: 0.0-1.0 (personality consistency rating)
- detectedTraits: array of personality traits found in the response
- issues: array of consistency problems found
- explanation: brief explanation of the analysis

Focus on whether the response maintains the personality's established characteristics.
    `;

    const analysis = await this.aiService.generateResponse(
      analysisPrompt,
      { model: 'gpt-3.5-turbo', maxTokens: 300 }
    );

    return JSON.parse(analysis);
  }

  private async logConsistencyMetrics(
    conversationId: string,
    messageId: string,
    templateId: string,
    analysis: ConsistencyAnalysis
  ): Promise<void> {
    await this.db.personalityConsistencyLog.create({
      data: {
        conversationId,
        messageId,
        templateId,
        consistencyScore: analysis.score,
        detectedTraits: analysis.detectedTraits,
        deviationNotes: analysis.issues.join('; ')
      }
    });
  }
}

interface ConsistencyValidationResult {
  isConsistent: boolean;
  score: number;
  detectedTraits: string[];
  issues: string[];
  recommendedActions: string[];
}

interface ConsistencyAnalysis {
  score: number;
  detectedTraits: string[];
  issues: string[];
  explanation: string;
}
```

---

## Template Customization Engine

### **Problem-First Customization System**

**Customization Logic** (building on Sprint 1 user management):
```typescript
interface TemplateCustomizations {
  customName?: string;
  problemFocus: string; // User's main challenge
  focusAreas?: string[]; // Specific areas to emphasize
  communicationPreferences?: {
    frequency: 'high' | 'medium' | 'low';
    style: 'detailed' | 'brief' | 'encouraging' | 'direct';
    timing: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };
  personalityAdjustments?: Record<string, any>;
}

class TemplateCustomizationEngine {
  constructor(
    private aiService: AIService,
    private templateManager: TemplatePersonalityManager
  ) {}

  async customizeTemplate(
    templateId: string,
    userId: string,
    customizationInput: CustomizationInput
  ): Promise<TemplateCustomizations> {
    const baseTemplate = await this.templateManager.getTemplate(templateId);
    
    // Analyze user's problem focus
    const problemAnalysis = await this.analyzeProblemFocus(
      customizationInput.problemDescription,
      baseTemplate
    );

    // Generate customizations
    const customizations: TemplateCustomizations = {
      customName: customizationInput.customName || baseTemplate.displayName,
      problemFocus: customizationInput.problemDescription,
      focusAreas: problemAnalysis.suggestedFocusAreas,
      communicationPreferences: {
        frequency: customizationInput.preferredFrequency || 'medium',
        style: this.determineOptimalStyle(problemAnalysis, baseTemplate),
        timing: customizationInput.preferredTiming || 'flexible'
      },
      personalityAdjustments: this.generatePersonalityAdjustments(
        problemAnalysis,
        baseTemplate
      )
    };

    return customizations;
  }

  private async analyzeProblemFocus(
    problemDescription: string,
    template: TemplatePersonality
  ): Promise<ProblemAnalysis> {
    const analysisPrompt = `
Analyze this user's challenge and suggest how the ${template.name} template can be customized to help:

USER'S CHALLENGE: "${problemDescription}"

TEMPLATE STRENGTHS: ${template.coreTraits.join(', ')}

Provide a JSON response with:
- challengeCategory: primary category of the challenge
- suggestedFocusAreas: 2-3 specific areas the template should emphasize
- personalityEmphasis: which template traits are most relevant
- dailyActivities: specific activities from the template's routine that would help
- customizationStrategy: how to adapt the template's communication for this challenge

Focus on practical, actionable customizations.
    `;

    const analysis = await this.aiService.generateResponse(
      analysisPrompt,
      { model: 'gpt-4', maxTokens: 500 }
    );

    return JSON.parse(analysis);
  }

  private determineOptimalStyle(
    problemAnalysis: ProblemAnalysis,
    template: TemplatePersonality
  ): string {
    // Logic to determine communication style based on problem type
    const challengeCategory = problemAnalysis.challengeCategory;
    
    if (challengeCategory === 'confidence' || challengeCategory === 'anxiety') {
      return 'encouraging';
    } else if (challengeCategory === 'productivity' || challengeCategory === 'organization') {
      return 'direct';
    } else if (challengeCategory === 'stress' || challengeCategory === 'overwhelm') {
      return 'brief';
    }
    
    return template.communicationStyle.sharingStyle;
  }

  private generatePersonalityAdjustments(
    problemAnalysis: ProblemAnalysis,
    template: TemplatePersonality
  ): Record<string, any> {
    return {
      emphasizedTraits: problemAnalysis.personalityEmphasis,
      prioritizedActivities: problemAnalysis.dailyActivities,
      responseModifications: {
        challengeHandling: problemAnalysis.customizationStrategy,
        supportiveLanguage: this.generateSupportiveLanguage(problemAnalysis),
        specificExamples: this.generateSpecificExamples(problemAnalysis, template)
      }
    };
  }
}

interface CustomizationInput {
  problemDescription: string;
  customName?: string;
  preferredFrequency?: 'high' | 'medium' | 'low';
  preferredTiming?: 'morning' | 'afternoon' | 'evening' | 'flexible';
}

interface ProblemAnalysis {
  challengeCategory: string;
  suggestedFocusAreas: string[];
  personalityEmphasis: string[];
  dailyActivities: string[];
  customizationStrategy: string;
}
```

---

## Integration with Sprint 1 AI System

### **Enhanced Model Selection** (extending Sprint 1 patterns)

**Template-Aware Model Selection**:
```typescript
// Building on Sprint 1 AI service
class LightwalkerAIService extends Sprint1AIService {
  async generateTemplateResponse(
    templateId: string,
    userMessage: string,
    conversationContext: ConversationContext,
    userCustomizations: TemplateCustomizations
  ): Promise<TemplateResponse> {
    try {
      // Get template personality
      const template = await this.templateManager.getTemplate(templateId);
      
      // Determine optimal model based on complexity
      const complexity = this.analyzeMessageComplexity(userMessage, conversationContext);
      const selectedModel = this.selectOptimalModel(complexity, template);
      
      // Generate personality-consistent prompt
      const systemPrompt = this.promptEngine.generateSystemPrompt(
        template,
        userCustomizations,
        conversationContext
      );

      // Generate response with personality consistency
      const response = await this.generateResponse(
        userMessage,
        {
          model: selectedModel,
          systemPrompt,
          maxTokens: this.getMaxTokensForTemplate(template),
          temperature: this.getTemperatureForTemplate(template)
        }
      );

      // Validate personality consistency
      const consistencyValidation = await this.consistencyMonitor.validateResponse(
        templateId,
        userMessage,
        response.content,
        conversationContext.conversationId,
        response.messageId
      );

      // Log usage and costs (extending Sprint 1 patterns)
      await this.logAIUsage({
        userId: conversationContext.userId,
        templateId,
        model: selectedModel,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        cost: response.cost,
        consistencyScore: consistencyValidation.score
      });

      return {
        content: response.content,
        model: selectedModel,
        consistency: consistencyValidation,
        cost: response.cost,
        usage: response.usage
      };

    } catch (error) {
      // Enhanced error handling for template failures
      throw new TemplateResponseError(
        `Failed to generate response for template ${templateId}`,
        error,
        { templateId, userId: conversationContext.userId }
      );
    }
  }

  private selectOptimalModel(
    complexity: MessageComplexity,
    template: TemplatePersonality
  ): AIModel {
    // Use Sprint 1 model selection as base, enhance for templates
    const baseModel = super.selectModel(complexity);

    // Template-specific model preferences
    if (template.name === 'confident-leader' && complexity.hasDecisionMaking) {
      return 'gpt-4'; // Leaders need sophisticated decision analysis
    }

    if (template.name === 'creative-inspired' && complexity.hasCreativeElement) {
      return 'gpt-4'; // Creative responses benefit from advanced model
    }

    if (complexity.isRoutineQuery && !complexity.hasEmotionalContent) {
      return 'gpt-3.5-turbo'; // Simple routine sharing can use faster model
    }

    return baseModel;
  }

  private getMaxTokensForTemplate(template: TemplatePersonality): number {
    // Adjust response length based on template communication style
    switch (template.communicationStyle.sharingStyle) {
      case 'detailed': return 300;
      case 'brief': return 150;
      case 'story-based': return 250;
      case 'practical': return 200;
      default: return 200;
    }
  }

  private getTemperatureForTemplate(template: TemplatePersonality): number {
    // Adjust creativity based on template personality
    switch (template.name) {
      case 'creative-inspired': return 0.9; // High creativity
      case 'organized-productive': return 0.3; // Low creativity, high consistency
      case 'calm-centered': return 0.5; // Balanced approach
      default: return 0.7; // Default balanced creativity
    }
  }
}
```

### **Conversation Context Management**

**Enhanced Context Tracking** (building on Sprint 1 conversation system):
```typescript
interface ConversationContext {
  conversationId: string;
  userId: string;
  templateId: string;
  recentMessages: Message[];
  recentCopyingActivities: CopyingActivity[];
  userPreferences: UserPreferences;
  sessionMetadata: {
    startTime: Date;
    messageCount: number;
    lastActivity: Date;
  };
}

class ConversationContextManager {
  constructor(private db: PrismaClient) {}

  async buildContext(
    conversationId: string,
    userId: string,
    templateId: string
  ): Promise<ConversationContext> {
    // Get recent messages (extending Sprint 1 patterns)
    const recentMessages = await this.db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        conversation: true
      }
    });

    // Get recent copying activities
    const recentActivities = await this.db.copyingActivity.findMany({
      where: { 
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get user preferences (from Sprint 1)
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { preferences: true }
    });

    return {
      conversationId,
      userId,
      templateId,
      recentMessages: recentMessages.reverse(), // Chronological order
      recentCopyingActivities: recentActivities,
      userPreferences: user?.preferences || {},
      sessionMetadata: {
        startTime: new Date(),
        messageCount: recentMessages.length,
        lastActivity: recentMessages[0]?.createdAt || new Date()
      }
    };
  }

  async updateContext(
    context: ConversationContext,
    newMessage: Message
  ): Promise<ConversationContext> {
    // Add new message to context
    context.recentMessages.push(newMessage);
    
    // Keep only last 10 messages
    if (context.recentMessages.length > 10) {
      context.recentMessages = context.recentMessages.slice(-10);
    }

    // Update session metadata
    context.sessionMetadata.messageCount++;
    context.sessionMetadata.lastActivity = new Date();

    return context;
  }
}
```

---

## Performance Optimization and Caching

### **Template Response Caching**

**Intelligent Caching Strategy** (extending Sprint 1 optimization):
```typescript
class TemplateResponseCache {
  constructor(
    private redis: RedisClient, // From Sprint 1 infrastructure
    private ttl: number = 3600 // 1 hour default TTL
  ) {}

  async getCachedResponse(
    templateId: string,
    messageType: string,
    userContext: string
  ): Promise<CachedResponse | null> {
    const cacheKey = this.generateCacheKey(templateId, messageType, userContext);
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        
        // Check if cache is still valid
        if (this.isCacheValid(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }

    return null;
  }

  async setCachedResponse(
    templateId: string,
    messageType: string,
    userContext: string,
    response: TemplateResponse,
    customTTL?: number
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(templateId, messageType, userContext);
    const cacheData: CachedResponse = {
      response: response.content,
      model: response.model,
      cachedAt: new Date(),
      templateId,
      messageType
    };

    try {
      await this.redis.setex(
        cacheKey,
        customTTL || this.ttl,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  private generateCacheKey(
    templateId: string,
    messageType: string,
    userContext: string
  ): string {
    // Create deterministic cache key
    const contextHash = crypto
      .createHash('md5')
      .update(userContext)
      .digest('hex')
      .substring(0, 8);
    
    return `template:${templateId}:${messageType}:${contextHash}`;
  }

  private isCacheValid(cached: CachedResponse): boolean {
    const age = Date.now() - new Date(cached.cachedAt).getTime();
    return age < (this.ttl * 1000);
  }
}

interface CachedResponse {
  response: string;
  model: string;
  cachedAt: Date;
  templateId: string;
  messageType: string;
}
```

### **Database Query Optimization**

**Optimized Template Queries** (building on Sprint 1 database patterns):
```typescript
class OptimizedTemplateQueries {
  constructor(private db: PrismaClient) {}

  // Optimized query for active user Lightwalker with template
  async getUserLightwalkerWithTemplate(userId: string): Promise<UserLightwalkerWithTemplate | null> {
    return await this.db.userLightwalker.findFirst({
      where: { 
        userId, 
        isActive: true 
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            displayName: true,
            personalityPrompt: true,
            communicationStyle: true,
            coreTraits: true,
            dailyRoutines: true,
            challengeResponses: true
          }
        },
        user: {
          select: {
            id: true,
            preferences: true,
            timezone: true
          }
        }
      }
    });
  }

  // Optimized query for recent conversation context
  async getConversationContext(
    conversationId: string,
    limit: number = 10
  ): Promise<ConversationWithContext> {
    return await this.db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
            modelUsed: true
          }
        },
        lightwalkerConversation: {
          include: {
            userLightwalker: {
              include: {
                template: {
                  select: {
                    id: true,
                    name: true,
                    personalityPrompt: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  // Optimized query for progress metrics
  async getProgressMetrics(
    userId: string,
    days: number = 30
  ): Promise<ProgressMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.db.progressMetrics.findMany({
      where: {
        userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
  }

  // Bulk insert for copying activities (performance optimization)
  async bulkInsertCopyingActivities(
    activities: CopyingActivityInput[]
  ): Promise<void> {
    await this.db.copyingActivity.createMany({
      data: activities,
      skipDuplicates: true
    });
  }
}
```

---

## Error Handling and Monitoring

### **Template-Specific Error Handling** (extending Sprint 1 patterns)

```typescript
// Enhanced error classes for template system
class TemplateSystemError extends Error {
  constructor(
    message: string,
    public templateId?: string,
    public userId?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'TemplateSystemError';
  }
}

class TemplatePersonalityError extends TemplateSystemError {
  constructor(
    message: string,
    templateId: string,
    public consistencyScore?: number
  ) {
    super(message, templateId);
    this.name = 'TemplatePersonalityError';
  }
}

class TemplateCustomizationError extends TemplateSystemError {
  constructor(
    message: string,
    templateId: string,
    userId: string,
    public customizationData?: any
  ) {
    super(message, templateId, userId);
    this.name = 'TemplateCustomizationError';
  }
}

// Enhanced error boundary for template operations
class TemplateErrorHandler {
  constructor(
    private logger: Logger,
    private monitoring: MonitoringService
  ) {}

  async handleTemplateError(error: Error, context: TemplateErrorContext): Promise<ErrorResponse> {
    // Log error with template context
    this.logger.error('Template system error', {
      error: error.message,
      stack: error.stack,
      templateId: context.templateId,
      userId: context.userId,
      operation: context.operation,
      timestamp: new Date()
    });

    // Send monitoring alert for critical errors
    if (this.isCriticalError(error)) {
      await this.monitoring.sendAlert({
        type: 'template_system_error',
        severity: 'high',
        templateId: context.templateId,
        userId: context.userId,
        error: error.message
      });
    }

    // Return user-friendly error response
    return {
      success: false,
      error: this.getUserFriendlyMessage(error),
      fallbackAction: this.getFallbackAction(error, context)
    };
  }

  private getUserFriendlyMessage(error: Error): string {
    if (error instanceof TemplatePersonalityError) {
      return "Your Lightwalker™ is thinking... please hold on a moment.";
    }
    
    if (error instanceof TemplateCustomizationError) {
      return "Having trouble setting up your Lightwalker™. Let's try that again.";
    }

    return "Your Lightwalker™ is temporarily unavailable. Please try again in a moment.";
  }

  private getFallbackAction(error: Error, context: TemplateErrorContext): FallbackAction {
    if (error instanceof TemplatePersonalityError) {
      return {
        type: 'retry_with_simpler_model',
        params: { model: 'gpt-3.5-turbo' }
      };
    }

    if (error instanceof TemplateCustomizationError) {
      return {
        type: 'use_default_template',
        params: { templateId: context.templateId }
      };
    }

    return {
      type: 'show_error_message',
      params: { allowRetry: true }
    };
  }
}
```

---

## Testing Strategy

### **Template Personality Testing**

```typescript
// Comprehensive testing for template consistency
describe('Template Personality System', () => {
  let templateManager: TemplatePersonalityManager;
  let aiService: LightwalkerAIService;
  let consistencyMonitor: PersonalityConsistencyMonitor;

  beforeEach(async () => {
    // Setup test environment with Sprint 1 foundation
    const testDb = await setupTestDatabase();
    const testAI = new MockAIService();
    
    templateManager = new TemplatePersonalityManager(testDb, testAI);
    aiService = new LightwalkerAIService(testAI, templateManager);
    consistencyMonitor = new PersonalityConsistencyMonitor(testAI, testDb);
  });

  describe('Template Creation and Retrieval', () => {
    it('should create user Lightwalker with customizations', async () => {
      const customizations = {
        problemFocus: "I want to be more confident in meetings",
        customName: "Confident Alex"
      };

      const userLightwalker = await templateManager.createUserLightwalker(
        'user-123',
        'confident-leader',
        customizations
      );

      expect(userLightwalker.customizations.problemFocus).toBe(customizations.problemFocus);
      expect(userLightwalker.customName).toBe(customizations.customName);
    });

    it('should deactivate previous Lightwalker when creating new one', async () => {
      // Create first Lightwalker
      await templateManager.createUserLightwalker('user-123', 'confident-leader', {});
      
      // Create second Lightwalker
      await templateManager.createUserLightwalker('user-123', 'healthy-energized', {});

      const activeLightwalkers = await db.userLightwalker.findMany({
        where: { userId: 'user-123', isActive: true }
      });

      expect(activeLightwalkers).toHaveLength(1);
      expect(activeLightwalkers[0].templateId).toBe('healthy-energized');
    });
  });

  describe('Personality Consistency', () => {
    it('should maintain personality traits across conversations', async () => {
      const template = await templateManager.getTemplate('confident-leader');
      const userMessage = "I'm nervous about presenting to the board tomorrow";

      const response = await aiService.generateTemplateResponse(
        'confident-leader',
        userMessage,
        mockConversationContext,
        mockCustomizations
      );

      expect(response.consistency.score).toBeGreaterThan(0.8);
      expect(response.consistency.detectedTraits).toContain('decisive');
      expect(response.content).toMatch(/confident|leadership|approach/i);
    });

    it('should detect personality inconsistencies', async () => {
      const inconsistentResponse = "I don't know what to do. I'm completely lost and have no idea how to help you.";

      const validation = await consistencyMonitor.validateResponse(
        'confident-leader',
        "How should I handle conflict?",
        inconsistentResponse,
        'conv-123',
        'msg-456'
      );

      expect(validation.isConsistent).toBe(false);
      expect(validation.score).toBeLessThan(0.5);
      expect(validation.issues).toContain('lacks confident leadership traits');
    });
  });

  describe('Template Customization', () => {
    it('should customize template based on user problem focus', async () => {
      const customizationInput = {
        problemDescription: "I procrastinate and can't get organized",
        customName: "Productive Pat"
      };

      const customizations = await templateCustomizationEngine.customizeTemplate(
        'organized-productive',
        'user-123',
        customizationInput
      );

      expect(customizations.focusAreas).toContain('procrastination');
      expect(customizations.personalityAdjustments.emphasizedTraits).toContain('systematic');
    });
  });

  describe('Performance and Caching', () => {
    it('should cache template responses for similar queries', async () => {
      const cacheKey = 'template:confident-leader:greeting:basic';
      
      // First request - should generate and cache
      const response1 = await aiService.generateTemplateResponse(
        'confident-leader',
        "Hello",
        mockConversationContext,
        mockCustomizations
      );

      // Second request - should use cache
      const response2 = await aiService.generateTemplateResponse(
        'confident-leader',
        "Hello",
        mockConversationContext,
        mockCustomizations
      );

      expect(response2.fromCache).toBe(true);
      expect(response2.content).toBe(response1.content);
    });

    it('should handle database queries efficiently', async () => {
      const startTime = Date.now();
      
      const userLightwalker = await optimizedQueries.getUserLightwalkerWithTemplate('user-123');
      
      const queryTime = Date.now() - startTime;
      expect(queryTime).toBeLessThan(100); // Should complete within 100ms
      expect(userLightwalker?.template).toBeDefined();
    });
  });
});
```

---

## Implementation Timeline

### **Week 1-2: Core Architecture**
- [ ] Extend Sprint 1 database schema with template tables
- [ ] Implement TemplatePersonalityManager class
- [ ] Create template seed data for 6 personalities
- [ ] Set up basic template storage and retrieval

### **Week 3-4: AI Integration**
- [ ] Implement PersonalityPromptEngine
- [ ] Extend Sprint 1 AI service for template responses
- [ ] Add personality consistency monitoring
- [ ] Implement template-aware model selection

### **Week 5-6: Customization and Optimization**
- [ ] Build TemplateCustomizationEngine
- [ ] Implement conversation context management
- [ ] Add response caching for performance
- [ ] Optimize database queries for templates

### **Week 7-8: Testing and Polish**
- [ ] Comprehensive template personality testing
- [ ] Error handling and monitoring implementation
- [ ] Performance testing and optimization
- [ ] Integration testing with Sprint 1 systems

---

**Template Architecture Complete - Ready for Implementation**  
**Next Phase**: Backend Engineer database schema implementation  
**Dependencies**: Sprint 1 infrastructure, template personality research

This comprehensive template system architecture builds upon Sprint 1's proven foundation while introducing sophisticated personality consistency, customization capabilities, and performance optimization specifically designed for Lightwalker™'s unique requirements.