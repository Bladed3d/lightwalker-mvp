# Lightwalker Project Context for Taskmaster

## Project Vision
Transform personal development from "advice-giving" to "behavioral modeling" through AI companions that represent users' ideal future selves.

## Key Innovation
Instead of telling users what to do, Lightwalkers **show** what they do - enabling natural copying behavior for effortless transformation.

## Current Architecture

### Multi-Dimensional Character System
- **Habits**: Concrete daily practices (exercise, meditation, journaling)
- **Traits**: Personality transformations (judgment→gratitude, anxiety→calm)  
- **Values**: Core principles guiding decisions
- **Role Models**: Historical wisdom (Patanjali, Marcus Aurelius, etc.)
- **Knowledge**: User's personal library integration

### Technical Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Prisma + PostgreSQL (Neon)
- **AI**: OpenRouter integration for multi-model support
- **Dashboard**: Gaming-inspired HUD interface
- **Deployment**: Vercel + Neon database

### File Structure
```
/src/components/
├── HUD/LightwalkerHUD.tsx          # Gaming dashboard
├── lightwalker/                     # Core components
└── dashboard/                       # Dashboard panels

/docs/
├── multi-dimensional-character-architecture.md
├── interactive-conversation-engine.md
├── character-creation-research.md
└── Lightwalker-brainstorm.md

/prisma/
├── schema.prisma                    # Multi-dimensional data model
└── seed.ts                         # Template data
```

## Development Philosophy
1. **Progressive Complexity**: Start simple, add sophistication over time
2. **Gaming-Inspired UX**: Visual engagement over text-heavy interfaces  
3. **Quality over Quantity**: Curated experiences vs unlimited options
4. **User Agency**: Choice-based transformation, no forced coaching

## Critical Success Factors
1. **Character Coherence**: Multi-dimensional synthesis must feel authentic
2. **Visual Impact**: Dashboard must immediately differentiate from competitors
3. **Practical Utility**: System must work for real-life complexity
4. **Performance**: Real-time synthesis without lag

## Current Challenges
1. **Complexity Management**: Sophisticated backend with simple UX
2. **Role Model Authenticity**: Accurate historical representation
3. **Knowledge Integration**: Seamless citation and application
4. **Conversation Quality**: Context-aware, personality-consistent responses

## Competitive Advantages
1. **Multi-dimensional approach**: Beyond single-focus apps
2. **Gaming aesthetics**: Engaging visual interface
3. **Role model integration**: Historical wisdom application
4. **Knowledge synthesis**: Personal library integration
5. **Modeling philosophy**: Show don't tell approach

This context helps Taskmaster understand the project's complexity and track progress across multiple sophisticated systems.