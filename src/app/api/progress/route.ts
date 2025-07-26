import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30')

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      )
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get progress metrics
    const progressMetrics = await prisma.progressMetric.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get recent activities for context
    const recentActivities = await prisma.copyingActivity.findMany({
      where: {
        userId: userId,
        dateCopied: {
          gte: startDate
        }
      },
      include: {
        userLightwalker: {
          include: {
            template: {
              select: { displayName: true, icon: true }
            }
          }
        }
      },
      orderBy: { dateCopied: 'desc' },
      take: 10
    })

    // Calculate summary statistics
    const totalActivities = await prisma.copyingActivity.count({
      where: {
        userId: userId,
        dateCopied: { gte: startDate }
      }
    })

    const currentStreak = await calculateCurrentStreak(userId)
    const averageDaily = progressMetrics.length > 0 
      ? progressMetrics.reduce((sum, m) => sum + m.dailyActivityCount, 0) / progressMetrics.length
      : 0

    const averageConsistency = progressMetrics.length > 0
      ? progressMetrics.reduce((sum, m) => sum + m.consistencyScore, 0) / progressMetrics.length  
      : 0

    // Format activities for response
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      description: activity.activityDescription,
      type: activity.activityType,
      dateCopied: activity.dateCopied,
      difficulty: activity.difficultyRating,
      satisfaction: activity.satisfactionRating,
      notes: activity.notes,
      lightwalkerName: activity.userLightwalker.template.displayName,
      lightwalkerIcon: activity.userLightwalker.template.icon
    }))

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalActivities,
          currentStreak,
          averageDaily: Math.round(averageDaily * 100) / 100,
          consistencyScore: Math.round(averageConsistency * 100) / 100,
          period: `${days} days`
        },
        progressMetrics: progressMetrics,
        recentActivities: formattedActivities,
        chartData: progressMetrics.map(metric => ({
          date: metric.date,
          activities: metric.dailyActivityCount,
          consistency: metric.consistencyScore,
          weeklyAverage: metric.weeklyAverage
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch progress data' 
      },
      { status: 500 }
    )
  }
}

async function calculateCurrentStreak(userId: string): Promise<number> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = new Date(today)
  
  // Look backwards day by day until we find a day with no activities
  while (true) {
    const startOfDay = new Date(currentDate)
    const endOfDay = new Date(currentDate)
    endOfDay.setHours(23, 59, 59, 999)
    
    const activitiesCount = await prisma.copyingActivity.count({
      where: {
        userId: userId,
        dateCopied: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    
    if (activitiesCount === 0) {
      break
    }
    
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
    
    // Prevent infinite loop - max 365 days
    if (streak >= 365) break
  }
  
  return streak
}