'use client'

// Bulletproof Daily Use Page - Designed to prevent "Cannot access before initialization" errors
// Uses simple structure, function declarations, and explicit initialization

import React from 'react';
import { 
  MessageCircle,
  Target,
  Clock,
  Grid3X3,
  Users,
  BarChart3,
  Sparkles
} from 'lucide-react';

// Import the game-like timeline that matches Section 5 of the mockup
import GamelikeTimeline from '@/components/daily-use/GamelikeTimeline';

// Import types and hooks
import { useDailyActivities } from '@/hooks/useDailyActivities';

// Main component using function declaration
export default function BulletproofDailyUse() {
  // Simple hook usage with explicit error handling
  const dailyData = useDailyActivities();
  
  // Simple state with explicit initialization
  const [currentTime, setCurrentTime] = React.useState(() => new Date());
  const [serverStatus, setServerStatus] = React.useState({ healthy: true, lastPing: Date.now() });
  
  // Simple effect for time updates (every second for server status monitoring)
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second to show server is live

    return () => clearInterval(interval);
  }, []);

  // Server health check - ping API every 30 seconds to prove code execution
  React.useEffect(() => {
    const pingServer = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setServerStatus({ healthy: true, lastPing: Date.now() });
        } else {
          setServerStatus({ healthy: false, lastPing: Date.now() });
        }
      } catch (error) {
        setServerStatus({ healthy: false, lastPing: Date.now() });
      }
    };

    // Initial ping
    pingServer();

    // Ping every 30 seconds
    const healthInterval = setInterval(pingServer, 30000);

    return () => clearInterval(healthInterval);
  }, []);

  // Simple data extraction with defaults
  const schedule = dailyData.schedule || { 
    date: new Date().toISOString().split('T')[0],
    activities: [], 
    completedCount: 0, 
    totalPoints: 0, 
    completionPercentage: 0,
    nextActivities: []
  };
  const lightwalkerState = dailyData.lightwalkerState || { 
    name: 'Your Lightwalker',
    level: 1,
    totalPoints: 0,
    currentStreakDays: 0,
    longestStreak: 0,
    currentMood: 'calm' as const,
    activeAttributes: [],
    dominantRoleModels: [],
    avatarAnimation: 'idle' as const,
    attributeGlow: []
  };
  const loading = dailyData.loading || false;
  const error = dailyData.error || null;
  
  // Simple computed values
  const completionPercentage = dailyData.getCompletionPercentage ? dailyData.getCompletionPercentage() : 0;
  const pointsEarned = dailyData.getPointsEarned ? dailyData.getPointsEarned() : 0;
  const todayStreak = dailyData.getTodayStreak ? dailyData.getTodayStreak() : 0;

  // Simple handlers using function declarations
  function handleActivityComplete(activityId: string) {
    if (dailyData.completeActivity) {
      dailyData.completeActivity(activityId);
    }
  }

  // Enhanced timeline handlers
  function handleSlotDrop(timeSlot: string, activity: any) {
    console.log('Activity dropped:', activity, 'to slot:', timeSlot);
    // Could implement rescheduling here
  }

  function handleTimeSlotSelect(slot: string) {
    console.log('Time slot selected:', slot);
  }

  function handleActivitySelect(activity: any) {
    console.log('Activity selected:', activity);
  }

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-white mb-2">Loading Daily Use...</h2>
          <p className="text-slate-300">Preparing your experience</p>
        </div>
      </div>
    );
  }

  // Simple error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Target className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">System Error</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Simple no data state
  if (!schedule.activities || schedule.activities.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Activities Found</h2>
          <p className="text-slate-300 mb-4">Create your Lightwalker first to begin</p>
          <a 
            href="/ai-character-creation-hybrid"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Create Lightwalker
          </a>
        </div>
      </div>
    );
  }

  // Main render - simple structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Lightwalker™ Daily Use</h1>
                <p className="text-xs text-slate-400">Timeline Edition</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{pointsEarned}</div>
                <div className="text-xs text-slate-400">Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{Math.round(completionPercentage)}%</div>
                <div className="text-xs text-slate-400">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-400">{todayStreak}</div>
                <div className="text-xs text-slate-400">Streak</div>
              </div>
              {/* Live Server Status Indicator */}
              <div className="text-center">
                <div className="text-sm font-mono text-cyan-400">{currentTime.toLocaleTimeString()}</div>
                <div className={`text-xs ${serverStatus.healthy ? 'text-green-400' : 'text-red-400'}`}>
                  {serverStatus.healthy ? '🟢 Code Executing' : '🔴 Server Dead'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
          
          {/* Game-like Timeline matching Section 5 mockup exactly */}
          <div className="col-span-12">
            <GamelikeTimeline />
          </div>

          {/* Role Models */}
          <div className="col-span-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Role Models
            </h3>
            
            <div className="space-y-3">
              {lightwalkerState.dominantRoleModels && lightwalkerState.dominantRoleModels.length > 0 ? (
                lightwalkerState.dominantRoleModels.slice(0, 3).map((roleModel, index) => (
                  <div key={index} className="p-3 bg-slate-700 rounded-lg">
                    <div className="text-sm font-medium text-white">{roleModel.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{roleModel.archetype || 'Role Model'}</div>
                    <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, (roleModel.influence || 0) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-sm">No role models selected</div>
              )}
            </div>
          </div>

          {/* Actions Grid */}
          <div className="col-span-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Grid3X3 className="w-5 h-5 mr-2 text-green-400" />
              Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {schedule.activities.slice(0, 8).map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => handleActivityComplete(activity.id)}
                  disabled={activity.isCompleted}
                  className={`p-3 rounded-lg text-left transition-all ${
                    activity.isCompleted
                      ? 'bg-green-800 text-green-100 cursor-not-allowed'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  <div className="text-sm font-medium">{activity.title}</div>
                  <div className="text-xs text-slate-400">{activity.points} pts</div>
                  {activity.isCompleted && (
                    <div className="text-xs text-green-400 mt-1">✓ Complete</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Extra Credit */}
          <div className="col-span-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
              Extra Credit
            </h3>
            
            <div className="space-y-2">
              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="text-sm font-medium text-yellow-100">Help a colleague</div>
                <div className="text-xs text-yellow-400">+25 bonus pts</div>
              </div>
              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="text-sm font-medium text-yellow-100">Random act of kindness</div>
                <div className="text-xs text-yellow-400">+30 bonus pts</div>
              </div>
              <div className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <div className="text-sm font-medium text-yellow-100">Learn something new</div>
                <div className="text-xs text-yellow-400">+20 bonus pts</div>
              </div>
            </div>
          </div>

          {/* Status & Chat */}
          <div className="col-span-3 space-y-4">
            {/* Status */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-400" />
                Status
              </h3>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">
                  {Math.round(completionPercentage)}%
                </div>
                <div className="text-sm text-slate-400 mb-4">Daily Progress</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Points:</span>
                    <span className="text-blue-400">{pointsEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Streak:</span>
                    <span className="text-green-400">{todayStreak} days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Progress */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                Progress
              </h3>
              
              <div className="text-center">
                <div className="text-xl font-bold text-green-400 mb-2">{pointsEarned}</div>
                <div className="text-sm text-slate-400 mb-4">Points Today</div>
                
                <div className="w-full bg-slate-600 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, completionPercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}