'use client'

import { useState } from 'react';
import { 
  Clock, 
  Activity as ActivityIcon, 
  User, 
  BarChart3, 
  Calendar,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

// Components
import ActivityTimeline from '@/components/daily-actions/ActivityTimeline';
import GameifiedTimeline from '@/components/daily-actions/GameifiedTimeline';
import LightwalkerAvatar from '@/components/daily-actions/LightwalkerAvatar';
import AttributeContainer from '@/components/daily-actions/AttributeContainer';
import RoleModelInfluences from '@/components/daily-actions/RoleModelInfluences';
import QuickActions from '@/components/daily-actions/QuickActions';
// import ActivityModal from '@/components/daily-actions/ActivityModal';

// Hooks and utilities
import { useDailyActivities } from '@/hooks/useDailyActivities';
import { Activity, DailyUseUIState } from '@/types/daily-use';

export default function DailyActionsPage() {
  // Data hooks
  const {
    schedule,
    lightwalkerState,
    stats,
    achievements,
    loading,
    error,
    completeActivity,
    rescheduleActivity,
    markActivityInProgress,
    getCurrentActivity,
    getNextActivities,
    getCompletionPercentage,
    getPointsEarned,
    getTodayStreak
  } = useDailyActivities();

  // UI State
  const [uiState, setUIState] = useState<DailyUseUIState>({
    activeTab: 'timeline',
    selectedActivity: undefined,
    showActivityModal: false,
    quickActionPanel: 'hidden',
    timelineView: 'today',
    lightwalkerView: 'avatar'
  });

  const [viewMode, setViewMode] = useState<'classic' | 'gamified'>('classic');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Event handlers
  const handleActivitySelect = (activity: Activity) => {
    setUIState(prev => ({
      ...prev,
      selectedActivity: activity,
      showActivityModal: true
    }));
  };

  const handleActivityComplete = async (activityId: string, rating?: number, notes?: string) => {
    await completeActivity(activityId, rating, notes);
    setUIState(prev => ({
      ...prev,
      showActivityModal: false,
      selectedActivity: undefined
    }));
  };

  const handleCloseModal = () => {
    setUIState(prev => ({
      ...prev,
      showActivityModal: false,
      selectedActivity: undefined
    }));
  };

  const handleTabChange = (tab: DailyUseUIState['activeTab']) => {
    setUIState(prev => ({ ...prev, activeTab: tab }));
    setIsMobileMenuOpen(false);
  };

  const handleQuickAction = (panel: DailyUseUIState['quickActionPanel']) => {
    setUIState(prev => ({
      ...prev,
      quickActionPanel: prev.quickActionPanel === panel ? 'hidden' : panel
    }));
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your Daily Actions experience...</h2>
          <p className="text-gray-600">Preparing your personalized activities</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <X className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load Daily Actions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!schedule || !lightwalkerState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No activities scheduled</h2>
          <p className="text-gray-600">Create your Lightwalker first to get personalized activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Daily Actions</h1>
                <p className="text-sm text-gray-600">Living your Lightwalker (Development)</p>
              </div>
            </div>

            {/* View Mode Toggle & Stats */}
            <div className="hidden md:flex items-center space-x-6">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('classic')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'classic'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Classic
                </button>
                <button
                  onClick={() => setViewMode('gamified')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'gamified'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎮 Gamified
                </button>
              </div>

              {/* Stats Summary */}
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{getPointsEarned()}</div>
                  <div className="text-xs text-gray-600">{viewMode === 'gamified' ? 'XP' : 'Points'}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{Math.round(getCompletionPercentage())}%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{getTodayStreak()}</div>
                  <div className="text-xs text-gray-600">Streak</div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-indigo-100">
            <div className="px-4 py-3 space-y-2">
              {/* Mobile Stats */}
              <div className="flex justify-around text-center py-2 border-b border-gray-100">
                <div>
                  <div className="text-lg font-bold text-indigo-600">{getPointsEarned()}</div>
                  <div className="text-xs text-gray-600">Points</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{Math.round(getCompletionPercentage())}%</div>
                  <div className="text-xs text-gray-600">Complete</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{getTodayStreak()}</div>
                  <div className="text-xs text-gray-600">Streak</div>
                </div>
              </div>
              
              {/* View Mode Toggle - Mobile */}
              <div className="mb-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('classic')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'classic'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📋 Classic
                  </button>
                  <button
                    onClick={() => setViewMode('gamified')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'gamified'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🎮 Gamified
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {[
                  { id: 'timeline', label: 'Timeline', icon: Clock },
                  { id: 'lightwalker', label: 'Lightwalker', icon: User },
                  { id: 'stats', label: 'Stats', icon: BarChart3 }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id as DailyUseUIState['activeTab'])}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      uiState.activeTab === id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Desktop Navigation */}
          <div className="hidden md:block lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-4">
              <nav className="space-y-2">
                {[
                  { id: 'timeline', label: 'Timeline', icon: Clock },
                  { id: 'lightwalker', label: 'Lightwalker', icon: User },
                  { id: 'stats', label: 'Stats', icon: BarChart3 }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id as DailyUseUIState['activeTab'])}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      uiState.activeTab === id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-7">
            {uiState.activeTab === 'timeline' && (
              <>
                {viewMode === 'classic' ? (
                  <ActivityTimeline
                    schedule={schedule}
                    onActivitySelect={handleActivitySelect}
                    onActivityComplete={completeActivity}
                    onActivityReschedule={rescheduleActivity}
                    onMarkInProgress={markActivityInProgress}
                    currentTime={new Date()}
                  />
                ) : (
                  <GameifiedTimeline
                    activities={schedule.activities}
                    onActivityAdd={(activity, timeSlot) => {
                      // Convert partial activity to full activity and add to schedule
                      const newActivity: Activity = {
                        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        title: activity.title || 'New Activity',
                        description: activity.description || 'Custom activity',
                        roleModel: activity.roleModel || 'Custom',
                        roleModelId: activity.roleModelId || 'custom',
                        attribute: activity.attribute || 'Personal Growth',
                        duration: activity.duration || '15 minutes',
                        difficulty: activity.difficulty || 3,
                        timeOfDay: activity.timeOfDay || 'anytime',
                        category: activity.category || 'creative',
                        scheduledTime: timeSlot,
                        isCompleted: false,
                        points: activity.points || 20,
                        method: activity.method || 'Practice with intention',
                        benefit: activity.benefit || 'Builds character',
                        successCriteria: activity.successCriteria || 'Complete with focus',
                        roleModelColor: activity.roleModelColor || '#6B73FF',
                        roleModelArchetype: activity.roleModelArchetype || 'guide',
                        ...activity
                      };
                      
                      // Add to schedule - in real app this would update the backend
                      console.log('Adding activity:', newActivity);
                    }}
                    onActivityComplete={completeActivity}
                    onActivitySelect={handleActivitySelect}
                  />
                )}
              </>
            )}

            {uiState.activeTab === 'lightwalker' && (
              <div className="space-y-6">
                <LightwalkerAvatar
                  lightwalkerState={lightwalkerState}
                  currentActivity={getCurrentActivity()}
                  onActivityFocus={handleActivitySelect}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AttributeContainer
                    activeAttributes={lightwalkerState.activeAttributes}
                    attributeGlow={lightwalkerState.attributeGlow}
                    currentActivity={getCurrentActivity()}
                  />
                  
                  <RoleModelInfluences
                    dominantRoleModels={lightwalkerState.dominantRoleModels}
                    currentActivity={getCurrentActivity()}
                  />
                </div>
              </div>
            )}

            {uiState.activeTab === 'stats' && stats && (
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Progress</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{stats.todayPoints}</div>
                    <div className="text-sm text-gray-600">Today's Points</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.currentLevel}</div>
                    <div className="text-sm text-gray-600">Current Level</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.perfectDays}</div>
                    <div className="text-sm text-gray-600">Perfect Days</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(stats.consistencyScore)}</div>
                    <div className="text-sm text-gray-600">Consistency</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level Progress</span>
                      <span>{stats.pointsToNextLevel} points to next level</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (stats.todayPoints / (stats.todayPoints + stats.pointsToNextLevel)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-600">
                    <p>Favorite time: <span className="font-semibold">{stats.favoriteTimeOfDay}</span></p>
                    <p>Most active category: <span className="font-semibold">{stats.mostActiveCategory}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="lg:col-span-3">
            <QuickActions
              onAction={handleQuickAction}
              activePanel={uiState.quickActionPanel}
              currentActivity={getCurrentActivity()}
              nextActivities={getNextActivities(3)}
              achievements={achievements}
            />
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {/* Temporarily commented out for build
      {uiState.showActivityModal && uiState.selectedActivity && (
        <ActivityModal
          activity={uiState.selectedActivity}
          isOpen={uiState.showActivityModal}
          onClose={handleCloseModal}
          onComplete={handleActivityComplete}
          onReschedule={rescheduleActivity}
        />
      )}
      */}

      {/* Quick Action Panels */}
      {uiState.quickActionPanel !== 'hidden' && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => handleQuickAction('hidden')}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold capitalize">{uiState.quickActionPanel}</h3>
              <button
                onClick={() => handleQuickAction('hidden')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-gray-600">
              {uiState.quickActionPanel === 'journal' && (
                <p>Journal functionality coming soon...</p>
              )}
              {uiState.quickActionPanel === 'schedule' && (
                <p>Schedule management coming soon...</p>
              )}
              {uiState.quickActionPanel === 'todo' && (
                <p>Todo list integration coming soon...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}