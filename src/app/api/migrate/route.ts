import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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