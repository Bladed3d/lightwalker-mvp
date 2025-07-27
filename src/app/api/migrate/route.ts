import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'migrate') {
      return handleMigration()
    }

    if (action === 'seed-role-models') {
      return seedRoleModels()
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return handleMigration()
  }
}

export async function GET(request: NextRequest) {
  return handleMigration()
}

async function handleMigration() {
  try {
    // Create a fresh Prisma client for migration
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })

    // Test connection first
    await prisma.$connect()
    
    // Try to query existing tables
    try {
      const existingTemplates = await prisma.lightwalkerTemplate.count()
      await prisma.$disconnect()
      
      return NextResponse.json({
        success: true,
        message: 'Database already initialized and accessible',
        templateCount: existingTemplates
      })
    } catch (tableError) {
      // Tables don't exist, need to create them
      console.log('Tables not found, this is expected for fresh database')
    }

    // Create tables using raw SQL for Neon PostgreSQL
    await prisma.$executeRawUnsafe(`
      -- Create users table
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "wordpress_user_id" INTEGER NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "preferences" TEXT DEFAULT '{}',
        "timezone" TEXT NOT NULL DEFAULT 'UTC',
        "status" TEXT NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `)

    await prisma.$executeRawUnsafe(`
      -- Create lightwalker_templates table
      CREATE TABLE IF NOT EXISTS "lightwalker_templates" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "display_name" TEXT NOT NULL,
        "tagline" TEXT,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'general',
        "monthly_price" DOUBLE PRECISION NOT NULL DEFAULT 29.00,
        "personality_prompt" TEXT NOT NULL,
        "communication_style" TEXT NOT NULL,
        "core_traits" TEXT NOT NULL,
        "daily_routines" TEXT NOT NULL,
        "challenge_responses" TEXT NOT NULL,
        "sample_activities" TEXT NOT NULL,
        "icon" TEXT NOT NULL DEFAULT '✨',
        "color_scheme" TEXT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "lightwalker_templates_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_wordpress_user_id_key" ON "users"("wordpress_user_id");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "lightwalker_templates_name_key" ON "lightwalker_templates"("name");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "lightwalker_templates_category_is_active_idx" ON "lightwalker_templates"("category", "is_active");
    `)

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function seedRoleModels() {
  try {
    const prisma = new PrismaClient()
    
    const steveJobsData = {
      fullName: "Steven Paul Jobs",
      commonName: "Steve Jobs", 
      lifeSpan: "1955-2011 (56 years)",
      culturalContext: "American technology industry, middle-class adoption background",
      historicalPeriod: "Digital revolution, personal computer era, mobile technology transformation",
      primaryDomain: "Innovation and technology leadership",
      lifeMission: "Create technology products that are intuitive, beautiful, and transform how people live",
      coreValues: JSON.stringify([
        "Perfectionism in design and user experience",
        "Simplicity over complexity", 
        "Revolutionary thinking over incremental improvement"
      ]),
      valueHierarchy: JSON.stringify([
        "User experience",
        "Design beauty", 
        "Technical innovation"
      ]),
      worldview: "Technology should serve humanity by being invisible and intuitive",
      personalPhilosophy: "Stay hungry, stay foolish - continuous learning and risk-taking",
      dominantTraits: JSON.stringify([
        "Perfectionist - obsessed with details others missed",
        "Visionary - seeing future products before markets knew they wanted them",
        "Demanding - high standards for self and others"
      ]),
      communicationStyle: "Direct, passionate, storytelling through demonstrations",
      emotionalPatterns: "Intense enthusiasm for great work, frustration with mediocrity",
      socialInteractionStyle: "Charismatic leadership through vision-sharing",
      learningApproach: "Hands-on experimentation, studying great design across industries",
      decisionProcess: JSON.stringify({
        philosophy: "Deciding what not to do is as important as deciding what to do"
      }),
      informationGathering: "Customer observation, market sensing, technology trend analysis",
      evaluationCriteria: "User experience impact, design elegance, technical feasibility",
      riskAssessment: "Calculated risks on breakthrough technologies",
      implementationStyle: "Rapid prototyping, iterative perfection",
      morningPractices: "Early rising, meditation, reviewing overnight emails",
      workPatterns: "12-16 hour workdays, deep focus sessions, walking meetings",
      physicalPractices: "Regular walking, minimal but consistent exercise",
      mentalSpiritualPractices: "Zen meditation, calligraphy study",
      eveningRoutines: "Family time, reading, reflection on daily progress",
      weeklyMonthlyRhythms: "Monday strategy sessions, Friday product reviews",
      stressManagement: "Meditation, walking, intense focus on solutions",
      conflictResolution: "Direct confrontation of issues, clear expectations",
      failureResponse: "Rapid learning from failure, immediate course correction",
      crisisLeadership: "Calm determination, clear vision communication",
      adaptationStrategies: "Continuous market sensing, willingness to cannibalize own products",
      coreTeachings: "Focus on user experience above all; simplicity is the ultimate sophistication",
      famousQuotes: JSON.stringify([
        "Stay hungry, stay foolish",
        "Design is not just what it looks like - design is how it works",
        "Innovation distinguishes between a leader and a follower"
      ]),
      teachingMethods: "Demonstration over explanation, learning through product creation",
      keyPrinciples: "User-first design, elegant simplicity, controlled ecosystem",
      practicalApplications: "Product development methodology, design thinking, strategic focus",
      familyRelationships: "Devoted to children, learning to balance work and family",
      friendshipPatterns: "Few but deep relationships, loyalty to those who shared vision",
      mentorshipStyle: "High expectations, direct feedback, inspiring through possibility",
      leadershipApproach: "Vision-driven, demanding excellence, creating possibility for others",
      conflictHandling: "Direct address of issues, performance-based decisions",
      contemporaryRelevance: "Product development, design thinking, strategic focus",
      dailyLifeApplications: "Simplifying daily routines, focusing on essential priorities",
      decisionTemplates: JSON.stringify([
        "What would create the best user experience?",
        "How can this be simplified?"
      ]),
      characterDevelopment: "Developing design sensibility, focus and elimination skills",
      commonMisinterpretations: "Perfectionism as never shipping; focus as rigidity",
      personalitySynthesis: "Combine Jobs' perfectionism with user empathy",
      decisionConsultation: "Frame decisions around user experience and elegant simplicity",
      situationalApplications: "Product development, career decisions, creative projects",
      potentialConflicts: "May conflict with collaborative styles",
      userImplementation: "Daily prioritization practice, design thinking application",
      primarySources: "Walter Isaacson biography, Apple keynote speeches",
      historicalSources: "Contemporary business press coverage, colleague interviews",
      academicSources: "Business school case studies, innovation research",
      culturalSources: "Technology industry oral histories",
      sourceQualityAssessment: "High reliability from authorized biography",
      historicalAccuracy: "Well-documented life with verified timeline",
      quoteAuthentication: "Famous quotes verified through video/audio records",
      culturalSensitivity: "Represents Silicon Valley innovation culture",
      balancedPerspective: "Acknowledges both visionary leadership and demanding style",
      scholarlyConsensus: "Widely recognized as transformative leader"
    }

    await prisma.roleModel.deleteMany({})
    
    const roleModel = await prisma.roleModel.create({
      data: steveJobsData
    })

    await prisma.$disconnect()

    return NextResponse.json({ 
      success: true, 
      count: 1,
      roleModel: { id: roleModel.id, name: roleModel.commonName }
    })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({ 
      error: `Seeding failed: ${error.message}` 
    }, { status: 500 })
  }
}