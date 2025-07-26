import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      )
    }

    const userLightwalker = await prisma.userLightwalker.findFirst({
      where: {
        userId: userId,
        isActive: true
      },
      include: {
        template: {
          select: {
            name: true,
            displayName: true,
            description: true,
            icon: true,
            colorScheme: true,
            personalityPrompt: true,
            communicationStyle: true,
            coreTraits: true,
            dailyRoutines: true,
            sampleActivities: true
          }
        }
      }
    })

    if (!userLightwalker) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active Lightwalker found'
      })
    }

    // Parse JSON fields
    const responseData = {
      ...userLightwalker,
      customizations: userLightwalker.customizations ? JSON.parse(userLightwalker.customizations) : null,
      template: {
        ...userLightwalker.template,
        colorScheme: JSON.parse(userLightwalker.template.colorScheme),
        communicationStyle: JSON.parse(userLightwalker.template.communicationStyle),
        coreTraits: JSON.parse(userLightwalker.template.coreTraits),
        dailyRoutines: JSON.parse(userLightwalker.template.dailyRoutines),
        sampleActivities: JSON.parse(userLightwalker.template.sampleActivities)
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Error fetching user Lightwalker:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch your Lightwalker' 
      },
      { status: 500 }
    )
  }
}