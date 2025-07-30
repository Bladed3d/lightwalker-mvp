import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const where: any = { isActive: true }
    
    if (domain) {
      where.primaryDomain = { contains: domain, mode: 'insensitive' }
    }
    
    if (search) {
      where.OR = [
        { commonName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { primaryDomain: { contains: search, mode: 'insensitive' } }
      ]
    }

    const roleModels = await prisma.roleModel.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        commonName: true,
        lifeSpan: true,
        primaryDomain: true,
        lifeMission: true,
        coreValues: true,
        famousQuotes: true,
        contemporaryRelevance: true,
        characterDevelopment: true,
        enhancedAttributes: true,
        dailyDoEnhanced: true,
        createdAt: true
      },
      orderBy: { commonName: 'asc' }
    })

    // Parse JSON fields for response
    const formattedRoleModels = roleModels.map(roleModel => ({
      ...roleModel,
      coreValues: JSON.parse(roleModel.coreValues || '[]'),
      famousQuotes: JSON.parse(roleModel.famousQuotes || '[]'),
      enhancedAttributes: JSON.parse(roleModel.enhancedAttributes || '[]'),
      dailyDoEnhanced: roleModel.dailyDoEnhanced || null // Keep as parsed JSON or null
    }))

    return NextResponse.json({ roleModels: formattedRoleModels })

  } catch (error) {
    console.error('Error fetching role models:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create new role model (admin function)
    const roleModel = await prisma.roleModel.create({
      data: {
        ...body,
        coreValues: JSON.stringify(body.coreValues || []),
        valueHierarchy: JSON.stringify(body.valueHierarchy || []),
        dominantTraits: JSON.stringify(body.dominantTraits || []),
        decisionProcess: JSON.stringify(body.decisionProcess || {}),
        famousQuotes: JSON.stringify(body.famousQuotes || []),
        decisionTemplates: JSON.stringify(body.decisionTemplates || [])
      }
    })

    return NextResponse.json({ roleModel })

  } catch (error) {
    console.error('Error creating role model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}