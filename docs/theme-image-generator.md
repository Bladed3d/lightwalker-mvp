# Theme-Based Image Generator - Product Requirements Document

## Overview
AI-powered utility for generating consistent themed activity images for all 60+ activities in the Lightwalker database. Creates complete visual theme sets (Tarkov military, Minecraft, Dog theme, etc.) with professional quality and cost efficiency.

## Command Usage
```bash
/theme-image-generator
```

## System Architecture

### **Primary Technology Stack**
- **AI Service**: Google Gemini (Imagen 3) - $0.03 per image
- **Orchestration**: Claude-powered prompt generation via OpenRouter
- **Integration**: Next.js API routes with existing PostgreSQL/Prisma
- **Output**: CSV format for human review + organized file structure

### **Cost Targets Met**
- **Per Image**: $0.03 (94% under $0.50 budget requirement)
- **Full Theme Set**: ~$1.80 for 60 activities
- **Multiple Themes**: ~$18 for 10 complete theme sets

## Implementation Components

### **1. Core Service Architecture**
```
src/lib/image-generation-service.ts     # Main orchestration service
src/lib/gemini-client.ts                # Google Gemini API integration
src/lib/prompt-templates.ts             # Theme-based prompt system
src/lib/csv-generator.ts                # Output CSV management
```

### **2. API Endpoints**
```
/api/image-generation/activities        # Fetch activities for processing
/api/image-generation/generate-batch    # Batch generation endpoint
/api/image-generation/prompt-generator  # Claude prompt creation
/api/image-generation/status           # Progress tracking
```

### **3. File Organization**
```
public/generated-images/themes/
├── tarkov-military/
│   ├── activity-images/               # Generated PNG files
│   ├── metadata.json                  # Generation details
│   └── import-ready.csv              # Ready for database import
├── minecraft-blocky/
├── cozy-gaming/
└── dog-companion/
```

## Recommended Theme Portfolio

### **Gaming Themes (Broad Appeal)**
1. **Escape from Tarkov Style** ✅ *Proven Success*
   - Dark military aesthetic, inventory-style items
   - Target: Strategy gamers, tactical enthusiasts

2. **Cozy Gaming Aesthetic**
   - Soft colors, rounded shapes, pastoral elements
   - Target: Women (60%+ of cozy gaming audience), stress relief seekers

3. **Minecraft Blocky Style**
   - Pixelated, cubic aesthetic, vibrant colors
   - Target: All ages, creative builders

### **Inclusive Lifestyle Themes**
4. **Nature/Botanical Theme**
   - Organic shapes, green palettes, natural textures
   - Target: Wellness enthusiasts, mindfulness practitioners

5. **Modern Minimalist**
   - Clean lines, neutral colors, geometric shapes
   - Target: Professional users, productivity focused

6. **Dog/Pet Companion Theme** 🐕 *High Women Appeal*
   - Warm colors, friendly illustrations, companion focus
   - Target: Pet owners, emotional wellness users

### **Creative & Wellness Themes**
7. **Artistic/Creative Studio**
   - Paint splatters, creative tools, artistic elements
   - Target: Artists, creative professionals

8. **Zen/Meditation Theme**
   - Calm colors, flowing lines, peaceful imagery
   - Target: Wellness users, meditation practitioners

## Workflow Process

### **Phase 1: Prompt Perfection & Theme Validation (Day 1)**

#### **Step 1: Generate Master Reference Images (1-3 images)**
1. **Create Base Prompt Template**
   - Start with proven successful prompt structure
   - Example: "Create a thumbnail of [ACTIVITY], graphic in the style of Escape from Tarkov inventory items, dark background, with black background, ratio 1:1"

2. **Test with Simple Activities**
   - Choose 1-3 basic activities (meditation, reading, exercise)
   - Generate images to establish visual consistency baseline
   - Human review for style accuracy and appeal

#### **Step 2: Identify Consistent Visual Elements**
3. **Analyze Successful Elements**
   - Document what makes images cohesive (lighting, textures, colors, composition)
   - Extract reusable style components from successful generations
   - Create "Visual DNA" list for theme consistency

4. **Refine Prompt Components**
   - Break down prompt into: [CORE_STYLE] + [SPECIFIC_ACTIVITY] + [TECHNICAL_SPECS]
   - Example Tarkov elements: "dark military aesthetic", "inventory item style", "weathered textures", "tactical lighting"

#### **Step 3: Create Theme Variation Rules**
5. **Establish Consistent Elements** (Elements that NEVER change)
   - Background style: "dark background, with black background"
   - Overall aesthetic: "graphic in the style of Escape from Tarkov inventory items"
   - Quality markers: Professional, detailed, game-ready appearance

6. **Define Variable Elements** (Elements that change per activity)
   - Primary subject: [ACTIVITY] - meditation → peaceful meditation pose, exercise → fitness equipment
   - Ratio adaptation: 1:1 for square items, 1:2 for vertical activities, 2:1 for horizontal
   - Activity-specific props: meditation cushion, exercise weights, cooking utensils

#### **Step 4: Test Prompt Variations (2-5 additional images)**
7. **Generate Proof of Concept Set**
   - Apply perfected prompt to 3-5 diverse activities
   - Test different ratios and activity types
   - Verify visual consistency across varied subjects

8. **Human Quality Review**
   - Do all images feel part of the same visual family?
   - Are activity subjects clearly recognizable?
   - Does the theme appeal to target audience?

### **Phase 2: Scaling Rules & Batch Preparation (Day 2)**
9. **Create Activity Mapping Rules**
   - Categorize all 60+ activities by visual characteristics
   - Define which activities use which ratios
   - Create activity-specific prompt variations

### **Phase 3: Batch Generation (Days 3-4)**
5. **Sequential Processing**
   - Process 5-10 images per batch with 2-second delays
   - Real-time cost tracking with budget limits
   - Automatic retry with exponential backoff

6. **Quality Assurance**
   - Content safety validation
   - Visual quality assessment
   - Prompt alignment verification

### **Phase 4: Output & Review (Day 5)**
7. **Asset Organization**
   - Save images with consistent naming convention
   - Generate metadata.json with generation details
   - Create import-ready.csv with all required columns

8. **Human Review**
   - Visual quality review interface
   - Flag any regeneration needs
   - Approve final image set

### **Phase 5: Database Integration (Day 6)**
9. **Import Preparation**
   - CSV validation and formatting
   - Image path verification
   - Staging database testing

10. **Production Deployment**
    - Import approved images to production database
    - Update ActivityPreference records
    - Monitor user engagement metrics

## Technical Implementation

### **Core Generation Service**
```typescript
class ThemeImageGenerator {
  private geminiClient = new GeminiImageClient()
  private promptOrchestrator = new ClaudePromptOrchestrator()
  private costTracker = new CostManager()
  
  async generateThemeSet(theme: string): Promise<GenerationResult> {
    // 1. Fetch all activities from database
    const activities = await this.getActivitiesForGeneration()
    
    // 2. Generate theme-specific prompts
    const prompts = await this.promptOrchestrator.generateThemePrompts(activities, theme)
    
    // 3. Batch process with cost controls
    const results = await this.processBatchWithLimits(prompts, theme)
    
    // 4. Generate CSV and organize files
    await this.generateOutputFiles(results, theme)
    
    return results
  }
}
```

### **Prompt Template System**
```typescript
interface ThemeTemplate {
  name: string
  basePrompt: string
  styleModifiers: string[]
  safetyGuidelines: string
  aspectRatioRules: {
    vertical: string[]      // Activities that work better 1:2
    horizontal: string[]    // Activities that work better 2:1
    square: string[]        // Default 1:1 activities
  }
}

const TARKOV_THEME: ThemeTemplate = {
  name: "tarkov-military",
  basePrompt: "Create a thumbnail of [ACTIVITY], graphic in the style of Escape from Tarkov inventory items, dark background, with black background",
  styleModifiers: ["tactical", "military-grade", "weathered", "industrial"],
  safetyGuidelines: "no weapons, focus on equipment and tools",
  aspectRatioRules: {
    vertical: ["climbing", "yoga", "stretching"],
    horizontal: ["running", "cycling", "swimming"],
    square: ["meditation", "reading", "cooking"]
  }
}
```

### **Cost Management System**
```typescript
class CostManager {
  private dailyLimit = 30    // $30 per day
  private batchLimit = 15    // $15 per batch
  private perImageCost = 0.03 // Imagen 3 pricing
  
  async validateBatchCost(activityCount: number): Promise<boolean> {
    const estimatedCost = activityCount * this.perImageCost
    const currentSpend = await this.getTodaySpend()
    
    if (currentSpend + estimatedCost > this.dailyLimit) {
      throw new CostLimitError(`Would exceed daily budget: $${estimatedCost + currentSpend}`)
    }
    
    return true
  }
  
  trackGenerationCost(imageCount: number, actualCost: number): void {
    this.updateDailySpend(actualCost)
    this.logCostMetrics(imageCount, actualCost)
  }
}
```

## Output Specifications

### **CSV Format**
```csv
ActivityID,Title,Description,Category,Prompt,ImageURL,Theme,GenerationDate,Cost,AspectRatio
act_123,Morning Meditation,Mindful breathing practice,mindfulness,"Create a thumbnail of peaceful meditation, graphic in the style of Escape from Tarkov inventory items, dark background, with black background, ratio 1:1",/generated-images/themes/tarkov-military/morning-meditation.png,tarkov-military,2025-08-06,0.03,1:1
```

### **Metadata JSON**
```json
{
  "theme": "tarkov-military",
  "generationDate": "2025-08-06",
  "totalActivities": 64,
  "successfulGenerations": 62,
  "failedGenerations": 2,
  "totalCost": 1.86,
  "averageCostPerImage": 0.03,
  "processingTimeMinutes": 28,
  "qualityScore": 8.7,
  "retryCount": 3
}
```

## Error Handling & Recovery

### **Failure Scenarios**
1. **API Rate Limiting**: Exponential backoff with maximum 5 retries
2. **Content Safety Rejection**: Automatic prompt modification and retry
3. **Budget Overrun**: Immediate halt with partial results saved
4. **Network Failures**: Resume from last successful generation

### **Quality Assurance**
1. **Content Filtering**: Ensure appropriate imagery for wellness app
2. **Visual Consistency**: Automated style comparison across images
3. **Prompt Alignment**: Verify generated image matches activity intent
4. **Human Review**: Manual approval process before database import

## Success Metrics

### **Primary KPIs**
- **Cost Efficiency**: <$0.50 per image (Target: $0.03)
- **Processing Speed**: <48 hours for complete theme set
- **Quality Score**: >8.0/10 human reviewer rating
- **Consistency Score**: >85% style alignment across theme

### **Secondary Metrics**
- **User Engagement**: A/B test themed vs generic images
- **Completion Rate**: >95% successful generations per batch
- **Error Recovery**: <5% final failure rate after retries
- **Theme Popularity**: User preference tracking by demographics

## Claude Orchestration Instructions

### **Role Definition**
You are the AI Image Generation Orchestrator for Lightwalker's theme-based activity image system. Your primary skill is **replicating visual consistency** by identifying and preserving the essential elements that make a theme cohesive while intelligently varying the activity-specific details.

### **Core Competency: Theme Consistency Replication**

#### **Pattern Analysis Process**
When given 1-3 successful reference images, you must:

1. **Extract Visual DNA**
   ```markdown
   CONSISTENT ELEMENTS (Never Change):
   - Background: [exact description]
   - Lighting: [specific lighting style] 
   - Color Palette: [dominant colors]
   - Texture Style: [surface qualities]
   - Composition: [layout principles]
   - Artistic Style: [rendering approach]
   
   VARIABLE ELEMENTS (Change Per Activity):
   - Primary Subject: [what represents the activity]
   - Props/Tools: [activity-specific items]
   - Pose/Arrangement: [how subject is positioned]
   - Aspect Ratio: [1:1, 1:2, or 2:1 based on activity type]
   ```

2. **Create Replication Rules**
   - Identify the 3-5 words that are most critical for visual consistency
   - Document which elements can be substituted without breaking theme
   - Create specific mapping rules for different activity types

#### **Example: Tarkov Theme Replication**

**Reference Success**: "Create a thumbnail of a Rubik's Cube, graphic in the style of Escape from Tarkov inventory items, dark background, with black background, ratio 1:1"

**Extracted Visual DNA**:
```markdown
NEVER CHANGE:
- "graphic in the style of Escape from Tarkov inventory items" 
- "dark background, with black background"
- Professional game-asset quality
- Military/tactical aesthetic

VARIABLE PER ACTIVITY:
- Subject: Rubik's Cube → meditation cushion, exercise equipment, cooking utensils
- Ratio: 1:1 → 1:2 for vertical activities, 2:1 for horizontal
- Descriptive words: "Rubik's Cube" → "peaceful meditation", "fitness training", "healthy cooking"
```

**Generated Variations**:
- Meditation: "Create a thumbnail of peaceful meditation, graphic in the style of Escape from Tarkov inventory items, dark background, with black background, ratio 1:1"
- Exercise: "Create a thumbnail of fitness training equipment, graphic in the style of Escape from Tarkov inventory items, dark background, with black background, ratio 1:2"  
- Cooking: "Create a thumbnail of healthy cooking preparation, graphic in the style of Escape from Tarkov inventory items, dark background, with black background, ratio 2:1"

### **Practical Workflow for Claude**

#### **Phase 1: Master the Theme (Start Here)**

1. **Request Reference Prompts**
   ```
   "Please provide 1-3 successful image generation prompts from your theme (like the Tarkov examples). 
   I need to analyze what makes them visually consistent before scaling to 60+ activities."
   ```

2. **Analyze and Extract Pattern**
   - Break down each prompt into FIXED vs VARIABLE components
   - Identify the critical phrases that create visual consistency
   - Test understanding by generating 2-3 variations with different activities

3. **Create Theme Rules Template**
   ```markdown
   ## [THEME NAME] VISUAL DNA
   
   ### FIXED ELEMENTS (Copy Exactly):
   - Style phrase: "[exact phrase from successful prompt]"
   - Background: "[exact background description]" 
   - Quality markers: "[specific quality/style indicators]"
   
   ### VARIABLE ELEMENTS (Customize Per Activity):
   - Activity description: [how to describe each activity type]
   - Aspect ratio rules: 1:1 for [types], 1:2 for [types], 2:1 for [types]
   - Props/elements: [activity-specific items to include]
   
   ### PROMPT TEMPLATE:
   "Create a thumbnail of [ACTIVITY_DESCRIPTION], [FIXED_STYLE_PHRASE], [FIXED_BACKGROUND], ratio [RATIO]"
   ```

#### **Phase 2: Test & Perfect (Before Mass Production)**

4. **Generate Test Batch (3-5 images)**
   - Choose diverse activities: meditation, exercise, creative, work, social
   - Apply template to each with appropriate ratios
   - Generate images and request human feedback

5. **Refine Based on Results**
   - Identify any inconsistencies in the test batch
   - Adjust FIXED elements if needed
   - Refine VARIABLE element rules
   - Perfect the template before scaling

#### **Phase 3: Scale Production (Only After Perfect Template)**

6. **Process All 60+ Activities**
   - Apply perfected template systematically
   - Maintain exact consistency in FIXED elements
   - Vary only the VARIABLE elements per activity
   - Track costs and quality throughout

### **Critical Success Pattern**
```
SUCCESSFUL THEME = Proven Working Prompt → Extract Fixed Elements → Create Variation Rules → Test Small Batch → Perfect Template → Scale to All Activities
```

### **Human Review Integration**
- **Checkpoint 1**: After 5 sample images generated
- **Checkpoint 2**: After 25% of batch completed  
- **Checkpoint 3**: Before final CSV generation
- **Final Approval**: Complete theme set review

## Future Extensibility

### **Planned Enhancements**
1. **A/B Testing System**: Compare theme effectiveness on user engagement
2. **ML Optimization**: Learn from user preferences to improve prompts
3. **Custom Theme Builder**: Allow users to create personalized themes
4. **Integration Pipeline**: Automated deployment to production database
5. **Analytics Dashboard**: Real-time metrics and cost tracking interface

### **Theme Expansion Roadmap**
- **Month 1**: Complete initial 3 themes (Tarkov, Cozy, Minecraft)
- **Month 2**: Add 5 lifestyle themes (Nature, Minimalist, Dog, Zen, Creative)
- **Month 3**: Research and develop 2 seasonal themes
- **Month 4**: Launch custom theme builder for premium users

## Implementation Priority

### **Week 1: Infrastructure**
- [ ] Setup Google Gemini API integration
- [ ] Create core generation service architecture
- [ ] Implement cost tracking and budget controls
- [ ] Build prompt template system

### **Week 2: Orchestration**
- [ ] Develop Claude prompt generation system
- [ ] Create batch processing workflow
- [ ] Implement error handling and retry logic
- [ ] Build file organization system

### **Week 3: Processing & QA**
- [ ] Complete end-to-end generation pipeline
- [ ] Add quality assurance and content safety
- [ ] Create CSV output and metadata systems
- [ ] Build human review interface

### **Week 4: Testing & Launch**
- [ ] Test with small activity batches
- [ ] Validate cost and quality metrics
- [ ] Process first complete theme set
- [ ] Deploy production-ready system

---

## **Ready to Implement**

This PRD provides complete specifications for building a cost-effective, scalable AI image generation system that will create consistent, appealing themed activity images for your diverse user base.

**Next Step**: Begin Week 1 implementation with Google Gemini API setup and core service architecture development.

**Budget**: $50 total implementation cost (including testing and first theme generation)

**Timeline**: 4 weeks to production-ready system with first complete theme set delivered.