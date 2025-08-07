import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getEffectiveSessionId, CONFIG } from '@/lib/dev-config';

const prisma = new PrismaClient();

// GET /api/timeline-activities - Fetch timeline activities
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawSessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');
    const date = url.searchParams.get('date'); // Optional: filter by specific date

    // 🔧 DEV MODE: Use configuration to determine session behavior
    const effectiveSessionId = getEffectiveSessionId(rawSessionId, userId);

    if (CONFIG.logSessionMode) {
      console.log('🔍 GET /api/timeline-activities called with:', {
        rawSessionId,
        effectiveSessionId,
        userId,
        date,
        devMode: CONFIG.forceGlobalTimelineActivities
      });
    }

    // Build where clause for user identification
    const whereClause: any = {
      OR: []
    };

    if (userId) {
      whereClause.OR.push({ userId: userId });
    }

    if (effectiveSessionId) {
      whereClause.OR.push({ sessionId: effectiveSessionId });
    }

    // If neither provided, return empty array
    if (whereClause.OR.length === 0) {
      return NextResponse.json({ 
        success: true, 
        timelineActivities: [],
        message: 'No session or user ID provided'
      });
    }

    // Add date filter if provided
    if (date) {
      whereClause.scheduledDate = {
        gte: new Date(date),
        lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) // Next day
      };
    }

    const timelineActivities = await prisma.timelineActivity.findMany({
      where: whereClause,
      include: {
        activity: true // Include the base activity data
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ]
    });

    console.log(`✅ Found ${timelineActivities.length} timeline activities`);

    // CRITICAL FIX: Fetch activity preferences to get custom categories
    const activityIds = timelineActivities.map(ta => ta.activityId);
    const activityPreferences = activityIds.length > 0 ? await prisma.activityPreference.findMany({
      where: {
        activityId: { in: activityIds },
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(effectiveSessionId ? [{ sessionId: effectiveSessionId }] : [])
        ],
        isActive: true
      }
    }) : [];

    console.log(`🔍 Found ${activityPreferences.length} activity preferences for timeline activities`);

    // Create preference map for quick lookup
    const preferencesMap = new Map();
    activityPreferences.forEach(pref => {
      preferencesMap.set(pref.activityId, pref);
    });

    // Transform for frontend compatibility WITH custom category preferences
    const formattedActivities = timelineActivities.map(ta => {
      const preference = preferencesMap.get(ta.activityId);
      
      const result = {
        id: ta.id,
        title: ta.activity.title,
        name: ta.activity.title, // Alias for compatibility
        time: ta.scheduledTime,
        scheduledTime: ta.scheduledTime,
        scheduledDate: ta.scheduledDate,
        duration: ta.customDuration || preference?.customDuration || ta.activity.duration,
        points: ta.customPoints || preference?.customPoints || ta.activity.points,
        icon: preference?.customImageUrl || ta.activity.icon,
        category: preference?.customCategory || ta.activity.category, // FIXED: Apply custom category
        customCategory: preference?.customCategory, // Also provide customCategory field
        difficulty: preference?.customDifficulty || ta.activity.difficulty,
        description: preference?.customDescription || ta.activity.description,
        instructions: preference?.customDescription || ta.activity.instructions,
        isCompleted: ta.isCompleted,
        completedAt: ta.completedAt,
        notes: ta.notes,
        // Timeline-specific fields
        activityId: ta.activityId,
        userId: ta.userId,
        sessionId: ta.sessionId,
        // Recurring pattern fields
        isRecurring: ta.isRecurring,
        recurringPattern: ta.recurringPattern,
        parentTimelineId: ta.parentTimelineId,
        createdAt: ta.createdAt,
        updatedAt: ta.updatedAt
      };
      
      // Debug log for activities that might have category issues
      if (ta.activity.title?.toLowerCase().includes('dogs') || preference?.customCategory) {
        console.log('🔍 TIMELINE ACTIVITY FORMATTING:', {
          activityId: ta.activityId,
          title: ta.activity.title,
          baseCategory: ta.activity.category,
          customCategory: preference?.customCategory,
          finalCategory: result.category,
          hasPreference: !!preference
        });
      }
      
      return result;
    });

    return NextResponse.json({
      success: true,
      timelineActivities: formattedActivities,
      count: formattedActivities.length
    });

  } catch (error) {
    console.error('❌ Error fetching timeline activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timeline activities' },
      { status: 500 }
    );
  }
}

// POST /api/timeline-activities - Create timeline activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      activityId,
      scheduledTime,
      scheduledDate,
      customDuration,
      customPoints,
      notes,
      sessionId: rawSessionId,
      userId,
      // Recurring fields (to be implemented)
      isRecurring,
      recurringPattern
    } = body;

    // 🔧 DEV MODE: Use configuration to determine session behavior
    const effectiveSessionId = getEffectiveSessionId(rawSessionId, userId);

    if (CONFIG.logSessionMode) {
      console.log('📝 POST /api/timeline-activities called with:', {
        activityId,
        scheduledTime,
        rawSessionId,
        effectiveSessionId,
        userId,
        devMode: CONFIG.forceGlobalTimelineActivities
      });
    }

    // Validate required fields
    if (!activityId || !scheduledTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: activityId, scheduledTime' },
        { status: 400 }
      );
    }

    // User identification required (after applying dev mode logic)
    if (!effectiveSessionId && !userId) {
      return NextResponse.json(
        { success: false, error: 'Either sessionId or userId is required' },
        { status: 400 }
      );
    }

    // Create the timeline activity
    const timelineActivity = await prisma.timelineActivity.create({
      data: {
        activityId,
        scheduledTime,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        customDuration,
        customPoints,
        notes,
        sessionId: effectiveSessionId,
        userId,
        isCompleted: false,
        isRecurring: isRecurring || false,
        recurringPattern: recurringPattern || null
      },
      include: {
        activity: true
      }
    });

    console.log('✅ Timeline activity created:', timelineActivity.id);

    // FIXED: Fetch activity preferences for the created activity
    const preference = await prisma.activityPreference.findFirst({
      where: {
        activityId: timelineActivity.activityId,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(effectiveSessionId ? [{ sessionId: effectiveSessionId }] : [])
        ],
        isActive: true
      }
    });

    // Format response for frontend compatibility WITH custom category preferences
    const formattedActivity = {
      id: timelineActivity.id,
      title: timelineActivity.activity.title,
      name: timelineActivity.activity.title,
      time: timelineActivity.scheduledTime,
      scheduledTime: timelineActivity.scheduledTime,
      scheduledDate: timelineActivity.scheduledDate,
      duration: timelineActivity.customDuration || preference?.customDuration || timelineActivity.activity.duration,
      points: timelineActivity.customPoints || preference?.customPoints || timelineActivity.activity.points,
      icon: preference?.customImageUrl || timelineActivity.activity.icon,
      category: preference?.customCategory || timelineActivity.activity.category, // FIXED: Apply custom category
      customCategory: preference?.customCategory,
      difficulty: preference?.customDifficulty || timelineActivity.activity.difficulty,
      description: preference?.customDescription || timelineActivity.activity.description,
      instructions: preference?.customDescription || timelineActivity.activity.instructions,
      isCompleted: timelineActivity.isCompleted,
      activityId: timelineActivity.activityId,
      userId: timelineActivity.userId,
      sessionId: timelineActivity.sessionId,
      isRecurring: timelineActivity.isRecurring,
      recurringPattern: timelineActivity.recurringPattern,
      parentTimelineId: timelineActivity.parentTimelineId,
      createdAt: timelineActivity.createdAt,
      updatedAt: timelineActivity.updatedAt
    };

    return NextResponse.json({
      success: true,
      timelineActivity: formattedActivity
    });

  } catch (error) {
    console.error('❌ Error creating timeline activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create timeline activity' },
      { status: 500 }
    );
  }
}

// PUT /api/timeline-activities - Update timeline activity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 PUT /api/timeline-activities called with:', body);

    const {
      id,
      scheduledTime,
      scheduledDate,
      customDuration,
      customPoints,
      notes,
      isCompleted,
      completedAt,
      // Recurring fields (to be implemented)
      isRecurring,
      recurringPattern
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Timeline activity ID is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);
    if (customDuration !== undefined) updateData.customDuration = customDuration;
    if (customPoints !== undefined) updateData.customPoints = customPoints;
    if (notes !== undefined) updateData.notes = notes;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurringPattern !== undefined) updateData.recurringPattern = recurringPattern;

    const timelineActivity = await prisma.timelineActivity.update({
      where: { id },
      data: updateData,
      include: {
        activity: true
      }
    });

    console.log('✅ Timeline activity updated:', timelineActivity.id);

    // FIXED: Fetch activity preferences for the updated activity
    const preference = await prisma.activityPreference.findFirst({
      where: {
        activityId: timelineActivity.activityId,
        OR: [
          ...(timelineActivity.userId ? [{ userId: timelineActivity.userId }] : []),
          ...(timelineActivity.sessionId ? [{ sessionId: timelineActivity.sessionId }] : [])
        ],
        isActive: true
      }
    });

    // Format response WITH custom category preferences
    const formattedActivity = {
      id: timelineActivity.id,
      title: timelineActivity.activity.title,
      name: timelineActivity.activity.title,
      time: timelineActivity.scheduledTime,
      scheduledTime: timelineActivity.scheduledTime,
      scheduledDate: timelineActivity.scheduledDate,
      duration: timelineActivity.customDuration || preference?.customDuration || timelineActivity.activity.duration,
      points: timelineActivity.customPoints || preference?.customPoints || timelineActivity.activity.points,
      icon: preference?.customImageUrl || timelineActivity.activity.icon,
      category: preference?.customCategory || timelineActivity.activity.category, // FIXED: Apply custom category
      customCategory: preference?.customCategory,
      difficulty: preference?.customDifficulty || timelineActivity.activity.difficulty,
      description: preference?.customDescription || timelineActivity.activity.description,
      instructions: preference?.customDescription || timelineActivity.activity.instructions,
      isCompleted: timelineActivity.isCompleted,
      completedAt: timelineActivity.completedAt,
      notes: timelineActivity.notes,
      activityId: timelineActivity.activityId,
      userId: timelineActivity.userId,
      sessionId: timelineActivity.sessionId,
      isRecurring: timelineActivity.isRecurring,
      recurringPattern: timelineActivity.recurringPattern,
      parentTimelineId: timelineActivity.parentTimelineId,
      createdAt: timelineActivity.createdAt,
      updatedAt: timelineActivity.updatedAt
    };

    return NextResponse.json({
      success: true,
      timelineActivity: formattedActivity
    });

  } catch (error) {
    console.error('❌ Error updating timeline activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update timeline activity' },
      { status: 500 }
    );
  }
}

// DELETE /api/timeline-activities - Delete timeline activity
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Timeline activity ID is required' },
        { status: 400 }
      );
    }

    await prisma.timelineActivity.delete({
      where: { id }
    });

    console.log('✅ Timeline activity deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Timeline activity deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting timeline activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete timeline activity' },
      { status: 500 }
    );
  }
}