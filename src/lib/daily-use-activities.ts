// Daily Use Activities Library
// Purpose: Activity definitions, scheduling logic, and gamification systems

import { Activity, DailySchedule, LightwalkerState, Achievement, DAILY_USE_CONSTANTS } from '@/types/daily-use';

// Sample activities based on role models and attributes
export const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: 'buddha-mindfulness-001',
    title: 'Morning Mindful Breathing',
    description: 'Start your day with 5 minutes of conscious breathing',
    roleModel: 'Buddha',
    roleModelId: 'buddha',
    attribute: 'Mindful Awareness',
    duration: '5 minutes',
    difficulty: 2,
    timeOfDay: 'morning',
    category: 'mindfulness',
    isCompleted: false,
    points: 15,
    method: 'Sit quietly and focus on your breath, counting each exhale from 1 to 10',
    benefit: 'Develops awareness and starts the day with intention',
    successCriteria: 'Complete 10 breath cycles without distraction',
    location: 'quiet space',
    roleModelColor: '#8B5A2B',
    roleModelArchetype: 'wisdom-keeper',
    materials: ['timer']
  },
  {
    id: 'jobs-focus-001',
    title: 'Daily Priority Setting',
    description: 'Identify your top 3 priorities for the day',
    roleModel: 'Steve Jobs',
    roleModelId: 'steve-jobs',
    attribute: 'Strategic Focus',
    duration: '3 minutes',
    difficulty: 3,
    timeOfDay: 'morning',
    category: 'decision-making',
    isCompleted: false,
    points: 20,
    method: 'Write down everything on your mind, then circle only the 3 most important items',
    benefit: 'Increases focus and prevents decision fatigue',
    successCriteria: 'Have 3 clearly defined priorities written down',
    location: 'anywhere',
    roleModelColor: '#1C1C1E',
    roleModelArchetype: 'visionary',
    materials: ['pen', 'paper']
  },
  {
    id: 'mlk-communication-001',
    title: 'Compassionate Listening',
    description: 'Practice deep listening in your next conversation',
    roleModel: 'Martin Luther King Jr.',
    roleModelId: 'martin-luther-king-jr',
    attribute: 'Empathetic Leadership',
    duration: 'ongoing',
    difficulty: 4,
    timeOfDay: 'anytime',
    category: 'communication',
    isCompleted: false,
    points: 30,
    method: 'In your next conversation, focus entirely on understanding the other person before responding',
    benefit: 'Builds stronger relationships and understanding',
    successCriteria: 'Successfully reflect back what someone said before offering your perspective',
    location: 'social setting',
    roleModelColor: '#4A90E2',
    roleModelArchetype: 'servant-leader'
  },
  {
    id: 'einstein-creativity-001',
    title: 'Curiosity Question',
    description: 'Ask one deep "what if" question about something you encounter',
    roleModel: 'Albert Einstein',
    roleModelId: 'albert-einstein',
    attribute: 'Intellectual Curiosity',
    duration: '2 minutes',
    difficulty: 2,
    timeOfDay: 'anytime',
    category: 'creative',
    isCompleted: false,
    points: 15,
    method: 'When you encounter something interesting, ask "What if..." and explore 3 possible answers',
    benefit: 'Develops creative thinking and intellectual humility',
    successCriteria: 'Formulate one meaningful "what if" question and explore 3 answers',
    location: 'anywhere',
    roleModelColor: '#6B73FF',
    roleModelArchetype: 'truth-seeker'
  },
  {
    id: 'joan-courage-001',
    title: 'Courage Moment',
    description: 'Take one small courageous action today',
    roleModel: 'Joan of Arc',
    roleModelId: 'joan-of-arc',
    attribute: 'Courageous Action',
    duration: 'varies',
    difficulty: 6,
    timeOfDay: 'anytime',
    category: 'decision-making',
    isCompleted: false,
    points: 60,
    method: 'Identify something you\'ve been avoiding due to fear and take the smallest possible step toward it',
    benefit: 'Builds confidence and overcomes limiting beliefs',
    successCriteria: 'Complete one action you previously avoided due to fear',
    location: 'context-dependent',
    roleModelColor: '#D4AF37',
    roleModelArchetype: 'warrior-saint'
  },
  {
    id: 'marcus-reflection-001',
    title: 'Evening Reflection',
    description: 'Review your day with stoic wisdom',
    roleModel: 'Marcus Aurelius',
    roleModelId: 'marcus-aurelius',
    attribute: 'Philosophical Reflection',
    duration: '10 minutes',
    difficulty: 3,
    timeOfDay: 'evening',
    category: 'reflection',
    isCompleted: false,
    points: 20,
    method: 'Ask yourself: What did I learn today? What could I have done better? What am I grateful for?',
    benefit: 'Develops wisdom and emotional regulation',
    successCriteria: 'Write honest answers to all three reflection questions',
    location: 'quiet space',
    roleModelColor: '#9C27B0',
    roleModelArchetype: 'philosopher-king',
    materials: ['journal', 'pen']
  }
];

// Generate a daily schedule based on user preferences and available activities
export function generateDailySchedule(
  date: string,
  userPreferences: {
    wakeTime: string;
    sleepTime: string;
    workHours: { start: string; end: string };
    preferredDifficulty: number; // 1-9
    maxActivitiesPerDay: number;
    favoriteCategories: string[];
  },
  userLightwalker: {
    selectedAttributes: Array<{ roleModel: string; attribute: string; }>;
    level: number;
  }
): DailySchedule {
  // Filter activities based on user's selected attributes and preferences
  const relevantActivities = SAMPLE_ACTIVITIES.filter(activity => 
    userLightwalker.selectedAttributes.some(attr => 
      attr.roleModel === activity.roleModel && attr.attribute === activity.attribute
    )
  );

  // Select activities for the day based on preferences
  const selectedActivities = selectActivitiesForDay(
    relevantActivities,
    userPreferences,
    userLightwalker.level
  );

  // Schedule activities throughout the day
  const scheduledActivities = scheduleActivities(selectedActivities, userPreferences);

  const totalPoints = scheduledActivities.reduce((sum, activity) => sum + activity.points, 0);
  const completedCount = scheduledActivities.filter(a => a.isCompleted).length;
  
  return {
    date,
    activities: scheduledActivities,
    totalPoints,
    completedCount,
    completionPercentage: (completedCount / scheduledActivities.length) * 100,
    currentActivity: getCurrentActivity(scheduledActivities),
    nextActivities: getNextActivities(scheduledActivities, 3)
  };
}

function selectActivitiesForDay(
  availableActivities: Activity[],
  preferences: any,
  userLevel: number
): Activity[] {
  const maxActivities = Math.min(preferences.maxActivitiesPerDay, 8);
  const activities: Activity[] = [];

  // Ensure variety across categories and times of day
  const categories = ['mindfulness', 'decision-making', 'communication', 'reflection'];
  const timesOfDay = ['morning', 'afternoon', 'evening', 'anytime'];

  // Add one activity from each preferred category
  preferences.favoriteCategories.forEach((category: string) => {
    const categoryActivities = availableActivities.filter(a => a.category === category);
    if (categoryActivities.length > 0 && activities.length < maxActivities) {
      const suitable = categoryActivities.filter(a => 
        Math.abs(a.difficulty - preferences.preferredDifficulty) <= 2
      );
      if (suitable.length > 0) {
        activities.push({ ...suitable[Math.floor(Math.random() * suitable.length)] });
      }
    }
  });

  // Fill remaining slots with balanced selection
  while (activities.length < maxActivities && activities.length < availableActivities.length) {
    const remaining = availableActivities.filter(a => 
      !activities.some(selected => selected.id === a.id)
    );
    
    if (remaining.length === 0) break;
    
    // Prefer activities that balance the day
    const balanced = remaining.find(a => {
      const hasTimeSlot = !activities.some(selected => selected.timeOfDay === a.timeOfDay);
      const hasCategory = !activities.some(selected => selected.category === a.category);
      return hasTimeSlot || hasCategory;
    });
    
    activities.push({ ...(balanced || remaining[0]) });
  }

  return activities;
}

function scheduleActivities(
  activities: Activity[],
  preferences: any
): Activity[] {
  const scheduled = [...activities];
  
  // Assign specific times based on timeOfDay preferences
  // Include user's sleepTime in evening slots
  const timeSlots = {
    morning: ['07:00', '07:30', '08:00', '08:30'],
    afternoon: ['12:00', '12:30', '13:00', '13:30', '14:00'],
    evening: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', preferences.sleepTime],
    anytime: ['10:00', '11:00', '15:00', '16:00', '17:00']
  };

  scheduled.forEach(activity => {
    const slots = timeSlots[activity.timeOfDay];
    if (slots && slots.length > 0) {
      const availableSlot = slots[Math.floor(Math.random() * slots.length)];
      activity.scheduledTime = availableSlot;
    }
  });

  return scheduled.sort((a, b) => {
    if (!a.scheduledTime) return 1;
    if (!b.scheduledTime) return -1;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });
}

function getCurrentActivity(activities: Activity[]): Activity | undefined {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // Find activity scheduled within 30 minutes of current time
  return activities.find(activity => {
    if (!activity.scheduledTime || activity.isCompleted) return false;
    
    const scheduledMinutes = timeToMinutes(activity.scheduledTime);
    const currentMinutes = timeToMinutes(currentTime);
    const difference = Math.abs(scheduledMinutes - currentMinutes);
    
    return difference <= 30;
  });
}

function getNextActivities(activities: Activity[], count: number): Activity[] {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const currentMinutes = timeToMinutes(currentTime);
  
  return activities
    .filter(activity => 
      activity.scheduledTime && 
      !activity.isCompleted && 
      timeToMinutes(activity.scheduledTime) > currentMinutes
    )
    .slice(0, count);
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Lightwalker state management
export function calculateLightwalkerState(
  schedule: DailySchedule,
  userStats: {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
  },
  selectedAttributes: Array<{
    roleModel: string;
    attribute: string;
    influence: number;
  }>
): LightwalkerState {
  const level = calculateLevel(userStats.totalPoints);
  const currentActivity = schedule.currentActivity;
  
  // Determine mood based on recent activity and time of day
  let mood: LightwalkerState['currentMood'] = 'calm';
  const hour = new Date().getHours();
  
  if (currentActivity) {
    switch (currentActivity.category) {
      case 'mindfulness': mood = 'calm'; break;
      case 'decision-making': mood = 'focused'; break;
      case 'physical': mood = 'energetic'; break;
      case 'creative': mood = 'reflective'; break;
      default: mood = 'determined';
    }
  } else if (hour < 10) {
    mood = 'energetic';
  } else if (hour < 14) {
    mood = 'focused';
  } else if (hour < 18) {
    mood = 'determined';
  } else {
    mood = 'reflective';
  }

  // Determine avatar animation
  let avatarAnimation: LightwalkerState['avatarAnimation'] = 'idle';
  if (currentActivity && !currentActivity.isCompleted) {
    avatarAnimation = 'active';
  } else if (schedule.completionPercentage === 100) {
    avatarAnimation = 'celebrating';
  } else if (schedule.completionPercentage > 50) {
    avatarAnimation = 'thinking';
  }

  // Get dominant role models (top 3 by influence)
  const dominantRoleModels = selectedAttributes
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 3)
    .map(attr => ({
      name: attr.roleModel,
      influence: attr.influence,
      color: getRoleModelColor(attr.roleModel),
      archetype: getRoleModelArchetype(attr.roleModel)
    }));

  return {
    name: 'Your Lightwalker', // This would be customizable
    level,
    totalPoints: userStats.totalPoints,
    currentStreakDays: userStats.currentStreak,
    longestStreak: userStats.longestStreak,
    currentActivity,
    currentMood: mood,
    activeAttributes: selectedAttributes.map(attr => attr.attribute),
    dominantRoleModels,
    avatarAnimation,
    attributeGlow: currentActivity ? [currentActivity.attribute] : []
  };
}

function calculateLevel(totalPoints: number): number {
  const thresholds = DAILY_USE_CONSTANTS.LEVEL_THRESHOLDS;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= thresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

function getRoleModelColor(roleModel: string): string {
  const colors: Record<string, string> = {
    'Buddha': '#8B5A2B',
    'Steve Jobs': '#1C1C1E',
    'Martin Luther King Jr.': '#4A90E2',
    'Joan of Arc': '#D4AF37',
    'Albert Einstein': '#6B73FF',
    'Marcus Aurelius': '#9C27B0'
  };
  return colors[roleModel] || '#6B73FF';
}

function getRoleModelArchetype(roleModel: string): string {
  const archetypes: Record<string, string> = {
    'Buddha': 'wisdom-keeper',
    'Steve Jobs': 'visionary',
    'Martin Luther King Jr.': 'servant-leader',
    'Joan of Arc': 'warrior-saint',
    'Albert Einstein': 'truth-seeker',
    'Marcus Aurelius': 'philosopher-king'
  };
  return archetypes[roleModel] || 'guide';
}

// Achievement system
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first activity',
    icon: '👣',
    category: 'consistency',
    isUnlocked: false,
    requirement: 'Complete 1 activity'
  },
  {
    id: 'morning-warrior',
    title: 'Morning Warrior',
    description: 'Complete 5 morning activities',
    icon: '🌅',
    category: 'consistency',
    isUnlocked: false,
    requirement: 'Complete 5 morning activities'
  },
  {
    id: 'perfect-day',
    title: 'Perfect Day',
    description: 'Complete all activities in a single day',
    icon: '⭐',
    category: 'perfect-day',
    isUnlocked: false,
    requirement: 'Complete all scheduled activities in one day'
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    category: 'streak',
    isUnlocked: false,
    requirement: 'Complete activities for 7 consecutive days'
  },
  {
    id: 'challenge-seeker',
    title: 'Challenge Seeker',
    description: 'Complete a difficulty 8+ activity',
    icon: '💪',
    category: 'difficulty',
    isUnlocked: false,
    requirement: 'Complete an activity with difficulty 8 or higher'
  },
  {
    id: 'well-rounded',
    title: 'Well-Rounded',
    description: 'Complete activities from all 6 categories',
    icon: '🎯',
    category: 'variety',
    isUnlocked: false,
    requirement: 'Complete at least one activity from each category'
  }
];

// Utility functions for activity management
export function completeActivity(
  activity: Activity,
  userRating?: number,
  reflectionNotes?: string
): Activity {
  const completedActivity = { ...activity };
  completedActivity.isCompleted = true;
  completedActivity.completedAt = new Date().toISOString();
  
  // Calculate bonus points based on difficulty and user rating
  let bonusPoints = 0;
  if (userRating && userRating >= 4) {
    bonusPoints = Math.floor(activity.points * 0.2); // 20% bonus for high rating
  }
  
  completedActivity.points += bonusPoints;
  return completedActivity;
}

export function calculateDailyPoints(activities: Activity[], streakDays: number): number {
  const basePoints = activities
    .filter(a => a.isCompleted)
    .reduce((sum, a) => sum + a.points, 0);
  
  // Apply streak multiplier
  let multiplier = 1;
  for (const [days, mult] of Object.entries(DAILY_USE_CONSTANTS.STREAK_MULTIPLIER)) {
    if (streakDays >= parseInt(days)) {
      multiplier = mult;
    }
  }
  
  const streakPoints = Math.floor(basePoints * (multiplier - 1));
  
  // Perfect day bonus
  const perfectDayBonus = activities.every(a => a.isCompleted) 
    ? DAILY_USE_CONSTANTS.PERFECT_DAY_BONUS 
    : 0;
  
  return basePoints + streakPoints + perfectDayBonus;
}

export function checkAchievements(
  userStats: {
    totalActivitiesCompleted: number;
    perfectDays: number;
    currentStreak: number;
    categoriesCompleted: string[];
    hardestActivityCompleted: number;
    morningActivitiesCompleted: number;
  }
): Achievement[] {
  const unlockedAchievements: Achievement[] = [];
  
  ACHIEVEMENTS.forEach(achievement => {
    if (achievement.isUnlocked) return;
    
    let shouldUnlock = false;
    
    switch (achievement.id) {
      case 'first-steps':
        shouldUnlock = userStats.totalActivitiesCompleted >= 1;
        break;
      case 'morning-warrior':
        shouldUnlock = userStats.morningActivitiesCompleted >= 5;
        break;
      case 'perfect-day':
        shouldUnlock = userStats.perfectDays >= 1;
        break;
      case 'streak-master':
        shouldUnlock = userStats.currentStreak >= 7;
        break;
      case 'challenge-seeker':
        shouldUnlock = userStats.hardestActivityCompleted >= 8;
        break;
      case 'well-rounded':
        shouldUnlock = userStats.categoriesCompleted.length >= 6;
        break;
    }
    
    if (shouldUnlock) {
      const unlockedAchievement = { ...achievement };
      unlockedAchievement.isUnlocked = true;
      unlockedAchievement.unlockedAt = new Date().toISOString();
      unlockedAchievements.push(unlockedAchievement);
    }
  });
  
  return unlockedAchievements;
}