import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return handleSetup()
}

export async function GET(request: NextRequest) {
  return handleSetup()
}

async function handleSetup() {
  try {
    // Check if setup already done
    const existingTemplates = await prisma.lightwalkerTemplate.count()
    
    if (existingTemplates > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        templateCount: existingTemplates
      })
    }

    // Run the actual seed script content instead
    await prisma.$executeRaw`DELETE FROM lightwalker_templates`
    
    // Use the same templates as seed.ts
    await runDatabaseSeed()

    // Insert all templates
    const createdTemplates = await prisma.lightwalkerTemplate.createMany({
      data: templates
    })

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      templatesCreated: createdTemplates.count
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}