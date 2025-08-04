// Daily Use System Types
// Purpose: Type definitions for the Daily Use page functionality

export interface Activity {
  id: string;
  title: string;
  description: string;
  roleModel: string;
  roleModelId: string;
  attribute: string;
  duration: string;
  difficulty: number; // 1-9 scale
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  category: 'mindfulness' | 'decision-making' | 'communication' | 'reflection' | 'physical' | 'creative';
  scheduledTime?: string; // HH:MM format
  isCompleted: boolean;
  completedAt?: string;
  points: number;
  inProgress?: boolean;
  
  // Activity details
  method: string;
  benefit: string;
  successCriteria: string;
  materials?: string[];
  location?: string;
  
  // Visual representation
  icon: string; // Emoji or image URL
  
  // Role model context
  roleModelColor: string;
  roleModelArchetype: string;
  
  // Gamification
  streakBonus?: number;
  perfectDayBonus?: number;
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  activities: Activity[];
  totalPoints: number;
  completedCount: number;
  completionPercentage: number;
  currentActivity?: Activity;
  nextActivities: Activity[];
}

export interface LightwalkerState {
  name: string;
  level: number;
  totalPoints: number;
  currentStreakDays: number;
  longestStreak: number;
  
  // Current activity context
  currentActivity?: Activity;
  currentMood: 'energetic' | 'focused' | 'calm' | 'reflective' | 'determined';
  activeAttributes: string[];
  dominantRoleModels: Array<{
    name: string;
    influence: number; // 0-1
    color: string;
    archetype: string;
  }>;
  
  // Visual representation
  avatarAnimation: 'idle' | 'active' | 'celebrating' | 'thinking';
  attributeGlow: string[]; // Currently active attribute IDs
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'journal' | 'schedule' | 'todo' | 'reflection';
  action: () => void;
  isActive: boolean;
}

export interface ActivityModal {
  activity: Activity;
  isOpen: boolean;
  mode: 'view' | 'complete' | 'edit';
}

export interface TimelineSegment {
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  activity?: Activity;
  isCurrentTime: boolean;
  isPast: boolean;
  isFree: boolean;
}

export interface DailyUseStats {
  todayPoints: number;
  weeklyAverage: number;
  completionRate: number;
  favoriteTimeOfDay: string;
  mostActiveCategory: string;
  currentLevel: number;
  pointsToNextLevel: number;
  
  // Achievement tracking
  perfectDays: number;
  totalActivitiesCompleted: number;
  hardestActivityCompleted: number;
  consistencyScore: number; // 0-100
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'consistency' | 'difficulty' | 'variety' | 'perfect-day' | 'streak';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-1 for partial achievements
  requirement: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  activityId?: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'challenging' | 'difficult';
  insights: string[];
  tags: string[];
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  reminderTimes: string[]; // HH:MM format
  types: {
    activityReminders: boolean;
    streakReminders: boolean;
    achievementNotifications: boolean;
    dailyReflections: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

// UI State interfaces
export interface DailyUseUIState {
  activeTab: 'timeline' | 'lightwalker' | 'stats' | 'settings';
  selectedActivity?: Activity;
  showActivityModal: boolean;
  quickActionPanel: 'hidden' | 'journal' | 'schedule' | 'edit';
  timelineView: 'today' | 'week' | 'month';
  lightwalkerView: 'avatar' | 'attributes' | 'influences';
}

// API Response types
export interface DailyUseApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ActivityCompletionRequest {
  activityId: string;
  completedAt: string;
  userRating?: number; // 1-5 difficulty rating
  reflectionNotes?: string;
  mood?: string;
}

export interface ActivityScheduleRequest {
  activities: Array<{
    activityId: string;
    scheduledTime: string; // HH:MM
    date: string; // YYYY-MM-DD
  }>;
}

// Activity Preferences System
export interface ActivityPreference {
  id: string;
  userId?: string; // For logged-in users
  sessionId?: string; // For anonymous users
  activityId: string; // Original activity template ID
  activityTitle: string; // For quick reference
  
  // Customizable properties
  customDuration?: string; // e.g., "45 min", "1 hour"
  customPoints?: number; // Custom point value
  customDifficulty?: number; // 1-9 scale
  customCategory?: string; // Custom category if changed
  customDescription?: string; // Custom description
  customIcon?: string; // Custom emoji icon
  
  // Art Studio - Image customization
  customImageUrl?: string; // URL to uploaded/generated image
  imageSource?: 'upload' | 'ai_generated' | 'template'; // Source of the image
  imagePrompt?: string; // For AI-generated images
  imageMetadata?: Record<string, any>; // Additional image data (size, cost, etc.)
  
  // Art Studio - Dynamic grid sizing
  customGridSize?: { w: number; h: number }; // Custom grid dimensions
  
  // Metadata
  timesUsed: number; // How often this customization is applied
  lastUsedAt?: string; // When last applied (ISO string)
  isActive: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface ActivityPreferenceSaveRequest {
  userId?: string;
  sessionId?: string;
  activityId: string;
  activityTitle: string;
  customDuration?: string;
  customPoints?: number;
  customDifficulty?: number;
  customCategory?: string;
  customDescription?: string;
  customIcon?: string;
  // Art Studio - Image customization
  customImageUrl?: string;
  imageSource?: 'upload' | 'ai_generated' | 'template';
  imagePrompt?: string;
  imageMetadata?: Record<string, any>;
  // Art Studio - Dynamic grid sizing
  customGridSize?: { w: number; h: number };
}

export interface ActivityPreferencesApiResponse {
  success: boolean;
  data?: ActivityPreference | ActivityPreference[];
  error?: string;
  message?: string;
  details?: any;
}

// Constants for the Daily Use system
export const DAILY_USE_CONSTANTS = {
  POINTS_PER_DIFFICULTY: {
    1: 10, 2: 15, 3: 20, 4: 30, 5: 40, 6: 60, 7: 80, 8: 100, 9: 150
  },
  STREAK_MULTIPLIER: {
    3: 1.1,  // 10% bonus after 3 days
    7: 1.2,  // 20% bonus after a week
    14: 1.3, // 30% bonus after 2 weeks
    30: 1.5  // 50% bonus after a month
  },
  PERFECT_DAY_BONUS: 100, // Bonus points for completing all activities
  LEVEL_THRESHOLDS: [
    0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000
  ],
  MAX_ACTIVITIES_PER_DAY: 12,
  TIMELINE_SEGMENTS: 24, // 24 hour segments
  NOTIFICATION_ADVANCE_MINUTES: [5, 15, 30, 60], // Notification timing options
} as const;

// Type guards
export function isActivity(obj: any): obj is Activity {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.roleModel === 'string' &&
    typeof obj.difficulty === 'number' &&
    obj.difficulty >= 1 && obj.difficulty <= 9
  );
}

export function isDailySchedule(obj: any): obj is DailySchedule {
  return (
    typeof obj === 'object' &&
    typeof obj.date === 'string' &&
    Array.isArray(obj.activities) &&
    obj.activities.every(isActivity)
  );
}

// Color mapping for role models and attributes
export const ROLE_MODEL_COLORS = {
  'Buddha': '#8B5A2B',
  'Steve Jobs': '#1C1C1E',
  'Martin Luther King Jr.': '#4A90E2',
  'Joan of Arc': '#D4AF37',
  'Albert Einstein': '#6B73FF',
  'Winston Churchill': '#8B4513',
  'Leonardo da Vinci': '#FF6B35',
  'Maya Angelou': '#9B59B6',
  'Nelson Mandela': '#27AE60',
  'Marie Curie': '#E74C3C',
  'Confucius': '#F39C12',
  'Frida Kahlo': '#E91E63',
  'Theodore Roosevelt': '#795548',
  'Oprah Winfrey': '#FF9800',
  'Socrates': '#607D8B',
  'Jane Goodall': '#4CAF50',
  'Marcus Aurelius': '#9C27B0',
  'Eleanor Roosevelt': '#2196F3',
  'Benjamin Franklin': '#FF5722',
  'Rumi': '#00BCD4',
  'Harriet Tubman': '#3F51B5',
  'Frederick Douglass': '#009688'
} as const;

export const ACTIVITY_CATEGORY_COLORS = {
  'mindfulness': '#8B5A2B',
  'decision-making': '#4A90E2', 
  'communication': '#27AE60',
  'reflection': '#9B59B6',
  'physical': '#E74C3C',
  'creative': '#FF6B35'
} as const;