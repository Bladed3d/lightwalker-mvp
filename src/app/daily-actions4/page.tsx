'use client'

import React, { useState, useEffect } from 'react';
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
import { DragDropContext } from 'react-beautiful-dnd';

// Components
import ActivityTimeline from '@/components/daily-actions4/ActivityTimeline';
import GameifiedTimeline from '@/components/daily-actions4/GameifiedTimeline';
import LightwalkerAvatar from '@/components/daily-actions4/LightwalkerAvatar';
import AttributeContainer from '@/components/daily-actions4/AttributeContainer';
import RoleModelInfluences from '@/components/daily-actions4/RoleModelInfluences';
import QuickActions from '@/components/daily-actions4/QuickActions';
import GamelikeTimeline from '@/components/daily-actions4/GamelikeTimeline';
import TarkovInventoryGrid from '@/components/daily-actions4/TarkovInventoryGrid';
import CurrentActivityPanel from '@/components/daily-actions4/CurrentActivityPanel';
import UpNextPanel from '@/components/daily-actions4/UpNextPanel';
import ActivityEditZone from '@/components/daily-actions4/ActivityEditZone';
import DurationScreen from '@/components/daily-actions4/DurationScreen';
// import ActivityModal from '@/components/daily-actions4/ActivityModal';

// Hooks and utilities
import { useDailyActivities } from '@/hooks/useDailyActivities';
import { Activity, DailyUseUIState, ActivityPreference } from '@/types/daily-use';
import { getTheme } from '@/lib/theme-config';
import { 
  saveActivityPreference, 
  loadActivityPreferences, 
  applyPreferencesToActivities 
} from '@/lib/activity-preferences';

export default function DailyActions2Page() {
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
  
  // Activity Preferences State
  const [activityPreferences, setActivityPreferences] = useState<ActivityPreference[]>([]);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  
  // Fix React Strict Mode interference with drag and drop
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load activity preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        setPreferencesLoading(true);
        const preferences = await loadActivityPreferences();
        setActivityPreferences(preferences);
        console.log(`📊 Loaded ${preferences.length} activity preferences`);
      } catch (error) {
        console.error('❌ Error loading activity preferences:', error);
      } finally {
        setPreferencesLoading(false);
      }
    }

    if (mounted) {
      loadPreferences();
    }
  }, [mounted]);

  // Apply preferences to activities when they change
  const activitiesWithPreferences = React.useMemo(() => {
    if (!schedule?.activities || preferencesLoading) {
      return schedule?.activities || [];
    }
    
    const activitiesWithPrefs = applyPreferencesToActivities(schedule.activities, activityPreferences);
    console.log(`🎨 Applied preferences to ${activitiesWithPrefs.length} activities`);
    return activitiesWithPrefs;
  }, [schedule?.activities, activityPreferences, preferencesLoading]);

  // Local state for dropped activities (grid and timeline)
  const [droppedActivities, setDroppedActivities] = useState<Activity[]>([]);
  const [timelineActivities, setTimelineActivities] = useState<Activity[]>([]);
  const [allTimelineActivities, setAllTimelineActivities] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [editingActivities, setEditingActivities] = useState<any[]>([]);
  
  // Update live time for server status
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle timeline time changes
  const handleTimeChange = (newCurrentTime: Date, newSelectedTime: Date | null) => {
    setCurrentTime(newCurrentTime);
    setSelectedTime(newSelectedTime);
  };

  // Handle receiving all timeline activities (sample + user-dropped)
  const handleActivitiesChange = (activities: any[]) => {
    setAllTimelineActivities(activities);
  };
  
  // Debug timeline activities changes
  useEffect(() => {
    console.log('📊 Timeline activities state changed:', timelineActivities.length, timelineActivities.map(a => a.title));
  }, [timelineActivities]);

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

  // Handle drag and drop from activity library to timeline
  const handleDragEnd = (result: any) => {
    console.log('🎯 React Beautiful DND - Drag end result:', {
      draggableId: result.draggableId,
      source: result.source,
      destination: result.destination,
      type: result.type
    });
    
    if (!result.destination) {
      console.log('❌ No destination - drag cancelled or dropped outside valid drop zone');
      return;
    }
    
    console.log('✅ Valid drop detected:', {
      from: result.source.droppableId,
      to: result.destination.droppableId,
      activityId: result.draggableId
    });
    
    // Check if dropped on timeline, grid, duration screen, or edit zone
    if (result.destination && (result.destination.droppableId === 'timeline-drop-zone' || result.destination.droppableId.startsWith('slot-') || result.destination.droppableId === 'activity-grid' || result.destination.droppableId === 'duration-screen-drop' || result.destination.droppableId === 'activity-edit-zone')) {
      const activityId = result.draggableId;
      
      // CRITICAL FIX: Use the same preference application logic as TarkovInventoryGrid
      console.log('🔍 Looking for preference-applied activity:', activityId);
      
      // Get base template activity
      const ACTIVITY_TEMPLATES = [
        { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '/activity-icons/meditation.jpg', category: 'mindfulness', points: 15, rarity: 'common', duration: '5 min', difficulty: 1 },
        { id: 'quick-walk', title: 'Quick Walk', icon: '/activity-icons/running.jpg', category: 'physical', points: 20, rarity: 'common', duration: '10 min', difficulty: 1 },
        { id: 'hydrate', title: 'Hydrate', icon: '/activity-icons/hydrate.jpg', category: 'physical', points: 15, rarity: 'common', duration: '1 min', difficulty: 1 },
        { id: 'posture-check', title: 'Posture Check', icon: '/activity-icons/posture-check.jpg', category: 'physical', points: 15, rarity: 'common', duration: '2 min', difficulty: 1 },
        { id: 'strategic-planning', title: 'Strategic Planning', icon: '/activity-icons/strategic-planning.jpg', category: 'decision-making', points: 30, rarity: 'uncommon', duration: '15 min', difficulty: 2 },
        { id: 'creative-thinking', title: 'Creative Thinking', icon: '/activity-icons/creative-thinking.jpg', category: 'creative', points: 25, rarity: 'uncommon', duration: '10 min', difficulty: 2 },
        { id: 'gratitude-practice', title: 'Gratitude Practice', icon: '/activity-icons/gratitude.jpg', category: 'mindfulness', points: 30, rarity: 'uncommon', duration: '5 min', difficulty: 2 },
        { id: 'skill-practice', title: 'Skill Practice', icon: '/activity-icons/skill-practice.jpg', category: 'creative', points: 35, rarity: 'uncommon', duration: '20 min', difficulty: 2 },
        { id: 'empathy-practice', title: 'Empathy Practice', icon: '/activity-icons/empathy.jpg', category: 'communication', points: 45, rarity: 'rare', duration: '15 min', difficulty: 3 },
        { id: 'deep-reflection', title: 'Deep Reflection', icon: '/activity-icons/deep-reflection.jpg', category: 'reflection', points: 50, rarity: 'rare', duration: '30 min', difficulty: 3 },
        { id: 'problem-solving', title: 'Problem Solving', icon: '/activity-icons/problem-solving.jpg', category: 'decision-making', points: 40, rarity: 'rare', duration: '25 min', difficulty: 3 },
        { id: 'mentoring', title: 'Mentoring Others', icon: '/activity-icons/mentoring.jpg', category: 'communication', points: 55, rarity: 'rare', duration: '30 min', difficulty: 3 },
        { id: 'leadership-moment', title: 'Leadership Moment', icon: '/activity-icons/leadership-moment.jpg', category: 'communication', points: 70, rarity: 'epic', duration: '45 min', difficulty: 4 },
        { id: 'innovation-session', title: 'Innovation Session', icon: '/activity-icons/innovation-session.jpg', category: 'creative', points: 65, rarity: 'epic', duration: '60 min', difficulty: 4 },
        { id: 'conflict-resolution', title: 'Conflict Resolution', icon: '/activity-icons/conflict-resolution.jpg', category: 'communication', points: 75, rarity: 'epic', duration: '30 min', difficulty: 4 },
        { id: 'life-changing-decision', title: 'Life-Changing Decision', icon: '/activity-icons/life-changing-decision.jpg', category: 'decision-making', points: 100, rarity: 'legendary', duration: '90 min', difficulty: 5 },
        { id: 'inspire-others', title: 'Inspire Others', icon: '/activity-icons/inspire-others.jpg', category: 'communication', points: 90, rarity: 'legendary', duration: '60 min', difficulty: 5 },
        { id: 'master-skill', title: 'Master New Skill', icon: '/activity-icons/learn.jpg', category: 'creative', points: 85, rarity: 'legendary', duration: '120 min', difficulty: 5 }
      ];
      
      const baseTemplate = ACTIVITY_TEMPLATES.find(t => t.id === activityId);
      if (!baseTemplate) {
        console.log('❌ Base template not found:', activityId);
        return;
      }
      
      // Apply preferences using the same logic as TarkovInventoryGrid
      let activity = { ...baseTemplate };
      
      // Check for saved preferences and apply them
      const preference = activityPreferences.find(p => p.activityId === activityId);
      if (preference) {
        console.log('✅ Found preference for activity:', activityId, preference);
        activity = {
          ...activity,
          duration: preference.customDuration ?? activity.duration,
          points: preference.customPoints ?? activity.points,
          difficulty: preference.customDifficulty ?? activity.difficulty,
          title: preference.customIcon ?? activity.title, // Note: customIcon is stored as title
        };
        console.log('🎨 Applied preferences to drag activity:', {
          before: { duration: baseTemplate.duration, points: baseTemplate.points },
          after: { duration: activity.duration, points: activity.points }
        });
      } else {
        console.log('ℹ️ No preferences found for activity:', activityId, 'using template defaults');
      }
      
      console.log('✅ Final activity for drag operation:', {
        id: activity.id,
        title: activity.title,
        duration: activity.duration,
        points: activity.points,
        difficulty: activity.difficulty
      });
      if (activity) {
        if (result.destination.droppableId === 'activity-grid') {
          // Dropped on the general grid (not a specific slot)
          console.log('📊 Activity dropped on grid container:', activity.title);
          console.log('💡 TIP: Try dropping directly on a time slot (e.g., 8:00a) for precise scheduling');
          
          // For now, find the first empty slot or use current time
          const currentHour = new Date().getHours();
          const timeSlot = currentHour === 0 ? '12:00a' : 
                          currentHour <= 11 ? `${currentHour}:00a` : 
                          currentHour === 12 ? '12:00p' : 
                          `${currentHour-12}:00p`;
          
          console.log('⏰ Auto-scheduling to:', timeSlot);
          
          // Create activity for auto-scheduled time
          const newActivity: Activity = {
            id: `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: activity.title,
            description: `${activity.title} - Added via drag and drop`,
            roleModel: 'Custom Activity',
            roleModelId: 'custom',
            attribute: 'Personal Growth',
            duration: activity.duration,
            difficulty: activity.difficulty,
            timeOfDay: 'anytime',
            category: activity.category as Activity['category'],
            scheduledTime: timeSlot,
            isCompleted: false,
            points: activity.points,
            method: 'Complete with focus and intention',
            benefit: 'Builds character and discipline',
            successCriteria: 'Finish the activity with full attention',
            roleModelColor: '#6B73FF',
            roleModelArchetype: 'guide',
            // Additional fields for display
            icon: activity.icon,
            name: activity.title,
            time: timeSlot,
            rarity: activity.rarity
          };
          
          setDroppedActivities(prev => [...prev, newActivity]);
          
        } else if (result.destination.droppableId.startsWith('slot-')) {
          // Dropped on a specific grid slot
          const timeSlot = result.destination.droppableId.replace('slot-', '');
          console.log('📊 Adding activity to grid slot:', { activity: activity.title, timeSlot });
          
          // Create the full activity object for the grid
          const newActivity: Activity = {
            id: `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: activity.title,
            description: `${activity.title} - Added via drag and drop`,
            roleModel: 'Custom Activity',
            roleModelId: 'custom',
            attribute: 'Personal Growth',
            duration: activity.duration,
            difficulty: activity.difficulty,
            timeOfDay: 'anytime',
            category: activity.category as Activity['category'],
            scheduledTime: timeSlot,
            isCompleted: false,
            points: activity.points,
            method: 'Complete with focus and intention',
            benefit: 'Builds character and discipline',
            successCriteria: 'Finish the activity with full attention',
            roleModelColor: '#6B73FF',
            roleModelArchetype: 'guide',
            // Additional fields for display
            icon: activity.icon,
            name: activity.title,
            time: timeSlot,
            rarity: activity.rarity
          };
          
          console.log('✅ Grid activity created:', newActivity);
          
          // Add to local state
          setDroppedActivities(prev => [...prev, newActivity]);
          
          console.log('📝 Activity added to state for slot:', timeSlot);
          
        } else if (result.destination.droppableId === 'timeline-drop-zone') {
          // Timeline component handles this via onActivityAdd - main handler ignores timeline drops
          console.log('✅ Timeline drop detected - letting timeline component handle it');
          return; // Timeline component will handle this drop
        } else if (result.destination.droppableId === 'duration-screen-drop') {
          // Handle dropping activity to duration screen
          console.log('🔧 Activity dropped in duration screen:', result.draggableId);
          
          const activityId = result.draggableId;
          const activity = ACTIVITY_TEMPLATES.find(a => a.id === activityId);
          
          if (activity) {
            console.log('✅ Found library activity for duration screen:', activity);
            
            // Pass the activity to the DurationScreen component
            // This will be handled by updating the DurationScreen to accept dropped activities
            // For now, we'll use a ref or callback to communicate with the DurationScreen
            window.dispatchEvent(new CustomEvent('activityDropped', {
              detail: {
                id: `edit-${Date.now()}-${activity.id}`,
                title: activity.title,
                duration: activity.duration,
                points: activity.points,
                icon: activity.icon,
                category: activity.category,
                difficulty: activity.difficulty, // Fix: Include difficulty field
                originalDuration: activity.duration
              }
            }));
          } else {
            console.log('❌ Library activity not found:', activityId);
          }
          
        } else if (result.destination.droppableId === 'activity-edit-zone') {
          // Handle dropping activity to the orange triangle edit zone
          console.log('🔧 Activity dropped in edit zone:', result.draggableId);
          
          // Use the preference-applied activity (already found above)
          console.log('✅ Using preference-applied activity for edit zone:', {
            title: activity.title,
            duration: activity.duration,
            points: activity.points,
            difficulty: activity.difficulty
          });
          
          // Open the Duration Screen and pass the preference-applied activity data
          setUIState(prev => ({ ...prev, quickActionPanel: 'edit' }));
          
          // Pass the preference-applied activity to the DurationScreen component
          window.dispatchEvent(new CustomEvent('activityDropped', {
            detail: {
              id: `edit-${Date.now()}-${activity.id}`,
              title: activity.title,
              duration: activity.duration,
              points: activity.points,
              icon: activity.icon,
              category: activity.category,
              difficulty: activity.difficulty,
              originalDuration: baseTemplate.duration // CRITICAL: Use original template duration for comparison
            }
          }));
          
        } else {
          console.log('📅 Unknown drop destination:', result.destination.droppableId);
        }
      }
    }
  };

  // Fix React Strict Mode - prevent rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing drag and drop...</h2>
          <p className="text-gray-600">Setting up React Beautiful DND</p>
        </div>
      </div>
    );
  }

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading your Daily Actions 2 experience...</h2>
          <p className="text-gray-600">Preparing your experimental interface</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load Daily Actions 2</h2>
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

  const theme = getTheme(viewMode);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={`min-h-screen ${theme.pageBackground} ${viewMode === 'gamified' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <header className={`${theme.headerBackground} border-b ${theme.headerBorder} sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${theme.headerText}`}>Daily Actions 2</h1>
                <p className={`text-xs ${theme.headerSubtext}`}>Experimental Playground 🧪</p>
              </div>
            </div>

            {/* View Mode Toggle & Stats */}
            <div className="hidden md:flex items-center space-x-6">
              {/* View Mode Toggle */}
              <div className={`flex ${viewMode === 'classic' ? 'bg-gray-100' : 'bg-slate-700'} rounded-lg p-1`}>
                <button
                  onClick={() => setViewMode('classic')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'classic'
                      ? viewMode === 'classic' ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white shadow-sm'
                      : viewMode === 'classic' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  📋 Classic
                </button>
                <button
                  onClick={() => setViewMode('gamified')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'gamified'
                      ? viewMode === 'classic' ? 'bg-white text-gray-900 shadow-sm' : 'bg-slate-600 text-white shadow-sm'
                      : viewMode === 'classic' ? 'text-gray-600 hover:text-gray-900' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🎮 Gamified
                </button>
              </div>

              {/* Stats Summary */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{getPointsEarned()}</div>
                  <div className="text-xs text-slate-400">{viewMode === 'gamified' ? 'XP' : 'Points'}</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{Math.round(getCompletionPercentage())}%</div>
                  <div className="text-xs text-slate-400">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-400">{getTodayStreak()}</div>
                  <div className="text-xs text-slate-400">Streak</div>
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Top Section - Current Activity, Timeline and Activity Grid */}
        <div className="flex gap-4 mb-6">
          {/* Left side - Current Activity Panel, Up Next, and Quick Actions */}
          <div className="w-48 flex-shrink-0">
            <CurrentActivityPanel 
              theme={theme}
              currentActivity={getCurrentActivity()}
              displayTime={selectedTime || currentTime}
              liveTime={liveTime}
              timelineActivities={allTimelineActivities}
            />
            <UpNextPanel 
              theme={theme}
              currentTime={liveTime}
              timelineActivities={allTimelineActivities}
            />
            <QuickActions
              onAction={handleQuickAction}
              activePanel={uiState.quickActionPanel}
              currentActivity={getCurrentActivity()}
              nextActivities={getNextActivities(3)}
              achievements={achievements}
              theme={theme}
            />
          </div>
          
          {/* Middle - Timeline Container */}
          <div className="flex-1">
            <GamelikeTimeline 
            key="main-timeline"
            theme={theme}
            timelineActivities={timelineActivities}
            onDragEnd={handleDragEnd}
            onTimeChange={handleTimeChange}
            onActivitiesChange={handleActivitiesChange}
            onActivityAdd={(activity, preciseTimeSlot) => {
              try {
                console.log('🎯 onActivityAdd called with PRECISE time:', { activityId: activity.id, preciseTimeSlot });
                
                // Use the precise time slot from timeline
                const timeSlot = preciseTimeSlot;
                
                // Simple activity object
                const newActivity = {
                  id: `timeline-${Date.now()}`,
                  title: activity.title,
                  scheduledTime: timeSlot,
                  icon: activity.icon,
                  points: activity.points,
                  category: activity.category,
                  duration: activity.duration,
                  difficulty: activity.difficulty,
                  isCompleted: false,
                  // Required fields for Activity type
                  description: `${activity.title} scheduled via timeline`,
                  roleModel: 'Custom',
                  roleModelId: 'custom',
                  attribute: 'Personal Growth',
                  timeOfDay: 'anytime',
                  method: 'Practice with intention',
                  benefit: 'Builds character',
                  successCriteria: 'Complete with focus',
                  roleModelColor: '#6B73FF',
                  roleModelArchetype: 'guide' as const
                };
                
                console.log('✅ Created timeline activity');
                setTimelineActivities(prev => {
                  const updated = [...prev, newActivity];
                  console.log('📊 State update:', prev.length, '→', updated.length);
                  return updated;
                });
                console.log('✅ State update completed');
              } catch (error) {
                console.error('❌ Error in onActivityAdd:', error);
              }
            }}
                hideCurrentActivity={true}
              />
            
            {/* Activity Grid below timeline zoom controls */}
            <div className="mt-4">
              <TarkovInventoryGrid 
                theme={theme}
                onDragEnd={handleDragEnd}
                activityPreferences={activityPreferences}
              />
              
              {/* Duration Screen - shows when Edit Activities panel is active */}
              <DurationScreen
                theme={theme}
                isVisible={uiState.quickActionPanel === 'edit'}
                onActivitySave={async (activity) => {
                  console.log('💾 Activity settings saved:', activity);
                  
                  try {
                    // Extract the base activity ID from the edit ID (e.g., "edit-123456-conflict-resolution" -> "conflict-resolution")
                    let baseActivityId = activity.id;
                    console.log('🏷️ Original activity ID:', activity.id);
                    
                    if (activity.id.startsWith('edit-') && activity.id.includes('-')) {
                      const parts = activity.id.split('-');
                      console.log('🔧 ID parts:', parts);
                      if (parts.length >= 3) {
                        baseActivityId = parts.slice(2).join('-'); // Get everything after "edit-timestamp-"
                        console.log('✂️ Extracted base ID from parts:', baseActivityId);
                      }
                    }
                    
                    console.log('🔍 Final base activity ID:', baseActivityId);
                    
                    // Find the original template activity from TarkovInventoryGrid
                    const ACTIVITY_TEMPLATES = [
                      { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '/activity-icons/meditation.jpg', category: 'mindfulness', points: 15, rarity: 'common', duration: '5 min', difficulty: 1 },
                      { id: 'quick-walk', title: 'Quick Walk', icon: '/activity-icons/running.jpg', category: 'physical', points: 20, rarity: 'common', duration: '10 min', difficulty: 1 },
                      { id: 'hydrate', title: 'Hydrate', icon: '/activity-icons/hydrate.jpg', category: 'physical', points: 15, rarity: 'common', duration: '1 min', difficulty: 1 },
                      { id: 'posture-check', title: 'Posture Check', icon: '/activity-icons/posture-check.jpg', category: 'physical', points: 15, rarity: 'common', duration: '2 min', difficulty: 1 },
                      { id: 'strategic-planning', title: 'Strategic Planning', icon: '/activity-icons/strategic-planning.jpg', category: 'decision-making', points: 30, rarity: 'uncommon', duration: '15 min', difficulty: 2 },
                      { id: 'creative-thinking', title: 'Creative Thinking', icon: '/activity-icons/creative-thinking.jpg', category: 'creative', points: 25, rarity: 'uncommon', duration: '10 min', difficulty: 2 },
                      { id: 'gratitude-practice', title: 'Gratitude Practice', icon: '/activity-icons/gratitude.jpg', category: 'mindfulness', points: 30, rarity: 'uncommon', duration: '5 min', difficulty: 2 },
                      { id: 'skill-practice', title: 'Skill Practice', icon: '/activity-icons/skill-practice.jpg', category: 'creative', points: 35, rarity: 'uncommon', duration: '20 min', difficulty: 2 },
                      { id: 'empathy-practice', title: 'Empathy Practice', icon: '/activity-icons/empathy.jpg', category: 'communication', points: 45, rarity: 'rare', duration: '15 min', difficulty: 3 },
                      { id: 'deep-reflection', title: 'Deep Reflection', icon: '/activity-icons/deep-reflection.jpg', category: 'reflection', points: 50, rarity: 'rare', duration: '30 min', difficulty: 3 },
                      { id: 'problem-solving', title: 'Problem Solving', icon: '/activity-icons/problem-solving.jpg', category: 'decision-making', points: 40, rarity: 'rare', duration: '25 min', difficulty: 3 },
                      { id: 'mentoring', title: 'Mentoring Others', icon: '/activity-icons/mentoring.jpg', category: 'communication', points: 55, rarity: 'rare', duration: '30 min', difficulty: 3 },
                      { id: 'leadership-moment', title: 'Leadership Moment', icon: '/activity-icons/leadership-moment.jpg', category: 'communication', points: 70, rarity: 'epic', duration: '45 min', difficulty: 4 },
                      { id: 'innovation-session', title: 'Innovation Session', icon: '/activity-icons/innovation-session.jpg', category: 'creative', points: 65, rarity: 'epic', duration: '60 min', difficulty: 4 },
                      { id: 'conflict-resolution', title: 'Conflict Resolution', icon: '/activity-icons/conflict-resolution.jpg', category: 'communication', points: 75, rarity: 'epic', duration: '30 min', difficulty: 4 },
                      { id: 'life-changing-decision', title: 'Life-Changing Decision', icon: '/activity-icons/life-changing-decision.jpg', category: 'decision-making', points: 100, rarity: 'legendary', duration: '90 min', difficulty: 5 },
                      { id: 'inspire-others', title: 'Inspire Others', icon: '/activity-icons/inspire-others.jpg', category: 'communication', points: 90, rarity: 'legendary', duration: '60 min', difficulty: 5 },
                      { id: 'master-skill', title: 'Master New Skill', icon: '/activity-icons/learn.jpg', category: 'creative', points: 85, rarity: 'legendary', duration: '120 min', difficulty: 5 }
                    ];
                    
                    // Find original template or use schedule activity
                    const templateActivity = ACTIVITY_TEMPLATES.find(t => t.id === baseActivityId);
                    const scheduleActivity = schedule?.activities.find(a => a.id === baseActivityId);
                    const originalActivity = templateActivity || scheduleActivity;
                    
                    if (!originalActivity) {
                      console.error('❌ Could not find original activity for ID:', baseActivityId);
                      return;
                    }
                    
                    console.log('📋 Original activity found:', originalActivity.title, 'Duration:', originalActivity.duration, 'Points:', originalActivity.points);
                    
                    // Create a proper Activity object for comparison
                    const baseActivity: Activity = {
                      id: baseActivityId,
                      title: originalActivity.title,
                      description: templateActivity?.description || `${originalActivity.title} activity`,
                      roleModel: 'Template Activity',
                      roleModelId: 'template',
                      attribute: 'Personal Growth',
                      duration: originalActivity.duration,
                      difficulty: originalActivity.difficulty || 3,
                      timeOfDay: 'anytime',
                      category: originalActivity.category as Activity['category'],
                      scheduledTime: '12:00p',
                      isCompleted: false,
                      points: originalActivity.points,
                      icon: originalActivity.icon,
                      method: 'Practice with intention',
                      benefit: 'Builds character',
                      successCriteria: 'Complete with focus',
                      roleModelColor: '#6B73FF',
                      roleModelArchetype: 'guide',
                    };
                    
                    // Determine what changed
                    const customizations: Partial<Activity> = {};
                    console.log('🔍 Comparing activity duration:', activity.duration, 'vs base:', baseActivity.duration);
                    console.log('🔍 Comparing activity points:', activity.points, 'vs base:', baseActivity.points);
                    
                    if (activity.duration !== baseActivity.duration) {
                      customizations.duration = activity.duration;
                      console.log('🔄 Duration changed:', baseActivity.duration, '->', activity.duration);
                    }
                    if (activity.points !== baseActivity.points) {
                      customizations.points = activity.points;
                      console.log('🔄 Points changed:', baseActivity.points, '->', activity.points);
                    }
                    if (activity.difficulty !== baseActivity.difficulty && activity.difficulty !== undefined && activity.difficulty !== null) {
                      customizations.difficulty = activity.difficulty;
                      console.log('🔄 Difficulty changed:', baseActivity.difficulty, '->', activity.difficulty);
                    } else if (activity.difficulty === undefined || activity.difficulty === null) {
                      console.log('⚠️ Skipping undefined/null difficulty:', activity.difficulty);
                    }
                    if (activity.category !== baseActivity.category) {
                      customizations.category = activity.category;
                      console.log('🔄 Category changed:', baseActivity.category, '->', activity.category);
                    }
                    if (activity.title !== baseActivity.title) {
                      customizations.title = activity.title;
                      console.log('🔄 Title changed:', baseActivity.title, '->', activity.title);
                    }
                    // Check for icon changes (custom images from Art Studio)
                    if (activity.icon && activity.icon !== originalActivity.icon) {
                      customizations.icon = activity.icon;
                      const iconPreview = activity.icon.startsWith('data:') 
                        ? `${activity.icon.substring(0, 50)}...` 
                        : activity.icon;
                      console.log('🎨 Icon changed:', originalActivity.icon, '->', iconPreview);
                    }
                    
                    console.log('📝 Customizations to save:', customizations);
                    
                    // Only save if there are actual customizations
                    if (Object.keys(customizations).length > 0) {
                      console.log('💾 Calling saveActivityPreference with:', { baseActivity: baseActivity.id, customizations });
                      const result = await saveActivityPreference(baseActivity, customizations);
                      console.log('📡 Save result:', result);
                      
                      if (result.success) {
                        console.log('✅ Activity preference saved successfully to database');
                        
                        // Refresh preferences list
                        console.log('🔄 Refreshing preferences from database...');
                        const updatedPreferences = await loadActivityPreferences();
                        console.log('📥 Loaded preferences:', updatedPreferences);
                        setActivityPreferences(updatedPreferences);
                        
                        // Show success message
                        console.log('🎉 Custom settings saved! They will be remembered for future use.');
                      } else {
                        console.error('❌ Failed to save activity preference:', result.error);
                      }
                    } else {
                      console.log('ℹ️ No changes detected, skipping save');
                    }
                  } catch (error) {
                    console.error('❌ Error saving activity preference:', error);
                  }
                }}
                onActivityPlace={(activity, timePosition) => {
                  console.log('📅 Placing activity on timeline:', { activity, timePosition });
                  
                  // Convert edited activity to timeline format
                  const timelineActivity = {
                    id: `timeline-${Date.now()}`,
                    title: activity.title,
                    scheduledTime: timePosition,
                    icon: activity.icon,
                    points: activity.points,
                    category: activity.category,
                    duration: activity.duration,
                    difficulty: 2,
                    isCompleted: false,
                    // Required fields for Activity type
                    description: `${activity.title} - Customized settings`,
                    roleModel: 'Custom',
                    roleModelId: 'custom',
                    attribute: 'Personal Growth',
                    timeOfDay: 'anytime',
                    method: 'Practice with intention',
                    benefit: 'Builds character',
                    successCriteria: 'Complete with focus',
                    roleModelColor: '#6B73FF',
                    roleModelArchetype: 'guide' as const
                  };
                  
                  // Add to timeline
                  setTimelineActivities(prev => [...prev, timelineActivity]);
                  
                  // Close edit panel
                  setUIState(prev => ({ ...prev, quickActionPanel: 'hidden' }));
                }}
                onBack={() => {
                  // Close edit panel
                  setUIState(prev => ({ ...prev, quickActionPanel: 'hidden' }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Desktop Navigation (moved down) */}
          <div className="hidden md:block lg:col-span-2">
            <div className={`${theme.menuBackground} rounded-lg p-4 border ${theme.menuBorder}`}>
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
                        ? `${theme.menuActiveBackground} ${theme.menuActiveText}`
                        : `${theme.menuText} ${theme.menuTextHover}`
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
                    schedule={{
                      ...schedule,
                      activities: activitiesWithPreferences
                    }}
                    onActivitySelect={handleActivitySelect}
                    onActivityComplete={completeActivity}
                    onActivityReschedule={rescheduleActivity}
                    onMarkInProgress={markActivityInProgress}
                    currentTime={new Date()}
                  />
                ) : (
                  <GameifiedTimeline
                    activities={[...activitiesWithPreferences, ...droppedActivities]}
                    theme={theme}
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
                    onDragEnd={handleDragEnd}
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

          {/* Right Sidebar - Available for future content */}
          <div className="lg:col-span-3">
            {/* Quick Actions moved to left side under Up Next panel */}
          </div>
        </div>
      </div>

      {/* Activity Modal - Temporarily commented out for build */}
      {/* 
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
              {uiState.quickActionPanel === 'edit' && (
                <p>Activity editing interface coming soon...</p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </DragDropContext>
  );
}