/**
 * Database-First Activity Filter System
 * 
 * Replaces hardcoded ACTIVITY_TEMPLATES with database queries
 * Provides clean separation of concerns and eliminates duplication issues
 */

import { ActivityPreference } from '@/types/daily-use';

export interface FilterOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface DatabaseFilterResult {
  activities: any[];
  source: 'database' | 'preferences' | 'timeline';
  count: number;
}

export const FILTER_OPTIONS: FilterOption[] = [
  {
    id: 'create-new',
    label: 'Create New',
    description: 'Create a custom activity from scratch',
    icon: '➕'
  },
  {
    id: 'my-activities',
    label: 'My Activities',
    description: 'Activities you use and customize',
    icon: '⭐'
  },
  {
    id: 'all-categories',
    label: 'All Activities',
    description: 'Complete activity library',
    icon: '📚'
  },
  {
    id: 'mindfulness',
    label: 'Mindfulness',
    description: 'Meditation, breathing, reflection',
    icon: '🧘'
  },
  {
    id: 'physical',
    label: 'Physical',
    description: 'Movement, exercise, health',
    icon: '💪'
  },
  {
    id: 'creative',
    label: 'Creative',
    description: 'Art, innovation, skills',
    icon: '🎨'
  },
  {
    id: 'communication',
    label: 'Communication',
    description: 'Leadership, mentoring, connection',
    icon: '🗣️'
  },
  {
    id: 'decision-making',
    label: 'Decision Making',
    description: 'Planning, problem-solving',
    icon: '🧠'
  },
  {
    id: 'reflection',
    label: 'Reflection',
    description: 'Deep thinking, contemplation',
    icon: '🤔'
  },
  {
    id: 'missing-images',
    label: 'Missing Images',
    description: 'Activities without custom icons',
    icon: '🖼️'
  }
];

/**
 * Fetch activities from database with filtering
 */
export async function getActivitiesFromDatabase(
  filterType: string,
  userPreferences: ActivityPreference[] = [],
  timelineActivities: any[] = [],
  sessionId?: string,
  userId?: string
): Promise<DatabaseFilterResult> {
  
  console.log('🔍 getActivitiesFromDatabase called:', {
    filterType,
    preferencesCount: userPreferences.length,
    timelineCount: timelineActivities.length,
    sessionId,
    userId
  });

  try {
    // Build API query parameters
    const params = new URLSearchParams();
    
    if (filterType !== 'all-categories' && filterType !== 'my-activities' && filterType !== 'create-new' && filterType !== 'missing-images') {
      params.set('category', filterType);
    }
    
    if (sessionId) {
      params.set('sessionId', sessionId);
    }
    
    if (userId) {
      params.set('userId', userId);
    }

    // For "My Activities", include preferences to get customized activities
    if (filterType === 'my-activities') {
      params.set('includePreferences', 'true');
    }

    const apiUrl = `/api/activities?${params.toString()}`;
    console.log('📡 Fetching activities from:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request returned error');
    }

    console.log(`✅ Fetched ${data.activities.length} activities from database`);

    // For "My Activities", filter to show:
    // 1. Activities with user preferences (customized)
    // 2. Activities currently on timeline
    if (filterType === 'my-activities') {
      const customizedActivityIds = new Set(userPreferences.map(p => p.activityId));
      const timelineActivityIds = new Set(timelineActivities.map(ta => {
        // For database timeline activities, use activityId field
        // For legacy timeline activities, fall back to computed ID
        return ta.activityId || ta.id || ta.name?.toLowerCase().replace(/\s+/g, '-');
      }));

      const myActivities = data.activities.filter((activity: any) => 
        customizedActivityIds.has(activity.id) || timelineActivityIds.has(activity.id)
      );

      console.log(`🔍 Filtered to ${myActivities.length} "My Activities"`);

      return {
        activities: myActivities,
        source: 'preferences',
        count: myActivities.length
      };
    }

    // For "Missing Images", filter to show activities without custom images
    if (filterType === 'missing-images') {
      const activitiesWithoutImages = data.activities.filter((activity: any) => {
        // Check if icon exists and is a custom image (starts with / or data:)
        const hasCustomImage = activity.icon && (activity.icon.startsWith('/') || activity.icon.startsWith('data:'));
        return !hasCustomImage;
      });

      console.log(`🖼️ Found ${activitiesWithoutImages.length} activities without custom images`);

      return {
        activities: activitiesWithoutImages,
        source: 'database',
        count: activitiesWithoutImages.length
      };
    }

    // For other filters, return all matching activities
    return {
      activities: data.activities,
      source: 'database',
      count: data.activities.length
    };

  } catch (error) {
    console.error('❌ Error fetching activities from database:', error);
    
    // Fallback to empty array
    return {
      activities: [],
      source: 'database',
      count: 0
    };
  }
}

/**
 * Get filter option counts
 */
export async function getFilterCounts(
  userPreferences: ActivityPreference[] = [],
  timelineActivities: any[] = []
): Promise<Record<string, number>> {
  try {
    // Fetch all activities for counting
    const response = await fetch('/api/activities');
    
    if (!response.ok) {
      throw new Error('Failed to fetch activities for counting');
    }

    const data = await response.json();
    const activities = data.activities || [];

    // Count by category
    const counts: Record<string, number> = {};
    
    // Count activities by category
    FILTER_OPTIONS.forEach(option => {
      if (option.id === 'create-new') {
        counts[option.id] = 1; // Always 1 for create new
      } else if (option.id === 'my-activities') {
        const customizedIds = new Set(userPreferences.map(p => p.activityId));
        const timelineIds = new Set(timelineActivities.map(ta => ta.activityId || ta.id || ta.name?.toLowerCase().replace(/\s+/g, '-')));
        const uniqueIds = new Set([...customizedIds, ...timelineIds]);
        counts[option.id] = uniqueIds.size;
      } else if (option.id === 'all-categories') {
        counts[option.id] = activities.length;
      } else if (option.id === 'missing-images') {
        counts[option.id] = activities.filter((a: any) => {
          const hasCustomImage = a.icon && (a.icon.startsWith('/') || a.icon.startsWith('data:'));
          return !hasCustomImage;
        }).length;
      } else {
        counts[option.id] = activities.filter((a: any) => a.category === option.id).length;
      }
    });

    return counts;

  } catch (error) {
    console.error('❌ Error getting filter counts:', error);
    return {};
  }
}