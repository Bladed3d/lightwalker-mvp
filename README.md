# Lightwalker MVP

AI personality companion system where users create ideal versions of themselves to copy behaviors from.

## Quick Deploy to Vercel

### 1. Database Setup (Neon)
1. Go to [neon.tech](https://neon.tech) and create free account
2. Create new project → Get connection string
3. Copy connection string for environment variables

### 2. Deploy to Vercel
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (from Neon)
   - `OPENROUTER_API_KEY` (your OpenRouter key - supports Claude, GPT, Llama)
   - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)

### 3. Run Database Migration
After deployment, run in Vercel dashboard or locally:
```bash
npx prisma db push
npx prisma db seed
```

## Local Development

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migration
npx prisma db push
npx prisma db seed

# Start development server
pnpm dev
```

## Core Features

- ✅ Template selection (Situational vs General)
- ✅ Character creation system
- ✅ Database with user tracking
- 🚧 4-path discovery triage system
- 🚧 Daily behavior copying interface

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- OpenAI API

## Deployment Status

- **Local**: ❌ (causes BSOD on Windows)
- **Vercel**: ✅ Ready to deploy
- **Database**: ✅ Neon PostgreSQL configured