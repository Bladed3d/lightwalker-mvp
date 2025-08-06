/**
 * Smart Activity Filter System
 * 
 * Provides personalized activity filtering based on:
 * - User's Lightwalker design (role model influences)
 * - Current timeline activities
 * - Previously customized activities
 * - Category-based suggestions
 */

import { ActivityPreference } from '@/types/daily-use';
import { ACTIVITY_TEMPLATES } from '@/components/daily-actions4/TarkovInventoryGrid';
import { getImageForEmoji } from './emoji-to-image-mapping';

/**
 * Map timeline activity names to categories
 */
function mapActivityToCategory(activityName: string): string {
  const name = activityName.toLowerCase();
  
  if (name.includes('meditate') || name.includes('reflect') || name.includes('breath')) return 'mindfulness';
  if (name.includes('run') || name.includes('walk') || name.includes('train') || name.includes('exercise') || name.includes('bath') || name.includes('shower')) return 'physical';
  if (name.includes('read') || name.includes('learn') || name.includes('study')) return 'learning';
  if (name.includes('create') || name.includes('innovate') || name.includes('art')) return 'creative';
  if (name.includes('connect') || name.includes('bond') || name.includes('family')) return 'communication';
  if (name.includes('work') || name.includes('plan') || name.includes('organize')) return 'decision-making';
  
  return 'mindfulness'; // default category
}

export interface FilterOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface SmartFilterResult {
  activities: any[];
  source: 'personalized' | 'category' | 'all';
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
    description: 'Personalized based on your Lightwalker and usage',
    icon: '⭐'
  },
  {
    id: 'all-categories',
    label: 'All Categories',
    description: 'All available activity templates',
    icon: '📋'
  },
  {
    id: 'purpose',
    label: 'Purpose',
    description: 'Meaning, values, spiritual practices',
    icon: '🎯'
  },
  {
    id: 'mental-health',
    label: 'Mental Health',
    description: 'Meditation, reflection, emotional regulation',
    icon: '🧠'
  },
  {
    id: 'physical',
    label: 'Physical',
    description: 'Exercise, movement, health practices',
    icon: '💪'
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'Communication, social connection, family',
    icon: '❤️'
  },
  {
    id: 'art-creativity',
    label: 'Art & Creativity',
    description: 'Music, visual arts, writing, crafts',
    icon: '🎨'
  },
  {
    id: 'learning',
    label: 'Learning',
    description: 'Study, skill development, growth',
    icon: '📚'
  },
  {
    id: 'productivity',
    label: 'Productivity',
    description: 'Planning, organizing, optimization',
    icon: '⚡'
  }
];

/**
 * Get personalized activities for "My Activities" filter
 */
export function getPersonalizedActivities(
  userPreferences: ActivityPreference[],
  timelineActivities: any[],
  lightwalkerRoleModels?: string[]
): any[] {
  const personalizedActivities = new Set<string>();
  const personalizedTitles = new Set<string>(); // Track titles too to prevent duplicates
  const result: any[] = [];

  console.log('🔍 getPersonalizedActivities called with:', {
    userPreferences: userPreferences.length,
    timelineActivities: timelineActivities.length,
    timelineData: timelineActivities.map(a => ({ id: a.id, title: a.title, icon: a.icon }))
  });

  // 1. Activities from current timeline
  timelineActivities.forEach(activity => {
    // Timeline activities might have 'name' instead of 'title', and no 'id'
    const activityId = activity.id || activity.name?.toLowerCase().replace(/\s+/g, '-');
    const activityTitle = activity.title || activity.name;
    
    console.log('📅 Processing timeline activity:', { 
      id: activityId, 
      title: activityTitle, 
      icon: activity.icon,
      originalActivity: activity 
    });
    
    if (activityId && !personalizedActivities.has(activityId) && !personalizedTitles.has(activityTitle)) {
      personalizedActivities.add(activityId);
      personalizedTitles.add(activityTitle);
      
      // Convert timeline activity to Activity Grid format
      const gridActivity = {
        id: activityId,
        title: activityTitle,
        icon: getImageForEmoji(activity.icon, activityTitle), // Replace emoji with custom image if available
        category: mapActivityToCategory(activityTitle),
        points: activity.points || 20,
        rarity: 'common' as const,
        duration: activity.duration ? 
          (activity.duration.toString().includes('min') ? activity.duration : `${activity.duration} min`) : 
          '15 min',
        difficulty: 1,
        description: `${activityTitle} from your timeline`,
        source: 'timeline',
        priority: 1
      };
      
      result.push(gridActivity);
      console.log('✅ Added timeline activity to personalized list:', activityTitle);
    }
  });

  // 2. Previously customized activities (user preferences)
  userPreferences.forEach(pref => {
    if (!personalizedActivities.has(pref.activityId)) {
      // Find the base template
      const template = ACTIVITY_TEMPLATES.find(t => t.id === pref.activityId);
      if (template && !personalizedTitles.has(template.title)) {
        personalizedActivities.add(pref.activityId);
        personalizedTitles.add(template.title);
        result.push({
          ...template,
          // Apply user customizations
          duration: pref.customDuration || template.duration,
          points: pref.customPoints || template.points,
          difficulty: pref.customDifficulty || template.difficulty,
          icon: pref.customImageUrl || template.icon,
          source: 'customized',
          priority: 2,
          timesUsed: pref.timesUsed || 0
        });
      }
    }
  });

  // 3. Lightwalker-influenced activities (based on role models)
  if (lightwalkerRoleModels && lightwalkerRoleModels.length > 0) {
    const roleModelActivities = getRoleModelActivities(lightwalkerRoleModels);
    roleModelActivities.forEach(activity => {
      if (!personalizedActivities.has(activity.id) && !personalizedTitles.has(activity.title)) {
        personalizedActivities.add(activity.id);
        personalizedTitles.add(activity.title);
        result.push({
          ...activity,
          source: 'lightwalker',
          priority: 3
        });
      }
    });
  }

  // 4. Suggested activities (2-3 per category that user hasn't tried)
  const suggestions = getSuggestedActivities(personalizedActivities);
  suggestions.forEach(activity => {
    if (!personalizedActivities.has(activity.id) && !personalizedTitles.has(activity.title)) {
      personalizedActivities.add(activity.id);
      personalizedTitles.add(activity.title);
      result.push({
        ...activity,
        source: 'suggestion',
        priority: 4
      });
    }
  });

  // Sort by priority and usage frequency
  return result.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    // Within same priority, sort by usage (most used first)
    return (b.timesUsed || 0) - (a.timesUsed || 0);
  });
}

/**
 * Get activities associated with specific role models
 */
function getRoleModelActivities(roleModels: string[]): any[] {
  const roleModelMap: Record<string, string[]> = {
    'steve-jobs': ['mindful-breathing', 'creative-thinking', 'deep-reflection'],
    'buddha': ['mindful-breathing', 'gratitude-practice', 'empathy-practice'],
    'marcus-aurelius': ['deep-reflection', 'gratitude-practice', 'strategic-planning'],
    'einstein': ['creative-thinking', 'problem-solving', 'skill-practice'],
    'leonardo': ['creative-thinking', 'skill-practice', 'innovation-session'],
    'gandhi': ['mindful-breathing', 'empathy-practice', 'conflict-resolution'],
    'mlk': ['empathy-practice', 'leadership-moment', 'inspire-others'],
    'mother-teresa': ['empathy-practice', 'gratitude-practice', 'mentoring'],
    'franklin': ['strategic-planning', 'skill-practice', 'deep-reflection'],
    'lincoln': ['deep-reflection', 'problem-solving', 'leadership-moment']
  };

  const activityIds = new Set<string>();
  roleModels.forEach(roleModel => {
    const activities = roleModelMap[roleModel.toLowerCase()] || [];
    activities.forEach(id => activityIds.add(id));
  });

  return ACTIVITY_TEMPLATES.filter(template => 
    activityIds.has(template.id)
  );
}

/**
 * Get 2-3 suggested activities per category that user hasn't tried
 */
function getSuggestedActivities(excludeIds: Set<string>): any[] {
  const categories = [
    { name: 'mindfulness', activities: ['mindful-breathing', 'gratitude-practice'] },
    { name: 'physical', activities: ['quick-walk', 'posture-check'] },
    { name: 'creative', activities: ['creative-thinking', 'skill-practice'] },
    { name: 'communication', activities: ['empathy-practice', 'mentoring'] },
    { name: 'decision-making', activities: ['strategic-planning', 'problem-solving'] }
  ];

  const suggestions: any[] = [];
  
  categories.forEach(category => {
    // Get first available activity from each category
    const available = category.activities.find(id => !excludeIds.has(id));
    if (available) {
      const template = ACTIVITY_TEMPLATES.find(t => t.id === available);
      if (template) {
        suggestions.push(template);
      }
    }
  });

  return suggestions;
}

/**
 * Filter activities by category
 */
export function filterActivitiesByCategory(
  categoryId: string,
  userPreferences: ActivityPreference[],
  timelineActivities: any[] = []
): SmartFilterResult {
  console.log(`🎯 filterActivitiesByCategory called:`, { categoryId, userPreferences: userPreferences.length, timelineActivities: timelineActivities.length });
  
  if (categoryId === 'my-activities') {
    const activities = getPersonalizedActivities(userPreferences, timelineActivities);
    console.log(`⭐ My Activities result:`, { count: activities.length, activities: activities.map(a => a.title) });
    return {
      activities,
      source: 'personalized',
      count: activities.length
    };
  }

  if (categoryId === 'all-categories') {
    // Get ALL activities from all sources (same logic as "Manage Images")
    const allActivities = new Map();
    
    // 1. Start with templates (lowest priority)
    ACTIVITY_TEMPLATES.forEach(template => {
      allActivities.set(template.id, {
        ...template,
        source: 'template'
      });
    });
    
    // 2. Add timeline activities (override templates if same ID)
    timelineActivities.forEach(timelineActivity => {
      const activityId = timelineActivity.id || timelineActivity.name?.toLowerCase().replace(/\s+/g, '-');
      const activityTitle = timelineActivity.title || timelineActivity.name;
      
      if (activityTitle) {
        const gridActivity = {
          id: activityId,
          title: activityTitle,
          icon: timelineActivity.icon || '❓',
          category: timelineActivity.category || 'timeline',
          points: timelineActivity.points || 20,
          rarity: 'common' as const,
          duration: timelineActivity.duration ? `${timelineActivity.duration} min` : '15 min',
          difficulty: timelineActivity.difficulty || 2,
          description: timelineActivity.description || `${activityTitle} from timeline`,
          source: 'timeline'
        };
        allActivities.set(activityId, gridActivity);
      }
    });
    
    // 3. Apply user preferences (highest priority)
    const activitiesWithPreferences = Array.from(allActivities.values()).map(template => {
      const pref = userPreferences.find(p => p.activityId === template.id);
      if (pref) {
        return {
          ...template,
          duration: pref.customDuration || template.duration,
          points: pref.customPoints || template.points,
          difficulty: pref.customDifficulty || template.difficulty,
          icon: pref.customImageUrl || template.icon,
          customized: true
        };
      }
      return template;
    });

    return {
      activities: activitiesWithPreferences,
      source: 'all',
      count: activitiesWithPreferences.length
    };
  }

  // Category-specific filtering
  const categoryMap: Record<string, string[]> = {
    'purpose': ['deep-reflection', 'gratitude-practice'],
    'mental-health': ['mindful-breathing', 'gratitude-practice', 'deep-reflection'],
    'physical': ['quick-walk', 'hydrate', 'posture-check'],
    'relationships': ['empathy-practice', 'mentoring', 'conflict-resolution'],
    'art-creativity': ['creative-thinking', 'skill-practice', 'innovation-session'],
    'learning': ['skill-practice', 'problem-solving', 'master-skill'],
    'productivity': ['strategic-planning', 'problem-solving', 'life-changing-decision']
  };

  const categoryActivityIds = categoryMap[categoryId] || [];
  const categoryActivities = ACTIVITY_TEMPLATES.filter(template =>
    categoryActivityIds.includes(template.id)
  );

  // Apply user preferences
  const activitiesWithPreferences = categoryActivities.map(template => {
    const pref = userPreferences.find(p => p.activityId === template.id);
    if (pref) {
      return {
        ...template,
        duration: pref.customDuration || template.duration,
        points: pref.customPoints || template.points,
        difficulty: pref.customDifficulty || template.difficulty,
        icon: pref.customImageUrl || template.icon,
        customized: true
      };
    }
    return template;
  });

  return {
    activities: activitiesWithPreferences,
    source: 'category',
    count: activitiesWithPreferences.length
  };
}

/**
 * Get filter statistics for display
 */
export function getFilterStats(
  userPreferences: ActivityPreference[],
  timelineActivities: any[]
): Record<string, number> {
  // Calculate total unique activities from all sources
  const allActivities = new Set();
  
  // Add template IDs
  ACTIVITY_TEMPLATES.forEach(template => allActivities.add(template.id));
  
  // Add timeline activity IDs
  timelineActivities.forEach(timelineActivity => {
    const activityId = timelineActivity.id || timelineActivity.name?.toLowerCase().replace(/\s+/g, '-');
    if (activityId) allActivities.add(activityId);
  });
  
  return {
    'my-activities': getPersonalizedActivities(userPreferences, timelineActivities).length,
    'all-categories': allActivities.size, // Total unique activities from all sources
    'timeline-activities': timelineActivities.length,
    'customized-activities': userPreferences.length
  };
}