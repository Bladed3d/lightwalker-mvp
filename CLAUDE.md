# Lightwalker Project Context

## Critical Time Estimation Adjustment

**IMPORTANT**: All time estimates must be adjusted using the formula:
- **1 week in estimates = 1 hour in reality**
- What seems like it should take "weeks" typically gets completed in hours
- Avoid creating fear about MVP timelines with inflated estimates
- Be optimistic about implementation speed while maintaining quality focus

## Project Overview

**Lightwalker**: AI personality companion system where users create ideal versions of themselves to copy behaviors from.

**Current Status**: Sprint 1 completed successfully in hours (not weeks) including:
- Smart categorization system with situational vs general templates
- Database schema with category and pricing fields
- Tabbed UI interface
- 4 new situational templates (Divorce Navigator, Relationship Rescue, etc.)
- Fixed template creation errors and server setup

## Key Technical Context

**Stack**: Next.js 14, TypeScript, Prisma ORM, SQLite, Tailwind CSS

**Database**: 
- Users table with WordPress integration
- LightwalkerTemplate model with category/monthlyPrice fields
- Demo user (ID: demo-user-id) for testing

**Important Commands**:
- `npm run dev` - Start development server (port 3001)
- `npx prisma db seed` - Seed database with templates
- Always run in Lightwalker subdirectory with proper dependencies

## User Experience Research

**90/10 Problem**: 90% of users don't know what they want their Lightwalker to be like
**Solution**: Dynamic Discovery Triage System with 4 pathways:
1. Role Model Method (20-30% of users)
2. Problem-First Method (40-50% of users) 
3. Day-in-Life Visioning (30-40% of users)
4. Values-First Discovery (15-25% of users)

## Development Priorities

1. **Character Creation**: Multi-pathway discovery system to solve 90/10 problem
2. **Post-Creation Experience**: Daily behavior copying for both concrete (exercise) and abstract (judgment→gratitude) transformations
3. **User Flow Documentation**: Every feature needs comprehensive flow mapping before implementation

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