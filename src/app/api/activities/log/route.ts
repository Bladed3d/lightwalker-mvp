import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const logActivitySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userLightwalkerId: z.string().min(1, 'Lightwalker ID is required'),
  activityDescription: z.string().min(1, 'Activity description is required'),
  activityType: z.string().optional(),
  difficultyRating: z.number().min(1).max(5).optional(),
  satisfactionRating: z.number().min(1).max(5).optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = logActivitySchema.parse(body)

    // Verify user owns this Lightwalker
    const userLightwalker = await prisma.userLightwalker.findFirst({
      where: {
        id: validatedData.userLightwalkerId,
        userId: validatedData.userId,
        isActive: true
      },
      include: {
        template: {
          select: { name: true, displayName: true }
        }
      }
    })

    if (!userLightwalker) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Lightwalker not found or access denied' 
        },
        { status: 404 }
      )
    }

    // Log the copying activity
    const activity = await prisma.copyingActivity.create({
      data: {
        userId: validatedData.userId,
        userLightwalkerId: validatedData.userLightwalkerId,
        activityDescription: validatedData.activityDescription,
        activityType: validatedData.activityType,
        templateSource: userLightwalker.template.name,
        difficultyRating: validatedData.difficultyRating,
        satisfactionRating: validatedData.satisfactionRating,
        notes: validatedData.notes,
        dateCopied: new Date(),
        timeLogged: new Date()
      }
    })

    // Update last interaction time
    await prisma.userLightwalker.update({
      where: { id: validatedData.userLightwalkerId },
      data: { lastInteractionAt: new Date() }
    })

    // Update daily progress metrics
    await updateDailyProgress(validatedData.userId, new Date())

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity logged successfully! 🎉'
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

    console.error('Error logging activity:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log activity' 
      },
      { status: 500 }
    )
  }
}

async function updateDailyProgress(userId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Count today's activities
  const dailyCount = await prisma.copyingActivity.count({
    where: {
      userId: userId,
      dateCopied: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  })

  // Calculate 7-day consistency score
  const sevenDaysAgo = new Date(date)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const weeklyActivities = await prisma.copyingActivity.groupBy({
    by: ['dateCopied'],
    where: {
      userId: userId,
      dateCopied: {
        gte: sevenDaysAgo,
        lte: endOfDay
      }
    },
    _count: true
  })

  const daysWithActivities = weeklyActivities.length
  const consistencyScore = (daysWithActivities / 7) * 100

  // Calculate weekly average
  const totalWeeklyActivities = weeklyActivities.reduce((sum, day) => sum + day._count, 0)
  const weeklyAverage = totalWeeklyActivities / 7

  // Update or create progress metric
  await prisma.progressMetric.upsert({
    where: {
      userId_date: {
        userId: userId,
        date: startOfDay
      }
    },
    update: {
      dailyActivityCount: dailyCount,
      consistencyScore: consistencyScore,
      weeklyAverage: weeklyAverage,
      calculatedAt: new Date()
    },
    create: {
      userId: userId,
      date: startOfDay,
      dailyActivityCount: dailyCount,
      consistencyScore: consistencyScore,
      weeklyAverage: weeklyAverage,
      streakDays: daysWithActivities > 0 ? 1 : 0, // Simplified streak calculation
      calculatedAt: new Date()
    }
  })
}