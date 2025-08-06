import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/timeline-activities - Fetch timeline activities
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');
    const date = url.searchParams.get('date'); // Optional: filter by specific date

    console.log('🔍 GET /api/timeline-activities called with:', {
      sessionId,
      userId,
      date
    });

    // Build where clause for user identification
    const whereClause: any = {
      OR: []
    };

    if (userId) {
      whereClause.OR.push({ userId: userId });
    }

    if (sessionId) {
      whereClause.OR.push({ sessionId: sessionId });
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

    // Transform for frontend compatibility
    const formattedActivities = timelineActivities.map(ta => ({
      id: ta.id,
      title: ta.activity.title,
      name: ta.activity.title, // Alias for compatibility
      time: ta.scheduledTime,
      scheduledTime: ta.scheduledTime,
      scheduledDate: ta.scheduledDate,
      duration: ta.customDuration || ta.activity.duration,
      points: ta.customPoints || ta.activity.points,
      icon: ta.activity.icon,
      category: ta.activity.category,
      difficulty: ta.activity.difficulty,
      description: ta.activity.description,
      instructions: ta.activity.instructions,
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
    }));

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
    console.log('📝 POST /api/timeline-activities called with:', body);

    const {
      activityId,
      scheduledTime,
      scheduledDate,
      customDuration,
      customPoints,
      notes,
      sessionId,
      userId,
      // Recurring fields (to be implemented)
      isRecurring,
      recurringPattern
    } = body;

    // Validate required fields
    if (!activityId || !scheduledTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: activityId, scheduledTime' },
        { status: 400 }
      );
    }

    // User identification required
    if (!sessionId && !userId) {
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
        sessionId,
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

    // Format response for frontend compatibility
    const formattedActivity = {
      id: timelineActivity.id,
      title: timelineActivity.activity.title,
      name: timelineActivity.activity.title,
      time: timelineActivity.scheduledTime,
      scheduledTime: timelineActivity.scheduledTime,
      scheduledDate: timelineActivity.scheduledDate,
      duration: timelineActivity.customDuration || timelineActivity.activity.duration,
      points: timelineActivity.customPoints || timelineActivity.activity.points,
      icon: timelineActivity.activity.icon,
      category: timelineActivity.activity.category,
      difficulty: timelineActivity.activity.difficulty,
      description: timelineActivity.activity.description,
      instructions: timelineActivity.activity.instructions,
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

    // Format response
    const formattedActivity = {
      id: timelineActivity.id,
      title: timelineActivity.activity.title,
      name: timelineActivity.activity.title,
      time: timelineActivity.scheduledTime,
      scheduledTime: timelineActivity.scheduledTime,
      scheduledDate: timelineActivity.scheduledDate,
      duration: timelineActivity.customDuration || timelineActivity.activity.duration,
      points: timelineActivity.customPoints || timelineActivity.activity.points,
      icon: timelineActivity.activity.icon,
      category: timelineActivity.activity.category,
      difficulty: timelineActivity.activity.difficulty,
      description: timelineActivity.activity.description,
      instructions: timelineActivity.activity.instructions,
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