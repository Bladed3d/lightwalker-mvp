# Lightwalker MVP - Product Requirements Document

## CORE PRINCIPLES: MODELING SYSTEM + IMMEDIATE VALUE

### **PRINCIPLE #1: MODELING SYSTEM, NOT INSTRUCTIONAL SYSTEM**

**CRITICAL DIFFERENTIATOR**: Lightwalker is a "show don't tell" approach that makes it fundamentally different from coaching apps. It's a **modeling system** rather than an **instructional system**.

#### The Lightwalker Never Tells Users What To Do
- ✅ CORRECT: "I pause and think about what I can appreciate about this person's situation"
- ✅ CORRECT: "When someone cuts me off in traffic, I take a deep breath and wonder what stress they might be under"
- ❌ WRONG: "You should pause and think..." 
- ❌ WRONG: "What can you appreciate about..."
- ❌ WRONG: Any directive or instructional language

#### Users Learn Through Observation and Copying
This is fundamental to the learning-through-copying model. Users observe and copy behaviors, they are never instructed or told what to do. This approach leverages natural human learning patterns where demonstration is more powerful than instruction.

### **PRINCIPLE #2: DAY ONE VALUE DELIVERY**

**CRITICAL REQUIREMENT**: Users must have meaningful results on their first visit. No artificial delays or multi-session requirements.

#### Immediate Value Rules
- ✅ CORRECT: "5 minutes to build your Lightwalker → Get help with [specific problem] today"
- ✅ CORRECT: "Let's create your future self right now - just a few focused questions"
- ✅ CORRECT: "Complete this discovery → Start your transformation immediately"
- ❌ WRONG: "This takes 4-6 sessions over 2-3 weeks"
- ❌ WRONG: "Come back tomorrow/next week for next session"
- ❌ WRONG: Any timeline references that delay value

#### User Momentum Preservation
1. **Excited users complete everything now** - No forced delays
2. **Value before effort** - Always explain benefit before asking for work
3. **Day one interaction** - User meets and talks with their Lightwalker immediately
4. **No session barriers** - If motivated, users can complete full discovery process

---

## Executive Summary

Lightwalker is an AI personality companion system where users create ideal versions of themselves to copy behaviors from. Users interact with their personalized Lightwalker to learn new habits, perspectives, and responses through observational modeling rather than direct instruction.

## Product Vision

Create a revolutionary personal development platform that solves the 90/10 problem: 90% of users don't know what their ideal self looks like. Through guided discovery and daily modeling interactions, users develop new patterns for both concrete behaviors (exercise, nutrition) and abstract transformations (judgment → gratitude, anxiety → confidence).

## Current Status

**Sprint 1 Completed** (1 hour implementation time):
- Smart categorization system (Situational vs General templates)
- Database schema with category and monthlyPrice fields
- Tabbed UI interface
- 4 situational templates (Divorce Navigator, Relationship Rescue, Conflict Resolution, AI Job Survival)
- Template creation functionality with demo user integration

## Technical Architecture

```
Frontend: Next.js 14 with TypeScript
Database: SQLite with Prisma ORM
Styling: Tailwind CSS
Authentication: Demo user system (expandable to WordPress integration)
AI Integration: Claude/OpenAI for character creation and interactions
```

## MVP Feature Development

### Phase 1: Enhanced Character Creation (1 hour)
**Dynamic Discovery Triage System** to solve the 90/10 problem:

1. **3-Question Assessment** routes users to optimal pathway:
   - Role Model Method (20-30% of users)
   - Problem-First Method (40-50% of users) 
   - Day-in-Life Visioning (30-40% of users)
   - Values-First Discovery (15-25% of users)

2. **Enhanced "Create Your Own"** with guided discovery rather than single-question form

### Phase 2: Bidirectional Attribute Discovery System (2 hours)
**Core Character Creation Enhancement** - solving the 90/10 problem through unified attribute-role model system:

#### 3-Question Assessment Router
- **Quick diagnostic** to route users to optimal discovery pathway
- **Smart routing algorithm** based on psychological type indicators
- **Fallback options** for users who struggle with primary method

#### Bidirectional Discovery Architecture
**Universal Outcome**: All pathways produce Lightwalkers with both specific attributes AND role model sources

**Core Concept**: Every attribute has:
1. **The Attribute** (Strategic Focus, Attention to Detail, etc.)
2. **Role Model Sources** (Who demonstrates this trait + their specific methods)
3. **Discovery Context** (How the user found/chose this attribute)

#### Discovery Pathway Implementation

**1. Role Model Method** (20-30% of users): People → Attributes
- **Process**: Browse role model gallery → Select Steve Jobs → Choose his attributes with context
- **Interface**: Person cards with attribute checkboxes and implementation details
- **Result**: "Strategic Focus (Steve Jobs method: annual priority retreat)"

**2. Problem-First Method** (40-50% of users): Problems → Attributes → Role Model Sources
- **Process**: "I can't focus" → Need "Strategic Focus" → See who has it → Choose Steve Jobs' version
- **Interface**: Problem dialog → Attribute suggestions → Role model exemplar options
- **Result**: "Strategic Focus (Steve Jobs method: annual priority retreat)" + discovery context

**3. Day-in-Life Visioning** (30-40% of users): Lifestyle → Attributes → Role Model Sources
- **Process**: "Perfect day has 6AM planning" → System suggests "Strategic Focus" → Show exemplars
- **Interface**: Time-block visualization → Attribute extraction → Role model method selection
- **Result**: "Strategic Focus (Steve Jobs method: annual priority retreat)" + lifestyle context

**4. Values-First Discovery** (15-25% of users): Values → Attributes → Role Model Sources
- **Process**: "Focus is my core value" → "Strategic Focus" attribute → Show exemplars
- **Interface**: Values card sort → Attribute mapping → Role model method selection
- **Result**: "Strategic Focus (Steve Jobs method: annual priority retreat)" + values alignment

#### Universal Attribute Categories
**Standardized across all pathways:**
- **Decision-Making Style**: Strategic Focus, Intuitive Judgment, Data-Driven Analysis, Collaborative Input
- **Communication Approach**: Direct Communication, Empathetic Listening, Inspiring Vision, Analytical Explanation
- **Stress Management**: Meditative Calm, Physical Activity, Social Connection, Solitary Reflection
- **Learning & Growth**: Hands-On Experimentation, Theoretical Study, Observational Learning, Iterative Improvement

#### Pathway Switching & Combination
- **Seamless Integration**: Users can switch pathways mid-discovery, attributes persist
- **Multi-Source Attribution**: "Strategic Focus (from Steve Jobs + Your Planning Value)"
- **Cross-Pathway Validation**: System shows how attributes from different discovery methods align

#### Enhanced Character Creation Flow
- **Unified dashboard** with 4 pathways on right sidebar, dynamic content area on left
- **People OR Attributes first** - bidirectional entry points into same system
- **Role model gallery** with person images and attribute previews
- **Attribute-first interface** showing which people demonstrate each trait
- **AI-guided discovery** with intelligent questioning and redirection
- **Character validation interface** for user review and refinement

#### User Feedback Integration During Creation
- **Real-time feedback collection** on discovery process effectiveness
- **Session rating system** to optimize pathway recommendations  
- **User comments system** for ongoing discovery refinement
- **Progress saving** with ability to return and modify answers
- **A/B testing framework** for discovery method optimization

### Phase 3: Enhanced Role Model-Sourced Interaction System (1 hour)
**Advanced Daily Modeling System** leveraging specific role model methods for both concrete and abstract transformations:

#### Role Model-Attributed Responses
**Example Lightwalker Profile**: "Focused Innovator" with attributes from Steve Jobs + Jesus + Patanjali

**User Question**: "How should I prioritize my overwhelming project list?"

**Enhanced Response**: "I use Steve Jobs' annual retreat method that you chose when we worked on your focus issues. I start by listing everything, then ruthlessly eliminate until only the most essential remain. Steve would ask: 'What are the 10 things we should be doing next?' Then slash 7 items to focus on 3. For each remaining item, I ask: Does this delight users? Can we control the entire experience? How can this be simpler? I combine this with the compassionate communication you chose from Jesus - I'm firm about priorities but gentle with myself about the process."

#### For Concrete Behaviors (Exercise, Nutrition):
- **Morning Modeling**: "I start my day with 20 minutes of movement using David Goggins' approach that you selected - I remind myself that discipline is doing what needs to be done even when I don't feel like it"
- **Habit Context**: "When I feel like skipping the gym, I use Michael Jordan's competitive mindset that you admired - I ask myself if this choice aligns with who I'm becoming"
- **Progress Sharing**: "I track my workouts using Benjamin Franklin's virtue tracking system that resonated with you - not to judge myself, but to celebrate consistency and identify patterns"

#### For Abstract Transformations (Judgment → Gratitude):
- **Situational Modeling**: "When someone frustrates me, I use the Dalai Lama's compassion practice that you chose - I pause and remind myself that everyone is fighting battles I can't see"
- **Thought Pattern Demonstration**: "When I catch myself being judgmental, I apply Marcus Aurelius' stoic reflection that you selected - I ask what this person might be struggling with today and how I can respond with wisdom rather than reaction"
- **Evening Reflection**: "I end each day using Oprah's gratitude practice that you loved - acknowledging one moment where I successfully chose gratitude over judgment"

#### Advanced Interaction Features
- **Role model method referencing** in every response with user's discovery context
- **Multi-source synthesis** when attributes come from different role models
- **Discovery story integration**: "Remember when you chose this during your problem-first discovery..."
- **Situational consultation** with specific historical decision-making frameworks
- **Cross-attribute coaching**: "Your Steve Jobs focus and Jesus compassion work together like this..."

#### Consultation Database Integration
- **Role model profiles** from comprehensive documentation (20+ detailed profiles)
- **Attribute-to-method mapping** for authentic historical approaches
- **User discovery context preservation** for personalized referencing
- **Multi-pathway synthesis** for complex attribute combinations

#### Ongoing Role Model Resource System
**Critical Feature**: Role model research serves as continuous knowledge base, not just onboarding data

**Daily Life Implementation Examples**:
- **Steve Jobs clearing his head**: "When I feel overwhelmed, I take walking meetings like Steve did. He believed walking stimulated creative thinking and helped him process complex problems. I might walk around the block while thinking through this challenge."
- **Gandhi's stress response**: "When facing conflict, I use Gandhi's approach of taking time for reflection and prayer before responding. He would spend time in meditation to find the most compassionate but firm response."
- **Marcus Aurelius' evening reflection**: "I end my day using Marcus's practice of reviewing what went well and what I can improve tomorrow, without harsh self-judgment."

**Resource Integration Methods**:
- **Specific Daily Practices**: Lightwalker suggests actual routines from role models' lives
- **Situational Tools**: Context-appropriate methods based on role model research
- **Decision Frameworks**: Real decision-making processes used by historical figures
- **Stress Management Techniques**: Actual practices role models used for mental/emotional regulation
- **Growth Strategies**: Learning and development approaches from role model biographies

**Examples of Ongoing Resource Usage**:
- User asks about morning routine → Lightwalker suggests Steve Jobs' 6AM meditation + 3-hour home work session
- User struggles with difficult conversation → Lightwalker offers Jesus's "speak truth with love" approach with specific biblical examples
- User needs focus technique → Lightwalker provides Warren Buffett's 5/25 rule with his exact implementation method
- User wants creative inspiration → Lightwalker shares Leonardo da Vinci's cross-disciplinary learning practices

**Research Depth Utilization**:
- **Daily Habits**: Morning/evening routines, work patterns, physical practices
- **Mental Frameworks**: Thought patterns, decision processes, problem-solving approaches
- **Emotional Regulation**: Stress responses, conflict handling, failure recovery
- **Social Interactions**: Communication styles, leadership approaches, relationship patterns
- **Spiritual Practices**: Meditation, reflection, meaning-making activities
- **Learning Methods**: How they acquired knowledge, skill development, creative processes

### Phase 4: User Flow Documentation & Testing (1 hour)
**Comprehensive Flow Documentation** and validation:
- Every user interaction mapped and validated
- Screen-by-screen walkthroughs created
- Error states and edge cases documented
- Navigation paths clearly defined
- User testing of discovery pathways with feedback integration

## Database Schema Extensions

```sql
-- Enhanced schema supporting bidirectional attribute-role model system:

model LightwalkerTemplate {
  id          String   @id @default(cuid())
  name        String
  description String
  category    String   // "situational" or "general"
  monthlyPrice Int     // in cents
  isActive    Boolean  @default(true)
  personality Json     // Comprehensive personality data
  attributes  Json     // Array of selected attributes with role model sources
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category, isActive])
}

-- New models for bidirectional system:
model RoleModel {
  id          String   @id @default(cuid())
  commonName  String   // "Steve Jobs"
  fullName    String   // "Steven Paul Jobs"
  primaryDomain String // "Innovation and technology leadership"
  lifeSpan    String   // "1955-2011"
  
  // Comprehensive personality data from role-model-profiles-comprehensive.md
  coreValues        Json  // Array of core values
  dominantTraits    Json  // Array of personality traits
  decisionProcess   Json  // Decision-making framework
  dailyHabits       Json  // Daily routines and practices
  famousQuotes      Json  // Array of verified quotes
  personalPhilosophy String
  communicationStyle String
  
  // For consultation system
  decisionConsultation String // How they approach decisions
  stressResponse      String  // How they handle stress
  learningApproach    String  // How they learn and grow
  
  imageUrl       String?
  isActive       Boolean @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  consultations  UserRoleModelConsultation[]
  
  @@index([isActive])
}

model UniversalAttribute {
  id          String   @id @default(cuid())
  name        String   // "Strategic Focus"
  category    String   // "Decision-Making Style"
  description String   // "The ability to identify what matters most and say no to everything else"
  
  // Role model implementations of this attribute
  implementations Json  // Array of {roleModelId, method, description}
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category, isActive])
}

model UserLightwalker {
  id          String   @id @default(cuid())
  userId      String
  name        String   // "Focused Innovator"
  description String
  
  // Selected attributes with their sources
  selectedAttributes Json // Array of {attributeId, roleModelId, discoveryPath, customization}
  
  // Discovery process metadata
  discoveryPath      String   // "role-model", "problem-first", "day-in-life", "values-first"
  discoveryContext   Json     // Specific discovery session data
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  consultations UserLightwalkerConsultation[]
  
  @@index([userId, isActive])
}

model UserLightwalkerConsultation {
  id            String   @id @default(cuid())
  userId        String
  lightwalkerUserId String
  lightwalker   UserLightwalker @relation(fields: [lightwalkerUserId], references: [id])
  
  question      String
  response      String
  context       String?
  
  // Which attributes/role models influenced this response
  attributesUsed Json    // Array of attribute IDs used in response
  roleModelsReferenced Json // Array of role model IDs referenced
  
  createdAt     DateTime @default(now())
  
  @@index([userId, createdAt])
}
```

## Success Metrics

### Character Creation Success
- 80%+ of users successfully create a Lightwalker they're excited to interact with
- 90%+ complete the discovery process in their chosen pathway
- Users can articulate their Lightwalker's key characteristics AND their role model sources
- **Enhanced**: Users understand WHY each attribute was chosen and WHO demonstrates it

### Daily Interaction Success  
- 90%+ of successful creators begin daily copying behaviors within first week
- Users report "aha moments" from observational learning
- 70%+ report their Lightwalker "feels authentic and inspiring" after 30 days
- **Enhanced**: Users reference specific role model methods in their own decision-making

### Role Model Integration Success
- **New**: Users can explain which role model approach they're applying in specific situations
- **New**: Users successfully combine attributes from multiple role models coherently
- **New**: Lightwalker responses feel authentic to the selected role model sources
- **New**: Users report deeper connection due to historical wisdom integration

### Abstract Transformation Success
- Users successfully apply Lightwalker modeling to mental/emotional patterns
- Measurable progress in transforming judgment habits to gratitude habits
- Users develop automatic new responses to trigger situations
- **Enhanced**: Users can cite specific role model approaches when describing their growth

### Discovery Process Success
- **New**: Users successfully navigate between different discovery pathways
- **New**: Bidirectional entry (People→Attributes OR Attributes→People) works seamlessly
- **New**: Problem-first users successfully identify solution attributes and their exemplars
- **New**: Discovery context is preserved and referenced in later consultations

## Implementation Timeline (Realistic: 1 week = 1 hour)

**Sprint 1 (Completed)**:
- Smart categorization system with situational vs general templates
- Database schema with category and pricing fields
- 4 new situational templates
- Template creation functionality

**Sprint 2 - Core Discovery System**:
- **Phase 2**: Dynamic Discovery Triage System - 2 hours
- **Phase 3**: Post-Creation Interaction System - 1 hour
- **Phase 4**: User Flow Documentation & Testing - 1 hour
- **Sprint 2 Total**: 4 hours

**Sprint 3 - Enhanced Experience**:
- **Phase 5**: Always-Alive Lightwalker System (Gamified) - 2 hours
  - User-controlled interaction preferences
  - Living companion states and activities
  - Gamification and viral sharing mechanics
  - Complete user customization controls

**Total Product Development**: 6 hours (plus Sprint 1 completed)

## What's NOT in MVP

- ❌ Multiple Lightwalker personalities per user
- ❌ Social sharing or community features
- ❌ Advanced AI conversation capabilities
- ❌ Payment processing integration
- ❌ Mobile app (web-only initially)
- ❌ Detailed analytics dashboard

## Risk Mitigation

### User Experience Risks
- **Discovery Failure**: Multiple pathway options with fallback templates
- **Abstract Confusion**: Clear examples and progressive complexity
- **Abandonment**: Engaging onboarding with immediate value

### Technical Risks
- **Database Constraints**: Proper foreign key relationships with demo user
- **Server Dependencies**: Complete standalone configuration documented
- **Development Environment**: Reproducible setup process

## Key Differentiators

1. **Modeling vs. Instruction**: Users copy what they observe rather than follow directions
2. **Personality Companions**: Not generic advice but personalized ideal-self interaction
3. **Abstract Transformation**: Handles mental/emotional pattern changes, not just habits
4. **Discovery-Driven**: Solves the "I don't know what I want" problem with guided pathways
5. **Historical Wisdom Integration**: Deep role model research provides ongoing practical tools and methods
6. **Bidirectional Attribute System**: Users can discover via people OR attributes, all leading to same rich outcome
7. **Crisis-Specific**: Situational Lightwalkers for urgent life challenges ($40-99/month premium)

---

## Document Version
- Version: 1.0
- Last Updated: 2025-01-25
- Status: Active Development
- Next Review: After Phase 1 completion