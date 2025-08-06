import React, { useState, useEffect, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ThemeConfig } from '@/lib/theme-config';

interface GamelikeTimelineProps {
  theme?: ThemeConfig;
  onActivityAdd?: (activity: any, timeSlot: string) => void;
  onActivityRemove?: (activity: any) => void;
  onActivitySetRepeat?: (activity: any, position: { x: number; y: number }) => void;
  isDndActive?: boolean;
  timelineActivities?: any[];
  onDragEnd?: (result: any) => void;
  hideCurrentActivity?: boolean;
  onTimeChange?: (currentTime: Date, selectedTime: Date | null) => void;
  onActivitiesChange?: (activities: any[]) => void;
  isMobileView?: boolean;
}

const GamelikeTimeline = ({ theme, onActivityAdd, onActivityRemove, onActivitySetRepeat, isDndActive = false, timelineActivities = [], onDragEnd, hideCurrentActivity = false, onTimeChange, onActivitiesChange, isMobileView = false }: GamelikeTimelineProps) => {
  // Fix Next.js SSR/CSR mismatch for React Beautiful DND
  if (typeof window === 'undefined') {
    return (
      <div className={`${theme?.timelineBackground || 'bg-slate-800'} rounded-xl p-6 border ${theme?.timelineBorder || 'border-slate-700'}`}>
        <div className="text-center py-8">
          <div className="text-xl font-semibold text-white">Loading Timeline...</div>
        </div>
      </div>
    );
  }

  const [currentTime, setCurrentTime] = useState(() => new Date()); // Initialize with current time
  const [liveTime, setLiveTime] = useState(() => new Date()); // For live timestamp display
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
  }, [currentTime, selectedTime]);

  // Notify parent component of all available activities (only timeline activities)
  useEffect(() => {
    if (onActivitiesChange) {
      onActivitiesChange(timelineActivities);
    }
  }, [timelineActivities]);

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
  }, [zoomLevel, pixelsPerMinute, selectedTime, isPaused, lastZoomOffset]);

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

  // Robust drag state coordination with React Beautiful DND
  useEffect(() => {
    if (isDndActive && isDragging) {
      handleDragEnd(); // Use the proper cleanup function
    }
  }, [isDndActive, isDragging]);

  // Monitor React Beautiful DND completion and force cleanup if timeline drag state persists
  useEffect(() => {
    // Detect React Beautiful DND completion by monitoring DOM state changes
    const checkDndCompletion = () => {
      const isDndDragging = document.querySelector('[data-rbd-dragging]');
      const isDndDropAnimating = document.querySelector('[data-rbd-drop-animation]');
      
      // If no DND elements are active but timeline is still dragging, force cleanup
      if (!isDndDragging && !isDndDropAnimating && isDragging && !isDndActive) {
        handleDragEnd();
      }
    };
    
    // Check immediately and after a short delay
    const timeoutId = setTimeout(checkDndCompletion, 100);
    
    return () => clearTimeout(timeoutId);
  }, [timelineActivities.length]); // Trigger when timeline activities change (drop occurred)

  // Enhanced global event listener for robust cleanup
  useEffect(() => {
    const forceCleanupDragState = () => {
      if (isDragging) {
        const dragMetadata = (window as any).timelineDragMetadata;
        const isDndActive = document.querySelector('[data-rbd-dragging], [data-rbd-drop-animation]');
        
        // If React Beautiful DND is active or drag has been going too long, force cleanup
        if (isDndActive || (dragMetadata && Date.now() - dragMetadata.startTime > 2000)) {
            handleDragEnd();
        }
      }
    };

    // Listen for multiple events that can indicate React Beautiful DND completion
    document.addEventListener('mouseup', forceCleanupDragState);
    document.addEventListener('touchend', forceCleanupDragState);
    document.addEventListener('dragend', forceCleanupDragState);
    
    // Safety interval to catch any missed cleanup
    const intervalId = setInterval(() => {
      if (isDragging) {
        const dragMetadata = (window as any).timelineDragMetadata;
        if (dragMetadata && Date.now() - dragMetadata.startTime > 3000) {
          handleDragEnd();
        }
      }
    }, 1000);

    return () => {
      document.removeEventListener('mouseup', forceCleanupDragState);
      document.removeEventListener('touchend', forceCleanupDragState);
      document.removeEventListener('dragend', forceCleanupDragState);
      clearInterval(intervalId);
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
  }, [timelineActivities]); // Only depend on timelineActivities to avoid re-running when activities fade

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

  // Enhanced drag start with React Beautiful DND coordination
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Enhanced DND detection - check for draggable elements
    const target = e.target as HTMLElement;
    const isDraggableElement = target.closest('[data-rbd-draggable-context-id], [data-rbd-draggable-id]');
    
    // Don't start timeline drag if React Beautiful DND is active OR if clicking on draggable elements
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
    
    // Additional safety check - if React Beautiful DND started, abort immediately
    const dragMetadata = (window as any).timelineDragMetadata;
    if (dragMetadata && Date.now() - dragMetadata.startTime > 100) {
      // If drag has been going for >100ms and React Beautiful DND might be interfering
      const isDndInterference = document.querySelector('[data-rbd-dragging]');
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

  // Activity drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    if (!isDragging && e.dataTransfer.types.includes('application/json')) { 
      // Only allow drops when not dragging timeline and we have activity data
      setIsDropTarget(true);
      
      // Calculate drop position for visual indicator
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        setDropIndicatorPosition(relativeX);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    // Only hide drop indicator if we're leaving the timeline container entirely
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsDropTarget(false);
      setDropIndicatorPosition(null);
    }
  };


  const resetToNow = () => {
    setCurrentTime(new Date()); // Update to actual current time immediately
    setSelectedTime(null);
    setScrollOffset(0);
    setIsPaused(false);
  };


  const currentActivity = getCurrentActivity();
  const displayTime = selectedTime || currentTime;

  return (
    <div className={`${theme?.timelineBackground || 'bg-slate-800'} rounded-xl p-6 border ${theme?.timelineBorder || 'border-slate-700'}`}>
      {/* Header with title and status */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-semibold ${theme?.timelineText || 'text-white'}`}>Daily Timeline</h2>
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
          {/* Timeline Container with React Beautiful DND Drop Zone */}
          <Droppable droppableId="timeline-drop-zone" type="ACTIVITY">
            {(provided, snapshot) => {
              
              // Clear drop indicators when drag ends
              useEffect(() => {
                if (!snapshot.isDraggingOver && isDropTarget) {
                  // Small delay to ensure drop is processed first
                  setTimeout(() => {
                    setIsDropTarget(false);
                    setDropIndicatorPosition(null);
                    setDraggedActivityId(null);
                    setLastDisplayedDropTime(null);
                  }, 100);
                }
              }, [snapshot.isDraggingOver]);
              
              // Handle React Beautiful DND drops with precise positioning
              const handleReactDNDDrop = (result: any) => {
                const activityId = result.draggableId || draggedActivityId;
                
                if (result.destination?.droppableId === 'timeline-drop-zone' && onActivityAdd && isDropTarget && activityId) {
                  
                  // FIXED: Use the displayed drop time for accurate placement instead of recalculating from mouse position
                  let preciseTimeSlot: string;
                  
                  if (lastDisplayedDropTime) {
                    // Convert 12-hour format to 24-hour format for database consistency
                    const isPM = lastDisplayedDropTime.includes('p');
                    const timeStr = lastDisplayedDropTime.replace(/[ap]/, '');
                    const [hourStr, minStr] = timeStr.split(':');
                    let hours = parseInt(hourStr);
                    const mins = parseInt(minStr);
                    
                    // Convert to 24-hour format
                    if (isPM && hours !== 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;
                    
                    preciseTimeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                  } else {
                    // Fallback: Calculate from position if no displayed time available
                    if (containerRef.current && dropIndicatorPosition !== null) {
                      const centerX = containerRef.current.clientWidth / 2;
                      const pixelOffsetFromCenter = dropIndicatorPosition - centerX;
                      const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
                      
                      // Use the same calculation as timeline scrolling for consistency
                      const baseTime = selectedTime || currentTime;
                      const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
                      const targetMinutes = baseMinutes + timeOffsetMinutes;
                      
                      // Normalize to 24-hour format
                      let normalizedMinutes = targetMinutes;
                      while (normalizedMinutes < 0) normalizedMinutes += 1440;
                      while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
                      
                      // Round to nearest 5-minute interval for cleaner placement
                      normalizedMinutes = Math.round(normalizedMinutes / 5) * 5;
                      
                      // Convert to time string (24-hour format for consistency)
                      let hours = Math.floor(normalizedMinutes / 60);
                      let mins = Math.round(normalizedMinutes % 60);
                      
                      // Handle mins = 60 case (carry over to next hour)
                      if (mins === 60) {
                        mins = 0;
                        hours = (hours + 1) % 24;
                      }
                      
                      preciseTimeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                    } else {
                      // Final fallback to current time
                      const now = new Date();
                      preciseTimeSlot = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    }
                  }
                  
                  // Database-first activity lookup - Enhanced ID matching for timeline rescheduling
                  const matchesActivityId = (storedActivity: any, targetId: string) => {
                    if (!storedActivity) return false;
                    const storedId = storedActivity.id || storedActivity.name?.toLowerCase().replace(/\s+/g, '-');
                    return storedId === targetId || 
                           storedId?.includes(targetId) || 
                           targetId?.includes(storedId) ||
                           storedActivity.title?.toLowerCase().replace(/\s+/g, '-') === targetId;
                  };
                  
                  // Get activity data from processed database activities (no async calls)
                  let activityData;
                  const preferenceAppliedActivity = (window as any).currentDraggedActivity;
                  const databaseActivities = (window as any).databaseActivities || [];
                  
                  
                  if (preferenceAppliedActivity && matchesActivityId(preferenceAppliedActivity, activityId)) {
                    activityData = preferenceAppliedActivity;
                  } else {
                    // Use processed database activities from grid
                    const dbActivity = databaseActivities.find((a: any) => a.id === activityId);
                    if (dbActivity) {
                      activityData = {
                        id: dbActivity.id,
                        title: dbActivity.title,
                        icon: dbActivity.icon, // Already processed with preferences
                        category: dbActivity.category,
                        points: dbActivity.points,
                        rarity: dbActivity.rarity,
                        duration: dbActivity.duration
                      };
                    }
                  }
                  
                  // Final fallback if database activities not available
                  if (!activityData) {
                    activityData = { id: activityId, title: 'Activity', icon: '⭐', category: 'custom', points: 25, rarity: 'common', duration: '15 min' };
                  }
                  
                  
                  // Call onActivityAdd with full activity data and precise time
                  onActivityAdd(activityData, preciseTimeSlot);
                  
                  // Clear drop indicators and drag data
                  setIsDropTarget(false);
                  setDropIndicatorPosition(null);
                  setDraggedActivityId(null);
                  setLastDisplayedDropTime(null); // Clear stored drop time
                  
                  // Clear the stored drag data to prevent stale data issues
                  (window as any).currentDraggedActivity = null;
                }
              };
              
              // Call handleReactDNDDrop when onDragEnd is available
              useEffect(() => {
                if (onDragEnd && !snapshot.isDraggingOver && isDropTarget && draggedActivityId) {
                  const mockResult = {
                    draggableId: draggedActivityId,
                    destination: { droppableId: 'timeline-drop-zone' }
                  };
                  handleReactDNDDrop(mockResult);
                }
              }, [snapshot.isDraggingOver, onDragEnd, draggedActivityId, isDropTarget]);
              
              // Legacy detailed function - kept as backup (logging removed for production)
              const handleReactDNDDropDetailed = (result: any) => {
                const activityId = result.draggableId || draggedActivityId;
                const dropKey = `${activityId}-${Math.round(dropIndicatorPosition || 0)}`;
                
                // Prevent duplicate processing
                if (lastProcessedDrop === dropKey) {
                  return;
                }
                
                if (result.destination?.droppableId === 'timeline-drop-zone' && onActivityAdd && isDropTarget && dropIndicatorPosition !== null && activityId) {
                  setLastProcessedDrop(dropKey);
                  
                  // Calculate the exact time for the drop position
                  if (containerRef.current) {
                    const centerX = containerRef.current.clientWidth / 2;
                    const pixelOffsetFromCenter = dropIndicatorPosition - centerX;
                    const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
                    
                    // Calculate the absolute time position on the timeline
                    const timelinePos = getTimelinePosition();
                    const absolutePixelPosition = dropIndicatorPosition - timelinePos;
                    const targetMinutes = absolutePixelPosition / pixelsPerMinute;
                    
                    // Normalize to 24-hour format
                    let normalizedMinutes = targetMinutes;
                    while (normalizedMinutes < 0) normalizedMinutes += 1440;
                    while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
                    
                    // Convert to time string
                    let hours = Math.floor(normalizedMinutes / 60);
                    let mins = Math.round(normalizedMinutes % 60);
                    
                    // Handle mins = 60 case (carry over to next hour)
                    if (mins === 60) {
                      mins = 0;
                      hours = (hours + 1) % 24;
                    }
                    
                    const timeSlot = hours === 0 ? `12:${mins.toString().padStart(2, '0')}a` : 
                                    hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                                    hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                                    `${hours-12}:${mins.toString().padStart(2, '0')}p`;
                    
                    // Database-first activity lookup - Enhanced ID matching for timeline rescheduling
                    const matchesActivityId2 = (storedActivity: any, targetId: string) => {
                      if (!storedActivity) return false;
                      const storedId = storedActivity.id || storedActivity.name?.toLowerCase().replace(/\s+/g, '-');
                      return storedId === targetId || 
                             storedId?.includes(targetId) || 
                             targetId?.includes(storedId) ||
                             storedActivity.title?.toLowerCase().replace(/\s+/g, '-') === targetId;
                    };
                    
                    // Database-first activity lookup
                    let activity;
                    const preferenceAppliedActivity2 = (window as any).currentDraggedActivity;
                    const databaseActivities2 = (window as any).databaseActivities || [];
                    
                    if (preferenceAppliedActivity2 && matchesActivityId2(preferenceAppliedActivity2, activityId)) {
                      activity = preferenceAppliedActivity2;
                    } else {
                      // Use processed database activities from grid
                      const dbActivity = databaseActivities2.find((a: any) => a.id === activityId);
                      if (dbActivity) {
                        activity = {
                          id: dbActivity.id,
                          title: dbActivity.title,
                          icon: dbActivity.icon, // Already processed with preferences
                          category: dbActivity.category,
                          points: dbActivity.points,
                          rarity: dbActivity.rarity,
                          duration: dbActivity.duration,
                          difficulty: dbActivity.difficulty || 1
                        };
                      }
                    }
                    
                    // Final fallback if database activities not available
                    if (!activity) {
                      activity = { id: activityId, title: 'Activity', icon: '⭐', category: 'custom', points: 25, rarity: 'common', duration: '15 min', difficulty: 1 };
                    }
                    
                    if (activity) {
                      onActivityAdd(activity, timeSlot);
                      
                      // Clear all drop-related states
                      setDraggedActivityId(null);
                      setIsDropTarget(false);
                      setDropIndicatorPosition(null);
                      
                      // Clear the stored drag data
                      (window as any).currentDraggedActivity = null;
                    }
                  }
                }
              };
              
              // Only process actual drops, not when leaving timeline
              // Removed auto-drop useEffect that was causing unwanted drops when dragging away
              
              return (
                <div 
                  {...provided.droppableProps}
                  ref={(el) => {
                    provided.innerRef(el);
                    (containerRef as any).current = el;
                  }}
                  className={`relative bg-black border-2 ${
                    snapshot.isDraggingOver ? 'border-green-400 bg-green-500/20 shadow-lg shadow-green-400/30' : 
                    isDropTarget ? 'border-green-400 bg-green-500/10' : 'border-slate-700'
                  } rounded-lg h-36 overflow-hidden select-none ${isDragging && !isDndActive ? 'cursor-grabbing' : isDndActive ? 'cursor-pointer' : 'cursor-grab'} ${hideCurrentActivity ? '' : 'ml-4'}`}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none',
                    minHeight: '144px' // Increased height for better activity spacing and label positioning
                  }}
                  // Add mouse move handler for React Beautiful DND drop indicator
                  onMouseMove={(e) => {
                    if (snapshot.isDraggingOver && containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      const relativeX = e.clientX - rect.left;
                      setDropIndicatorPosition(relativeX);
                      setIsDropTarget(true);
                      
                      // Store the dragged activity ID
                      if (snapshot.draggingOverWith && !draggedActivityId) {
                        setDraggedActivityId(snapshot.draggingOverWith);
                        setLastProcessedDrop(null); // Clear previous drop
                      }
                      
                      // Calculate and update drop time in the dragging card
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
                      
                      // Update the drop time in the dragging card (with retry for timing issues)
                      if (snapshot.draggingOverWith) {
                        const updateDropTime = () => {
                          // Try updating grid activity drop time first
                          let dropTimeElement = document.getElementById(`drop-time-${snapshot.draggingOverWith}`);
                          if (dropTimeElement) {
                            dropTimeElement.textContent = timeString;
                            return true;
                          }
                          
                          // If not found, try timeline activity drop time format
                          dropTimeElement = document.getElementById(`drop-time-timeline-activity-${snapshot.draggingOverWith.replace('timeline-activity-', '')}`);
                          if (dropTimeElement) {
                            dropTimeElement.textContent = timeString;
                            return true;
                          }
                          
                          // Also try the full timeline activity ID format
                          dropTimeElement = document.getElementById(`drop-time-${snapshot.draggingOverWith}`);
                          if (dropTimeElement) {
                            dropTimeElement.textContent = timeString;
                            return true;
                          }
                          
                          return false;
                        };
                        
                        // Try immediate update, then retry after small delay if element not found
                        if (!updateDropTime()) {
                          setTimeout(updateDropTime, 10);
                        }
                      }
                    }
                    // Call original drag handler if not in DND mode AND actually dragging timeline
                    if (!snapshot.isDraggingOver && isDragging) {
                      handleDragMove(e);
                    }
                  }}
                  onMouseLeave={() => {
                    // Always clear drop states when leaving timeline, regardless of drag mode
                    setIsDropTarget(false);
                    setDropIndicatorPosition(null);
                    setDraggedActivityId(null);
                    setLastDisplayedDropTime(null);
                    
                    // Clear timeline drag state to prevent erratic movement after React Beautiful DND
                    setIsDragging(false);
                    
                    // CRITICAL FIX: Reset selectedTime to prevent timeline jumping after React Beautiful DND
                    // This ensures mouse movements after drop don't use the drop position for calculations
                    if (snapshot.isDraggingOver || isDndActive) {
                      setSelectedTime(null);
                    }
                    
                    // Only call handleDragEnd for non-React-Beautiful-DND drags
                    if (!snapshot.isDraggingOver && isDragging) {
                      handleDragEnd();
                    }
                  }}
                {...(!snapshot.isDraggingOver && !isDndActive && {
                  onMouseDown: handleDragStart,
                  onMouseUp: handleDragEnd,
                  onTouchStart: handleDragStart,
                  onTouchMove: handleDragMove,
                  onTouchEnd: handleDragEnd
                })}
              >
            
            {/* Drop Zone Indicator - Shows when dragging over with React Beautiful DND */}
            {snapshot.isDraggingOver && !isDropTarget && (
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
                  {(() => {
                    // Calculate the exact time for this drop position using same logic as timeline scrolling
                    if (containerRef.current && dropIndicatorPosition !== null) {
                      const centerX = containerRef.current.clientWidth / 2;
                      const pixelOffsetFromCenter = dropIndicatorPosition - centerX;
                      const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
                      
                      // Use the same calculation as timeline scrolling for consistency
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
                      
                      // Store this calculated time for accurate drop placement
                      setLastDisplayedDropTime(timeString);
                      
                      return timeString;
                    }
                    return '';
                  })()}
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

              {/* Activity Icons - Only show user-added timeline activities */}
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
                
                // Debug logging removed - drag and drop fix is working correctly
                const isDroppedActivity = !!activity.scheduledTime;
                const isActivityFaded = fadedActivities.has(activity.id);
                
                // Only make dropped activities (user-placed) draggable to edit zone
                const activityContent = (
                  <div
                    className="absolute flex flex-col items-center"
                    style={{ 
                      left: `${position}px`, // No offset - use CSS transform for centering
                      top: '6px',
                      transform: 'translateX(-50%)', // CSS centering - more reliable
                    }}
                  >
                    {/* Activity Time (above icon) */}
                    <div className="text-xs text-slate-300 font-mono mb-1 whitespace-nowrap">
                      {displayTime}
                    </div>
                    
                    {/* Activity Icon */}
                    <div className="relative">
                      <div className={`transition-all duration-300 overflow-hidden ${
                        isDroppedActivity 
                          ? isActivityFaded 
                            ? 'w-12 h-12 flex items-center justify-center cursor-move' // Faded styling - no rounded-full clipping
                            : 'w-12 h-12 rounded-full flex items-center justify-center bg-green-600 ring-2 ring-green-400 shadow-lg shadow-green-400/30 cursor-move' // Fresh green styling
                          : 'w-12 h-12 rounded-full flex items-center justify-center bg-black' // Default styling for non-dropped activities
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
                      
                      {/* Tactical Crosshair Target - Right-click menu indicator */}
                      {isDroppedActivity && (
                        <div 
                          className="absolute -top-1 -right-1 w-4 h-4 bg-transparent flex items-center justify-center cursor-pointer group"
                          onContextMenu={(e) => {
                            e.preventDefault();
                            const menuData = {
                              visible: true,
                              x: e.clientX,
                              y: e.clientY,
                              activity: activity
                            };
                            setContextMenu(menuData);
                          }}
                          title="Right-click for actions"
                        >
                          <div className="text-red-500 text-xs font-bold leading-none hover:text-red-400 transition-colors">⊕</div>
                          
                          {/* Hover tooltip */}
                          <div className="absolute left-6 top-0 bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Right-click for menu
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Activity Name (below icon for dropped activities) */}
                    {isDroppedActivity && (
                      <div className="text-xs text-green-300 font-medium mt-1 whitespace-nowrap max-w-20 truncate">
                        {activityName}
                      </div>
                    )}
                  </div>
                );

                // Wrap user-placed activities (timeline activities) in Draggable for edit zone
                if (isDroppedActivity && activity.id) {
                  return (
                    <Draggable 
                      key={`timeline-activity-${activity.id}-${index}`}
                      draggableId={`timeline-activity-${activity.id}`}
                      index={index}
                      type="timeline-activity"
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            // Override position for timeline placement
                            position: 'absolute',
                            left: `${position}px`,
                            top: '6px',
                            transform: snapshot.isDragging 
                              ? `${provided.draggableProps.style?.transform || ''} translateX(-50%)` 
                              : 'translateX(-50%)'
                          }}
                          className={`flex flex-col items-center ${
                            snapshot.isDragging ? 'z-50 rotate-6 scale-110' : ''
                          }`}
                        >
                          {/* Enhanced drop time popup when dragging timeline activities */}
                          {snapshot.isDragging && (
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
                          <div className="text-xs text-slate-300 font-mono mb-1 whitespace-nowrap">
                            {displayTime}
                          </div>
                          
                          {/* Activity Icon */}
                          <div className="relative">
                            <div className={`transition-all duration-300 overflow-hidden ${
                              snapshot.isDragging 
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
                            
                            {/* Tactical Crosshair Target - Right-click menu indicator */}
                            {isDroppedActivity && (
                              <div 
                                className="absolute -top-1 -right-1 w-4 h-4 bg-transparent flex items-center justify-center cursor-pointer group"
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  const menuData = {
                                    visible: true,
                                    x: e.clientX,
                                    y: e.clientY,
                                    activity: activity
                                  };
                                  setContextMenu(menuData);
                                }}
                                title="Right-click for actions"
                              >
                                <div className="text-red-500 text-xs font-bold leading-none hover:text-red-400 transition-colors">⊕</div>
                                
                                {/* Hover tooltip */}
                                <div className="absolute left-6 top-0 bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                  Right-click for menu
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Activity Name (below icon for dropped activities) */}
                          <div className="text-xs text-green-300 font-medium mt-1 whitespace-nowrap max-w-20 truncate">
                            {activityName}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                } else {
                  // Return non-draggable content for sample activities
                  return (
                    <div key={`${activity.id || activity.time}-${index}`}>
                      {activityContent}
                    </div>
                  );
                }
              })}
            </div>
            {provided.placeholder}
            </div>
              );
            }}
          </Droppable>

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
          </div>

        </div>
      </div>
    </div>
  );
};

export default GamelikeTimeline;