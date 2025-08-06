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
  X,
  Image as ImageIcon
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
import TarkovInventoryGrid, { ActivityTemplate } from '@/components/daily-actions4/TarkovInventoryGrid';
import CurrentActivityPanel from '@/components/daily-actions4/CurrentActivityPanel';
import UpNextPanel from '@/components/daily-actions4/UpNextPanel';
import ActivityEditZone from '@/components/daily-actions4/ActivityEditZone';
import DurationScreen from '@/components/daily-actions4/DurationScreen';
import QuickActionsPanel from '@/components/daily-actions4/QuickActionsPanel';
import InstructionsWindow from '@/components/daily-actions4/InstructionsWindow';
import RepeatActivityModal from '@/components/daily-actions4/RepeatActivityModal';

// Utilities
import { getSessionId, getUserId } from '@/lib/session-utils';
// import ActivityModal from '@/components/daily-actions4/ActivityModal';

// Hooks and utilities
import { useDailyActivities } from '@/hooks/useDailyActivities';

// Helper function to snap time to 5-minute intervals
function snapToFiveMinutes(timeString: string): string {
  // Parse time string (e.g., "8:23a" or "3:47p")
  const match = timeString.match(/^(\d+):(\d+)([ap])$/);
  if (!match) return timeString; // Return original if can't parse
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3];
  
  // Convert to 24-hour format for calculation
  if (period === 'p' && hours !== 12) hours += 12;
  if (period === 'a' && hours === 12) hours = 0;
  
  // Calculate total minutes and snap to 5-minute intervals
  const totalMinutes = hours * 60 + minutes;
  const snappedMinutes = Math.round(totalMinutes / 5) * 5;
  
  // Convert back to hours and minutes
  let snappedHours = Math.floor(snappedMinutes / 60) % 24;
  const snappedMins = snappedMinutes % 60;
  
  // Convert back to 12-hour format
  const newPeriod = snappedHours >= 12 ? 'p' : 'a';
  if (snappedHours === 0) snappedHours = 12;
  else if (snappedHours > 12) snappedHours -= 12;
  
  return `${snappedHours}:${snappedMins.toString().padStart(2, '0')}${newPeriod}`;
}
import { Activity, DailyUseUIState, ActivityPreference } from '@/types/daily-use';
import { getTheme } from '@/lib/theme-config';
import { 
  saveActivityPreference, 
  loadActivityPreferences, 
  applyPreferencesToActivities,
  saveActivityImageAndGridPreference
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

  const [viewMode, setViewMode] = useState<'classic' | 'gamified'>('gamified');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Activity Preferences State
  const [activityPreferences, setActivityPreferences] = useState<ActivityPreference[]>([]);
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  
  // Database Activities State - passed to timeline to avoid async calls in render
  const [processedActivities, setProcessedActivities] = useState<ActivityTemplate[]>([]);
  
  // Timeline Activities State - must be declared before useEffect that references it
  const [allTimelineActivities, setAllTimelineActivities] = useState<any[]>([]);
  
  // Repeat Activity Modal State
  const [repeatModal, setRepeatModal] = useState<{
    isVisible: boolean;
    activity: any;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    activity: null,
    position: { x: 0, y: 0 }
  });
  
  // Fix React Strict Mode interference with drag and drop
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    console.log('🔧 Setting mounted to true');
    setMounted(true);
  }, []);

  // Load timeline activities from database on mount
  useEffect(() => {
    async function loadTimelineActivities() {
      try {
        const sessionId = getSessionId();
        const userId = getUserId();
        
        console.log('📊 Loading timeline activities from database');
        
        const response = await fetch(`/api/timeline-activities?sessionId=${sessionId}${userId ? `&userId=${userId}` : ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to load timeline activities');
        }

        const result = await response.json();
        const activities = result.timelineActivities || [];
        
        console.log(`✅ Loaded ${activities.length} timeline activities from database`);
        
        // Apply activity preferences to timeline activities to get custom images
        let processedActivities = activities;
        if (activityPreferences.length > 0) {
          processedActivities = activities.map(timelineActivity => {
            // Find matching preference by activityId
            const preference = activityPreferences.find(pref => pref.activityId === timelineActivity.activityId);
            
            if (preference && preference.customImageUrl) {
              console.log('🎨 Applying custom image to timeline activity:', {
                activityTitle: timelineActivity.title,
                originalIcon: timelineActivity.icon,
                customImage: preference.customImageUrl
              });
              
              return {
                ...timelineActivity,
                icon: preference.customImageUrl // Use custom image instead of base icon
              };
            }
            
            return timelineActivity;
          });
          
          console.log(`🎨 Applied preferences to ${processedActivities.filter(a => activityPreferences.find(p => p.activityId === a.activityId && p.customImageUrl)).length} timeline activities`);
        }
        
        // Update both timeline state arrays
        setTimelineActivities(processedActivities);
        setAllTimelineActivities(processedActivities);
        
      } catch (error) {
        console.error('❌ Error loading timeline activities:', error);
        // Don't show alert on load failure, just continue with empty state
      }
    }

    if (mounted) {
      loadTimelineActivities();
    }
  }, [mounted]);

  // Reprocess timeline activities when preferences change to apply custom images
  useEffect(() => {
    if (allTimelineActivities.length > 0 && activityPreferences.length > 0) {
      console.log('🔄 Reprocessing timeline activities with updated preferences');
      
      let hasChanges = false;
      const processedActivities = allTimelineActivities.map(timelineActivity => {
        // Find matching preference by activityId
        const preference = activityPreferences.find(pref => pref.activityId === timelineActivity.activityId);
        
        if (preference && preference.customImageUrl && timelineActivity.icon !== preference.customImageUrl) {
          console.log('🎨 Applying custom image to timeline activity:', {
            activityTitle: timelineActivity.title,
            originalIcon: timelineActivity.icon,
            customImage: preference.customImageUrl
          });
          
          hasChanges = true;
          return {
            ...timelineActivity,
            icon: preference.customImageUrl // Use custom image instead of base icon
          };
        }
        
        return timelineActivity;
      });
      
      // Only update if there are actual changes to prevent infinite loops
      if (hasChanges) {
        const customizedCount = processedActivities.filter(a => 
          activityPreferences.find(p => p.activityId === a.activityId && p.customImageUrl)
        ).length;
        
        console.log(`🎨 Applied preferences to ${customizedCount} timeline activities`);
        setTimelineActivities(processedActivities);
      }
    }
  }, [activityPreferences, allTimelineActivities]);

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

  // Listen for preference updates and reload them
  useEffect(() => {
    const handlePreferenceUpdate = async (event: any) => {
      console.log('🔄 Preference update event received, reloading preferences...');
      try {
        const preferences = await loadActivityPreferences();
        setActivityPreferences(preferences);
        console.log(`📊 Reloaded ${preferences.length} activity preferences`);
      } catch (error) {
        console.error('❌ Error reloading activity preferences:', error);
      }
    };

    // Listen for both events
    window.addEventListener('activityImageUpdated', handlePreferenceUpdate);
    window.addEventListener('gridLayoutChanged', handlePreferenceUpdate);
    
    return () => {
      window.removeEventListener('activityImageUpdated', handlePreferenceUpdate);
      window.removeEventListener('gridLayoutChanged', handlePreferenceUpdate);
    };
  }, []);

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
  const [preferenceAppliedActivities, setPreferenceAppliedActivities] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [liveTime, setLiveTime] = useState(new Date());
  const [editingActivities, setEditingActivities] = useState<any[]>([]);
  
  // Quick Actions Panel State
  const [showQuickActionsPanel, setShowQuickActionsPanel] = useState(false);
  
  // Instructions Window State
  const [showInstructions, setShowInstructions] = useState(false);
  
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
    
    // Debug alerts removed - drag and drop is working correctly
    
    if (!result.destination) {
      console.log('❌ No destination - drag cancelled or dropped outside valid drop zone');
      // Debug removed - drag and drop fix complete
      return;
    }
    
    console.log('✅ Valid drop detected:', {
      from: result.source.droppableId,
      to: result.destination.droppableId,
      activityId: result.draggableId
    });
    
    // Check if dropped on timeline, grid, duration screen, or edit zone
    if (result.destination && (result.destination.droppableId === 'timeline-drop-zone' || result.destination.droppableId.startsWith('slot-') || result.destination.droppableId === 'activity-grid' || result.destination.droppableId === 'duration-screen-drop' || result.destination.droppableId === 'activity-edit-zone')) {
      let activityId = result.draggableId;
      
      // Handle timeline activity drags (strip timeline-activity- prefix)
      const isTimelineDrag = activityId.startsWith('timeline-activity-');
      if (isTimelineDrag) {
        activityId = activityId.replace('timeline-activity-', '');
        console.log('🔄 Timeline reschedule detected:', {
          originalId: result.draggableId,
          cleanedId: activityId,
          from: result.source?.droppableId,
          to: result.destination?.droppableId
        });
      }
      
      // CRITICAL FIX: Use the same preference application logic as TarkovInventoryGrid
      console.log('🔍 Looking for preference-applied activity:', activityId);
      
      // Database-first activity lookup - use processed activities from grid
      console.log('🗄️ Using database-processed activities:', processedActivities.length);
      
      // First try to find in processed activities (includes custom images and preferences)
      let baseTemplate = processedActivities.find(t => t.id === activityId);
      
      // Fallback to preference-applied activities (old data structure)
      if (!baseTemplate) {
        baseTemplate = preferenceAppliedActivities.find(t => t.id === activityId);
      }
      let isTimelineActivity = false;
      
      // If not found in templates, check if it's a timeline activity
      if (!baseTemplate) {
        console.log('🔍 Not found in templates, checking timeline activities:', activityId);
        
        // Check directly in timeline activities
        const timelineActivity = allTimelineActivities.find((a: any) => {
          const timelineId = a.id || a.name?.toLowerCase().replace(/\s+/g, '-');
          return timelineId === activityId;
        });
        
        if (timelineActivity) {
          // Convert timeline activity to template format
          baseTemplate = {
            id: activityId,
            title: timelineActivity.title || timelineActivity.name,
            icon: timelineActivity.icon,
            category: 'physical', // Default category, can be refined
            points: timelineActivity.points || 20,
            rarity: 'common' as const,
            duration: timelineActivity.duration ? `${timelineActivity.duration} min` : '15 min',
            difficulty: 2,
            description: `${timelineActivity.title || timelineActivity.name} from timeline`
          };
          isTimelineActivity = true;
          console.log('✅ Found and converted timeline activity:', baseTemplate.title);
        }
      }
      
      if (!baseTemplate) {
        console.log('❌ Activity not found in templates or timeline activities:', activityId);
        return;
      }
      
      // Apply preferences - ALWAYS manually apply preferences to ensure custom images are used
      let activity = { ...baseTemplate };
      
      // Always try to apply preferences manually first (this is the primary method)
      const preference = activityPreferences.find(p => p.activityId === activityId);
      if (preference) {
        console.log('✅ Found preference for activity:', activityId, preference);
        activity = {
          ...activity,
          duration: preference.customDuration ?? activity.duration,
          points: preference.customPoints ?? activity.points,
          difficulty: preference.customDifficulty ?? activity.difficulty,
          icon: preference.customImageUrl ?? activity.icon, // Apply custom image if available
          title: activity.title, // Keep original title
          gridSize: preference.customGridSize ?? { w: 1, h: 1 },
          originalDuration: activity.duration, // Store original for comparison
          instructions: preference.instructions || activity.description || ''
        };
        console.log('🎨 Applied preferences to drag activity:', {
          before: { duration: baseTemplate.duration, points: baseTemplate.points, icon: baseTemplate.icon },
          after: { duration: activity.duration, points: activity.points, icon: activity.icon },
          preferenceImageUrl: preference.customImageUrl,
          hasCustomImage: activity.icon.startsWith('/') || activity.icon.startsWith('data:')
        });
      } else {
        // Fallback: check if already processed by TarkovInventoryGrid
        const foundInPreferenceApplied = preferenceAppliedActivities.find(t => t.id === activityId);
        if (foundInPreferenceApplied && foundInPreferenceApplied.icon !== baseTemplate.icon) {
          // Use TarkovInventoryGrid processed version only if it has a different icon (custom image)
          activity = { ...foundInPreferenceApplied };
          console.log('✅ Using TarkovInventoryGrid processed activity (has custom image):', {
            activityId,
            icon: activity.icon,
            iconType: activity.icon.startsWith('/') || activity.icon.startsWith('data:') ? 'custom-image' : 'emoji'
          });
        } else {
          console.log('ℹ️ No preferences found for activity:', activityId, 'using template defaults');
        }
      }
      
      console.log('✅ Final activity for drag operation:', {
        id: activity.id,
        title: activity.title,
        duration: activity.duration,
        points: activity.points,
        difficulty: activity.difficulty,
        icon: activity.icon,
        iconType: activity.icon.startsWith('/') || activity.icon.startsWith('data:') ? 'custom-image' : 'emoji'
      });
      
      // CRITICAL FIX: Handle timeline-to-timeline rescheduling with proper state management
      if (isTimelineDrag && result.destination.droppableId === 'timeline-drop-zone') {
        console.log('🔄 Processing timeline reschedule for activity:', activityId);
        
        // Find the existing timeline activity being moved using multiple matching criteria
        const existingActivity = allTimelineActivities.find(ta => {
          const taId = ta.id || ta.name?.toLowerCase().replace(/\s+/g, '-');
          const titleId = ta.title?.toLowerCase().replace(/\s+/g, '-');
          
          return taId === activityId || 
                 titleId === activityId ||
                 ta.title === activityId ||
                 ta.name === activityId;
        });
        
        if (existingActivity) {
          console.log('✅ Found existing timeline activity for reschedule:', {
            activity: existingActivity.title || existingActivity.name,
            currentTime: existingActivity.scheduledTime,
            id: existingActivity.id
          });
          
          // ATOMIC OPERATION: Remove the existing activity immediately and store it for re-placement
          setAllTimelineActivities(prev => {
            const filtered = prev.filter(ta => {
              // Enhanced matching - must match on BOTH id AND time to ensure exact removal
              const isExactMatch = (ta.id === existingActivity.id && ta.scheduledTime === existingActivity.scheduledTime) ||
                                 (ta === existingActivity) || // Reference equality
                                 (ta.title === existingActivity.title && ta.scheduledTime === existingActivity.scheduledTime && ta.id === existingActivity.id);
              
              if (isExactMatch) {
                console.log('🗑️ REMOVING activity for reschedule:', {
                  title: ta.title || ta.name,
                  time: ta.scheduledTime,
                  id: ta.id
                });
              }
              
              return !isExactMatch;
            });
            
            console.log('📊 Timeline activities after reschedule removal:', {
              before: prev.length,
              after: filtered.length,
              removedCount: prev.length - filtered.length,
              removedActivity: existingActivity.title || existingActivity.name
            });
            
            return filtered;
          });
          
          // Also remove from the main timelineActivities state to prevent duplication
          setTimelineActivities(prev => {
            const filtered = prev.filter(ta => {
              const isExactMatch = (ta.id === existingActivity.id && ta.scheduledTime === existingActivity.scheduledTime) ||
                                 (ta === existingActivity) ||
                                 (ta.title === existingActivity.title && ta.scheduledTime === existingActivity.scheduledTime);
              return !isExactMatch;
            });
            
            if (filtered.length !== prev.length) {
              console.log('📊 Also removed from timelineActivities state');
            }
            
            return filtered;
          });
          
          // Store the activity data for the timeline component to re-add at new position
          (window as any).currentDraggedActivity = {
            ...existingActivity,
            // Mark this as a reschedule operation
            isReschedule: true,
            originalTime: existingActivity.scheduledTime
          };
          
          console.log('🔄 Timeline reschedule prepared - activity removed, ready for re-placement');
          
          // CRITICAL: Return early to let timeline component handle the re-addition
          // Do not process this as a regular drop
          return;
          
        } else {
          console.error('❌ Could not find timeline activity to reschedule:', {
            activityId,
            availableActivities: allTimelineActivities.map(ta => ({
              id: ta.id,
              title: ta.title || ta.name,
              time: ta.scheduledTime
            }))
          });
          return;
        }
      }
      
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
          
          console.log('✅ Grid activity created for timeline:', {
            id: newActivity.id,
            title: newActivity.title,
            icon: newActivity.icon,
            iconType: newActivity.icon.startsWith('/') || newActivity.icon.startsWith('data:') ? 'custom-image' : 'emoji',
            timeSlot: timeSlot
          });
          
          // Debug logging removed - drag and drop fix working correctly
          
          // Add to local state
          setDroppedActivities(prev => [...prev, newActivity]);
          
          console.log('📝 Activity added to state for slot:', timeSlot);
          
        } else if (result.destination.droppableId === 'timeline-drop-zone') {
          // Pass the preference-applied activity to timeline component
          console.log('✅ Timeline drop detected - passing preference-applied activity');
          
          // Store the preference-applied activity for timeline to use
          (window as any).currentDraggedActivity = activity;
          
          return; // Timeline component will handle this drop
        } else if (result.destination.droppableId === 'duration-screen-drop') {
          // Handle dropping activity to duration screen
          console.log('🔧 Activity dropped in duration screen:', result.draggableId);
          
          const activityId = result.draggableId;
          const activity = processedActivities.find(a => a.id === activityId);
          
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
                originalDuration: activity.duration,
                gridSize: activity.gridSize || { w: 1, h: 1 },
                instructions: activity.instructions || activity.description || ''
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
              originalDuration: isTimelineActivity ? activity.duration : baseTemplate.duration, // Use timeline duration for timeline activities
              gridSize: activity.gridSize || { w: 1, h: 1 },
              instructions: activity.instructions || activity.description || '',
              // Preserve repeat settings if this is a timeline activity
              isRecurring: isTimelineActivity ? activity.isRecurring || false : false,
              recurringPattern: isTimelineActivity ? activity.recurringPattern : undefined,
              scheduledTime: isTimelineActivity ? (activity.time || activity.scheduledTime) : undefined
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
    console.log('🔄 Component not mounted yet, showing loading screen');
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
  
  console.log('✅ Component mounted, checking other loading states');

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
  
  // Callback to receive processed activities from TarkovInventoryGrid
  const handleActivitiesProcessed = (activities: ActivityTemplate[]) => {
    console.log('📦 Received processed activities from grid:', activities.length);
    setProcessedActivities(activities);
    
    // Store in window for timeline access (avoid async calls in render)
    (window as any).databaseActivities = activities;
  };

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
              onInstructionsToggle={() => setShowInstructions(!showInstructions)}
              isInstructionsOpen={showInstructions}
            />
            <UpNextPanel 
              theme={theme}
              currentTime={liveTime}
              timelineActivities={allTimelineActivities}
            />
            
            {/* Manage Images Button - Right after Up Next */}
            <div className="mt-3">
              <button
                onClick={() => setShowQuickActionsPanel(true)}
                className="w-full flex items-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 border-2 border-purple-500 rounded-lg transition-colors shadow-lg"
              >
                <ImageIcon className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">Manage Images</span>
              </button>
            </div>
            
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
            onActivityAdd={async (activity, preciseTimeSlot) => {
              try {
                // Apply 5-minute snap to the time slot
                const snappedTimeSlot = snapToFiveMinutes(preciseTimeSlot);
                console.log('🎯 onActivityAdd called:', { 
                  activityId: activity.id, 
                  preciseTimeSlot, 
                  snappedTimeSlot,
                  isReschedule: activity.isReschedule,
                  originalTime: activity.originalTime 
                });
                
                // Check if this is a reschedule operation
                if (activity.isReschedule) {
                  console.log('🔄 Processing timeline reschedule - updating database:', {
                    activity: activity.title,
                    from: activity.originalTime,
                    to: snappedTimeSlot
                  });
                  
                  // Update existing timeline activity in database
                  const response = await fetch('/api/timeline-activities', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: activity.id,
                      scheduledTime: snappedTimeSlot
                    })
                  });

                  if (!response.ok) {
                    throw new Error('Failed to update timeline activity');
                  }

                  const result = await response.json();
                  const updatedActivity = result.timelineActivity;
                  
                  // Update local state
                  setTimelineActivities(prev => prev.map(ta => 
                    ta.id === activity.id ? updatedActivity : ta
                  ));
                  
                  setAllTimelineActivities(prev => prev.map(ta => 
                    ta.id === activity.id ? updatedActivity : ta
                  ));
                  
                  console.log('✅ Timeline reschedule completed successfully');
                  return;
                }
                
                // Regular new activity creation - save to database
                console.log('📝 Creating new timeline activity in database');
                
                const response = await fetch('/api/timeline-activities', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    activityId: activity.id,
                    scheduledTime: snappedTimeSlot,
                    scheduledDate: new Date().toISOString(),
                    customDuration: activity.duration,
                    customPoints: activity.points,
                    sessionId: getSessionId(),
                    userId: getUserId(),
                    notes: null
                  })
                });

                if (!response.ok) {
                  throw new Error('Failed to create timeline activity');
                }

                const result = await response.json();
                const newActivity = result.timelineActivity;
                
                console.log('✅ Timeline activity created in database:', newActivity.id);
                
                // Add to local state
                setTimelineActivities(prev => {
                  const updated = [...prev, newActivity];
                  console.log('📊 Added new activity to timelineActivities:', prev.length, '→', updated.length);
                  return updated;
                });
                
                setAllTimelineActivities(prev => {
                  const updated = [...prev, newActivity];
                  console.log('📊 Added new activity to allTimelineActivities:', prev.length, '→', updated.length);
                  return updated;
                });
                
                console.log('✅ New activity creation completed');
              } catch (error) {
                console.error('❌ Error in onActivityAdd:', error);
                alert('Failed to create timeline activity. Please try again.');
              }
            }}
            onActivityRemove={async (activity) => {
              console.log('🗑️ onActivityRemove called:', activity);
              
              try {
                // Delete from database
                const response = await fetch(`/api/timeline-activities?id=${activity.id}`, {
                  method: 'DELETE'
                });

                if (!response.ok) {
                  throw new Error('Failed to delete timeline activity');
                }

                console.log('✅ Timeline activity deleted from database:', activity.id);
                
                // Remove from local state
                setTimelineActivities(prev => {
                  const updated = prev.filter(ta => ta !== activity && ta.id !== activity.id);
                  console.log('📊 Removed activity from timelineActivities:', prev.length, '→', updated.length);
                  return updated;
                });
                
                setAllTimelineActivities(prev => {
                  const updated = prev.filter(ta => ta !== activity && ta.id !== activity.id);
                  console.log('📊 Removed activity from allTimelineActivities:', prev.length, '→', updated.length);
                  return updated;
                });
                
                console.log('✅ Activity removal completed successfully');
              } catch (error) {
                console.error('❌ Error removing timeline activity:', error);
                alert('Failed to remove timeline activity. Please try again.');
              }
            }}
            onActivitySetRepeat={(activity, position) => {
              console.log('🔄 onActivitySetRepeat called:', activity, 'at position:', position);
              
              // Show the focused repeat modal at click position
              setRepeatModal({
                isVisible: true,
                activity: activity,
                position: position
              });
            }}
                hideCurrentActivity={true}
              />
            
            {/* Instructions Window - between timeline and Activity Grid */}
            <InstructionsWindow
              theme={theme}
              isVisible={showInstructions}
              onClose={() => setShowInstructions(false)}
              activity={getCurrentActivity()}
              timelineActivities={allTimelineActivities}
              displayTime={selectedTime || currentTime}
            />
            
            {/* Activity Grid below timeline zoom controls */}
            <div className="mt-4">
              <TarkovInventoryGrid 
                theme={theme}
                onDragEnd={handleDragEnd}
                activityPreferences={activityPreferences}
                timelineActivities={allTimelineActivities}
                onActivitiesProcessed={handleActivitiesProcessed}
                onCreateNewActivity={() => {
                  console.log('🆕 Create new activity clicked');
                  // Open Duration Screen with a blank activity
                  setUIState(prev => ({ ...prev, quickActionPanel: 'edit' }));
                  
                  // Create a blank activity template
                  const blankActivity = {
                    id: `new-activity-${Date.now()}`,
                    title: 'New Activity',
                    duration: '15 min',
                    points: 25,
                    icon: '⭐',
                    category: 'custom',
                    difficulty: 2,
                    originalDuration: '15 min',
                    instructions: '',
                    gridSize: { w: 1, h: 1 },
                    isRecurring: false
                  };
                  
                  // Pass the blank activity to the DurationScreen
                  window.dispatchEvent(new CustomEvent('activityDropped', {
                    detail: blankActivity
                  }));
                }}
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
                    
                    // Find the original database activity from processed activities
                    console.log('🗄️ Using database-processed activities for duration screen:', processedActivities.length);
                    
                    // Find original template, schedule activity, or timeline activity
                    const templateActivity = processedActivities.find(t => t.id === baseActivityId);
                    const scheduleActivity = schedule?.activities.find(a => a.id === baseActivityId);
                    
                    // Check timeline activities if not found in templates or schedule
                    let timelineActivity = null;
                    if (!templateActivity && !scheduleActivity) {
                      timelineActivity = allTimelineActivities.find((a: any) => {
                        const timelineId = a.id || a.name?.toLowerCase().replace(/\s+/g, '-');
                        return timelineId === baseActivityId;
                      });
                      console.log('🔍 Checking timeline activities for ID:', baseActivityId, timelineActivity ? 'Found!' : 'Not found');
                    }
                    
                    const originalActivity = templateActivity || scheduleActivity || timelineActivity;
                    
                    if (!originalActivity) {
                      console.error('❌ Could not find original activity for ID:', baseActivityId);
                      console.log('Available timeline activities:', allTimelineActivities.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        computedId: a.id || a.name?.toLowerCase().replace(/\s+/g, '-')
                      })));
                      return;
                    }
                    
                    console.log('📋 Original activity found:', originalActivity.title || originalActivity.name, 'Duration:', originalActivity.duration, 'Points:', originalActivity.points);
                    
                    // Create a proper Activity object for comparison
                    // Handle both template activities and timeline activities (which may have different field names)
                    const activityTitle = originalActivity.title || originalActivity.name;
                    const activityDuration = originalActivity.duration || '15 min';
                    const activityPoints = originalActivity.points || 20;
                    const activityCategory = originalActivity.category || 'physical';
                    const activityIcon = originalActivity.icon;
                    
                    const baseActivity: Activity = {
                      id: baseActivityId,
                      title: activityTitle,
                      description: templateActivity?.description || timelineActivity?.description || `${activityTitle} activity`,
                      roleModel: timelineActivity ? 'Timeline Activity' : 'Template Activity',
                      roleModelId: timelineActivity ? 'timeline' : 'template',
                      attribute: 'Personal Growth',
                      duration: activityDuration,
                      difficulty: originalActivity.difficulty || 2,
                      timeOfDay: 'anytime',
                      category: activityCategory as Activity['category'],
                      scheduledTime: '12:00p',
                      isCompleted: false,
                      points: activityPoints,
                      icon: activityIcon,
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
                    console.log('🔍 Activity has gridSize:', activity.gridSize);
                    console.log('🔍 Base template gridSize:', originalActivity.gridSize);
                    
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
                    
                    // Check for grid size changes
                    let hasGridSizeChange = false;
                    if (activity.gridSize) {
                      const originalGridSize = originalActivity.gridSize || { w: 1, h: 1 };
                      if (activity.gridSize.w !== originalGridSize.w || activity.gridSize.h !== originalGridSize.h) {
                        hasGridSizeChange = true;
                        console.log('🔄 Grid size changed:', originalGridSize, '->', activity.gridSize);
                      }
                    }
                    
                    console.log('📝 Customizations to save:', customizations);
                    console.log('📐 Grid size change detected:', hasGridSizeChange);
                    
                    // Save grid size change using the image preference API
                    if (hasGridSizeChange) {
                      try {
                        const result = await saveActivityImageAndGridPreference(
                          baseActivityId,
                          activity.title,
                          activity.icon || originalActivity.icon, // Keep existing image
                          activity.gridSize,
                          'upload', // Keep as upload source
                          undefined,
                          {
                            gridSizeUpdate: true,
                            previousGridSize: originalActivity.gridSize || { w: 1, h: 1 },
                            newGridSize: activity.gridSize
                          }
                        );
                        
                        if (result.success) {
                          console.log('✅ Grid size preference saved successfully');
                        } else {
                          console.error('❌ Failed to save grid size preference:', result.error);
                        }
                      } catch (error) {
                        console.error('❌ Error saving grid size preference:', error);
                      }
                    }
                    
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
                onActivityPlace={async (activity, timePosition) => {
                  console.log('📅 Placing activity on timeline:', { activity, timePosition });
                  
                  try {
                    // Extract base activity ID
                    let baseActivityId = activity.id;
                    if (activity.id.startsWith('edit-') && activity.id.includes('-')) {
                      const parts = activity.id.split('-');
                      if (parts.length >= 3) {
                        baseActivityId = parts.slice(2).join('-');
                      }
                    }
                    
                    // Create timeline activity in database with repeat settings
                    const response = await fetch('/api/timeline-activities', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        activityId: baseActivityId,
                        scheduledTime: timePosition,
                        scheduledDate: new Date().toISOString(),
                        customDuration: activity.duration,
                        customPoints: activity.points,
                        sessionId: getSessionId(),
                        userId: getUserId(),
                        notes: null,
                        // Include repeat settings from Duration Screen
                        isRecurring: activity.isRecurring || false,
                        recurringPattern: activity.recurringPattern || null
                      })
                    });

                    if (!response.ok) {
                      throw new Error('Failed to create timeline activity');
                    }

                    const result = await response.json();
                    const newActivity = result.timelineActivity;
                    
                    console.log('✅ Timeline activity created in database with repeat settings:', {
                      id: newActivity.id,
                      title: newActivity.title,
                      time: newActivity.scheduledTime,
                      isRecurring: newActivity.isRecurring,
                      recurringPattern: newActivity.recurringPattern
                    });
                    
                    // Add to local state
                    setTimelineActivities(prev => [...prev, newActivity]);
                    setAllTimelineActivities(prev => [...prev, newActivity]);
                    
                    // Close edit panel
                    setUIState(prev => ({ ...prev, quickActionPanel: 'hidden' }));
                    
                  } catch (error) {
                    console.error('❌ Error placing activity on timeline:', error);
                    alert('Failed to place activity on timeline. Please try again.');
                  }
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

      {/* Quick Actions Panel */}
      <QuickActionsPanel
        theme={theme}
        isVisible={showQuickActionsPanel}
        onClose={() => setShowQuickActionsPanel(false)}
        activityTemplates={processedActivities}
        activityPreferences={activityPreferences}
        timelineActivities={allTimelineActivities}
      />

      {/* Repeat Activity Modal */}
      <RepeatActivityModal
        theme={theme}
        isVisible={repeatModal.isVisible}
        activity={repeatModal.activity}
        position={repeatModal.position}
        onSave={async (activity, repeatConfig) => {
          console.log('💾 Saving repeat config to database:', activity, repeatConfig);
          
          try {
            // Update timeline activity in database
            const response = await fetch('/api/timeline-activities', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: activity.id,
                customDuration: repeatConfig.duration,
                isRecurring: repeatConfig.isRecurring,
                recurringPattern: repeatConfig.recurringPattern
              })
            });

            if (!response.ok) {
              throw new Error('Failed to update timeline activity');
            }

            const result = await response.json();
            console.log('✅ Timeline activity updated in database:', result);

            // Update local state to reflect database changes
            const updatedActivity = result.timelineActivity;
            
            setTimelineActivities(prev => prev.map(ta => 
              ta.id === activity.id ? updatedActivity : ta
            ));
            
            setAllTimelineActivities(prev => prev.map(ta => 
              ta.id === activity.id ? updatedActivity : ta
            ));
            
            // Close modal
            setRepeatModal({ isVisible: false, activity: null, position: { x: 0, y: 0 } });
            
            console.log('✅ Repeat configuration saved to database successfully');
            
          } catch (error) {
            console.error('❌ Error saving repeat config:', error);
            alert('Failed to save repeat configuration. Please try again.');
          }
        }}
        onCancel={() => {
          console.log('❌ Repeat configuration cancelled');
          setRepeatModal({ isVisible: false, activity: null, position: { x: 0, y: 0 } });
        }}
      />
      </div>
    </DragDropContext>
  );
}