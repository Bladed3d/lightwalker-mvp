// Daily-Do Enhancement System Types
// Generated: 2025-07-29
// Purpose: Type definitions for Claude-powered activity enhancements

export interface DailyDoItem {
  id: string;                   // Unique identifier: "sf-001", "cw-002"
  action: string;              // Concrete, actionable task in first-person
  difficulty: number;          // 1-9 scale for gamification
  duration: string;            // "2-5 minutes", "10-15 minutes"
  timeOfDay: string;          // "morning", "evening", "anytime", "work-hours"
  category: string;           // "decision-making", "reflection", "communication"
  successCriteria: string;    // Clear completion indicator
  gamePoints: number;         // Points earned for completion (matches difficulty)
  
  // Optional enhancement metadata
  materials?: string[];       // ["pen", "paper", "timer"] if needed
  location?: string;          // "anywhere", "quiet-space", "outdoors"
  socialContext?: string;     // "solo", "with-others", "team-setting"
}

export interface AttributeEnhancement {
  attributeId: string;         // Unique identifier for the attribute
  originalMethod: string;      // Original abstract activity text
  dailyDoItems: DailyDoItem[]; // 2-3 concrete implementations
  
  // Enhancement metadata
  enhancedAt: string;         // ISO timestamp
  enhancedVersion: string;    // "1.0", "1.1" for version control
  difficultyRange: {          // Summary of difficulty spread
    min: number;
    max: number;
    average: number;
  };
  totalGamePoints: number;    // Sum of all item points
}

export interface RoleModelDailyDoEnhancement {
  // Enhancement session metadata
  enhancedAt: string;         // When this role model was enhanced
  enhancedBy: string;         // "claude-sonnet-4"
  version: string;            // "1.0" for rollback capability
  
  // Enhancement context
  enhancementContext: {
    userLevel: "beginner" | "intermediate" | "advanced";
    availableTime: "2-5min" | "5-15min" | "15-30min";
    preferredStyle: "structured" | "flexible" | "creative";
  };
  
  // All enhanced attributes for this role model
  attributes: AttributeEnhancement[];
  
  // Summary statistics
  summary: {
    totalAttributes: number;
    totalDailyDoItems: number;
    averageDifficulty: number;
    difficultyDistribution: {
      easy: number;      // 1-3 difficulty items
      moderate: number;  // 4-6 difficulty items
      challenging: number; // 7-9 difficulty items
    };
    categoryBreakdown: Record<string, number>;
    timeOfDayBreakdown: Record<string, number>;
  };
}

// Types for the enhancement process
export interface EnhancementPrompt {
  roleModel: string;           // "Steve Jobs"
  attribute: string;           // "Strategic Focus" 
  originalMethod: string;      // Abstract activity text
  context: {
    userLevel: "beginner" | "intermediate" | "advanced";
    availableTime: "2-5min" | "5-15min" | "15-30min";
    preferredStyle: "structured" | "flexible" | "creative";
  };
}

export interface EnhancementResponse {
  success: boolean;
  dailyDoItems?: DailyDoItem[];
  error?: string;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    retryCount: number;
  };
}

// Types for enhancement validation
export interface EnhancementQuality {
  hasConcreteVerbs: boolean;     // "write", "set timer", not "think about"
  hasSuccessCriteria: boolean;   // Clear completion indicator
  isImmediatelyDoable: boolean;  // No setup required
  usesFirstPerson: boolean;      // "I do X" format
  hasDifficultyRating: boolean;  // 1-9 scale assigned
  hasReasonableDuration: boolean; // Time estimate makes sense
  
  // Overall quality score (0-1)
  qualityScore: number;
  
  // Specific issues found
  issues: string[];
}

// Types for UI integration
export interface ActivityDisplayProps {
  attribute: {
    name: string;
    method: string;
    dailyDoEnhanced?: AttributeEnhancement;
  };
  showEnhanced: boolean;         // Feature flag control
  userLevel: "beginner" | "intermediate" | "advanced";
  onComplete?: (itemId: string) => void;
}

// Types for gamification integration
export interface DailyDoCompletion {
  userId: string;
  itemId: string;
  completedAt: string;           // ISO timestamp
  pointsEarned: number;
  completionType: "basic" | "reflection" | "insight";
  reflectionNotes?: string;
  difficultyRating: number;      // User's perceived difficulty (1-9)
}

export interface UserDailyDoProgress {
  userId: string;
  date: string;                  // YYYY-MM-DD
  completedItems: DailyDoCompletion[];
  totalPoints: number;
  streakDays: number;
  categoryProgress: Record<string, number>;
  difficultyProgress: {
    easy: number;
    moderate: number;
    challenging: number;
  };
}

// Database interface matching Prisma schema
export interface RoleModelWithDailyDo {
  id: string;
  commonName: string;
  enhancedAttributes: string | null;  // Legacy field
  dailyDoEnhanced: RoleModelDailyDoEnhancement | null;
  // ... other RoleModel fields
}

// Error types for enhancement process
export class EnhancementError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'EnhancementError';
  }
}

// Constants for enhancement system
export const ENHANCEMENT_CONSTANTS = {
  MAX_DAILY_DO_ITEMS_PER_ATTRIBUTE: 3,
  MIN_DAILY_DO_ITEMS_PER_ATTRIBUTE: 2,
  DIFFICULTY_SCALE: {
    MIN: 1,
    MAX: 9,
    EASY_THRESHOLD: 3,
    MODERATE_THRESHOLD: 6
  },
  DURATION_OPTIONS: [
    "1-2 minutes",
    "2-5 minutes", 
    "5-10 minutes",
    "10-15 minutes",
    "15-30 minutes",
    "ongoing"
  ],
  TIME_OF_DAY_OPTIONS: [
    "morning",
    "work-hours", 
    "evening",
    "anytime",
    "mealtime"
  ],
  CATEGORY_OPTIONS: [
    "decision-making",
    "reflection",
    "communication",
    "planning",
    "mindfulness",
    "physical",
    "creative",
    "social",
    "learning",
    "problem-solving"
  ]
} as const;

// Type guards for runtime validation
export function isDailyDoItem(obj: any): obj is DailyDoItem {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.action === 'string' &&
    typeof obj.difficulty === 'number' &&
    obj.difficulty >= 1 && obj.difficulty <= 9 &&
    typeof obj.successCriteria === 'string' &&
    typeof obj.gamePoints === 'number'
  );
}

export function isValidEnhancement(obj: any): obj is RoleModelDailyDoEnhancement {
  return (
    typeof obj === 'object' &&
    typeof obj.enhancedAt === 'string' &&
    typeof obj.version === 'string' &&
    Array.isArray(obj.attributes) &&
    obj.attributes.every((attr: any) => 
      typeof attr.attributeId === 'string' &&
      Array.isArray(attr.dailyDoItems) &&
      attr.dailyDoItems.every(isDailyDoItem)
    )
  );
}