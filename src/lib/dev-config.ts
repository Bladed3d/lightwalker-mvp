/**
 * Development Configuration
 * Controls behavior during development vs production/beta
 */

// 🚀 BETA LAUNCH TOGGLE
// Change this to false when ready for beta testing to enable user-specific data
export const DEV_MODE = true;

/**
 * Development Mode Configuration
 * 
 * When DEV_MODE = true (current):
 * - All activity preferences save as system defaults (global)
 * - All timeline activities save as system defaults (global)  
 * - Your improvements immediately apply to everyone
 * - Perfect for development and testing improvements
 * 
 * When DEV_MODE = false (beta launch):
 * - Activity preferences save per user session (private)
 * - Timeline activities save per user session (private)
 * - Users get clean slate with no test data
 * - Each user has their own personalized experience
 */

export const CONFIG = {
  // Force all data to be global during development
  forceGlobalPreferences: DEV_MODE,
  forceGlobalTimelineActivities: DEV_MODE,
  
  // Logging preferences
  logSessionMode: DEV_MODE,
  
  // Beta launch preparation
  betaReadyMode: !DEV_MODE
} as const;

/**
 * Get the effective session ID based on current mode
 */
export function getEffectiveSessionId(userSessionId?: string, userId?: string): string {
  if ((CONFIG.forceGlobalPreferences || CONFIG.forceGlobalTimelineActivities) && !userId) {
    if (CONFIG.logSessionMode) {
      console.log('🔧 DEV MODE: Using system-default sessionId for global data');
    }
    return 'system-default';
  }
  
  return userSessionId || 'system-default';
}

/**
 * Instructions for Beta Launch
 * 
 * TO SWITCH TO BETA MODE:
 * 1. Change DEV_MODE to false at the top of this file
 * 2. Optional: Clear system-default data from database if desired
 * 3. Redeploy - users will now have individual sessions
 * 
 * TO CLEAR TEST DATA (optional):
 * Run these SQL commands in your database:
 * 
 * -- Clear system default activity preferences
 * DELETE FROM "ActivityPreference" WHERE "sessionId" = 'system-default';
 * 
 * -- Clear system default timeline activities  
 * DELETE FROM "TimelineActivity" WHERE "sessionId" = 'system-default';
 */