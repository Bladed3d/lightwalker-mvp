# Lightwalker™ Project Quickstart Guide

## For New Chat Sessions: How to Resume Work

**Read this file first, then execute the diagnostic commands below to understand current project state.**

### Current Project Status
- **Project**: AI-powered Lightwalker™ character creation interface
- **Critical Issue**: RESOLVED - Scalable semantic search system implemented
- **Last Working**: Full semantic search with AI matching, direct keywords, and fuzzy fallback
- **Phase**: Ready for production testing and deployment

### Immediate Diagnostic Steps
```bash
cd D:\projects\ai\apps\Life-Designer\sub-projects\Lightwalker
npm run build  # Should succeed - confirms basic setup
npm run dev    # Start dev server
# Test: http://localhost:3001/ai-character-creation-hybrid
# Try search: "I want to forgive others easier" - should now return Lincoln/Buddha results
```

### Priority Tasks (Update when working on project)
1. **READY**: Push semantic search system to production
2. Test complete user flow in production environment
3. Verify search works for ANY concept (forgiveness, focus, procrastination, etc.)
4. Monitor semantic AI matching performance
5. Gather user feedback on search quality

### Key Technical Context
- **Stack**: Next.js 14, TypeScript, Prisma ORM, PostgreSQL (Neon), Tailwind CSS
- **Database**: 22 role models with enhancedAttributes JSON fields
- **AI**: OpenRouter API with DeepSeek R1 models for keyword extraction
- **NEVER use**: `react-router-dom` (breaks Vercel deployments)
- **Deployment**: Vercel (100/day limit - batch commits)

### Critical Files to Examine
- `src/app/ai-character-creation-hybrid/page.tsx` - Main search interface
- `src/app/api/role-models/route.ts` - Database API (has JSON parsing fixes)
- `src/app/api/ai-character-creation/route.ts` - AI search processing
- `src/lib/ai-service.ts` - OpenRouter integration
- `CLAUDE.md` - Full project context and branding requirements

### Expected User Flow (Currently Broken)
1. User types: "I want to forgive others easier"
2. AI extracts keywords, searches role models
3. Results show in left panel with highlighted role models in top gallery
4. User selects individual attributes (checkboxes)
5. Right panel shows selected attributes
6. Character building continues

### Recent Changes That May Have Broken Search
- Layout improvements: collapsible chat, compact role model gallery
- Database JSON parsing safety fixes
- TypeScript compatibility updates
- State management changes in main interface component

---

## For Current Chat: How to Update This File

**When user says "Please follow the instructions in quickstart.md to document our current progress", write:**

### Update Instructions for Current Chat

Replace the sections above with current information:

1. **Current Project Status**: What phase are we in? What's working/broken?
2. **Priority Tasks**: List 3-5 immediate next steps in order
3. **Recent Changes**: What was done in current session that might affect new chat?
4. **Diagnostic Commands**: Update any commands that need to be run first
5. **Expected Behavior**: What should be working when fixed?

**Keep unchanged**: Technical context, file locations, user flow structure, critical rules (react-router-dom warning, Vercel limits, etc.)

**Format**: Use same markdown structure, update content only. Focus on actionable information for resuming work efficiently.