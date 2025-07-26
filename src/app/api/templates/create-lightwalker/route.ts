import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createLightwalkerSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  customName: z.string().optional(),
  problemFocus: z.string().min(1, 'Problem focus is required'),
  customizations: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createLightwalkerSchema.parse(body)

    // Check if user already has an active Lightwalker
    const existingLightwalker = await prisma.userLightwalker.findFirst({
      where: {
        userId: validatedData.userId,
        isActive: true
      }
    })

    if (existingLightwalker) {
      // Deactivate existing Lightwalker
      await prisma.userLightwalker.update({
        where: { id: existingLightwalker.id },
        data: { isActive: false }
      })
    }

    // Verify template exists
    const template = await prisma.lightwalkerTemplate.findUnique({
      where: { id: validatedData.templateId },
      select: { id: true, name: true, displayName: true }
    })

    if (!template) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Template not found' 
        },
        { status: 404 }
      )
    }

    // Create new Lightwalker
    const newLightwalker = await prisma.userLightwalker.create({
      data: {
        userId: validatedData.userId,
        templateId: validatedData.templateId,
        customName: validatedData.customName,
        problemFocus: validatedData.problemFocus,
        customizations: validatedData.customizations ? JSON.stringify(validatedData.customizations) : null,
        creationCompletedAt: new Date(),
        lastInteractionAt: new Date(),
        isActive: true
      },
      include: {
        template: {
          select: {
            name: true,
            displayName: true,
            icon: true,
            colorScheme: true
          }
        }
      }
    })

    // Parse template data for response
    const responseData = {
      ...newLightwalker,
      template: {
        ...newLightwalker.template,
        colorScheme: JSON.parse(newLightwalker.template.colorScheme)
      },
      customizations: newLightwalker.customizations ? JSON.parse(newLightwalker.customizations) : null
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: `Your ${template.displayName} is ready!`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error creating Lightwalker:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create your Lightwalker' 
      },
      { status: 500 }
    )
  }
}