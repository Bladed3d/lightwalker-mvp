import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Use global prisma instance for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET /api/characters - Get all characters for a session/user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'Session ID or User ID required' },
        { status: 400 }
      )
    }

    const characters = await prisma.savedCharacter.findMany({
      where: {
        AND: [
          { isActive: true },
          sessionId ? { sessionId } : { userId }
        ]
      },
      orderBy: { lastViewedAt: 'desc' }
    })

    return NextResponse.json({ characters })
  } catch (error) {
    console.error('Failed to load characters:', error)
    return NextResponse.json(
      { error: 'Failed to load characters' },
      { status: 500 }
    )
  }
}

// POST /api/characters - Save a new character
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sessionId, 
      userId, 
      roleModelId, 
      selectedAttributeIds, 
      characterName,
      discoveryPoints,
      level 
    } = body

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'Session ID or User ID required' },
        { status: 400 }
      )
    }

    if (!roleModelId || !selectedAttributeIds || !Array.isArray(selectedAttributeIds)) {
      return NextResponse.json(
        { error: 'Role model ID and selected attributes required' },
        { status: 400 }
      )
    }

    // Check if character already exists and deactivate it
    if (sessionId || userId) {
      await prisma.savedCharacter.updateMany({
        where: {
          AND: [
            { isActive: true },
            sessionId ? { sessionId } : { userId }
          ]
        },
        data: { isActive: false }
      })
    }

    // Create new character
    const character = await prisma.savedCharacter.create({
      data: {
        sessionId,
        userId,
        roleModelId,
        selectedAttributeIds: JSON.stringify(selectedAttributeIds),
        characterName,
        discoveryPoints: discoveryPoints || 0,
        level: level || 1,
        isActive: true
      }
    })

    return NextResponse.json({ 
      character: {
        ...character,
        selectedAttributeIds: JSON.parse(character.selectedAttributeIds)
      }
    })
  } catch (error) {
    console.error('Failed to save character:', error)
    return NextResponse.json(
      { error: 'Failed to save character' },
      { status: 500 }
    )
  }
}