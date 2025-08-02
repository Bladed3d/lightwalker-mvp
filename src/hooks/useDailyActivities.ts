// Daily Activities Hook
// Purpose: Data fetching and state management for Daily Use page

'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  DailySchedule, 
  LightwalkerState, 
  DailyUseStats,
  Achievement,
  ActivityCompletionRequest 
} from '@/types/daily-use';
import { 
  generateDailySchedule, 
  calculateLightwalkerState, 
  SAMPLE_ACTIVITIES,
  completeActivity,
  calculateDailyPoints,
  checkAchievements 
} from '@/lib/daily-use-activities';

interface UseDailyActivitiesOptions {
  userId?: string;
  date?: string; // YYYY-MM-DD format
}

interface UseDailyActivitiesReturn {
  // Data
  schedule: DailySchedule | null;
  lightwalkerState: LightwalkerState | null;
  stats: DailyUseStats | null;
  achievements: Achievement[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  completeActivity: (activityId: string, userRating?: number, notes?: string) => Promise<void>;
  rescheduleActivity: (activityId: string, newTime: string) => Promise<void>;
  refreshSchedule: () => Promise<void>;
  markActivityInProgress: (activityId: string) => void;
  
  // UI helpers
  getCurrentActivity: () => Activity | null;
  getNextActivities: (count?: number) => Activity[];
  getCompletionPercentage: () => number;
  getPointsEarned: () => number;
  getTodayStreak: () => number;
}

export function useDailyActivities(options: UseDailyActivitiesOptions = {}): UseDailyActivitiesReturn {
  const { userId, date = new Date().toISOString().split('T')[0] } = options;
  
  // State
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [lightwalkerState, setLightwalkerState] = useState<LightwalkerState | null>(null);
  const [stats, setStats] = useState<DailyUseStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user preferences - in real app this would come from database/API
  const mockUserPreferences = {
    wakeTime: '07:00',
    sleepTime: '22:00',
    workHours: { start: '09:00', end: '17:00' },
    preferredDifficulty: 4,
    maxActivitiesPerDay: 6,
    favoriteCategories: ['mindfulness', 'decision-making', 'reflection']
  };

  const mockUserLightwalker = {
    selectedAttributes: [
      { roleModel: 'Buddha', attribute: 'Mindful Awareness', influence: 0.8 },
      { roleModel: 'Steve Jobs', attribute: 'Strategic Focus', influence: 0.7 },
      { roleModel: 'Martin Luther King Jr.', attribute: 'Empathetic Leadership', influence: 0.6 },
      { roleModel: 'Albert Einstein', attribute: 'Intellectual Curiosity', influence: 0.5 },
      { roleModel: 'Joan of Arc', attribute: 'Courageous Action', influence: 0.4 },
      { roleModel: 'Marcus Aurelius', attribute: 'Philosophical Reflection', influence: 0.7 }
    ],
    level: 3
  };

  const mockUserStats = {
    totalPoints: 850,
    currentStreak: 4,
    longestStreak: 12,
    totalActivitiesCompleted: 45,
    perfectDays: 2,
    categoriesCompleted: ['mindfulness', 'decision-making', 'communication', 'reflection'],
    hardestActivityCompleted: 7,
    morningActivitiesCompleted: 12
  };

  // Initialize data
  const loadDailyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate schedule based on user preferences
      const dailySchedule = generateDailySchedule(
        date,
        mockUserPreferences,
        mockUserLightwalker
      );

      // Calculate Lightwalker state
      const lightwalker = calculateLightwalkerState(
        dailySchedule,
        mockUserStats,
        mockUserLightwalker.selectedAttributes
      );

      // Generate stats
      const dailyStats: DailyUseStats = {
        todayPoints: calculateDailyPoints(dailySchedule.activities, mockUserStats.currentStreak),
        weeklyAverage: 145, // Mock data
        completionRate: dailySchedule.completionPercentage,
        favoriteTimeOfDay: 'morning',
        mostActiveCategory: 'mindfulness',
        currentLevel: lightwalker.level,
        pointsToNextLevel: 150, // Mock calculation
        perfectDays: mockUserStats.perfectDays,
        totalActivitiesCompleted: mockUserStats.totalActivitiesCompleted,
        hardestActivityCompleted: mockUserStats.hardestActivityCompleted,
        consistencyScore: 78 // Mock calculation
      };

      // Check for new achievements
      const newAchievements = checkAchievements(mockUserStats);

      setSchedule(dailySchedule);
      setLightwalkerState(lightwalker);
      setStats(dailyStats);
      setAchievements(newAchievements);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily data');
    } finally {
      setLoading(false);
    }
  }, [date]);

  // Load data on mount and date change
  useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  // Activity completion handler
  const handleCompleteActivity = useCallback(async (
    activityId: string, 
    userRating?: number, 
    notes?: string
  ) => {
    if (!schedule) return;

    try {
      const activity = schedule.activities.find(a => a.id === activityId);
      if (!activity) {
        throw new Error('Activity not found');
      }

      // Mark activity as completed
      const completedActivity = completeActivity(activity, userRating, notes);
      
      // Update schedule
      const updatedActivities = schedule.activities.map(a =>
        a.id === activityId ? completedActivity : a
      );
      
      const updatedSchedule: DailySchedule = {
        ...schedule,
        activities: updatedActivities,
        completedCount: updatedActivities.filter(a => a.isCompleted).length,
        completionPercentage: (updatedActivities.filter(a => a.isCompleted).length / updatedActivities.length) * 100,
        totalPoints: updatedActivities.reduce((sum, a) => a.isCompleted ? sum + a.points : sum, 0)
      };

      setSchedule(updatedSchedule);

      // Update Lightwalker state
      const updatedStats = { ...mockUserStats };
      updatedStats.totalActivitiesCompleted += 1;
      if (completedActivity.difficulty > updatedStats.hardestActivityCompleted) {
        updatedStats.hardestActivityCompleted = completedActivity.difficulty;
      }
      if (completedActivity.timeOfDay === 'morning') {
        updatedStats.morningActivitiesCompleted += 1;
      }

      const updatedLightwalker = calculateLightwalkerState(
        updatedSchedule,
        updatedStats,
        mockUserLightwalker.selectedAttributes
      );

      setLightwalkerState(updatedLightwalker);

      // Check for new achievements
      const newAchievements = checkAchievements(updatedStats);
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
      }

      // In a real app, this would make an API call to persist the completion
      // await api.completeActivity({ activityId, completedAt: new Date().toISOString(), userRating, reflectionNotes: notes });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete activity');
    }
  }, [schedule, mockUserLightwalker.selectedAttributes]);

  // Activity rescheduling handler
  const handleRescheduleActivity = useCallback(async (activityId: string, newTime: string) => {
    if (!schedule) return;

    try {
      const updatedActivities = schedule.activities.map(activity =>
        activity.id === activityId 
          ? { ...activity, scheduledTime: newTime }
          : activity
      );

      // Sort by scheduled time
      updatedActivities.sort((a, b) => {
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });

      setSchedule({
        ...schedule,
        activities: updatedActivities
      });

      // In a real app, this would make an API call
      // await api.rescheduleActivity({ activityId, newTime, date });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule activity');
    }
  }, [schedule]);

  // Mark activity as in progress
  const markActivityInProgress = useCallback((activityId: string) => {
    if (!schedule) return;

    const updatedActivities = schedule.activities.map(activity =>
      activity.id === activityId 
        ? { ...activity, inProgress: true }
        : { ...activity, inProgress: false } // Only one activity can be in progress at a time
    );

    setSchedule({
      ...schedule,
      activities: updatedActivities
    });
  }, [schedule]);

  // Helper functions
  const getCurrentActivity = useCallback((): Activity | null => {
    return schedule?.currentActivity || null;
  }, [schedule]);

  const getNextActivities = useCallback((count: number = 3): Activity[] => {
    return schedule?.nextActivities?.slice(0, count) || [];
  }, [schedule]);

  const getCompletionPercentage = useCallback((): number => {
    return schedule?.completionPercentage || 0;
  }, [schedule]);

  const getPointsEarned = useCallback((): number => {
    if (!schedule) return 0;
    return schedule.activities
      .filter(a => a.isCompleted)
      .reduce((sum, a) => sum + a.points, 0);
  }, [schedule]);

  const getTodayStreak = useCallback((): number => {
    return lightwalkerState?.currentStreakDays || 0;
  }, [lightwalkerState]);

  return {
    // Data
    schedule,
    lightwalkerState,
    stats,
    achievements,
    
    // Loading states
    loading,
    error,
    
    // Actions
    completeActivity: handleCompleteActivity,
    rescheduleActivity: handleRescheduleActivity,
    refreshSchedule: loadDailyData,
    markActivityInProgress,
    
    // UI helpers
    getCurrentActivity,
    getNextActivities,
    getCompletionPercentage,
    getPointsEarned,
    getTodayStreak
  };
}

// Additional hook for real-time updates
export function useActivityTimer(currentActivity: Activity | null) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isActiveTime, setIsActiveTime] = useState(false);

  useEffect(() => {
    if (!currentActivity?.scheduledTime) {
      setTimeRemaining('');
      setIsActiveTime(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [hours, minutes] = currentActivity.scheduledTime!.split(':').map(Number);
      const scheduledTime = hours * 60 + minutes;
      
      const diff = scheduledTime - currentTime;
      
      if (Math.abs(diff) <= 15) { // Within 15 minutes
        setIsActiveTime(true);
        if (diff > 0) {
          const remainingMinutes = diff;
          setTimeRemaining(`${remainingMinutes}m until start`);
        } else {
          setTimeRemaining('Active now!');
        }
      } else {
        setIsActiveTime(false);
        if (diff > 0) {
          const hours = Math.floor(diff / 60);
          const minutes = diff % 60;
          if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m`);
          } else {
            setTimeRemaining(`${minutes}m`);
          }
        } else {
          setTimeRemaining('Overdue');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentActivity]);

  return { timeRemaining, isActiveTime };
}