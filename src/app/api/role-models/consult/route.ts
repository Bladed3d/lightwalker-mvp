import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

interface ConsultRequest {
  userId: string
  roleModelId: string
  question: string
  context?: string
}

interface RoleModelPersonality {
  decisionProcess: any
  coreValues: string[]
  dominantTraits: string[]
  famousQuotes: string[]
  decisionConsultation: string
  personalPhilosophy: string
  communicationStyle: string
}

function generateRoleModelResponse(
  roleModel: any,
  question: string,
  context?: string
): string {
  const personality: RoleModelPersonality = {
    decisionProcess: JSON.parse(roleModel.decisionProcess || '{}'),
    coreValues: JSON.parse(roleModel.coreValues || '[]'),
    dominantTraits: JSON.parse(roleModel.dominantTraits || '[]'),
    famousQuotes: JSON.parse(roleModel.famousQuotes || '[]'),
    decisionConsultation: roleModel.decisionConsultation,
    personalPhilosophy: roleModel.personalPhilosophy,
    communicationStyle: roleModel.communicationStyle
  }

  // Create a contextual response based on the role model's characteristics
  let response = `In my experience, when facing "${question}"${context ? ` in the context of ${context}` : ''}, I would approach this by `

  // Add decision-making framework
  if (personality.decisionProcess && Object.keys(personality.decisionProcess).length > 0) {
    const processKeys = Object.keys(personality.decisionProcess)
    const firstProcess = personality.decisionProcess[processKeys[0]]
    response += `first ${firstProcess.toLowerCase()}. `
  }

  // Add core philosophy
  if (personality.personalPhilosophy) {
    response += `My fundamental belief is that ${personality.personalPhilosophy.toLowerCase()}. `
  }

  // Add specific consultation guidance
  if (personality.decisionConsultation) {
    response += `${personality.decisionConsultation} `
  }

  // Add a relevant quote if available
  if (personality.famousQuotes.length > 0) {
    const randomQuote = personality.famousQuotes[Math.floor(Math.random() * personality.famousQuotes.length)]
    response += `As I always say: "${randomQuote}"`
  }

  return response
}

export async function POST(request: NextRequest) {
  try {
    const body: ConsultRequest = await request.json()
    const { userId, roleModelId, question, context } = body

    if (!userId || !roleModelId || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, roleModelId, question' },
        { status: 400 }
      )
    }

    // Get the role model
    const roleModel = await prisma.roleModel.findUnique({
      where: { id: roleModelId, isActive: true }
    })

    if (!roleModel) {
      return NextResponse.json(
        { error: 'Role model not found or inactive' },
        { status: 404 }
      )
    }

    // Generate response based on role model's characteristics
    const response = generateRoleModelResponse(roleModel, question, context)

    // Save the consultation
    const consultation = await prisma.userRoleModelConsultation.create({
      data: {
        userId,
        roleModelId,
        question,
        context: context || null,
        response
      }
    })

    return NextResponse.json({
      id: consultation.id,
      question,
      response,
      roleModel: {
        id: roleModel.id,
        commonName: roleModel.commonName,
        primaryDomain: roleModel.primaryDomain
      },
      createdAt: consultation.createdAt
    })

  } catch (error) {
    console.error('Error in role model consultation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get recent consultations for the user
    const consultations = await prisma.userRoleModelConsultation.findMany({
      where: { userId },
      include: {
        roleModel: {
          select: {
            id: true,
            commonName: true,
            primaryDomain: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ consultations })

  } catch (error) {
    console.error('Error fetching consultations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}