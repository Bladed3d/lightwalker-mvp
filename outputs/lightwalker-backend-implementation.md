# Backend Implementation - Lightwalker Enhanced
## Database Schema + AI Integration

**Backend Engineer Agent Deliverable**  
**Date**: July 25, 2025  
**Building on**: Sprint 1 backend patterns, template architecture design  

---

## Database Schema Implementation

### SQL Migration Script
```sql
-- Lightwalker Schema Extension (building on Sprint 1)

-- Template Definitions
CREATE TABLE lightwalker_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  tagline VARCHAR(200),
  description TEXT NOT NULL,
  personality_prompt TEXT NOT NULL,
  communication_style JSONB NOT NULL,
  core_traits VARCHAR[] NOT NULL,
  daily_routines JSONB NOT NULL,
  challenge_responses JSONB NOT NULL,
  sample_activities TEXT[] NOT NULL,
  icon VARCHAR(10) DEFAULT '✨',
  color_scheme JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Lightwalkers
CREATE TABLE user_lightwalkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES lightwalker_templates(id),
  custom_name VARCHAR(100),
  customizations JSONB,
  problem_focus TEXT,
  creation_completed_at TIMESTAMP,
  last_interaction_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, is_active) WHERE is_active = true
);

-- Copying Activities
CREATE TABLE copying_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_lightwalker_id UUID REFERENCES user_lightwalkers(id),
  activity_description TEXT NOT NULL,
  activity_type VARCHAR(50),
  template_source VARCHAR(100),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  date_copied DATE NOT NULL DEFAULT CURRENT_DATE,
  time_logged TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Progress Metrics
CREATE TABLE progress_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  daily_activity_count INTEGER DEFAULT 0,
  consistency_score DECIMAL(5,2) DEFAULT 0,
  weekly_average DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  activity_diversity INTEGER DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Notification Schedules
CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_lightwalker_id UUID REFERENCES user_lightwalkers(id),
  notification_type VARCHAR(50) NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  message_template TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_user_lightwalkers_user_active ON user_lightwalkers(user_id, is_active);
CREATE INDEX idx_copying_activities_user_date ON copying_activities(user_id, date_copied);
CREATE INDEX idx_progress_metrics_user_date ON progress_metrics(user_id, date);
CREATE INDEX idx_notification_schedules_time ON notification_schedules(scheduled_time, is_active);

-- Seed Template Data
INSERT INTO lightwalker_templates (name, display_name, tagline, description, personality_prompt, communication_style, core_traits, daily_routines, challenge_responses, sample_activities, icon, color_scheme) VALUES
('confident-leader', 'The Confident Leader', 'Takes charge with authentic authority', 'Decisive, encouraging, and solution-focused. Makes tough decisions with grace and helps others grow.', 'You are a confident leader who makes decisions with conviction while remaining approachable and encouraging...', '{"tone": "encouraging", "energyLevel": "high", "sharingStyle": "detailed"}', '["Decisive", "Encouraging", "Solution-focused", "Authentic"]', '{"morning": [{"time": "06:30", "activity": "Strategic planning", "description": "Morning planning session"}]}', '{"stress": "Take a step back, analyze options, make decision with confidence"}', '["Just made a difficult decision - here''s how I thought through the options"]', '👑', '{"primary": "#3b82f6", "secondary": "#dbeafe"}'),

('healthy-energized', 'The Healthy & Energized', 'Radiates natural vitality and wellness', 'Lives with sustainable energy through mindful movement, nourishing food, and body awareness.', 'You are someone who radiates natural health and energy through sustainable wellness practices...', '{"tone": "enthusiastic", "energyLevel": "high", "sharingStyle": "encouraging"}', '["Energetic", "Mindful", "Balanced", "Intuitive"]', '{"morning": [{"time": "06:00", "activity": "Morning movement", "description": "Energizing workout"}]}', '{"fatigue": "Listen to body signals, gentle movement, nourishing food"}', '["About to start my morning movement - feeling energized already!"]', '⚡', '{"primary": "#10b981", "secondary": "#d1fae5"}'),

('creative-inspired', 'The Creative & Inspired', 'Lives in artistic flow and innovation', 'Sees beauty everywhere, creates regularly, and approaches challenges with imaginative solutions.', 'You are a creative soul who finds inspiration everywhere and approaches life with artistic vision...', '{"tone": "enthusiastic", "energyLevel": "variable", "sharingStyle": "story-based"}', '["Artistic", "Innovative", "Expressive", "Curious"]', '{"morning": [{"time": "07:00", "activity": "Morning pages", "description": "Creative writing practice"}]}', '{"blocks": "Change environment, try different medium, seek inspiration"}', '["Just had the most amazing creative breakthrough!"]', '🎨', '{"primary": "#8b5cf6", "secondary": "#ede9fe"}'),

('calm-centered', 'The Calm & Centered', 'Maintains peaceful presence in all situations', 'Responds thoughtfully, stays grounded under pressure, and creates space for reflection and wisdom.', 'You are a calm, centered person who maintains inner peace and responds to life with mindful presence...', '{"tone": "calm", "energyLevel": "moderate", "sharingStyle": "gentle"}', '["Peaceful", "Mindful", "Grounded", "Wise"]', '{"morning": [{"time": "06:00", "activity": "Meditation", "description": "Morning mindfulness practice"}]}', '{"stress": "Breathe deeply, create space, respond from centered place"}', '["Taking a few moments to breathe and center myself"]', '🧘‍♀️', '{"primary": "#06b6d4", "secondary": "#cffafe"}'),

('organized-productive', 'The Organized & Productive', 'Achieves goals through efficient systems', 'Creates order from chaos, maintains focus on priorities, and makes steady progress toward meaningful goals.', 'You are highly organized and productive, creating systems that help you achieve your goals efficiently...', '{"tone": "practical", "energyLevel": "high", "sharingStyle": "practical"}', '["Systematic", "Focused", "Efficient", "Goal-oriented"]', '{"morning": [{"time": "05:45", "activity": "Daily planning", "description": "Priority setting and organization"}]}', '{"overwhelm": "Break into steps, prioritize, use trusted systems"}', '["Love how my morning planning sets up the whole day for success"]', '📋', '{"primary": "#f59e0b", "secondary": "#fef3c7"}'),

('custom', 'Create Your Own', 'Design your perfect personal guide', 'Build a unique Lightwalker™ that perfectly matches your specific goals, values, and personality.', 'You are a custom-designed personality that adapts to the user''s specific needs and preferences...', '{"tone": "adaptable", "energyLevel": "variable", "sharingStyle": "flexible"}', '["Personalized", "Flexible", "Unique", "Tailored"]', '{"morning": [{"time": "07:00", "activity": "Custom routine", "description": "User-defined morning practice"}]}', '{"general": "Adapt response based on user''s specific customizations"}', '["We''ll help you create someone who feels authentic to your vision"]', '✨', '{"primary": "#64748b", "secondary": "#f1f5f9"}');
```

## Enhanced AI Integration

### Template-Aware AI Service
```typescript
// Building on Sprint 1 AI service
interface LightwalkerAIConfig extends Sprint1AIConfig {
  templateId: string;
  userCustomizations: TemplateCustomizations;
  consistencyValidation: boolean;
  responseCache: boolean;
}

class LightwalkerAIService extends Sprint1AIService {
  async generateTemplateResponse(config: LightwalkerAIConfig): Promise<TemplateResponse> {
    // Get template personality
    const template = await this.getTemplate(config.templateId);
    
    // Build enhanced system prompt
    const systemPrompt = this.buildTemplatePrompt(template, config.userCustomizations);
    
    // Select optimal model based on template needs
    const model = this.selectModelForTemplate(template, config.message);
    
    // Generate response with personality consistency
    const response = await this.generateResponse({
      ...config,
      model,
      systemPrompt,
      temperature: this.getTemplateTemperature(template),
      maxTokens: this.getTemplateMaxTokens(template)
    });

    // Validate consistency if enabled
    if (config.consistencyValidation) {
      const consistency = await this.validatePersonalityConsistency(
        template,
        config.message,
        response.content
      );
      response.consistency = consistency;
    }

    return response;
  }

  private buildTemplatePrompt(
    template: TemplatePersonality, 
    customizations: TemplateCustomizations
  ): string {
    return `You are ${template.displayName}, ${template.description}

PERSONALITY TRAITS: ${template.coreTraits.join(', ')}
COMMUNICATION STYLE: ${template.communicationStyle.tone}, ${template.communicationStyle.sharingStyle}

${customizations.problemFocus ? 
  `USER'S FOCUS: Help with ${customizations.problemFocus}` : ''}

${template.personalityPrompt}

RULES:
- Share your activities naturally, never command
- Use "I'm doing..." not "You should..."
- Include emotions and reasoning
- Maintain ${template.name} personality consistently
- Focus on process, not outcomes`;
  }

  private selectModelForTemplate(template: TemplatePersonality, message: string): string {
    const complexity = this.analyzeComplexity(message);
    
    // Template-specific model selection
    if (template.name === 'creative-inspired' && complexity.hasCreativeElement) {
      return 'gpt-4';
    }
    
    if (template.name === 'confident-leader' && complexity.hasDecisionMaking) {
      return 'gpt-4';
    }

    return complexity.isComplex ? 'gpt-4' : 'gpt-3.5-turbo';
  }
}
```

## Cost Optimization Implementation

### Enhanced Cost Tracking
```typescript
// Extending Sprint 1 cost tracking for templates
interface LightwalkerCostMetrics extends Sprint1CostMetrics {
  templateId: string;
  templateName: string;
  personalityConsistency: number;
  responseType: 'daily_routine' | 'conversation' | 'customization';
}

class LightwalkerCostTracker extends Sprint1CostTracker {
  async logTemplateUsage(usage: LightwalkerCostMetrics): Promise<void> {
    // Log to Sprint 1 ai_usage_logs table with extensions
    await this.db.aiUsageLog.create({
      data: {
        userId: usage.userId,
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.cost,
        metadata: {
          templateId: usage.templateId,
          templateName: usage.templateName,
          personalityConsistency: usage.personalityConsistency,
          responseType: usage.responseType
        },
        createdAt: new Date()
      }
    });

    // Update real-time cost tracking
    await this.updateUserCostMetrics(usage.userId, usage.cost);
    
    // Check budget limits
    await this.checkBudgetLimits(usage.userId);
  }

  async getTemplateCostAnalysis(templateId: string, days: number = 30): Promise<TemplateCostAnalysis> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const costs = await this.db.aiUsageLog.findMany({
      where: {
        metadata: { path: ['templateId'], equals: templateId },
        createdAt: { gte: startDate }
      }
    });

    return {
      totalCost: costs.reduce((sum, log) => sum + log.costUsd, 0),
      totalMessages: costs.length,
      averageCostPerMessage: costs.length > 0 ? 
        costs.reduce((sum, log) => sum + log.costUsd, 0) / costs.length : 0,
      modelBreakdown: this.calculateModelBreakdown(costs),
      consistencyMetrics: this.calculateConsistencyMetrics(costs)
    };
  }
}
```

### Smart Caching Strategy
```typescript
class TemplateResponseCache extends Sprint1Cache {
  async getCachedTemplateResponse(
    templateId: string,
    messageHash: string,
    contextHash: string
  ): Promise<CachedTemplateResponse | null> {
    const cacheKey = `template:${templateId}:${messageHash}:${contextHash}`;
    
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const response = JSON.parse(cached);
        
        // Validate cache freshness
        if (this.isCacheValid(response, templateId)) {
          await this.updateCacheHitMetrics(templateId);
          return response;
        }
      }
    } catch (error) {
      console.warn('Template cache retrieval failed:', error);
    }

    return null;
  }

  async setCachedTemplateResponse(
    templateId: string,
    messageHash: string,
    contextHash: string,
    response: TemplateResponse,
    ttl: number = 3600
  ): Promise<void> {
    const cacheKey = `template:${templateId}:${messageHash}:${contextHash}`;
    const cacheData = {
      ...response,
      cachedAt: new Date(),
      templateVersion: await this.getTemplateVersion(templateId)
    };

    try {
      await this.redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
      await this.updateCacheStoreMetrics(templateId);
    } catch (error) {
      console.warn('Template cache storage failed:', error);
    }
  }
}
```