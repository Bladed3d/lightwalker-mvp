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

**📅 LATEST SESSION (July 29, 2025):**
- **Major Achievement**: Complete database redesign from JSON to relational structure
- **Multi-Role-Model Support**: Users can now mix traits from different role models
- **Character Display**: Shows all contributing role models as vertical avatar stack
- **Fixed Issues**: Infinite re-render loops, purple dot bleeding, animation cleanup
- **Deployment Status**: Hit Vercel 100/day limit, waiting for reset
- **Last Commit**: `3a67533` - All improvements ready to deploy when Vercel resumes
- **Infrastructure Plan**: Documented Supabase migration for 50 users milestone in PRD

## Key Technical Context

**Stack**: Next.js 14, TypeScript, Prisma ORM, PostgreSQL (Neon), Tailwind CSS

**⚠️ CRITICAL: DO NOT INSTALL REACT-ROUTER-DOM**
- This project uses **Next.js App Router** for routing - NOT React Router
- `react-router-dom` and `@types/react-router-dom` cause pnpm lockfile conflicts
- These packages were previously installed for testing but removed (commit `229375d`)
- For navigation, use Next.js `useRouter()`, `Link`, and `redirect()` instead
- Installing react-router-dom will break Vercel deployments with `ERR_PNPM_OUTDATED_LOCKFILE`

**Database**: 
- **Production**: PostgreSQL on Neon (configured via DATABASE_URL)
- **RoleModel Schema**: 40+ fields including enhancedAttributes JSON field
- **22 Role Models**: Buddha, Steve Jobs, MLK Jr., Joan of Arc, Einstein, etc.
- **Image URLs**: Generated from commonName with space→hyphen, period removal

**Important Commands**:
- `npm run build` - Build production version (ALWAYS use this instead of dev)
- `npx ts-node scripts/seed-role-models.ts` - Seed role models
- Always run in Lightwalker subdirectory with proper dependencies

**🚨 CRITICAL DEVELOPMENT RULE:**
- **NEVER use `npm run dev`** - Only use `npm run build` for testing
- **ALWAYS ask before pushing to git** - Batch multiple changes together
- **ALWAYS ask before deploying to Vercel** - Remember the 100/day limit

**🚨 CRITICAL DEPLOYMENT LIMITATION:**
- **Vercel Free Tier**: Only 100 deployments per day
- **ALWAYS batch multiple fixes/updates before pushing to GitHub**
- **DO NOT push individual commits** - wait until you have 3-5 related changes
- **Rate limit resets every 24 hours** - plan deployments accordingly
- **Manual deployment available** in Vercel dashboard if needed

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

## 🚀 NEXT DEVELOPMENT PHASE: AI-POWERED CHARACTER CREATION

**PRIMARY FOCUS**: Revolutionary character creation with AI guidance + manual control

**🤖 AI CHARACTER CREATION SYSTEM (Phase 1 - MVP):**

1. **Hybrid Interface** ✅ PROTOTYPE COMPLETE
   - `/ai-character-creation` page implemented
   - Dual-path: AI-Guided conversation OR Manual search
   - Real-time Lightwalker™ builder with visual feedback
   - Search system with synonym expansion and smart weighting

2. **Progressive AI Strategy** 📋 PLANNED
   - **Phase 1 (MVP)**: Kimi K2 via Openrouter for cost efficiency
   - **Phase 2 (Enhancement)**: Tiered AI system with automatic escalation
   - Simple tasks: Kimi K2 (keyword extraction, basic responses)
   - Complex tasks: Premium AI (frustration triggers, nuanced conversations)

3. **User Experience Flow**
   - Opening: Ask user preferred discovery method (problems/traits/people/habits)
   - AI highlights top recommendation but never auto-adds
   - User must checkbox confirm all selections
   - Limit 2 selections per search to maintain focus
   - Visual magic: Role model highlighting, attribute preview, progress tracking

**IMMEDIATE NEXT STEPS:**
1. Implement Kimi K2 integration via Openrouter
2. Build conversation parser for natural language → keywords
3. Add visual feedback animations (highlighting, progress indicators)
4. Test with pre-beta users
5. Plan tiered AI system for Phase 2

**POST-CREATION EXPERIENCE (Phase 2):**
- Daily behavior copying system with enhanced Daily-Do items ✅
- Situation-based guidance using first-person examples
- Achievement system and progress tracking
- Real-time coaching conversations

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

## CRITICAL: SEARCH SYSTEM DESIGN PRINCIPLES

**NEVER HARD-CODE SPECIFIC KEYWORD SOLUTIONS**

❌ **WRONG APPROACH:**
- Adding "forgiveness" → "compassion" hard-coded mappings
- Creating specific fallback rules for individual words
- Building keyword lists that need manual updates for each user complaint

✅ **CORRECT APPROACH:**
- Build semantic/fuzzy matching systems that work for ANY concept
- Use AI models to understand meaning, not keyword matching
- Create systems that learn and adapt automatically
- Design for 10,000+ different search terms without manual intervention

**SEARCH ARCHITECTURE REQUIREMENTS:**
1. **Semantic Understanding**: System must understand concepts like "forgiveness" = "compassion" through AI, not hard-coded rules
2. **Automatic Learning**: When searches fail, system should learn from database content automatically
3. **Scalable Matching**: Must work for ANY psychological/personal development concept without manual coding
4. **Fallback Strategy**: If semantic matching fails, use fuzzy text matching across ALL database content

**IMPLEMENTATION STRATEGY:**
- Use AI models (OpenRouter) for semantic keyword extraction AND semantic matching
- Build database content analysis to automatically find related concepts
- Implement fuzzy matching as final fallback for unknown terms
- Never add individual keyword mappings - always build systems that scale

**VIOLATION CONSEQUENCES:**
Hard-coding specific solutions like "forgiveness" keywords will result in:
- 2,000+ user complaints requiring individual fixes
- Unmaintainable codebase with hundreds of special cases
- Poor user experience for uncommon but valid searches
- Technical debt that prevents scaling

**REMEMBER:** If you find yourself adding specific words to keyword lists, STOP and build a semantic system instead.

## Success Metrics

- 80%+ users successfully create Lightwalker they're excited about
- 90%+ begin daily copying behaviors within first week
- 70%+ report authentic/inspiring character after 30 days