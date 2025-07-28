import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/characters/[id] - Get specific character
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const character = await prisma.savedCharacter.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      }
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    // Update last viewed timestamp
    await prisma.savedCharacter.update({
      where: { id: params.id },
      data: { lastViewedAt: new Date() }
    })

    return NextResponse.json({ 
      character: {
        ...character,
        selectedAttributeIds: JSON.parse(character.selectedAttributeIds)
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
      selectedAttributeIds, 
      characterName,
      discoveryPoints,
      level 
    } = body

    const updateData: any = {}
    
    if (selectedAttributeIds && Array.isArray(selectedAttributeIds)) {
      updateData.selectedAttributeIds = JSON.stringify(selectedAttributeIds)
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
        selectedAttributeIds: JSON.parse(character.selectedAttributeIds)
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