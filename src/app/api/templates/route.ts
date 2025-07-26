import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.lightwalkerTemplate.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        tagline: true,
        description: true,
        category: true,
        monthlyPrice: true,
        icon: true,
        colorScheme: true,
        sampleActivities: true,
        coreTraits: true,
      },
      orderBy: [
        { category: 'asc' },
        { monthlyPrice: 'desc' },
        { name: 'asc' }
      ]
    })

    // Parse JSON strings for frontend
    const templatesWithParsedData = templates.map(template => ({
      ...template,
      colorScheme: JSON.parse(template.colorScheme),
      sampleActivities: JSON.parse(template.sampleActivities),
      coreTraits: JSON.parse(template.coreTraits),
    }))

    return NextResponse.json({
      success: true,
      data: templatesWithParsedData
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch templates' 
      },
      { status: 500 }
    )
  }
}