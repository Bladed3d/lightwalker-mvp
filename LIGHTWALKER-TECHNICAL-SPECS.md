# Lightwalker Technical Specifications

## 🛠️ DEVELOPMENT STACK

**Framework**: Next.js 14 with App Router
**Language**: TypeScript
**Database**: PostgreSQL (Neon) with Prisma ORM
**Styling**: Tailwind CSS
**Deployment**: Vercel
**AI Integration**: OpenRouter (GPT-4o-mini)

---

## 💾 DATABASE ARCHITECTURE

### RoleModel Schema (40+ fields)
```sql
model RoleModel {
  id                    Int      @id @default(autoincrement())
  name                  String
  commonName            String   @unique
  era                   String
  culture               String
  knownFor              String
  corePhilosophy        String
  // ... 35+ additional fields
  enhancedAttributes    Json     // Contains 6th-grade explanations, benefits, oppositeOf, methods
}
```

### Key Database Details
- **22 Role Models**: Buddha, Steve Jobs, MLK Jr., Joan of Arc, Einstein, etc.
- **Enhanced Attributes**: JSON field with structured attribute data
- **Image URLs**: Generated from commonName (space→hyphen, period removal)
- **Seeding**: Via `scripts/seed-role-models.ts` (NEVER create new seeding scripts)

---

## ⚡ CRITICAL COMMANDS

### ✅ ALWAYS USE THESE
```bash
npm run build                           # Build production (NEVER use npm run dev)
npx ts-node scripts/seed-role-models.ts # Seed role models
git status                              # Check git status
git add [files]                         # Stage files
git commit -m "message"                 # Commit changes
git push origin main                    # Deploy to production
```

### ❌ NEVER USE THESE  
```bash
npm run dev                             # FORBIDDEN - Prisma file lock issues
npm start                               # Not configured
find . -name "*.ts"                     # Use Glob tool instead
grep pattern file                       # Use Grep tool instead
cat file.txt                            # Use Read tool instead
ls directory                            # Use LS tool instead
```

### 🟡 KNOWN ISSUES & WORKAROUNDS
- **Prisma File Locking (Windows)**: `npm run build` may fail first time → Retry once
- **Git Line Endings**: CRLF warnings are normal on Windows → Ignore
- **TypeScript Compilation**: Use `npm run build` instead of `npx tsc --noEmit`

---

## 🔧 DEVELOPMENT ENVIRONMENT

### Windows-Specific Considerations
- **File Paths**: Use backslash format `D:\\projects\\...`
- **PowerShell**: May require different syntax than Unix commands
- **File Locking**: Windows processes can cause temporary locks (retry builds)
- **Tools Over Bash**: Always use Read, Grep, LS tools instead of bash commands

### Environment Variables
```bash
DATABASE_URL=postgresql://...           # Neon PostgreSQL connection
OPENROUTER_API_KEY=sk-...              # AI integration key
```

---

## 🚨 DEPLOYMENT SPECIFICATIONS

### Vercel Configuration
- **Free Tier Limit**: 100 deployments per day
- **Auto-Deploy**: Pushes to main branch trigger deployment
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Deployment Rules
1. **ALWAYS batch 3-5 changes** before pushing
2. **ALWAYS ask permission** before git push
3. **Rate limit resets**: Every 24 hours
4. **Manual deployment**: Available in Vercel dashboard if needed

---

## 📦 PACKAGE MANAGEMENT

### ✅ ALLOWED PACKAGES
- Core Next.js ecosystem packages
- Tailwind CSS and related utilities
- Prisma and database connectors
- OpenRouter/OpenAI packages

### ❌ FORBIDDEN PACKAGES
```bash
react-router-dom                        # Breaks Vercel deployment with pnpm lockfile conflicts
@types/react-router-dom                 # Same pnpm issue
```

### Installation Notes
- Use `npm install` for new packages
- Run in Lightwalker subdirectory
- Check for lockfile conflicts before deployment

---

## 🔌 API ENDPOINTS

### Production APIs
```
/api/role-models                        # Get all role models with archetype mapping
/api/semantic-search                    # Semantic attribute search
/api/ai-character-creation              # AI-powered character building
/api/web-research                       # Real-time person attribute extraction
```

### API Patterns
- Consistent error handling with try/catch blocks
- Proper TypeScript types for all endpoints
- JSON response format standardized
- Rate limiting considerations for AI calls

---

## 🎨 UI/UX TECHNICAL DETAILS

### Component Architecture
- **Main Interface**: `src/app/ai-character-creation-hybrid/page.tsx`
- **Discovery System**: Integrated 4-tab discovery interface
- **Real-Time Builder**: Visual feedback with role model highlighting
- **Responsive Design**: Mobile (min-h-[500px]) + Desktop (70vh) optimized

### Styling Conventions
- Tailwind CSS utility-first approach
- Consistent color palette and spacing
- Animation system using CSS transitions
- Component-level styling (no global CSS modifications)

### State Management
- React hooks for local component state
- No external state management library
- Real-time updates without external dependencies
- Clean state management patterns established

---

## 🔍 DEBUGGING & TESTING

### Testing Strategy
- **Local Testing**: Always use `npm run build` to test changes
- **API Testing**: Use curl or browser for endpoint verification
- **TypeScript**: Zero compilation errors required for deployment
- **Visual Testing**: Screenshot comparison when possible

### Debugging Methodology
1. **Test Model Reliability**: Check AI endpoint responsiveness first
2. **Test APIs Directly**: Verify endpoints before testing UI
3. **Check Semantic Alignment**: Ensure user language matches database structure
4. **Time-box Debugging**: No more than 2 hours without systematic approach

### Common Issues
- **Search Failures**: Usually semantic mismatch ("forgiveness" vs "forgiving")
- **AI Response Issues**: Check model reliability before deep debugging
- **Build Failures**: Retry once for Windows file locking, then investigate

---

## 📂 DEPENDENCY MANAGEMENT

### Core Dependencies
- Next.js 14 with App Router
- TypeScript with strict configuration
- Prisma ORM with PostgreSQL connector
- Tailwind CSS with component plugins

### Development Workflow
1. Make changes using appropriate tools (Read, Edit, MultiEdit)
2. Test locally with `npm run build`
3. Fix any TypeScript errors
4. Ask permission before git operations
5. Batch multiple related changes
6. Deploy to production via git push

**IMPORTANT**: Always check `CLAUDE-CRITICAL-RULES.md` before executing any system commands!