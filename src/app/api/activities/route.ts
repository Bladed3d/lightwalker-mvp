import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/activities
 * Fetch activities from database with optional filtering
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const search = searchParams.get('search');
    const includePreferences = searchParams.get('includePreferences') === 'true';
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    console.log('🔍 GET /api/activities called with:', {
      category,
      rarity,
      search,
      includePreferences,
      sessionId,
      userId
    });

    // Build where clause for activities
    const whereClause: any = {
      isActive: true
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (rarity && rarity !== 'all') {
      whereClause.rarity = rarity;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch activities from database
    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: [
        { rarity: 'asc' }, // Common first, then uncommon, rare, epic, legendary
        { sortOrder: 'asc' },
        { title: 'asc' }
      ],
      include: includePreferences ? {
        activityPreferences: {
          where: {
            OR: [
              userId ? { userId } : {},
              sessionId ? { sessionId } : {}
            ].filter(Boolean)
          }
        }
      } : undefined
    });

    console.log(`✅ Found ${activities.length} activities from database`);

    // Transform activities to match the expected format
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      icon: activity.icon,
      category: activity.category,
      points: activity.points,
      rarity: activity.rarity,
      duration: activity.duration,
      difficulty: activity.difficulty,
      gridSize: {
        w: activity.gridSizeW,
        h: activity.gridSizeH
      },
      // Include preference data if requested
      ...(includePreferences && activity.activityPreferences && activity.activityPreferences.length > 0 ? {
        customDuration: activity.activityPreferences[0].customDuration,
        customPoints: activity.activityPreferences[0].customPoints,
        customDifficulty: activity.activityPreferences[0].customDifficulty,
        customImageUrl: activity.activityPreferences[0].customImageUrl,
        customGridSize: activity.activityPreferences[0].customGridSize as any
      } : {})
    }));

    return NextResponse.json({
      success: true,
      activities: transformedActivities,
      count: transformedActivities.length
    });

  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}