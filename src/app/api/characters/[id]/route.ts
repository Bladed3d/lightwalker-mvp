import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Use global prisma instance for serverless
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET /api/characters/[id] - Get specific character
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Looking for character with ID:', params.id)
    
    const character = await prisma.savedCharacter.findUnique({
      where: { 
        id: params.id
      },
      include: {
        userTraits: {
          include: {
            subTrait: {
              include: {
                trait: {
                  include: {
                    roleModel: true
                  }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log('Found character:', character?.id)
    console.log('User traits count:', character?.userTraits?.length)

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found', searchedId: params.id },
        { status: 404 }
      )
    }

    if (!character.isActive) {
      return NextResponse.json(
        { error: 'Character is inactive', searchedId: params.id },
        { status: 404 }
      )
    }

    // Update last viewed timestamp
    await prisma.savedCharacter.update({
      where: { id: params.id },
      data: { lastViewedAt: new Date() }
    })

    // If no userTraits (new relational data), fall back to legacy selectedTraits
    let selectedTraits: any[] = []
    
    if (character.userTraits && character.userTraits.length > 0) {
      // Use new relational structure
      selectedTraits = character.userTraits.map(ut => ({
        traitId: ut.subTrait.trait.slug,
        roleModelId: ut.subTrait.trait.roleModel.id,
        traitName: ut.subTrait.trait.name,
        subTraitCode: ut.subTraitCode,
        method: ut.subTrait.method,
        description: ut.subTrait.description
      }))
    } else if (character.selectedTraits) {
      // Fall back to legacy JSON data
      selectedTraits = JSON.parse(character.selectedTraits)
    }

    return NextResponse.json({ 
      character: {
        ...character,
        selectedTraits,
        // Also provide the full relational data for advanced use
        userTraits: character.userTraits
      }
    })
  } catch (error) {
    console.error('Failed to load character:', error)
    return NextResponse.json(
      { error: 'Failed to load character' },
      { status: 500 }
    )
  }
}

// PUT /api/characters/[id] - Update character
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      selectedTraits, 
      characterName,
      discoveryPoints,
      level 
    } = body

    const updateData: any = {}
    
    if (selectedTraits && Array.isArray(selectedTraits)) {
      updateData.selectedTraits = JSON.stringify(selectedTraits)
    }
    if (characterName !== undefined) {
      updateData.characterName = characterName
    }
    if (discoveryPoints !== undefined) {
      updateData.discoveryPoints = discoveryPoints
    }
    if (level !== undefined) {
      updateData.level = level
    }

    updateData.updatedAt = new Date()
    updateData.lastViewedAt = new Date()

    const character = await prisma.savedCharacter.update({
      where: { 
        id: params.id,
        isActive: true 
      },
      data: updateData
    })

    return NextResponse.json({ 
      character: {
        ...character,
        selectedTraits: JSON.parse(character.selectedTraits)
      }
    })
  } catch (error) {
    console.error('Failed to update character:', error)
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}

// DELETE /api/characters/[id] - Delete (deactivate) character
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.savedCharacter.update({
      where: { 
        id: params.id,
        isActive: true 
      },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete character:', error)
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    )
  }
}