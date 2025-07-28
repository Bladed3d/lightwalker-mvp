import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Use global prisma instance for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET /api/characters - Get all characters for a session/user OR specific character by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const characterId = searchParams.get('id')

    // If specific character ID is requested
    if (characterId) {
      console.log('Looking for specific character with ID:', characterId)
      
      const character = await prisma.savedCharacter.findUnique({
        where: { id: characterId }
      })

      if (!character) {
        return NextResponse.json(
          { error: 'Character not found', searchedId: characterId },
          { status: 404 }
        )
      }

      if (!character.isActive) {
        return NextResponse.json(
          { error: 'Character is inactive', searchedId: characterId },
          { status: 404 }
        )
      }

      // Update last viewed timestamp
      await prisma.savedCharacter.update({
        where: { id: characterId },
        data: { lastViewedAt: new Date() }
      })

      return NextResponse.json({ 
        character: {
          ...character,
          selectedTraits: character.selectedTraits ? JSON.parse(character.selectedTraits) : []
        }
      })
    }

    // Otherwise, get all characters for session/user
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
      selectedTraits, // New format: [{traitId, roleModelId, traitName}, ...]
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

    if (!selectedTraits || !Array.isArray(selectedTraits) || selectedTraits.length === 0) {
      return NextResponse.json(
        { error: 'Selected traits required' },
        { status: 400 }
      )
    }

    // Validate trait format
    for (const trait of selectedTraits) {
      if (!trait.traitId || !trait.roleModelId || !trait.traitName) {
        return NextResponse.json(
          { error: 'Invalid trait format. Each trait must have traitId, roleModelId, and traitName' },
          { status: 400 }
        )
      }
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
        selectedTraits: JSON.stringify(selectedTraits),
        characterName,
        discoveryPoints: discoveryPoints || 0,
        level: level || 1,
        isActive: true
      }
    })

    return NextResponse.json({ 
      character: {
        ...character,
        selectedTraits: character.selectedTraits ? JSON.parse(character.selectedTraits) : []
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