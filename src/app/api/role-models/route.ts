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

    // Parse JSON fields for response and add imageUrl + missing UI fields
    const formattedRoleModels = roleModels.map(roleModel => {
      // Generate imageUrl from commonName (same logic as working components)
      const imageFileName = roleModel.commonName
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/\./g, '')    // Remove periods (for "Dr." and "Jr.")
        .toLowerCase() + '.jpg'
      
      // Default color schemes for role models (fallback if not in DB)
      const colorMap: Record<string, {primaryColor: string, secondaryColor: string, archetype: string}> = {
        'Steve Jobs': { primaryColor: '#007AFF', secondaryColor: '#5AC8FA', archetype: 'innovator' },
        'Buddha': { primaryColor: '#FF9500', secondaryColor: '#FFCC02', archetype: 'sage' },
        'Einstein': { primaryColor: '#5856D6', secondaryColor: '#AF52DE', archetype: 'thinker' },
        'Marcus Aurelius': { primaryColor: '#34C759', secondaryColor: '#30D158', archetype: 'stoic' },
        'Joan of Arc': { primaryColor: '#FF3B30', secondaryColor: '#FF6482', archetype: 'warrior' },
        'Leonardo da Vinci': { primaryColor: '#FF9500', secondaryColor: '#FFCC02', archetype: 'renaissance' },
        'Nelson Mandela': { primaryColor: '#34C759', secondaryColor: '#30D158', archetype: 'leader' },
        'Marie Curie': { primaryColor: '#5856D6', secondaryColor: '#AF52DE', archetype: 'scientist' },
        'Gandhi': { primaryColor: '#007AFF', secondaryColor: '#5AC8FA', archetype: 'pacifist' },
        'Martin Luther King Jr': { primaryColor: '#FF3B30', secondaryColor: '#FF6482', archetype: 'activist' }
      }
      
      const defaultColors = colorMap[roleModel.commonName] || { 
        primaryColor: '#06b6d4', 
        secondaryColor: '#67e8f9', 
        archetype: 'wisdom-keeper' 
      }
      
      // Safe JSON parsing with fallbacks  
      const safeParseJSON = (jsonValue: any, fallback: any = []) => {
        if (!jsonValue) return fallback
        if (typeof jsonValue === 'string') {
          try {
            return JSON.parse(jsonValue)
          } catch (e) {
            console.error(`JSON parse error for ${roleModel.commonName}:`, e)
            return fallback
          }
        }
        // If already parsed/object, return as-is
        return jsonValue
      }

      return {
        ...roleModel,
        imageUrl: `/role-models/${imageFileName}`,
        // Use defaults since these fields don't exist in current schema
        archetype: defaultColors.archetype,
        primaryColor: defaultColors.primaryColor,
        secondaryColor: defaultColors.secondaryColor,
        coreValues: safeParseJSON(roleModel.coreValues, []),
        famousQuotes: safeParseJSON(roleModel.famousQuotes, []),
        enhancedAttributes: safeParseJSON(roleModel.enhancedAttributes, []),
        dailyDoEnhanced: safeParseJSON(roleModel.dailyDoEnhanced, null)
      }
    })

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