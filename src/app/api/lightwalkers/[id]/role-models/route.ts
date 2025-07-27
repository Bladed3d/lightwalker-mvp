import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

interface AddRoleModelRequest {
  roleModelId: string
  influenceWeight?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lightwalkerId = params.id

    // Get all role models associated with this Lightwalker
    const lightwalkerRoleModels = await prisma.lightwalkerRoleModel.findMany({
      where: { userLightwalkerId: lightwalkerId },
      include: {
        roleModel: {
          select: {
            id: true,
            fullName: true,
            commonName: true,
            primaryDomain: true,
            lifeMission: true,
            coreValues: true,
            famousQuotes: true,
            personalPhilosophy: true
          }
        }
      },
      orderBy: { influenceWeight: 'desc' }
    })

    // Parse JSON fields
    const formattedAssociations = lightwalkerRoleModels.map(association => ({
      id: association.id,
      influenceWeight: association.influenceWeight,
      addedAt: association.addedAt,
      roleModel: {
        ...association.roleModel,
        coreValues: JSON.parse(association.roleModel.coreValues || '[]'),
        famousQuotes: JSON.parse(association.roleModel.famousQuotes || '[]')
      }
    }))

    return NextResponse.json({ associations: formattedAssociations })

  } catch (error) {
    console.error('Error fetching Lightwalker role models:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lightwalkerId = params.id
    const body: AddRoleModelRequest = await request.json()
    const { roleModelId, influenceWeight = 1.0 } = body

    if (!roleModelId) {
      return NextResponse.json(
        { error: 'Missing roleModelId' },
        { status: 400 }
      )
    }

    // Verify the Lightwalker exists
    const lightwalker = await prisma.userLightwalker.findUnique({
      where: { id: lightwalkerId }
    })

    if (!lightwalker) {
      return NextResponse.json(
        { error: 'Lightwalker not found' },
        { status: 404 }
      )
    }

    // Verify the role model exists
    const roleModel = await prisma.roleModel.findUnique({
      where: { id: roleModelId, isActive: true }
    })

    if (!roleModel) {
      return NextResponse.json(
        { error: 'Role model not found or inactive' },
        { status: 404 }
      )
    }

    // Check if association already exists
    const existingAssociation = await prisma.lightwalkerRoleModel.findUnique({
      where: {
        userLightwalkerId_roleModelId: {
          userLightwalkerId: lightwalkerId,
          roleModelId
        }
      }
    })

    if (existingAssociation) {
      return NextResponse.json(
        { error: 'Role model already associated with this Lightwalker' },
        { status: 409 }
      )
    }

    // Create the association
    const association = await prisma.lightwalkerRoleModel.create({
      data: {
        userLightwalkerId: lightwalkerId,
        roleModelId,
        influenceWeight
      },
      include: {
        roleModel: {
          select: {
            id: true,
            fullName: true,
            commonName: true,
            primaryDomain: true,
            lifeMission: true
          }
        }
      }
    })

    return NextResponse.json({ association })

  } catch (error) {
    console.error('Error adding role model to Lightwalker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lightwalkerId = params.id
    const { searchParams } = new URL(request.url)
    const roleModelId = searchParams.get('roleModelId')

    if (!roleModelId) {
      return NextResponse.json(
        { error: 'Missing roleModelId parameter' },
        { status: 400 }
      )
    }

    // Remove the association
    const deleted = await prisma.lightwalkerRoleModel.deleteMany({
      where: {
        userLightwalkerId: lightwalkerId,
        roleModelId
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error removing role model from Lightwalker:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}