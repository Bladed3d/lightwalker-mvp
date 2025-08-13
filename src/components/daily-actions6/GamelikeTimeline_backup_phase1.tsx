'use client'

import React, { useState, useEffect, useRef } from 'react';

// Phase 2 Cleanup Complete: This file is now the DND Kit version
console.log('🧹 Phase 2 Cleanup: GamelikeTimeline.tsx successfully switched to DND Kit version');
// Phase 4 Complete: React Beautiful DND package fully removed from system
console.log('✅ DND Kit Migration Complete - React Beautiful DND fully removed');
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ThemeConfig } from '@/lib/theme-config';

// Duration parsing utility
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 15; // Default duration
  
  // Handle various formats: "15 min", "1 hour", "2 hours 30 min", "6 hours"
  const hourMatch = duration.match(/(\d+)\s*hours?/i);
  const minMatch = duration.match(/(\d+)\s*min/i);
  
  let totalMinutes = 0;
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }
  
  if (minMatch) {
    totalMinutes += parseInt(minMatch[1]);
  }
  
  // If no match found, try to parse as just a number (assume minutes)
  if (totalMinutes === 0) {
    const numMatch = duration.match(/(\d+)/);
    if (numMatch) {
      totalMinutes = parseInt(numMatch[1]);
    }
  }
  
  return totalMinutes || 15; // Default to 15 minutes if parsing fails
}

// Category color mapping (7 core categories + legacy fallbacks)
const CATEGORY_COLORS = {
  // Core 7 categories
  mindfulness: '#3B82F6',    // blue
  physical: '#10B981',       // green  
  creativity: '#F59E0B',     // orange
  communication: '#8B4513',  // brown
  learning: '#8B5CF6',       // purple
  productivity: '#06B6D4',   // teal
  relationships: '#EC4899',  // pink
  // Legacy category fallbacks (will be remapped later)
  creative: '#F59E0B',       // → creativity
  'decision-making': '#06B6D4', // → productivity
  reflection: '#3B82F6',     // → mindfulness
  'self-care': '#10B981',    // → physical
  growth: '#8B5CF6',         // → learning
  nutrition: '#10B981',      // → physical
  companionship: '#EC4899',  // → relationships
  sleep: '#10B981',          // → physical
  morning: '#10B981',        // → physical
  work: '#06B6D4',           // → productivity
  social: '#EC4899',         // → relationships
  custom: '#9CA3AF',      // neutral gray
} as const;

// Category vertical offset mapping (10px increments to prevent overlap)
const CATEGORY_VERTICAL_OFFSETS = {
  // Core 7 categories (10px spacing)
  mindfulness: 10,
  physical: 20,
  creativity: 30,
  communication: 40,
  learning: 50,
  productivity: 60,
  relationships: 70,
  // Legacy category fallbacks (map to core categories)
  creative: 30,           // → creativity
  'decision-making': 60,  // → productivity
  reflection: 10,         // → mindfulness
  'self-care': 20,        // → physical
  growth: 50,             // → learning
  nutrition: 20,          // → physical
  companionship: 70,      // → relationships
  sleep: 20,              // → physical
  morning: 20,            // → physical
  work: 60,               // → productivity
  social: 70,             // → relationships
  custom: 80,             // fallback
} as const;

interface GamelikeTimelineDndKitProps {
  theme?: ThemeConfig;
  onActivityAdd?: (activity: any, timeSlot: string) => void;
  onActivityRemove?: (activity: any) => void;
  onActivitySetRepeat?: (activity: any, position: { x: number; y: number }) => void;
  onActivitySetAlert?: (activity: any, position: { x: number; y: number }) => void;
  isDndActive?: boolean;
  timelineActivities?: any[];
  onDragEnd?: (result: any) => void;
  hideCurrentActivity?: boolean;
  onTimeChange?: (currentTime: Date, selectedTime: Date | null) => void;
  onActivitiesChange?: (activities: any[]) => void;
  isMobileView?: boolean;
}

// SortableTimelineActivity Component for DND Kit
interface SortableTimelineActivityProps {
  activity: any;
  index: number;
  position: number;
  displayTime: string;
  activityIcon: string;
  activityName: string;
  isDroppedActivity: boolean;
  isActivityFaded: boolean;
  isCurrent: boolean;
  onContextMenu: (e: React.MouseEvent, activity: any) => void;
}

function SortableTimelineActivity({
  activity,
  index,
  position,
  displayTime,
  activityIcon,
  activityName,
  isDroppedActivity,
  isActivityFaded,
  isCurrent,
  onContextMenu
}: SortableTimelineActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging
  } = useSortable({
    id: `timeline-activity-${activity.id}`,
    data: {
      type: 'timeline-activity',
      activity
    }
  });

  const style = {
    position: 'absolute' as const,
    left: `${position}px`,
    top: '6px',
    transform: `translateX(-50%) ${CSS.Transform.toString(transform)}`,
    transition: transition || (isCurrentlyDragging ? 'none' : 'all 300ms ease'),
    opacity: isCurrentlyDragging ? 0.5 : 1,
    zIndex: isCurrentlyDragging ? 50 : 'auto'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center ${
        isCurrentlyDragging ? 'z-50 rotate-6 scale-110' : ''
      }`}
    >
      {/* Enhanced drop time popup when dragging timeline activities */}
      {isCurrentlyDragging && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-2xl z-[100] animate-pulse border-2 border-orange-300 w-24">
          <div className="text-center">
            <div className="text-xs opacity-90">Drop at</div>
            <div id={`drop-time-timeline-activity-${activity.id}`} className="text-base font-black w-full">Hover Timeline</div>
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-orange-500"></div>
        </div>
      )}

      {/* Activity Time (above icon) */}
      <div className="relative text-xs text-slate-300 font-mono mb-1 whitespace-nowrap">
        {displayTime}
        {/* Tactical Crosshair Target - Right-click menu indicator */}
        {isDroppedActivity && (
          <div 
            className="absolute -top-1 -right-6 w-4 h-4 bg-transparent flex items-center justify-center cursor-pointer group"
            onContextMenu={(e) => onContextMenu(e, activity)}
            title="Right-click for actions"
          >
            <div className="w-3 h-3 text-red-400 hover:text-red-300 transition-colors">⊕</div>
            
            {/* Hover tooltip */}
            <div className="absolute left-6 top-0 bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Right-click for menu
            </div>
          </div>
        )}
      </div>
      
      {/* Activity Icon */}
      <div className="relative">
        <div className={`transition-all duration-300 overflow-hidden ${
          isCurrentlyDragging 
            ? 'w-12 h-12 rounded-full flex items-center justify-center bg-orange-500 ring-2 ring-orange-400 shadow-xl shadow-orange-400/50' 
            : isActivityFaded
              ? 'w-12 h-12 flex items-center justify-center cursor-move' // Faded styling - no rounded-full clipping
              : 'w-12 h-12 rounded-full flex items-center justify-center bg-green-600 ring-2 ring-green-400 shadow-lg shadow-green-400/30 cursor-move' // Fresh green styling
        }`}>
          {(activityIcon.startsWith('/') || activityIcon.startsWith('data:')) ? (
            <img 
              src={activityIcon} 
              alt={activityName}
              className={`w-full h-full object-cover ${isActivityFaded ? '' : 'rounded-full'}`}
              draggable={false}
            />
          ) : (
            <span className="text-2xl">{activityIcon}</span>
          )}
        </div>
        {/* Underline highlight for current activity */}
        {isCurrent && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-400 shadow-lg shadow-blue-400/50"></div>
        )}
      </div>
      
      {/* Activity Name (below icon for dropped activities) */}
      <div className="text-xs text-green-300 font-medium mt-1 whitespace-nowrap max-w-20 truncate">
        {activityName}
      </div>
    </div>
  );
}

const GamelikeTimelineDndKit = ({
  theme,
  onActivityAdd,
  onActivityRemove,
  onActivitySetRepeat,
  onActivitySetAlert,
  isDndActive = false,
  timelineActivities = [],
  onDragEnd,
  hideCurrentActivity = false,
  onTimeChange,
  onActivitiesChange,
  isMobileView = false
}: GamelikeTimelineDndKitProps) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [liveTime, setLiveTime] = useState(() => new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);
  const [zoomLevel, setZoomLevel] = useState(isMobileView ? 2 : 4); // Mobile: zoom 2, Desktop: zoom 4
  const [fadedActivities, setFadedActivities] = useState<Set<string>>(new Set()); // Track faded activities
  const [lastDisplayedDropTime, setLastDisplayedDropTime] = useState<string | null>(null); // Track displayed drop time for accurate placement
  
  // Update zoom level when mobile view changes
  useEffect(() => {
    setZoomLevel(isMobileView ? 2 : 4);
  }, [isMobileView]);

  const [isDropTarget, setIsDropTarget] = useState(false);
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<number | null>(null);
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [lastProcessedDrop, setLastProcessedDrop] = useState<string | null>(null);
  const [lastZoomOffset, setLastZoomOffset] = useState<number | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    activity: any;
  } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu?.visible) {
        setContextMenu(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu?.visible]);

  // COORDINATE SYSTEM FOUNDATION: 
  // pixelsPerMinute is the key conversion factor between time and screen position
  // This must be consistent across ALL positioning and drag calculations
  const pixelsPerMinute = zoomLevel;

  // No more hardcoded activities - timeline shows only user-added database activities
  const activities: any[] = [];

  // FIXED: Update current time every 60 seconds like original working timeline
  // Frequent updates cause positioning jitter and accuracy issues
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 60000); // Update every 60 seconds for stable positioning

    return () => clearInterval(timer);
  }, [isPaused]);

  // Separate live timestamp for debugging - updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000); // Update every second for live feedback

    return () => clearInterval(timer);
  }, []);

  // Notify parent component when time changes
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(currentTime, selectedTime);
    }
  }, [currentTime, selectedTime, onTimeChange]);

  // Notify parent component of all available activities (only timeline activities)
  useEffect(() => {
    if (onActivitiesChange) {
      onActivitiesChange(timelineActivities);
    }
  }, [timelineActivities, onActivitiesChange]);

  // Preserve user's selected time when zoom level changes
  useEffect(() => {
    // Only reset if user hasn't manually positioned the timeline
    if (!selectedTime && !isPaused) {
      setScrollOffset(0);
      setLastZoomOffset(0);
    } else if (selectedTime) {
      // Recalculate scroll offset to keep the selected time centered at new zoom level
      const selectedMinutes = selectedTime.getHours() * 60 + selectedTime.getMinutes();
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const minutesDifference = selectedMinutes - currentMinutes;
      
      // Calculate the scroll offset needed to center the selected time at the new zoom level
      const newScrollOffset = -(minutesDifference * pixelsPerMinute);
      
      // Prevent infinite loop by checking if offset actually changed
      if (lastZoomOffset !== newScrollOffset) {
        setScrollOffset(newScrollOffset);
        setLastZoomOffset(newScrollOffset);
      }
    } else if (isPaused) {
      // If timeline is paused but no specific selectedTime, maintain current view by using currentTime
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      // Keep the current time centered by maintaining zero offset relative to current time
      if (lastZoomOffset !== 0) {
        setScrollOffset(0);
        setLastZoomOffset(0);
      }
    }
  }, [zoomLevel, pixelsPerMinute, selectedTime, isPaused, lastZoomOffset, currentTime]);

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).mozUserSelect = 'none';
      (document.body.style as any).msUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    }

    return () => {
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    };
  }, [isDragging]);

  // Auto-fade green circle after 1 second for newly dropped activities
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timelineActivities.forEach(activity => {
      if (activity.scheduledTime && activity.id && !fadedActivities.has(activity.id)) {
        // Set timer to fade this activity's green circle
        const timer = setTimeout(() => {
          setFadedActivities(prev => new Set([...prev, activity.id]));
        }, 1000);

        timers.push(timer);
      }
    });

    // Cleanup all timers when component unmounts or dependencies change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [timelineActivities, fadedActivities]); // Only depend on timelineActivities to avoid re-running when activities fade

  // FIXED TIMELINE POSITION - ensures proper centering at all zoom levels
  const getTimelinePosition = () => {
    const centerX = (containerRef.current?.clientWidth || 800) / 2;
    
    if (isDragging || selectedTime) {
      // When dragging or paused, use base current time position plus offset
      const baseMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(baseMinutes * pixelsPerMinute) + centerX + scrollOffset;
    } else {
      // When running normally, position based on current time
      // This centers the current time in the visible area regardless of zoom level
      const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(minutes * pixelsPerMinute) + centerX;
    }
  };

  // Get current activity - simple time-based detection (zoom-independent)
  const getCurrentActivity = () => {
    const time = selectedTime || currentTime;
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    
    // Find activity closest to current time (simple time comparison)
    let closestActivity = null;
    let minTimeDifference = Infinity;
    
    for (let i = 0; i < activities.length; i++) {
      const [hours, mins] = activities[i].time.split(':').map(Number);
      const activityStart = hours * 60 + mins;
      const timeDifference = Math.abs(currentMinutes - activityStart);
      
      if (timeDifference < minTimeDifference) {
        minTimeDifference = timeDifference;
        closestActivity = activities[i];
      }
    }
    
    return closestActivity;
  };

  // Enhanced drag start with DND Kit coordination
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Enhanced DND detection - check for draggable elements
    const target = e.target as HTMLElement;
    const isDraggableElement = target.closest('[data-dnd-kit-sortable], [data-dnd-kit-draggable]');
    
    // Don't start timeline drag if DND Kit is active OR if clicking on draggable elements
    if (isDndActive || isDraggableElement) {
      return;
    }
    
    e.preventDefault();
    
    // Set drag state with safety timestamp for cleanup
    const dragStartTime = Date.now();
    setIsDragging(true);
    setDragStartTime(new Date(dragStartTime));
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX - scrollOffset);
    setIsPaused(true);
    
    // Store drag metadata for cleanup logic
    (window as any).timelineDragMetadata = {
      startTime: dragStartTime,
      startX: clientX,
      initialOffset: scrollOffset
    };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Enhanced validation for drag move
    if (!isDragging || isDndActive) return;
    
    // Additional safety check - if DND Kit started, abort immediately
    const dragMetadata = (window as any).timelineDragMetadata;
    if (dragMetadata && Date.now() - dragMetadata.startTime > 100) {
      // If drag has been going for >100ms and DND Kit might be interfering
      const isDndInterference = document.querySelector('[data-dnd-kit-sortable]');
      if (isDndInterference) {
        handleDragEnd();
        return;
      }
    }
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    // FIXED: Using correct positive relationship from working timeline
    // Calculate new scroll offset
    const newScrollOffset = clientX - dragStartX;
    setScrollOffset(newScrollOffset);
    
    // Calculate what time is at center using CORRECTED formula
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // FIXED: Positive relationship for intuitive drag behavior
    // Drag RIGHT → see earlier times, Drag LEFT → see later times
    const minutesAtCenter = currentTimeMinutes - (newScrollOffset / pixelsPerMinute);
    
    // Ensure we stay within 0-1439 (24 hours)
    let normalizedMinutes = minutesAtCenter;
    while (normalizedMinutes < 0) normalizedMinutes += 1440;
    while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
    
    // Create the display time
    const newTime = new Date();
    newTime.setHours(Math.floor(normalizedMinutes / 60));
    newTime.setMinutes(Math.round(normalizedMinutes % 60));
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    
    setSelectedTime(newTime);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Clear drag metadata
    delete (window as any).timelineDragMetadata;
    
    // Additional safety: ensure no lingering drag state
    setTimeout(() => {
      if (isDragging) {
        setIsDragging(false);
      }
    }, 50);
  };

  // Calculate time from drop position
  const calculateTimeFromPosition = (x: number) => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    const centerX = containerWidth / 2;
    const offsetFromCenter = x - centerX;
    const minutesOffset = offsetFromCenter / pixelsPerMinute;
    
    const baseTime = currentTime.getHours() * 60 + currentTime.getMinutes();
    const targetMinutes = baseTime + minutesOffset;
    
    // Convert to time string
    const hours = Math.floor(targetMinutes / 60) % 24;
    const mins = Math.round(targetMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const resetToNow = () => {
    setCurrentTime(new Date()); // Update to actual current time immediately
    setSelectedTime(null);
    setScrollOffset(0);
    setIsPaused(false);
  };

  // DND Kit Drop Zone for Timeline
  const dropResult = useDroppable({
    id: 'timeline-drop-zone',
    data: { 
      accepts: ['activity'],
      type: 'Timeline'
    }
  });
  
  const { setNodeRef: setDroppableNodeRef, isOver } = dropResult;
  
  // Debug the drop zone setup
  useEffect(() => {
    console.log('🔍 TIMELINE DROP ZONE STATE:', {
      isOver,
      nodeRef: setDroppableNodeRef,
      dropResult
    });
  }, []);

  // Debug logging for drop zone registration
  useEffect(() => {
    console.log('🎯 Timeline drop zone registered', { 
      id: 'timeline-drop-zone',
      ref: setDroppableNodeRef
    });
  }, []);
  
  // Debug isOver changes
  useEffect(() => {
    if (isOver) {
      console.log('✅ TIMELINE: Something is hovering over the timeline!');
    } else {
      console.log('❌ TIMELINE: Nothing hovering over timeline');
    }
  }, [isOver]);

  // Track previous isOver state to detect drop completion
  const [wasOver, setWasOver] = useState(false);

  // Handle actual drop detection and processing
  useEffect(() => {
    // Detect when isOver goes from true to false (drop completed)
    if (wasOver && !isOver && onActivityAdd) {
      console.log('🎯 Timeline drop detected! Processing drop...');
      
      // Get the dragged activity from global state
      const draggedActivity = (window as any).currentDraggedActivity;
      if (draggedActivity && lastDisplayedDropTime) {
        console.log('✅ Drop completed on timeline', { 
          activity: draggedActivity.title || draggedActivity.name,
          time: lastDisplayedDropTime 
        });
        
        // Call onActivityAdd with the calculated time from the drop position
        onActivityAdd(draggedActivity, lastDisplayedDropTime);
        
        // Clear the stored drop time
        setLastDisplayedDropTime(null);
      } else {
        console.warn('❌ Timeline drop failed: missing activity or drop time', {
          draggedActivity: !!draggedActivity,
          lastDisplayedDropTime
        });
      }
    }
    
    // Update wasOver state for next cycle
    setWasOver(isOver);
  }, [isOver, wasOver, onActivityAdd, lastDisplayedDropTime]);

  const currentActivity = getCurrentActivity();
  const displayTime = selectedTime || currentTime;

  return (
    <div className={`${theme?.timelineBackground || 'bg-slate-800'} rounded-xl p-6 border ${theme?.timelineBorder || 'border-slate-700'}`}>
      {/* Header with title and status */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-semibold ${theme?.timelineText || 'text-white'}`}>Daily Timeline (DND Kit)</h2>
          <div className={`text-sm ${theme?.cardSubtext || 'text-slate-400'}`}>
            {isDragging ? 'Dragging Timeline' : isPaused ? 'Timeline Paused' : 'Live Timeline'}
          </div>
        </div>
      </div>

      {/* Main Layout: Left Panel + Timeline OR just Timeline based on hideCurrentActivity */}
      <div className={hideCurrentActivity ? "" : "flex"}>
        
        {/* Left Panel - Current Activity with border separator */}
        {!hideCurrentActivity && (
          <div className="w-48 flex-shrink-0 border-r border-slate-600 pr-4">
            <div className={`${theme?.cardBackground || 'bg-slate-700'} rounded-lg p-4 text-center`}>
            {/* Large Activity Icon */}
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-3 mx-auto">
              <span className="text-3xl">{currentActivity?.icon || '🌟'}</span>
            </div>
            
            {/* Activity Name */}
            <h3 className={`text-lg font-semibold ${theme?.timelineText || 'text-white'} mb-1`}>
              {currentActivity?.name || 'Free Time'}
            </h3>
            
            {/* Current Time */}
            <div className="text-xl text-blue-400 font-mono mb-2">
              {displayTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }).replace(/\s?(AM|PM)/, (match, period) => period.toLowerCase())}
            </div>
            
            {/* DEBUG: Show raw time values for bug analysis */}
            <div className="text-xs text-red-400 font-mono mb-1">
              DEBUG: {displayTime.getHours()}:{displayTime.getMinutes().toString().padStart(2, '0')} 
              ({displayTime.getHours() * 60 + displayTime.getMinutes()} min)
            </div>
            
            {/* Debug: Live timestamp for server status verification */}
            <div className="text-xs text-cyan-400 mb-1">
              Server Live: {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Points */}
            <div className={`text-sm ${theme?.cardSubtext || 'text-gray-300'}`}>
              Points: {currentActivity?.points || 0}
            </div>

            {/* HIGH ENERGY Status Pill */}
            {currentActivity && (
              <div className="mt-3">
                <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full">
                  🔥 HIGH ENERGY
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Timeline Section */}
        <div className={hideCurrentActivity ? "w-full" : "flex-1"}>
          {/* Timeline Container with DND Kit Drop Zone */}
          <div 
            ref={(el) => {
              setDroppableNodeRef(el);
              (containerRef as any).current = el;
            }}
            className={`relative bg-black border-2 ${
              isOver ? 'border-green-400 bg-green-500/20 shadow-lg shadow-green-400/30' : 
              isDropTarget ? 'border-green-400 bg-green-500/10' : 'border-slate-700'
            } rounded-lg h-36 overflow-hidden select-none ${isDragging && !isDndActive ? 'cursor-grabbing' : isDndActive ? 'cursor-pointer' : 'cursor-grab'} ${hideCurrentActivity ? '' : 'ml-4'}`}
            style={{ 
              userSelect: 'none', 
              WebkitUserSelect: 'none', 
              MozUserSelect: 'none', 
              msUserSelect: 'none',
              minHeight: '144px' // Increased height for better activity spacing and label positioning
            }}
            // Add mouse move handler for drop indicator
            onMouseMove={(e) => {
              if (isOver && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const relativeX = e.clientX - rect.left;
                setDropIndicatorPosition(relativeX);
                setIsDropTarget(true);
                
                // Calculate and update drop time for visual feedback
                const centerX = containerRef.current.clientWidth / 2;
                const pixelOffsetFromCenter = relativeX - centerX;
                const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
                
                const baseTime = selectedTime || currentTime;
                const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
                const targetMinutes = baseMinutes + timeOffsetMinutes;
                
                // Normalize to 24-hour format
                let normalizedMinutes = targetMinutes;
                while (normalizedMinutes < 0) normalizedMinutes += 1440;
                while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
                
                // Apply 5-minute snapping for visual feedback during drag
                normalizedMinutes = Math.round(normalizedMinutes / 5) * 5;
                
                // Convert to time string
                let hours = Math.floor(normalizedMinutes / 60);
                let mins = Math.round(normalizedMinutes % 60);
                
                // Handle mins = 60 case (carry over to next hour)
                if (mins === 60) {
                  mins = 0;
                  hours = (hours + 1) % 24;
                }
                
                const timeString = hours === 0 ? `12:${mins.toString().padStart(2, '0')}a` : 
                                  hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                                  hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                                  `${hours-12}:${mins.toString().padStart(2, '0')}p`;
                
                // Store the displayed drop time for accurate placement
                setLastDisplayedDropTime(timeString);
                
                // Debug logging for drop hovering
                console.log('🔍 Drop hovering over timeline', { isOver, time: timeString });
              }
              
              // Call original drag handler if not in DND mode AND actually dragging timeline
              if (!isOver && isDragging) {
                handleDragMove(e);
              }
            }}
            onMouseLeave={() => {
              // Always clear drop states when leaving timeline, regardless of drag mode
              setIsDropTarget(false);
              setDropIndicatorPosition(null);
              setDraggedActivityId(null);
              setLastDisplayedDropTime(null);
              
              // Clear timeline drag state to prevent erratic movement after DND Kit
              setIsDragging(false);
              
              // CRITICAL FIX: Reset selectedTime to prevent timeline jumping after DND Kit
              // This ensures mouse movements after drop don't use the drop position for calculations
              if (isOver || isDndActive) {
                setSelectedTime(null);
              }
              
              // Only call handleDragEnd for non-DND-Kit drags
              if (!isOver && isDragging) {
                handleDragEnd();
              }
            }}
            {...(!isOver && !isDndActive && {
              onMouseDown: handleDragStart,
              onMouseUp: handleDragEnd,
              onTouchStart: handleDragStart,
              onTouchMove: handleDragMove,
              onTouchEnd: handleDragEnd
            })}
          >
          
          {/* Drop Zone Indicator - Shows when dragging over with DND Kit */}
          {isOver && !isDropTarget && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-green-500/10 backdrop-blur-sm border-2 border-green-400 border-dashed rounded-lg">
              <div className="text-center">
                <div className="text-green-300 font-semibold text-lg animate-pulse mb-2">
                  📅 Drop Activity Here
                </div>
                <div className="text-green-200 text-sm">
                  Move cursor to see exact drop time
                </div>
              </div>
            </div>
          )}

          {/* Current Time Indicator - Blue dot and line (stays centered) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 z-30"></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full z-30 shadow-lg shadow-blue-400/50" style={{ bottom: '1px' }}>
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          </div>

          {/* Enhanced Drop Indicator - Green line, arrow, and time display */}
          {isDropTarget && dropIndicatorPosition !== null && (
            <>
              {/* Vertical drop line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-green-400 z-40 animate-pulse shadow-lg shadow-green-400/50"
                style={{ left: `${dropIndicatorPosition}px` }}
              ></div>
              
              {/* Drop arrow indicator */}
              <div 
                className="absolute -translate-x-1/2 z-40"
                style={{ 
                  left: `${dropIndicatorPosition}px`,
                  top: '8px'
                }}
              >
                {/* Arrow pointing down */}
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-green-400 animate-bounce"></div>
              </div>
              
              {/* Drop time indicator */}
              <div 
                className="absolute -translate-x-1/2 z-40 bg-green-400 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg animate-pulse"
                style={{ 
                  left: `${dropIndicatorPosition}px`,
                  top: '-32px'
                }}
              >
                {lastDisplayedDropTime || 'Calculating...'}
              </div>
              
              {/* Bottom drop indicator circle */}
              <div 
                className="absolute -translate-x-1/2 w-4 h-4 bg-green-400 rounded-full z-40 shadow-lg shadow-green-400/50 animate-bounce"
                style={{ 
                  left: `${dropIndicatorPosition}px`,
                  bottom: '1px'
                }}
              >
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </>
          )}

          {/* Moving Timeline */}
          <div 
            ref={timelineRef}
            className="absolute inset-0 transition-transform duration-1000 ease-out"
            style={{
              width: `${24 * 60 * pixelsPerMinute}px`, // 24 hours * 60 minutes * pixels per minute
              transform: `translateX(${getTimelinePosition()}px)`,
            }}
          >
            {/* Timeline Base Line - moved lower to avoid activity label overlap */}
            <div className="absolute left-0 right-0 h-0.5 bg-slate-600" style={{ bottom: '24px' }}></div>

            {/* Duration Lines SVG Overlay */}
            <svg 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                width: `${24 * 60 * pixelsPerMinute}px`,
                height: '100%',
                zIndex: 25 // Below activity icons but above timeline base
              }}
            >
              {timelineActivities.map((activity, index) => {
                // Parse activity time (same logic as activity rendering)
                let hours, mins;
                if (activity.time) {
                  [hours, mins] = activity.time.split(':').map(Number);
                } else if (activity.scheduledTime) {
                  const timeStr = activity.scheduledTime;
                  
                  if (timeStr.includes('a') || timeStr.includes('p')) {
                    const isPM = timeStr.includes('p');
                    const [hourStr, minStr] = timeStr.replace(/[ap]/, '').split(':');
                    hours = parseInt(hourStr);
                    mins = parseInt(minStr);
                    
                    if (isPM && hours !== 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;
                  } else {
                    [hours, mins] = timeStr.split(':').map(Number);
                  }
                } else {
                  return null;
                }

                // Calculate start position
                const activityStart = hours * 60 + mins;
                const startPosition = activityStart * pixelsPerMinute;
                
                // Parse duration and calculate end position
                const durationMinutes = parseDurationToMinutes(activity.duration || '15 min');
                const endPosition = startPosition + (durationMinutes * pixelsPerMinute);
                
                // Get category color and vertical offset - check both category and customCategory
                const category = activity.customCategory || activity.category || 'custom';
                const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.custom;
                const verticalOffset = CATEGORY_VERTICAL_OFFSETS[category as keyof typeof CATEGORY_VERTICAL_OFFSETS] || CATEGORY_VERTICAL_OFFSETS.custom;
                
                // Calculate line Y position (from bottom of container)
                const lineY = 144 - 24 - verticalOffset; // container height - timeline base - category offset
                
                return (
                  <g key={`duration-${activity.id || index}`}>
                    {/* Main duration line */}
                    <line
                      x1={startPosition}
                      y1={lineY}
                      x2={endPosition}
                      y2={lineY}
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.7"
                      className="duration-line hover:opacity-100 transition-opacity"
                    />
                    
                    {/* Start circle */}
                    <circle
                      cx={startPosition}
                      cy={lineY}
                      r="2"
                      fill={color}
                      opacity="0.8"
                    />
                    
                    {/* End circle */}
                    <circle
                      cx={endPosition}
                      cy={lineY}
                      r="2"
                      fill={color}
                      opacity="0.8"
                    />
                    
                    {/* Duration text (only show for longer activities to avoid clutter) */}
                    {durationMinutes >= 30 && (
                      <text
                        x={startPosition + (endPosition - startPosition) / 2}
                        y={lineY - 8}
                        textAnchor="middle"
                        fontSize="10"
                        fill={color}
                        opacity="0.9"
                        className="font-mono text-shadow"
                      >
                        {activity.duration}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hourly Time Markers (aligned with moved timeline) */}
            {Array.from({ length: 24 }, (_, i) => (
              <div key={`hour-${i}`}>
                <div 
                  className="absolute w-px h-4 bg-slate-500"
                  style={{ 
                    left: `${i * 60 * pixelsPerMinute}px`,
                    bottom: '24px'
                  }}
                />
                <div 
                  className="absolute text-xs text-slate-400 font-mono text-center"
                  style={{ 
                    left: `${i * 60 * pixelsPerMinute - 20}px`,
                    width: '40px',
                    bottom: '8px'
                  }}
                >
                  {i === 0 ? '12:00a' : i <= 11 ? `${i}:00a` : i === 12 ? '12:00p' : `${i-12}:00p`}
                </div>
              </div>
            ))}

            {/* 15-Minute Interval Markers - Half height of hourly markers */}
            {Array.from({ length: 24 * 4 }, (_, i) => {
              // Skip if this is an hourly marker (every 4th marker)
              if (i % 4 === 0) return null;
              
              return (
                <div key={`quarter-${i}`}>
                  <div 
                    className="absolute w-px h-2 bg-slate-600 opacity-60"
                    style={{ 
                      left: `${i * 15 * pixelsPerMinute}px`,
                      bottom: '24px'
                    }}
                  />
                </div>
              );
            })}

            {/* Activity Icons - Only show user-added timeline activities with DND Kit Sortable */}
            <SortableContext 
              items={timelineActivities.filter(activity => activity.scheduledTime).map(activity => `timeline-activity-${activity.id}`)}
              strategy={rectSortingStrategy}
            >
              {timelineActivities.map((activity, index) => {
                // Handle both formats: "07:00" and "7:00a"
                let hours, mins;
                if (activity.time) {
                  // Sample activities format: "07:00"
                  [hours, mins] = activity.time.split(':').map(Number);
                } else if (activity.scheduledTime) {
                  // Dropped activities format: "10:00" (24-hour) or "4:09p" (12-hour)
                  const timeStr = activity.scheduledTime;
                  
                  if (timeStr.includes('a') || timeStr.includes('p')) {
                    // 12-hour format: "4:09p"
                    const isPM = timeStr.includes('p');
                    const [hourStr, minStr] = timeStr.replace(/[ap]/, '').split(':');
                    hours = parseInt(hourStr);
                    mins = parseInt(minStr);
                    
                    // Convert to 24-hour format
                    if (isPM && hours !== 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;
                  } else {
                    // 24-hour format: "10:00"
                    [hours, mins] = timeStr.split(':').map(Number);
                  }
                  
                  // Use the actual calculated time (no override)
                } else {
                  return null; // Skip if no time info
                }
                
                const activityStart = hours * 60 + mins;
                
                // FIXED: Position relative to midnight (0:00) like original timeline
                // Uses same formula as original: (hours * 60 + mins) * pixelsPerMinute
                const position = activityStart * pixelsPerMinute;
                
                // Highlight the current activity (matches getCurrentActivity logic)
                const time = selectedTime || currentTime;
                const currentMinutes = time.getHours() * 60 + time.getMinutes();
                const isCurrent = currentActivity && activity.time === currentActivity.time;
                
                // Convert to 12-hour format
                const displayTime = hours === 0 ? '12:00a' : 
                                  hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                                  hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                                  `${hours-12}:${mins.toString().padStart(2, '0')}p`;
                
                // Use the appropriate icon and name
                const activityIcon = activity.icon || '⭐';
                const activityName = activity.name || activity.title || 'Activity';
                
                const isDroppedActivity = !!activity.scheduledTime;
                const isActivityFaded = fadedActivities.has(activity.id);
                
                // Only make dropped activities (user-placed) draggable to edit zone using DND Kit
                if (isDroppedActivity && activity.id) {
                  return (
                    <SortableTimelineActivity
                      key={`timeline-activity-${activity.id}-${index}`}
                      activity={activity}
                      index={index}
                      position={position}
                      displayTime={displayTime}
                      activityIcon={activityIcon}
                      activityName={activityName}
                      isDroppedActivity={isDroppedActivity}
                      isActivityFaded={isActivityFaded}
                      isCurrent={isCurrent}
                      onContextMenu={(e, activity) => {
                        e.preventDefault();
                        const menuData = {
                          visible: true,
                          x: e.clientX,
                          y: e.clientY,
                          activity: activity
                        };
                        setContextMenu(menuData);
                      }}
                    />
                  );
                } else {
                  // Return non-draggable content for sample activities
                  return (
                    <div key={`${activity.id || activity.time}-${index}`}>
                      <div
                        className="absolute flex flex-col items-center"
                        style={{ 
                          left: `${position}px`, // No offset - use CSS transform for centering
                          top: '6px',
                          transform: 'translateX(-50%)', // CSS centering - more reliable
                        }}
                      >
                        {/* Activity Time (above icon) */}
                        <div className="relative text-xs text-slate-300 font-mono mb-1 whitespace-nowrap">
                          {displayTime}
                        </div>
                        
                        {/* Activity Icon */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black">
                            {(activityIcon.startsWith('/') || activityIcon.startsWith('data:')) ? (
                              <img 
                                src={activityIcon} 
                                alt={activityName}
                                className="w-full h-full object-cover rounded-full"
                                draggable={false}
                              />
                            ) : (
                              <span className="text-2xl">{activityIcon}</span>
                            )}
                          </div>
                          {/* Underline highlight for current activity */}
                          {isCurrent && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-400 shadow-lg shadow-blue-400/50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </SortableContext>
          </div>
          </div>

          {/* Context Menu - Portal to document body for proper rendering */}
          {contextMenu?.visible && (
            <div>
              <div 
                className="fixed bg-slate-800 border-2 border-red-500 rounded-lg shadow-xl min-w-40"
                style={{ 
                  left: `${contextMenu.x}px`, 
                  top: `${contextMenu.y - 60}px`, // Position above cursor
                  zIndex: 9999 // Ensure it's above everything
                }}
              >
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 hover:text-blue-300 transition-colors flex items-center gap-2"
                    onClick={() => {
                      if (onActivitySetRepeat) {
                        onActivitySetRepeat(contextMenu.activity, { x: contextMenu.x, y: contextMenu.y });
                      }
                      setContextMenu(null);
                    }}
                  >
                    <span className="text-blue-500">🔄</span>
                    Set Repeat
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-slate-700 hover:text-yellow-300 transition-colors flex items-center gap-2"
                    onClick={() => {
                      if (onActivitySetAlert) {
                        onActivitySetAlert(contextMenu.activity, { x: contextMenu.x, y: contextMenu.y });
                      }
                      setContextMenu(null);
                    }}
                  >
                    <span className="text-yellow-500">🔔</span>
                    Set Alerts
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors flex items-center gap-2"
                    onClick={() => {
                      if (onActivityRemove) {
                        onActivityRemove(contextMenu.activity);
                      }
                      setContextMenu(null);
                    }}
                  >
                    <span className="text-red-500">⊗</span>
                    Remove from Timeline
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Zoom Control with NOW button */}
          <div className="mt-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>Timeline Zoom</span>
              <div className="flex items-center justify-center space-x-1">
              {/* Zoom buttons 1-8 */}
              {Array.from({ length: 8 }, (_, i) => i + 1).map((level) => (
                <button
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-all duration-200 ${
                    zoomLevel === level
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                      : `${theme?.buttonSecondary || 'bg-slate-600 text-slate-300 hover:bg-slate-500 hover:text-white'}`
                  }`}
                >
                  {level}
                </button>
              ))}
              {/* NOW button - same height as zoom buttons */}
              <button
                onClick={resetToNow}
                className={`px-3 h-7 ${theme?.buttonPrimary || 'bg-blue-600 hover:bg-blue-700 text-white'} rounded text-xs font-semibold transition-colors ml-1`}
              >
                NOW
              </button>
            </div>
            <span className={`text-xs ${theme?.timelineText || 'text-slate-300'}`}>{zoomLevel}x ({pixelsPerMinute}px/min)</span>
          </div>

          {/* Duration Legend - Only show if there are timeline activities */}
          {timelineActivities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>Duration Colors</span>
                <span className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>
                  {timelineActivities.length} activities
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {/* Show legend for categories that are actually present in timeline activities */}
                {Object.entries(CATEGORY_COLORS)
                  .filter(([category]) => 
                    timelineActivities.some(activity => 
                      (activity.category || 'custom') === category
                    )
                  )
                  .slice(0, 6) // Limit to 6 categories to avoid clutter
                  .map(([category, color]) => (
                    <div key={category} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-0.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className={`${theme?.cardSubtext || 'text-slate-400'} capitalize`}>
                        {category.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                {/* Show +more indicator if there are additional categories */}
                {Object.keys(CATEGORY_COLORS).filter(category => 
                  timelineActivities.some(activity => 
                    (activity.category || 'custom') === category
                  )
                ).length > 6 && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 rounded-full bg-slate-500" />
                    <span className={`${theme?.cardSubtext || 'text-slate-400'}`}>
                      +{Object.keys(CATEGORY_COLORS).filter(category => 
                        timelineActivities.some(activity => 
                          (activity.category || 'custom') === category
                        )
                      ).length - 6} more
                    </span>
                  </div>
                )}
              </div>
              <div className={`text-xs ${theme?.cardSubtext || 'text-slate-400'} mt-1 italic`}>
                Lines show activity duration and overlap
              </div>
            </div>
          )}
          
          </div>

        </div>
      </div>
    </div>
  );
};

export default GamelikeTimelineDndKit;