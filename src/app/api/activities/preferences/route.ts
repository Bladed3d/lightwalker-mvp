import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const savePreferenceSchema = z.object({
  userId: z.string().optional(), // For logged-in users
  sessionId: z.string().optional(), // For anonymous users
  activityId: z.string().min(1, 'Activity ID is required'),
  activityTitle: z.string().min(1, 'Activity title is required'),
  customDuration: z.string().optional(),
  customPoints: z.number().optional(),
  customDifficulty: z.number().min(1).max(9).optional(),
  customCategory: z.string().optional(),
  customDescription: z.string().optional(),
  customIcon: z.string().optional(),
  // Art Studio - Image customization fields
  customImageUrl: z.string().optional(),
  imageSource: z.enum(['upload', 'ai_generated', 'template']).optional(),
  imagePrompt: z.string().optional(),
  imageMetadata: z.record(z.any()).optional(), // JSON object
  // Art Studio - Dynamic grid sizing
  customGridSize: z.object({ w: z.number(), h: z.number() }).optional()
})

const getPreferencesSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  activityId: z.string().optional() // If provided, get specific activity preference
})

// GET: Retrieve activity preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryData = {
      userId: searchParams.get('userId') || undefined,
      sessionId: searchParams.get('sessionId') || undefined,
      activityId: searchParams.get('activityId') || undefined
    }

    const validatedQuery = getPreferencesSchema.parse(queryData)

    // Require either userId or sessionId
    if (!validatedQuery.userId && !validatedQuery.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either userId or sessionId is required' 
        },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = {
      isActive: true
    }

    if (validatedQuery.userId) {
      whereClause.userId = validatedQuery.userId
    } else if (validatedQuery.sessionId) {
      whereClause.sessionId = validatedQuery.sessionId
    }

    if (validatedQuery.activityId) {
      whereClause.activityId = validatedQuery.activityId
    }

    // Get user/session preferences
    const userPreferences = await prisma.activityPreference.findMany({
      where: whereClause,
      orderBy: [
        { lastUsedAt: 'desc' },
        { timesUsed: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Also get system default activities (timeline emoji activities)
    const systemDefaults = await prisma.activityPreference.findMany({
      where: {
        sessionId: 'system-default',
        isActive: true
      },
      orderBy: [
        { activityTitle: 'asc' }
      ]
    })

    // Combine user preferences with system defaults
    // User preferences override system defaults for same activityId
    const userActivityIds = new Set(userPreferences.map(p => p.activityId))
    const filteredSystemDefaults = systemDefaults.filter(def => !userActivityIds.has(def.activityId))
    
    const preferences = [...userPreferences, ...filteredSystemDefaults]

    return NextResponse.json({
      success: true,
      data: preferences,
      message: `Found ${preferences.length} activity preferences`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
          details: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Error retrieving activity preferences:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve activity preferences' 
      },
      { status: 500 }
    )
  }
}

// POST: Save/update activity preference
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = savePreferenceSchema.parse(body)

    // Require either userId or sessionId
    if (!validatedData.userId && !validatedData.sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either userId or sessionId is required' 
        },
        { status: 400 }
      )
    }

    // If user is provided, verify they exist
    if (validatedData.userId) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: { id: true }
      })

      if (!user) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'User not found' 
          },
          { status: 404 }
        )
      }
    }

    // Build where clause for upsert
    const whereClause: any = {
      activityId: validatedData.activityId
    }

    if (validatedData.userId) {
      whereClause.userId = validatedData.userId
    } else if (validatedData.sessionId) {
      whereClause.sessionId = validatedData.sessionId
    }

    // Upsert the activity preference
    const preference = await prisma.activityPreference.upsert({
      where: validatedData.userId 
        ? { unique_user_activity_preference: { userId: validatedData.userId, activityId: validatedData.activityId } }
        : { unique_session_activity_preference: { sessionId: validatedData.sessionId!, activityId: validatedData.activityId } },
      update: {
        activityTitle: validatedData.activityTitle,
        customDuration: validatedData.customDuration,
        customPoints: validatedData.customPoints,
        customDifficulty: validatedData.customDifficulty,
        customCategory: validatedData.customCategory,
        customDescription: validatedData.customDescription,
        customIcon: validatedData.customIcon,
        // Art Studio - Image fields
        customImageUrl: validatedData.customImageUrl,
        imageSource: validatedData.imageSource,
        imagePrompt: validatedData.imagePrompt,
        imageMetadata: validatedData.imageMetadata,
        // Art Studio - Dynamic grid sizing
        customGridSize: validatedData.customGridSize,
        timesUsed: { increment: 1 },
        lastUsedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        userId: validatedData.userId,
        sessionId: validatedData.sessionId,
        activityId: validatedData.activityId,
        activityTitle: validatedData.activityTitle,
        customDuration: validatedData.customDuration,
        customPoints: validatedData.customPoints,
        customDifficulty: validatedData.customDifficulty,
        customCategory: validatedData.customCategory,
        customDescription: validatedData.customDescription,
        customIcon: validatedData.customIcon,
        // Art Studio - Image fields
        customImageUrl: validatedData.customImageUrl,
        imageSource: validatedData.imageSource,
        imagePrompt: validatedData.imagePrompt,
        imageMetadata: validatedData.imageMetadata,
        // Art Studio - Dynamic grid sizing
        customGridSize: validatedData.customGridSize,
        timesUsed: 1,
        lastUsedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: preference,
      message: 'Activity preference saved successfully! 🎉'
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

    console.error('Error saving activity preference:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save activity preference' 
      },
      { status: 500 }
    )
  }
}

// DELETE: Remove activity preference
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const preferenceId = searchParams.get('id')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')

    if (!preferenceId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Preference ID is required' 
        },
        { status: 400 }
      )
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either userId or sessionId is required' 
        },
        { status: 400 }
      )
    }

    // Build where clause to ensure user owns this preference
    const whereClause: any = {
      id: preferenceId
    }

    if (userId) {
      whereClause.userId = userId
    } else if (sessionId) {
      whereClause.sessionId = sessionId
    }

    // Delete the preference
    const deletedPreference = await prisma.activityPreference.delete({
      where: whereClause
    })

    return NextResponse.json({
      success: true,
      data: deletedPreference,
      message: 'Activity preference deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting activity preference:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete activity preference' 
      },
      { status: 500 }
    )
  }
}