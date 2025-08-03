# Lightwalker Architecture & File Structure

## 🌐 PRODUCTION URLS

### Live Application URLs
- **🔥 MAIN APP**: https://lightwalker-mvp.vercel.app/ai-character-creation-hybrid ✅ LIVE
- **Legacy Discovery**: https://lightwalker-mvp.vercel.app/discovery-enhanced
- **GitHub Repository**: https://github.com/Bladed3d/lightwalker-mvp

### Development URLs
- **Vercel Dashboard**: https://vercel.com/dashboard (Manual deployment available)
- **Database**: PostgreSQL on Neon (via DATABASE_URL environment variable)

---

## 📁 KEY FILE LOCATIONS

### 🎯 Core Application Files
```
src/app/ai-character-creation-hybrid/page.tsx    # 🔥 Main character creation interface
src/lib/ai-service.ts                             # AI integration service
src/components/lightwalker/                       # UI components directory
```

### 🔌 API Endpoints
```
src/app/api/role-models/route.ts                  # Role model data with archetype mapping
src/app/api/semantic-search/route.ts              # Semantic attribute search
src/app/api/ai-character-creation/route.ts        # AI-powered character building
src/app/api/web-research/route.ts                 # 🔥 Real-time person attribute extraction
```

### 🗄️ Database & Scripts
```
prisma/schema.prisma                              # Database schema definition
scripts/seed-role-models.ts                      # Role model seeding script (USE THIS)
```

### 🖼️ Static Assets
```
public/role-models/*.jpg                          # 22 role model images
public/role-models/                               # Image directory structure
```

### 📋 Configuration Files
```
package.json                                      # Dependencies and scripts
next.config.js                                    # Next.js configuration
tailwind.config.js                                # Tailwind CSS configuration
.env.local                                        # Environment variables (not in git)
```

---

## 🏗️ APPLICATION ARCHITECTURE

### Frontend Architecture
```
┌─────────────────────────────────────────┐
│           Next.js App Router            │
├─────────────────────────────────────────┤
│  /ai-character-creation-hybrid          │ ← Main interface
│  ├── 4-Tab Discovery System             │
│  ├── AI-Guided Conversation             │
│  ├── Real-Time Character Builder        │
│  └── Web Research Integration           │
├─────────────────────────────────────────┤
│  Components Layer                       │
│  ├── Role Model Display                 │
│  ├── Attribute Selection                │
│  ├── Search Interface                   │
│  └── AI Response Display               │
└─────────────────────────────────────────┘
```

### Backend Architecture
```
┌─────────────────────────────────────────┐
│            API Layer                    │
├─────────────────────────────────────────┤
│  /api/role-models          │ Database   │
│  /api/semantic-search      │ Operations │
│  /api/ai-character-creation│            │
│  /api/web-research         │            │
├─────────────────────────────────────────┤
│         Services Layer                  │
├─────────────────────────────────────────┤
│  AI Service (OpenRouter)   │ Database   │
│  Semantic Matching         │ (Prisma)   │
│  Person Detection          │            │
│  Attribute Extraction      │            │
├─────────────────────────────────────────┤
│          Data Layer                     │
├─────────────────────────────────────────┤
│  PostgreSQL (Neon)         │ Static     │
│  22 Role Models            │ Assets     │
│  Enhanced Attributes       │ (Images)   │
└─────────────────────────────────────────┘
```

---

## 🔧 DEPLOYMENT ARCHITECTURE

### Vercel Deployment Flow
```
GitHub Push → Vercel Build → Production Deploy
     ↓              ↓              ↓
  main branch → npm run build → Live URL
```

### Build Process
1. **Trigger**: Push to main branch
2. **Build Command**: `npm run build`
3. **Environment**: Vercel serverless functions
4. **Database**: External PostgreSQL (Neon)
5. **Static Assets**: CDN distribution
6. **Deployment Limit**: 100 per day (Free tier)

### Environment Configuration
```bash
DATABASE_URL=postgresql://...              # Neon PostgreSQL
OPENROUTER_API_KEY=sk-...                 # AI service key
NEXT_PUBLIC_APP_URL=https://...           # Public app URL
```

---

## 🗂️ COMPONENT ARCHITECTURE

### Main Interface Components
```
ai-character-creation-hybrid/page.tsx
├── DiscoveryTabs (4 pathways)
│   ├── RoleModelTab
│   ├── AIGuideTab          ← Primary AI interface
│   ├── PerfectDayTab
│   └── ValuesFirstTab
├── SearchInterface
│   ├── SemanticSearch
│   └── WebResearchPanel    ← 🔥 New feature
├── CharacterBuilder
│   ├── RoleModelDisplay
│   ├── AttributeSelection
│   └── ProgressTracking
└── AIResponseDisplay      ← 🔥 Right panel
```

### Reusable Components
```
src/components/lightwalker/
├── RoleModelCard.tsx                     # Individual role model display
├── AttributeSelector.tsx                 # Attribute selection interface
├── SearchBar.tsx                         # Search input component
├── ProgressIndicator.tsx                 # Progress tracking display
└── AIResponseBox.tsx                     # 🔥 AI research responses
```

---

## 🔍 SEARCH SYSTEM ARCHITECTURE

### Multi-Layer Search Strategy
```
User Input → Person Detection → Web Research → Semantic Matching → Database Results
     ↓              ↓              ↓              ↓              ↓
"Ray Dalio"  → Name Extracted → AI Analysis → Trait Mapping → Role Models
```

### Search Components
1. **Person Detection**: Regex patterns identify person mentions
2. **Web Research**: AI extracts relevant attributes from person query
3. **Semantic Matching**: Maps extracted traits to database attributes
4. **Database Search**: Weighted scoring system finds matching role models
5. **Result Display**: Visual feedback with explanations

### Fallback Strategy
```
Primary: Semantic AI matching
    ↓ (if fails)
Secondary: Fuzzy text matching
    ↓ (if fails) 
Tertiary: Broad category search
    ↓ (if fails)
Final: Show all role models
```

---

## 📊 DATA FLOW ARCHITECTURE

### Character Creation Flow
```
User Input → AI Processing → Database Query → UI Update → State Management
     ↓              ↓              ↓              ↓              ↓
  Search      → Keyword      → Role Models → Visual        → Local
  Query         Extraction     & Attributes   Feedback       Storage
```

### Real-Time Updates
- **Search Results**: Immediate visual feedback
- **AI Responses**: Streaming response display
- **Character Builder**: Real-time attribute updates
- **Progress Tracking**: Live progress indicators

### State Management
```
├── Local Component State (React hooks)
├── Search State (current query, results)
├── Character Builder State (selected attributes)
├── AI Conversation State (chat history)
└── UI State (active tabs, modals, animations)
```

---

## 🔐 SECURITY ARCHITECTURE

### API Security
- **Environment Variables**: Sensitive keys stored securely
- **Rate Limiting**: Built-in Vercel rate limiting
- **Input Validation**: All user inputs validated and sanitized
- **Error Handling**: Secure error messages (no sensitive data exposed)

### Data Privacy
- **No Personal Data Storage**: Only anonymous usage patterns
- **Temporary Sessions**: No long-term user data retention
- **Public Domain Content**: All role models are historical figures

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Architecture Limits
- **Vercel Free Tier**: 100 deployments/day, serverless function limits
- **Database**: Neon PostgreSQL free tier (suitable for MVP)
- **AI Calls**: OpenRouter rate limits and cost considerations

### Scaling Path (50+ Users)
```
Current: Vercel Free + Neon Free + OpenRouter
    ↓
Phase 1: Vercel Pro + Neon Pro + Enhanced AI Tiers
    ↓
Phase 2: Custom Infrastructure + Supabase + Multiple AI Providers
```

**IMPORTANT**: All file paths should use Windows backslash format when referencing local development: `D:\\projects\\ai\\apps\\Life-Designer\\sub-projects\\Lightwalker\\...`