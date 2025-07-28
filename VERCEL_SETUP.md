# Vercel Deployment Setup

## Environment Variables Required

Add these environment variables in your Vercel dashboard:

### Database
```
DATABASE_URL=postgresql://neondb_owner:npg_wdYOgPl1RC9W@ep-round-sun-af4jmy8k-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### API Keys
```
OPENROUTER_API_KEY=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
```

### Authentication
```
NEXTAUTH_SECRET=your_auth_secret_here
NEXTAUTH_URL=https://lightwalker-mvp.vercel.app
```

### Production Settings
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://lightwalker-mvp.vercel.app
```

## Database Setup

After deployment, run the database seeding:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Set environment variables: `vercel env add DATABASE_URL`
5. Deploy: `vercel --prod`

## Database Population

To populate the database with role models, you'll need to run the seeding script after deployment. The fallback data will display 6 role models while the database is being set up.

## Current Fallback Role Models

When database connection fails, the app shows:
- Steve Jobs (Innovation & Strategic Focus)
- Buddha (Spiritual wisdom)
- Marcus Aurelius (Wisdom & Self-Discipline)
- Maya Angelou (Resilience & Grace)
- Martin Luther King Jr. (Civil rights leadership)
- Joan of Arc (Courage and faith)

All images are included in the `/public/role-models/` directory.