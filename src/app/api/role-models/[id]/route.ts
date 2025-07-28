import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleModelId = params.id

    const roleModel = await prisma.roleModel.findUnique({
      where: { id: roleModelId, isActive: true }
    })

    if (!roleModel) {
      return NextResponse.json(
        { error: 'Role model not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields for detailed response
    const formattedRoleModel = {
      ...roleModel,
      coreValues: JSON.parse(roleModel.coreValues || '[]'),
      valueHierarchy: JSON.parse(roleModel.valueHierarchy || '[]'),
      dominantTraits: JSON.parse(roleModel.dominantTraits || '[]'),
      decisionProcess: JSON.parse(roleModel.decisionProcess || '{}'),
      famousQuotes: JSON.parse(roleModel.famousQuotes || '[]'),
      decisionTemplates: JSON.parse(roleModel.decisionTemplates || '[]'),
      enhancedAttributes: JSON.parse(roleModel.enhancedAttributes || '[]')
    }

    return NextResponse.json({ roleModel: formattedRoleModel })

  } catch (error) {
    console.error('Error fetching role model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roleModelId = params.id
    const body = await request.json()

    // Update role model (admin function)
    const roleModel = await prisma.roleModel.update({
      where: { id: roleModelId },
      data: {
        ...body,
        coreValues: body.coreValues ? JSON.stringify(body.coreValues) : undefined,
        valueHierarchy: body.valueHierarchy ? JSON.stringify(body.valueHierarchy) : undefined,
        dominantTraits: body.dominantTraits ? JSON.stringify(body.dominantTraits) : undefined,
        decisionProcess: body.decisionProcess ? JSON.stringify(body.decisionProcess) : undefined,
        famousQuotes: body.famousQuotes ? JSON.stringify(body.famousQuotes) : undefined,
        decisionTemplates: body.decisionTemplates ? JSON.stringify(body.decisionTemplates) : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ roleModel })

  } catch (error) {
    console.error('Error updating role model:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}