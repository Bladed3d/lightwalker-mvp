'use client'

import { useState, useEffect } from 'react';
import { 
  MessageCircle,
  Target,
  TrendingUp,
  Clock,
  Grid3X3,
  Users,
  BarChart3,
  Sparkles,
  Play,
  Pause
} from 'lucide-react';

// Import the enhanced timeline component
import TimelineInterface from '../../../../.claude/quality-first-process/timeline-interface/timeline-interface';

// Import types
import { useDailyActivities } from '@/hooks/useDailyActivities';

export default function DailyUseGameUIEnhanced() {
  // Data hooks
  const {
    schedule,
    lightwalkerState,
    stats,
    achievements,
    loading,
    error,
    completeActivity,
    getCurrentActivity,
    getCompletionPercentage,
    getPointsEarned,
    getTodayStreak
  } = useDailyActivities();

  // UI State for game interface  
  const [gameUIState, setGameUIState] = useState({
    timelineAutoScroll: true,
    selectedTimeSlot: null,
    draggedActivity: null,
    chatMessages: [],
    showRoleModelDetails: null,
    gridLayout: 'compact',
    soundEnabled: true,
    particleEffects: true
  });

  // Current time for timeline positioning
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Activity selection handler
  const handleActivitySelect = (activity: any) => {
    console.log('Selected activity:', activity);
  };

  // Time navigation handler
  const handleTimeNavigate = (time: Date) => {
    console.log('Navigated to time:', time);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Enhanced Game Interface...</h2>
          <p className="text-slate-300">Preparing your enhanced daily adventures</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">
            <Target className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">System Offline</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!schedule || !lightwalkerState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Lightwalker Found</h2>
          <p className="text-slate-300 mb-4">Create your Lightwalker first to begin your journey</p>
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

  const currentActivity = getCurrentActivity();
  const completionPercentage = getCompletionPercentage();
  const pointsEarned = getPointsEarned();
  const todayStreak = getTodayStreak();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      {/* Game UI Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Lightwalker™ Command Center</h1>
                <p className="text-xs text-slate-400">Enhanced Timeline Experience</p>
              </div>
            </div>

            {/* Quick Stats */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
          
          {/* Section 1: Enhanced Timeline - Top Span */}
          <div className="col-span-12">
            <TimelineInterface
              schedule={schedule}
              lightwalkerState={lightwalkerState}
              currentTime={currentTime}
              onActivityComplete={completeActivity}
              onActivitySelect={handleActivitySelect}
              onTimeNavigate={handleTimeNavigate}
              className="w-full"
            />
          </div>

          {/* Section 2: Role Models - Left */}
          <div className="col-span-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-400" />
              Role Models
            </h3>
            
            <div className="space-y-3">
              {lightwalkerState.dominantRoleModels?.slice(0, 3).map((roleModel, index) => (
                <div key={index} className="p-3 bg-slate-700 rounded-lg">
                  <div className="text-sm font-medium text-white">{roleModel.name}</div>
                  <div className="text-xs text-slate-400">{roleModel.archetype}</div>
                  <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(roleModel.influence || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )) || (
                <div className="text-slate-400 text-sm">No role models selected</div>
              )}
            </div>
          </div>

          {/* Section 3: Scheduled Actions - Center Left */}
          <div className="col-span-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Grid3X3 className="w-5 h-5 mr-2 text-green-400" />
              Actions Grid
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {schedule.activities.slice(0, 8).map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => completeActivity(activity.id)}
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

          {/* Section 4: Extra Credit - Center Right */}
          <div className="col-span-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
              Extra Credit
            </h3>
            
            <div className="space-y-2">
              {[
                { title: 'Help a colleague', points: 25 },
                { title: 'Random act of kindness', points: 30 },
                { title: 'Learn something new', points: 20 },
                { title: 'Express gratitude', points: 15 }
              ].map((action, index) => (
                <div key={index} className="p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                  <div className="text-sm font-medium text-yellow-100">{action.title}</div>
                  <div className="text-xs text-yellow-400">+{action.points} bonus pts</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Chat & Status - Right */}
          <div className="col-span-3 space-y-4">
            {/* Chat */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-cyan-400" />
                Lightwalker Chat
              </h3>
              
              <div className="bg-slate-700 rounded-lg p-3 mb-3">
                <div className="text-sm text-cyan-100">
                  {currentActivity ? 
                    `I'm focusing on ${currentActivity.title} right now. The enhanced timeline shows your energy flow beautifully!` :
                    `Ready to start your day? The new timeline will guide your energy through each activity seamlessly.`
                  }
                </div>
                <div className="text-xs text-slate-400 mt-2">Just now</div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Message your Lightwalker..."
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                />
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
                  Send
                </button>
              </div>
            </div>

            {/* Status Circle */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-400" />
                Status
              </h3>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-slate-600"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      className="text-orange-400 transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{Math.round(completionPercentage)}%</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sync Level:</span>
                    <span className="text-orange-400">{Math.round(completionPercentage)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Streak:</span>
                    <span className="text-green-400">{todayStreak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Level:</span>
                    <span className="text-blue-400">{lightwalkerState.level || 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Graph */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                Progress
              </h3>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">{pointsEarned}</div>
                <div className="text-sm text-slate-400 mb-4">Points Today</div>
                
                <div className="flex justify-center space-x-2">
                  {[65, 82, 45, 78, 91, 67].map((points, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-3 bg-green-500 rounded-t mb-1"
                        style={{ height: `${points / 2}px` }}
                      ></div>
                      <div className="text-xs text-slate-400">
                        {['M', 'T', 'W', 'T', 'F', 'S'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement Notice */}
      <div className="fixed bottom-4 right-4 bg-blue-600/90 backdrop-blur text-white px-4 py-2 rounded-lg text-sm">
        ✨ Enhanced Timeline with Magnetic Navigation
      </div>
    </div>
  );
}