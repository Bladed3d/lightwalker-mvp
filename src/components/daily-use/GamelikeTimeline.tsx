import React, { useState, useEffect, useRef } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { ThemeConfig } from '@/lib/theme-config';

interface GamelikeTimelineProps {
  theme?: ThemeConfig;
  onActivityAdd?: (activity: any, timeSlot: string) => void;
  isDndActive?: boolean;
  timelineActivities?: any[];
  onDragEnd?: (result: any) => void;
}

const GamelikeTimeline = ({ theme, onActivityAdd, isDndActive = false, timelineActivities = [], onDragEnd }: GamelikeTimelineProps) => {
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
  const [zoomLevel, setZoomLevel] = useState(4); // 1-8 zoom levels (pixels per minute)
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [dropIndicatorPosition, setDropIndicatorPosition] = useState<number | null>(null);
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [lastProcessedDrop, setLastProcessedDrop] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // COORDINATE SYSTEM FOUNDATION: 
  // pixelsPerMinute is the key conversion factor between time and screen position
  // This must be consistent across ALL positioning and drag calculations
  const pixelsPerMinute = zoomLevel;

  // Sample activities for the full 24-hour day
  const activities = [
    { time: '00:30', name: 'Night Rest', icon: '🌙', duration: 30, points: 5 },
    { time: '01:00', name: 'Deep Sleep', icon: '😴', duration: 360, points: 50 },
    { time: '07:00', name: 'Wake', icon: '☀️', duration: 15, points: 10 },
    { time: '07:15', name: 'Meditate', icon: '🧘', duration: 30, points: 25 },
    { time: '07:45', name: 'Run', icon: '🏃', duration: 45, points: 40 },
    { time: '08:30', name: 'Bath', icon: '🚿', duration: 20, points: 15 },
    { time: '08:50', name: 'Breakfast', icon: '🍳', duration: 30, points: 20 },
    { time: '09:20', name: 'Read', icon: '📖', duration: 40, points: 30 },
    { time: '10:00', name: 'Deep Work', icon: '💻', duration: 120, points: 80 },
    { time: '12:00', name: 'Lunch', icon: '🥗', duration: 45, points: 25 },
    { time: '12:45', name: 'Walk', icon: '🚶', duration: 30, points: 20 },
    { time: '13:15', name: 'Create', icon: '🎨', duration: 90, points: 60 },
    { time: '14:45', name: 'Connect', icon: '👥', duration: 60, points: 35 },
    { time: '15:45', name: 'Recharge', icon: '☕', duration: 15, points: 10 },
    { time: '16:00', name: 'Innovate', icon: '💡', duration: 90, points: 65 },
    { time: '17:30', name: 'Train', icon: '💪', duration: 45, points: 40 },
    { time: '18:15', name: 'Nourish', icon: '🍽️', duration: 45, points: 25 },
    { time: '19:00', name: 'Bond', icon: '👨‍👩‍👧', duration: 90, points: 50 },
    { time: '20:30', name: 'Learn', icon: '📚', duration: 60, points: 35 },
    { time: '21:30', name: 'Reflect', icon: '✍️', duration: 30, points: 20 },
    { time: '22:00', name: 'Wind Down', icon: '🌅', duration: 60, points: 15 },
    { time: '23:00', name: 'Prepare Sleep', icon: '🛏️', duration: 60, points: 20 },
    { time: '23:30', name: 'Night Reading', icon: '📚', duration: 30, points: 10 }
  ];

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

  // Reset timeline position when zoom level changes to ensure proper centering
  useEffect(() => {
    setScrollOffset(0);
    setSelectedTime(null);
    setIsPaused(false);
    console.log('🔄 Timeline reset due to zoom change:', zoomLevel + 'x');
  }, [zoomLevel]);

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

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    // WORKING DRAG START (from working code)
    setDragStartX(clientX - scrollOffset);
    setIsPaused(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
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
  };

  // Activity drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔄 Timeline dragOver:', {
      isDragging,
      dataTypes: Array.from(e.dataTransfer.types),
      hasData: e.dataTransfer.types.includes('application/json')
    });
    
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
    
    console.log('➡️ Timeline dragEnter:', {
      isDragging,
      dataTypes: Array.from(e.dataTransfer.types)
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('⬅️ Timeline dragLeave');
    
    // Only hide drop indicator if we're leaving the timeline container entirely
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setIsDropTarget(false);
      setDropIndicatorPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 Timeline drop:', {
      isDragging,
      dataTypes: Array.from(e.dataTransfer.types),
      onActivityAdd: !!onActivityAdd
    });
    
    setIsDropTarget(false);
    setDropIndicatorPosition(null);
    
    if (!onActivityAdd || isDragging) {
      console.log('❌ Drop rejected: no callback or timeline dragging');
      return;
    }
    
    try {
      const draggedData = e.dataTransfer.getData('application/json');
      console.log('📦 Dropped data:', draggedData);
      
      if (!draggedData) {
        console.log('❌ No drag data found');
        return;
      }
      
      const activity = JSON.parse(draggedData);
      console.log('✅ Parsed activity:', activity);
      
      // Calculate the time position where the activity was dropped
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const centerX = containerRef.current.clientWidth / 2;
        
        // Calculate what time this X position represents
        const timelinePosition = getTimelinePosition();
        const pixelOffsetFromCenter = relativeX - centerX;
        const timeOffsetMinutes = -pixelOffsetFromCenter / pixelsPerMinute;
        
        const baseTime = selectedTime || currentTime;
        const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
        const targetMinutes = baseMinutes + timeOffsetMinutes;
        
        // Normalize to 24-hour format
        let normalizedMinutes = targetMinutes;
        while (normalizedMinutes < 0) normalizedMinutes += 1440;
        while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
        
        // Convert to time string
        const hours = Math.floor(normalizedMinutes / 60);
        const mins = Math.round(normalizedMinutes % 60);
        const timeSlot = hours === 0 ? '12:00a' : 
                        hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                        hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                        `${hours-12}:${mins.toString().padStart(2, '0')}p`;
        
        console.log('🕐 Calculated time slot:', timeSlot);
        onActivityAdd(activity, timeSlot);
      }
    } catch (error) {
      console.error('❌ Error handling dropped activity:', error);
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
      {/* Header with NOW button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${theme?.timelineText || 'text-white'}`}>Daily Timeline</h2>
        <button
          onClick={resetToNow}
          className={`px-4 py-2 ${theme?.buttonPrimary || 'bg-blue-600 hover:bg-blue-700 text-white'} rounded-lg font-medium transition-colors`}
        >
          NOW
        </button>
      </div>

      {/* Main Layout: Left Panel + Timeline */}
      <div className="flex gap-6">
        
        {/* Left Panel - Current Activity */}
        <div className="w-48 flex-shrink-0">
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

        {/* Timeline Section */}
        <div className="flex-1">
          {/* Timeline Container with React Beautiful DND Drop Zone */}
          <Droppable droppableId="timeline-drop-zone" type="ACTIVITY">
            {(provided, snapshot) => {
              // Only log when dragging state changes
              if (snapshot.isDraggingOver) {
                console.log('✅ Timeline: DRAGGING OVER', snapshot.draggingOverWith);
              }
              
              // Clear drop indicators when drag ends
              useEffect(() => {
                if (!snapshot.isDraggingOver && isDropTarget) {
                  // Small delay to ensure drop is processed first
                  setTimeout(() => {
                    setIsDropTarget(false);
                    setDropIndicatorPosition(null);
                    setDraggedActivityId(null);
                    console.log('🧹 Cleared drop indicators after drag end');
                  }, 100);
                }
              }, [snapshot.isDraggingOver]);
              
              // Handle React Beautiful DND drops with precise positioning
              const handleReactDNDDrop = (result: any) => {
                const activityId = result.draggableId || draggedActivityId;
                const dropKey = `${activityId}-${Math.round(dropIndicatorPosition || 0)}`;
                
                // Prevent duplicate processing
                if (lastProcessedDrop === dropKey) {
                  console.log('🚫 Skipping duplicate drop processing for:', dropKey);
                  return;
                }
                
                console.log('🎯 Timeline React DND drop attempt:', {
                  hasDestination: !!result.destination,
                  droppableId: result.destination?.droppableId,
                  hasOnActivityAdd: !!onActivityAdd,
                  isDropTarget,
                  dropIndicatorPosition,
                  activityId,
                  draggedActivityId,
                  dropKey
                });
                
                if (result.destination?.droppableId === 'timeline-drop-zone' && onActivityAdd && isDropTarget && dropIndicatorPosition !== null && activityId) {
                  setLastProcessedDrop(dropKey);
                  console.log('🎯 Timeline React DND drop with position:', dropIndicatorPosition);
                  
                  // Calculate the exact time for the drop position
                  if (containerRef.current) {
                    const centerX = containerRef.current.clientWidth / 2;
                    const pixelOffsetFromCenter = dropIndicatorPosition - centerX;
                    const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
                    
                    const baseTime = selectedTime || currentTime;
                    const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
                    const targetMinutes = baseMinutes + timeOffsetMinutes;
                    
                    // Normalize to 24-hour format
                    let normalizedMinutes = targetMinutes;
                    while (normalizedMinutes < 0) normalizedMinutes += 1440;
                    while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
                    
                    // Convert to time string
                    const hours = Math.floor(normalizedMinutes / 60);
                    const mins = Math.round(normalizedMinutes % 60);
                    const timeSlot = hours === 0 ? `12:${mins.toString().padStart(2, '0')}a` : 
                                    hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                                    hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                                    `${hours-12}:${mins.toString().padStart(2, '0')}p`;
                    
                    console.log('🕐 Timeline calculated drop time:', timeSlot);
                    
                    // Create activity object from dragged item
                    const ACTIVITY_TEMPLATES = [
                      { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '🧘‍♂️', category: 'mindfulness', points: 15, rarity: 'common', duration: '5 min', difficulty: 1 },
                      { id: 'quick-walk', title: 'Quick Walk', icon: '🚶‍♂️', category: 'physical', points: 20, rarity: 'common', duration: '10 min', difficulty: 1 },
                      { id: 'hydrate', title: 'Hydrate', icon: '💧', category: 'physical', points: 15, rarity: 'common', duration: '1 min', difficulty: 1 },
                      { id: 'posture-check', title: 'Posture Check', icon: '🏃‍♂️', category: 'physical', points: 15, rarity: 'common', duration: '2 min', difficulty: 1 },
                      { id: 'strategic-planning', title: 'Strategic Planning', icon: '🎯', category: 'decision-making', points: 30, rarity: 'uncommon', duration: '15 min', difficulty: 2 },
                      { id: 'creative-thinking', title: 'Creative Thinking', icon: '💡', category: 'creative', points: 25, rarity: 'uncommon', duration: '10 min', difficulty: 2 },
                      { id: 'gratitude-practice', title: 'Gratitude Practice', icon: '🙏', category: 'mindfulness', points: 30, rarity: 'uncommon', duration: '5 min', difficulty: 2 },
                      { id: 'skill-practice', title: 'Skill Practice', icon: '🎨', category: 'creative', points: 35, rarity: 'uncommon', duration: '20 min', difficulty: 2 },
                      { id: 'empathy-practice', title: 'Empathy Practice', icon: '💝', category: 'communication', points: 45, rarity: 'rare', duration: '15 min', difficulty: 3 },
                      { id: 'deep-reflection', title: 'Deep Reflection', icon: '🏛️', category: 'reflection', points: 50, rarity: 'rare', duration: '30 min', difficulty: 3 },
                      { id: 'problem-solving', title: 'Problem Solving', icon: '🧩', category: 'decision-making', points: 40, rarity: 'rare', duration: '25 min', difficulty: 3 },
                      { id: 'mentoring', title: 'Mentoring Others', icon: '👨‍🏫', category: 'communication', points: 55, rarity: 'rare', duration: '30 min', difficulty: 3 },
                      { id: 'leadership-moment', title: 'Leadership Moment', icon: '👑', category: 'communication', points: 70, rarity: 'epic', duration: '45 min', difficulty: 4 },
                      { id: 'innovation-session', title: 'Innovation Session', icon: '🚀', category: 'creative', points: 65, rarity: 'epic', duration: '60 min', difficulty: 4 },
                      { id: 'conflict-resolution', title: 'Conflict Resolution', icon: '🤝', category: 'communication', points: 75, rarity: 'epic', duration: '30 min', difficulty: 4 },
                      { id: 'life-changing-decision', title: 'Life-Changing Decision', icon: '🌟', category: 'decision-making', points: 100, rarity: 'legendary', duration: '90 min', difficulty: 5 },
                      { id: 'inspire-others', title: 'Inspire Others', icon: '✨', category: 'communication', points: 90, rarity: 'legendary', duration: '60 min', difficulty: 5 },
                      { id: 'master-skill', title: 'Master New Skill', icon: '🏆', category: 'creative', points: 85, rarity: 'legendary', duration: '120 min', difficulty: 5 }
                    ];
                    
                    const activity = ACTIVITY_TEMPLATES.find(a => a.id === activityId);
                    console.log('🔍 Looking for activity:', activityId, 'Found:', !!activity);
                    if (activity) {
                      console.log('✅ Calling onActivityAdd with:', activity, timeSlot);
                      onActivityAdd(activity, timeSlot);
                      
                      // Clear the stored activity ID
                      setDraggedActivityId(null);
                    } else {
                      console.log('❌ Activity not found in templates for ID:', activityId);
                    }
                  }
                }
              };
              
              // Call this when React Beautiful DND completes
              useEffect(() => {
                console.log('🔍 Timeline useEffect check:', {
                  hasOnDragEnd: !!onDragEnd,
                  isDraggingOver: snapshot.isDraggingOver,
                  isDropTarget,
                  draggedActivityId,
                  draggingOverWith: snapshot.draggingOverWith
                });
                
                if (onDragEnd && !snapshot.isDraggingOver && isDropTarget && draggedActivityId) {
                  console.log('🎯 Processing timeline drop for:', draggedActivityId);
                  // This was a successful drop, process it
                  const mockResult = {
                    draggableId: draggedActivityId,
                    destination: { droppableId: 'timeline-drop-zone' }
                  };
                  handleReactDNDDrop(mockResult);
                }
              }, [snapshot.isDraggingOver, onDragEnd, draggedActivityId, isDropTarget]);
              
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
                  } rounded-lg h-32 overflow-hidden select-none ${isDragging && !isDndActive ? 'cursor-grabbing' : isDndActive ? 'cursor-pointer' : 'cursor-grab'}`}
                  style={{ 
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none',
                    minHeight: '128px' // Ensure proper drop zone size
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
                        console.log('📝 Stored dragged activity ID:', snapshot.draggingOverWith);
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
                      
                      // Convert to time string
                      const hours = Math.floor(normalizedMinutes / 60);
                      const mins = Math.round(normalizedMinutes % 60);
                      const timeString = hours === 0 ? `12:${mins.toString().padStart(2, '0')}a` : 
                                        hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                                        hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                                        `${hours-12}:${mins.toString().padStart(2, '0')}p`;
                      
                      // Update the drop time in the dragging card
                      if (snapshot.draggingOverWith) {
                        const dropTimeElement = document.getElementById(`drop-time-${snapshot.draggingOverWith}`);
                        if (dropTimeElement) {
                          dropTimeElement.textContent = timeString;
                        }
                      }
                    }
                    // Call original drag handler if not in DND mode
                    if (!snapshot.isDraggingOver) {
                      handleDragMove(e);
                    }
                  }}
                  onMouseLeave={() => {
                    if (snapshot.isDraggingOver) {
                      setIsDropTarget(false);
                      setDropIndicatorPosition(null);
                      setDraggedActivityId(null);
                    } else {
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
            <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full z-30 shadow-lg shadow-blue-400/50" style={{ bottom: '3px' }}>
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
                    // Calculate the exact time for this drop position
                    if (containerRef.current) {
                      const centerX = containerRef.current.clientWidth / 2;
                      const pixelOffsetFromCenter = dropIndicatorPosition - centerX;
                      const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
                      
                      const baseTime = selectedTime || currentTime;
                      const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
                      const targetMinutes = baseMinutes + timeOffsetMinutes;
                      
                      // Normalize to 24-hour format
                      let normalizedMinutes = targetMinutes;
                      while (normalizedMinutes < 0) normalizedMinutes += 1440;
                      while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
                      
                      // Convert to time string
                      const hours = Math.floor(normalizedMinutes / 60);
                      const mins = Math.round(normalizedMinutes % 60);
                      return hours === 0 ? `12:${mins.toString().padStart(2, '0')}a` : 
                             hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                             hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                             `${hours-12}:${mins.toString().padStart(2, '0')}p`;
                    }
                    return '';
                  })()}
                </div>
                
                {/* Bottom drop indicator circle */}
                <div 
                  className="absolute -translate-x-1/2 w-4 h-4 bg-green-400 rounded-full z-40 shadow-lg shadow-green-400/50 animate-bounce"
                  style={{ 
                    left: `${dropIndicatorPosition}px`,
                    bottom: '3px'
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
              {/* Timeline Base Line - moved down with time labels */}
              <div className="absolute left-0 right-0 h-0.5 bg-slate-600" style={{ bottom: '18px' }}></div>

              {/* Hourly Time Markers (aligned with moved timeline) */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={`hour-${i}`}>
                  <div 
                    className="absolute w-px h-4 bg-slate-500"
                    style={{ 
                      left: `${i * 60 * pixelsPerMinute}px`,
                      bottom: '18px'
                    }}
                  />
                  <div 
                    className="absolute text-xs text-slate-400 font-mono"
                    style={{ 
                      left: `${i * 60 * pixelsPerMinute - 15}px`,
                      bottom: '3px'
                    }}
                  >
                    {i === 0 ? '12:00a' : i <= 11 ? `${i}:00a` : i === 12 ? '12:00p' : `${i-12}:00p`}
                  </div>
                </div>
              ))}

              {/* Activity Icons */}
              {(() => {
                const allActivities = [...activities, ...timelineActivities];
                console.log(`🎨 Rendering ${allActivities.length} total activities (${activities.length} sample + ${timelineActivities.length} timeline)`);
                if (timelineActivities.length > 0) {
                  timelineActivities.forEach((a, i) => {
                    console.log(`🔍 Timeline activity ${i}:`, {
                      title: a.title,
                      time: a.time,
                      scheduledTime: a.scheduledTime,
                      hasTime: !!a.time,
                      hasScheduledTime: !!a.scheduledTime
                    });
                  });
                }
                return allActivities;
              })().map((activity, index) => {
                // Handle both formats: "07:00" and "7:00a"
                let hours, mins;
                if (activity.time) {
                  // Sample activities format: "07:00"
                  [hours, mins] = activity.time.split(':').map(Number);
                } else if (activity.scheduledTime) {
                  // Dropped activities format: "7:00a" or "7:00p"  
                  const timeStr = activity.scheduledTime;
                  const isPM = timeStr.includes('p');
                  const [hourStr, minStr] = timeStr.replace(/[ap]/, '').split(':');
                  hours = parseInt(hourStr);
                  mins = parseInt(minStr);
                  
                  // Convert to 24-hour format
                  if (isPM && hours !== 12) hours += 12;
                  if (!isPM && hours === 12) hours = 0;
                  
                  console.log('🎨 DROPPED ACTIVITY FOUND:', {
                    title: activity.title,
                    timeStr,
                    convertedHours: hours,
                    convertedMins: mins,
                    position: (hours * 60 + mins) * pixelsPerMinute,
                    isDropped: true
                  });
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
                
                return (
                  <div
                    key={`${activity.id || activity.time}-${index}`}
                    className="absolute flex flex-col items-center"
                    style={{ 
                      left: `${position - 24}px`, // Center the 48px icon (24px offset)
                      top: '20px'
                    }}
                  >
                    {/* Activity Time (above icon) */}
                    <div className="text-xs text-slate-300 font-mono mb-1 whitespace-nowrap">
                      {displayTime}
                    </div>
                    
                    {/* Activity Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/30' : ''
                    } ${isDroppedActivity ? 'bg-green-600 ring-2 ring-green-400 shadow-lg shadow-green-400/30' : 'bg-black'}`}>
                      <span className="text-2xl">{activityIcon}</span>
                    </div>
                    
                    {/* Activity Name (below icon for dropped activities) */}
                    {isDroppedActivity && (
                      <div className="text-xs text-green-300 font-medium mt-1 whitespace-nowrap max-w-20 truncate">
                        {activityName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {provided.placeholder}
            </div>
              );
            }}
          </Droppable>

          {/* Timeline Zoom Control */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>Timeline Zoom</span>
              <span className={`text-xs ${theme?.timelineText || 'text-slate-300'}`}>{zoomLevel}x ({pixelsPerMinute}px/min)</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((level) => (
                <button
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200 ${
                    zoomLevel === level
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                      : `${theme?.buttonSecondary || 'bg-slate-600 text-slate-300 hover:bg-slate-500 hover:text-white'}`
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status Display */}
          <div className="flex justify-center items-center mt-4">
            <div className={`text-sm ${theme?.cardSubtext || 'text-slate-400'}`}>
              {isDragging ? 'Dragging Timeline' : isPaused ? 'Timeline Paused' : 'Live Timeline'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamelikeTimeline;