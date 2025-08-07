import { ActivityPreference, ActivityPreferenceSaveRequest, ActivityPreferencesApiResponse, Activity } from '@/types/daily-use'
import { getEffectiveSessionId, CONFIG } from './dev-config'

/**
 * Activity Preferences Utility Functions
 * Handles saving, loading, and applying user's custom activity settings
 */

// Generate a session ID for anonymous users
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get current user/session identifier
export function getCurrentUserIdentifier(): { userId?: string; sessionId: string } {
  // Check if we should force global mode (development)
  if (CONFIG.forceGlobalPreferences) {
    if (CONFIG.logSessionMode) {
      console.log('🔧 DEV MODE: Using system-default sessionId - all changes apply globally');
    }
    return { sessionId: 'system-default' }
  }
  
  // Beta/production mode: use individual sessions
  let sessionId = localStorage.getItem('lightwalker_session_id')
  
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('lightwalker_session_id', sessionId)
  }
  
  if (CONFIG.logSessionMode) {
    console.log('👤 BETA MODE: Using individual sessionId:', sessionId.substring(0, 20) + '...');
  }
  
  return { sessionId }
}

// Save activity preference
export async function saveActivityPreference(
  activity: Activity,
  customizations: Partial<Activity>
): Promise<ActivityPreferencesApiResponse> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const requestData: ActivityPreferenceSaveRequest = {
      userId,
      sessionId,
      activityId: activity.id,
      activityTitle: activity.title,
      customDuration: customizations.duration,
      customPoints: customizations.points,
      customDifficulty: customizations.difficulty,
      customCategory: customizations.category,
      customDescription: customizations.description,
      customIcon: customizations.title !== activity.title ? customizations.title : undefined, // Store custom title as icon if changed
      // Art Studio - Handle custom images
      customImageUrl: customizations.icon && (customizations.icon.startsWith('data:') || customizations.icon.startsWith('http')) ? customizations.icon : undefined,
      imageSource: customizations.icon && customizations.icon.startsWith('data:') ? 'upload' : undefined
    }

    const response = await fetch('/api/activities/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    const result: ActivityPreferencesApiResponse = await response.json()
    
    if (!result.success) {
      console.error('Failed to save activity preference:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('Error saving activity preference:', error)
    return {
      success: false,
      error: 'Network error while saving preference'
    }
  }
}

// Load all activity preferences for current user/session
export async function loadActivityPreferences(): Promise<ActivityPreference[]> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (sessionId) params.append('sessionId', sessionId)
    
    const response = await fetch(`/api/activities/preferences?${params}`)
    const result: ActivityPreferencesApiResponse = await response.json()
    
    if (result.success && Array.isArray(result.data)) {
      return result.data
    }
    
    return []
  } catch (error) {
    console.error('Error loading activity preferences:', error)
    return []
  }
}

// Load specific activity preference
export async function loadActivityPreference(activityId: string): Promise<ActivityPreference | null> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (sessionId) params.append('sessionId', sessionId)
    params.append('activityId', activityId)
    
    const response = await fetch(`/api/activities/preferences?${params}`)
    const result: ActivityPreferencesApiResponse = await response.json()
    
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      return result.data[0]
    }
    
    return null
  } catch (error) {
    console.error('Error loading activity preference:', error)
    return null
  }
}

// Apply saved preferences to an activity
export function applyPreferencesToActivity(
  baseActivity: Activity,
  preference: ActivityPreference
): Activity {
  return {
    ...baseActivity,
    duration: preference.customDuration ?? baseActivity.duration,
    points: preference.customPoints ?? baseActivity.points,
    difficulty: preference.customDifficulty ?? baseActivity.difficulty,
    category: (preference.customCategory as any) ?? baseActivity.category,
    description: preference.customDescription ?? baseActivity.description,
    title: preference.customIcon ?? baseActivity.title, // Custom icon stored as title for now
    // Art Studio - Apply custom image if available
    icon: preference.customImageUrl ?? baseActivity.icon,
  }
}

// Delete activity preference
export async function deleteActivityPreference(preferenceId: string): Promise<boolean> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const params = new URLSearchParams()
    params.append('id', preferenceId)
    if (userId) params.append('userId', userId)
    if (sessionId) params.append('sessionId', sessionId)
    
    const response = await fetch(`/api/activities/preferences?${params}`, {
      method: 'DELETE'
    })
    
    const result: ActivityPreferencesApiResponse = await response.json()
    return result.success
  } catch (error) {
    console.error('Error deleting activity preference:', error)
    return false
  }
}

// Create a preferences map for quick lookup
export function createPreferencesMap(preferences: ActivityPreference[]): Map<string, ActivityPreference> {
  const map = new Map<string, ActivityPreference>()
  
  preferences.forEach(pref => {
    map.set(pref.activityId, pref)
  })
  
  return map
}

// Apply preferences to a list of activities
export function applyPreferencesToActivities(
  activities: Activity[],
  preferences: ActivityPreference[]
): Activity[] {
  const preferencesMap = createPreferencesMap(preferences)
  
  return activities.map(activity => {
    const preference = preferencesMap.get(activity.id)
    return preference ? applyPreferencesToActivity(activity, preference) : activity
  })
}

// Art Studio - Save custom image for activity
export async function saveActivityImagePreference(
  activityId: string,
  activityTitle: string,
  imageUrl: string,
  imageSource: 'upload' | 'ai_generated' = 'upload',
  imagePrompt?: string,
  imageMetadata?: Record<string, any>
): Promise<ActivityPreferencesApiResponse> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const requestData = {
      userId,
      sessionId,
      activityId,
      activityTitle,
      customImageUrl: imageUrl,
      imageSource,
      imagePrompt,
      imageMetadata
    }

    const response = await fetch('/api/activities/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    const result: ActivityPreferencesApiResponse = await response.json()
    
    if (!result.success) {
      console.error('Failed to save activity image preference:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('Error saving activity image preference:', error)
    return {
      success: false,
      error: 'Network error while saving image preference'
    }
  }
}

// Art Studio - Save custom image and grid size for activity
export async function saveActivityImageAndGridPreference(
  activityId: string,
  activityTitle: string,
  imageUrl: string,
  gridSize: { w: number; h: number },
  imageSource: 'upload' | 'ai_generated' = 'upload',
  imagePrompt?: string,
  imageMetadata?: Record<string, any>,
  customCategory?: string
): Promise<ActivityPreferencesApiResponse> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const requestData = {
      userId,
      sessionId,
      activityId,
      activityTitle,
      customImageUrl: imageUrl,
      imageSource,
      imagePrompt,
      imageMetadata,
      customGridSize: gridSize,
      customCategory
    }

    const response = await fetch('/api/activities/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    const result: ActivityPreferencesApiResponse = await response.json()
    
    if (result.success) {
      console.log('✅ Activity image and grid preference saved successfully!');
      
      // Trigger grid reorganization event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gridLayoutChanged', {
          detail: { 
            activityId, 
            newGridSize: gridSize,
            imageUrl,
            timestamp: Date.now() 
          }
        }));
      }
      
      return { 
        success: true, 
        data: result.data, 
        message: `Custom image and ${gridSize.w}×${gridSize.h} grid saved! 🎨📐` 
      };
    } else {
      console.error('❌ Failed to save activity image and grid preference:', result.error);
      return result;
    }
  } catch (error) {
    console.error('❌ Error in saveActivityImageAndGridPreference:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to save activity image and grid preference' 
    };
  }
}

// Save activity preferences including category changes
export async function saveActivityCategoryPreference(
  activityId: string,
  activityTitle: string,
  customCategory: string,
  customDuration?: string,
  customPoints?: number
): Promise<ActivityPreferencesApiResponse> {
  try {
    const { userId, sessionId } = getCurrentUserIdentifier()
    
    const requestData = {
      userId,
      sessionId,
      activityId,
      activityTitle,
      customCategory,
      customDuration,
      customPoints
    }

    console.log('🔍 API REQUEST DEBUG:', {
      url: '/api/activities/preferences',
      method: 'POST',
      requestData,
      sessionId: sessionId
    });

    const response = await fetch('/api/activities/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    console.log('🔍 API RESPONSE DEBUG:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    const result: ActivityPreferencesApiResponse = await response.json()
    
    console.log('🔍 API RESULT DEBUG:', result);
    
    if (result.success) {
      console.log('✅ Activity category preference saved successfully!');
      
      // Trigger grid layout update event
      window.dispatchEvent(new CustomEvent('gridLayoutChanged', {
        detail: { 
          activityId, 
          newCategory: customCategory,
          customDuration,
          customPoints
        }
      }));
    } else {
      console.error('❌ API returned error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error saving activity category preference:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Art Studio - Get custom image URL for activity  
export function getCustomImageUrl(
  baseActivity: Activity,
  preference: ActivityPreference | null
): string {
  return preference?.customImageUrl ?? baseActivity.icon
}