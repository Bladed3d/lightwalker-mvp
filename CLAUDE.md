# Lightwalker Project Context

## Critical Time Estimation Adjustment

**IMPORTANT**: All time estimates must be adjusted using the formula:
- **1 week in estimates = 1 hour in reality**
- What seems like it should take "weeks" typically gets completed in hours
- Avoid creating fear about MVP timelines with inflated estimates
- Be optimistic about implementation speed while maintaining quality focus

## Project Overview

**Lightwalker**: AI personality companion system where users create ideal versions of themselves to copy behaviors from.

**Current Status**: Discovery System Phase COMPLETED ✅ (July 28, 2025)

**✅ COMPLETED FEATURES:**
- **Full Role Model Discovery System**: 22 comprehensive role models with enhanced attributes
- **Production Deployment**: https://lightwalker-mvp.vercel.app/discovery-enhanced fully functional
- **Database Integration**: PostgreSQL with Prisma ORM, all role models seeded
- **Enhanced Attributes System**: 6th-grade explanations, benefits, oppositeOf, methods for each trait
- **Gamified UI**: Particles, animations, achievement system foundation
- **Image System**: All 22 role model images working correctly
- **Fallback System**: 6 role models display when database unavailable

**🔧 RECENT TECHNICAL FIXES:**
- Fixed image URL generation to use commonName instead of database IDs
- Resolved Buddha/MLK Jr. image loading issues (filename casing, period handling)
- Fixed TypeScript compilation errors with const assertions
- Enhanced debug logging for production troubleshooting

## Key Technical Context

**Stack**: Next.js 14, TypeScript, Prisma ORM, PostgreSQL (Neon), Tailwind CSS

**Database**: 
- **Production**: PostgreSQL on Neon (configured via DATABASE_URL)
- **RoleModel Schema**: 40+ fields including enhancedAttributes JSON field
- **22 Role Models**: Buddha, Steve Jobs, MLK Jr., Joan of Arc, Einstein, etc.
- **Image URLs**: Generated from commonName with space→hyphen, period removal

**Important Commands**:
- `npm run dev` - Start development server (port 3001)
- `npx ts-node scripts/seed-role-models.ts` - Seed role models
- Always run in Lightwalker subdirectory with proper dependencies

**Key File Locations**:
- **Discovery UI**: `src/components/lightwalker/GamifiedDiscoveryEnhanced.tsx`
- **Database Schema**: `prisma/schema.prisma`
- **Role Model Seeding**: `scripts/seed-role-models.ts`
- **API Endpoint**: `src/app/api/role-models/route.ts`
- **Images**: `public/role-models/*.jpg` (22 files)

**Production URLs**:
- **Working Discovery**: https://lightwalker-mvp.vercel.app/discovery-enhanced
- **GitHub Repo**: https://github.com/Bladed3d/lightwalker-mvp

## User Experience Research

**90/10 Problem**: 90% of users don't know what they want their Lightwalker to be like
**Solution**: Dynamic Discovery Triage System with 4 pathways:
1. Role Model Method (20-30% of users)
2. Problem-First Method (40-50% of users) 
3. Day-in-Life Visioning (30-40% of users)
4. Values-First Discovery (15-25% of users)

## 🚀 NEXT DEVELOPMENT PHASE: POST-CREATION EXPERIENCE

**PRIMARY FOCUS**: Users have selected their role model and traits - now what?

**IMMEDIATE PRIORITIES (in order):**

1. **Lightwalker™ Character Display**
   - Show selected role model + traits as unified "character"
   - Display daily behavior copying suggestions
   - "What would [Role Model] do in this situation?" interface

2. **Daily Behavior Copying System**
   - Morning check-in: "What situations will you face today?"
   - Real-time suggestions: Tap situations → get role model's approach
   - Evening reflection: "How did you copy [Trait] today?"

3. **Achievement & Progress System**
   - Track behavior copying streaks
   - Unlock new traits/methods as user progresses
   - Visual progress indicators for trait development

4. **Situation-Based Guidance**
   - Common situations: work stress, relationships, decisions
   - Role model's specific approach for each situation
   - First-person examples: "I pause and consider..." (never "You should...")

**TECHNICAL FOUNDATION READY:**
- Database schema supports enhanced attributes with methods
- UI components for role model display exist
- Gamification system foundation in place

## CRITICAL BRANDING REQUIREMENT

**ALWAYS USE LIGHTWALKER™ WITH TRADEMARK SYMBOL**

Every reference to "Lightwalker" in the app MUST include the trademark symbol (™):
- ✅ CORRECT: "Lightwalker™", "Your Lightwalker™", "Lightwalker™ Status"
- ❌ WRONG: "Lightwalker", "Your Lightwalker", "Lightwalker Status"

This applies to:
- All UI text and headers
- Placeholder text in inputs
- Button labels
- Error messages
- Documentation
- API responses

## CRITICAL INTERACTION RULE

**NEVER TELL USERS WHAT TO DO - ONLY SHOW WHAT LIGHTWALKER™ DOES**

The Lightwalker MUST only speak in first person about their own actions/thoughts:
- ✅ CORRECT: "I pause and think about what I can appreciate about this person's situation"
- ✅ CORRECT: "When someone cuts me off in traffic, I take a deep breath and wonder what stress they might be under"
- ❌ WRONG: "You should pause and think..." 
- ❌ WRONG: "What can you appreciate about..."
- ❌ WRONG: Any directive or instructional language

This is fundamental to the learning-through-copying model. Users observe and copy behaviors, they are never instructed or told what to do.

## Key Learnings

- CodeTeam agents can complete "9-week" projects in hours when properly orchestrated
- Enhanced Project Manager has mandatory UX flow planning capabilities
- Smart categorization solves template scaling issues
- Server setup requires complete dependency installation in subdirectory

## CRITICAL: Role Model Selection Guidelines

**NEVER USE LIVING PEOPLE AS ROLE MODELS**
- Only use historical figures who have passed away
- We do not have permission to use living individuals' personas
- This avoids legal/ethical issues with personality rights
- Stick to well-documented historical figures with extensive public records
- If someone suggests a living person, replace with appropriate historical alternative

## CRITICAL: How to Add Role Models (Don't Overcomplicate This!)

**Steve Jobs was added using `scripts/seed-role-models.ts` - just use the same script!**

**To add more role models:**
1. Edit `scripts/seed-role-models.ts`
2. Add new objects to the `roleModelsData` array (copy Steve Jobs format exactly)
3. Run: `npx ts-node scripts/seed-role-models.ts`
4. That's it! Don't create new scripts or APIs.

**The script already has the complete schema structure - just copy the Steve Jobs entry format.**

**NEVER:**
- Create new seeding scripts
- Try to use the API endpoints
- Overcomplicate with schema analysis
- Start from scratch

**ALWAYS:**
- Use the existing working script
- Copy the exact format that works
- Add to the existing array
- Run the existing command

## Success Metrics

- 80%+ users successfully create Lightwalker they're excited about
- 90%+ begin daily copying behaviors within first week
- 70%+ report authentic/inspiring character after 30 days