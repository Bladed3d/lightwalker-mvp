'use client'

import React, { useState, useEffect, useRef } from 'react';
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

// Category vertical offset mapping (8px increments for mobile)
const CATEGORY_VERTICAL_OFFSETS = {
  // Core 7 categories (8px spacing for mobile)
  mindfulness: 8,
  physical: 16,
  creativity: 24,
  communication: 32,
  learning: 40,
  productivity: 48,
  relationships: 56,
  // Legacy category fallbacks (map to core categories)
  creative: 24,           // → creativity
  'decision-making': 48,  // → productivity
  reflection: 8,          // → mindfulness
  'self-care': 16,        // → physical
  growth: 40,             // → learning
  nutrition: 16,          // → physical
  companionship: 56,      // → relationships
  sleep: 16,              // → physical
  morning: 16,            // → physical
  work: 48,               // → productivity
  social: 56,             // → relationships
  custom: 64,             // fallback
} as const;

interface GamelikeTimelineMobileProps {
  theme?: ThemeConfig;
  onActivityAdd?: (activity: any, timeSlot: string) => void;
  onActivityRemove?: (activity: any) => void;
  onActivitySetRepeat?: (activity: any, position: { x: number; y: number }) => void;
  onActivitySetAlert?: (activity: any, position: { x: number; y: number }) => void;
  onActivityMove?: (activity: any, newTimeSlot: string) => void;
  timelineActivities?: any[];
  hideCurrentActivity?: boolean;
  onTimeChange?: (currentTime: Date, selectedTime: Date | null) => void;
  onActivitiesChange?: (activities: any[]) => void;
  selectedActivity?: any; // For mobile selection
  onActivitySelect?: (activity: any, timeSlot: string) => void;
}

const GamelikeTimelineMobile = ({ 
  theme, 
  onActivityAdd, 
  onActivityRemove, 
  onActivitySetRepeat, 
  onActivitySetAlert, 
  onActivityMove,
  timelineActivities = [], 
  hideCurrentActivity = false, 
  onTimeChange, 
  onActivitiesChange,
  selectedActivity,
  onActivitySelect
}: GamelikeTimelineMobileProps) => {

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [liveTime, setLiveTime] = useState(() => new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);
  const [zoomLevel, setZoomLevel] = useState(2); // Mobile optimized zoom
  const [fadedActivities, setFadedActivities] = useState<Set<string>>(new Set());
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    activity: any;
  } | null>(null);
  
  // Move mode state for repositioning activities
  const [moveMode, setMoveMode] = useState<{
    isActive: boolean;
    activity: any;
  } | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Selection highlight state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
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

  // Mobile-optimized pixel per minute (smaller for better touch targets)
  const pixelsPerMinute = zoomLevel;

  // Update current time every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Separate live timestamp for debugging - updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Notify parent component when time changes
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(currentTime, selectedTime);
    }
  }, [currentTime, selectedTime]);

  // Notify parent component of all available activities
  useEffect(() => {
    if (onActivitiesChange) {
      onActivitiesChange(timelineActivities);
    }
  }, [timelineActivities]);

  // Auto-fade green circle after 1 second for newly dropped activities
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timelineActivities.forEach(activity => {
      if (activity.scheduledTime && activity.id && !fadedActivities.has(activity.id)) {
        const timer = setTimeout(() => {
          setFadedActivities(prev => new Set([...prev, activity.id]));
        }, 1000);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [timelineActivities]);

  // MOBILE TIMELINE POSITION - optimized for touch interactions
  const getTimelinePosition = () => {
    const centerX = (containerRef.current?.clientWidth || 320) / 2; // Mobile width
    
    if (isDragging || selectedTime) {
      const baseMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(baseMinutes * pixelsPerMinute) + centerX + scrollOffset;
    } else {
      const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(minutes * pixelsPerMinute) + centerX;
    }
  };

  // Mobile-optimized touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    setIsDragging(true);
    setDragStartTime(new Date());
    const clientX = e.touches[0].clientX;
    setDragStartX(clientX - scrollOffset);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = e.touches[0].clientX;
    
    const newScrollOffset = clientX - dragStartX;
    setScrollOffset(newScrollOffset);
    
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const minutesAtCenter = currentTimeMinutes - (newScrollOffset / pixelsPerMinute);
    
    let normalizedMinutes = minutesAtCenter;
    while (normalizedMinutes < 0) normalizedMinutes += 1440;
    while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
    
    const newTime = new Date();
    newTime.setHours(Math.floor(normalizedMinutes / 60));
    newTime.setMinutes(Math.round(normalizedMinutes % 60));
    newTime.setSeconds(0);
    newTime.setMilliseconds(0);
    
    setSelectedTime(newTime);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mobile time slot selection handler
  const handleTimeSlotTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left;
    
    // Calculate time from tap position
    const centerX = containerRef.current.clientWidth / 2;
    const pixelOffsetFromCenter = relativeX - centerX;
    const timeOffsetMinutes = pixelOffsetFromCenter / pixelsPerMinute;
    
    const baseTime = selectedTime || currentTime;
    const baseMinutes = baseTime.getHours() * 60 + baseTime.getMinutes();
    const targetMinutes = baseMinutes + timeOffsetMinutes;
    
    let normalizedMinutes = targetMinutes;
    while (normalizedMinutes < 0) normalizedMinutes += 1440;
    while (normalizedMinutes >= 1440) normalizedMinutes -= 1440;
    
    // Round to 15-minute intervals for better mobile UX
    normalizedMinutes = Math.round(normalizedMinutes / 15) * 15;
    
    let hours = Math.floor(normalizedMinutes / 60);
    let mins = Math.round(normalizedMinutes % 60);
    
    if (mins === 60) {
      mins = 0;
      hours = (hours + 1) % 24;
    }
    
    const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    
    // Handle move mode - repositioning existing activity
    if (moveMode?.isActive && moveMode.activity && onActivityMove) {
      setSelectedTimeSlot(timeSlot);
      onActivityMove(moveMode.activity, timeSlot);
      setSelectedTimeSlot(null);
      setMoveMode(null); // Exit move mode
      return;
    }
    
    // Handle normal placement - placing new activity from inventory
    if (selectedActivity && onActivitySelect) {
      setSelectedTimeSlot(timeSlot);
      onActivitySelect(selectedActivity, timeSlot);
      setSelectedTimeSlot(null); // Clear selection after placement
    }
    // If no selected activity, do nothing (don't show gold overlay)
  };

  const resetToNow = () => {
    setCurrentTime(new Date());
    setSelectedTime(null);
    setScrollOffset(0);
    setIsPaused(false);
    setSelectedTimeSlot(null);
  };

  const displayTime = selectedTime || currentTime;

  return (
    <div className={`${theme?.timelineBackground || 'bg-slate-800'} rounded-xl p-4 border ${theme?.timelineBorder || 'border-slate-700'} relative`}>
      {/* Mobile Header */}
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${theme?.timelineText || 'text-white'}`}>Timeline</h2>
          <div className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>
            {isDragging ? 'Dragging' : isPaused ? 'Paused' : 'Live'}
          </div>
        </div>
      </div>

      {/* Current Time Display */}
      {!hideCurrentActivity && (
        <div className="text-center mb-3 p-3 bg-slate-700 rounded-lg">
          <div className="text-xl text-blue-400 font-mono">
            {displayTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }).replace(/\s?(AM|PM)/, (match, period) => period.toLowerCase())}
          </div>
          <div className="text-xs text-cyan-400 mt-1">
            Live: {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      {/* Mobile Timeline Container */}
      <div className="relative px-1"> {/* Minimal padding - 2px gap from arrows */}
        {/* Left Arrow - Centered on timeline */}
        <button
          onClick={() => {
            const newTime = new Date(selectedTime || currentTime);
            newTime.setMinutes(newTime.getMinutes() - 30);
            setSelectedTime(newTime);
            setScrollOffset(scrollOffset + (30 * pixelsPerMinute));
            setIsPaused(true);
          }}
          className="absolute -left-2.5 top-0 z-30 transition-all duration-200 hover:scale-110 flex items-center justify-center"
        >
          <img 
            src="/timeline-arrows/mobile-arrow.png" 
            alt="Previous" 
            className="w-3 h-24 transform rotate-180"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          />
        </button>

        {/* Right Arrow - Centered on timeline */}
        <button
          onClick={() => {
            const newTime = new Date(selectedTime || currentTime);
            newTime.setMinutes(newTime.getMinutes() + 30);
            setSelectedTime(newTime);
            setScrollOffset(scrollOffset - (30 * pixelsPerMinute));
            setIsPaused(true);
          }}
          className="absolute -right-2.5 top-0 z-30 transition-all duration-200 hover:scale-110 flex items-center justify-center"
        >
          <img 
            src="/timeline-arrows/mobile-arrow.png" 
            alt="Next" 
            className="w-3 h-24"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          />
        </button>

        <div 
          ref={containerRef}
          className="relative bg-black border-2 border-slate-700 rounded-lg h-24 overflow-hidden"
          style={{ 
            userSelect: 'none', 
            WebkitUserSelect: 'none',
            touchAction: 'none' // Prevent scroll interference
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={handleTimeSlotTap}
        >
        {/* Selection indicator */}
        {selectedActivity && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-green-500/10 backdrop-blur-sm border-2 border-green-400 border-dashed rounded-lg">
            <div className="text-center">
              <div className="text-green-300 font-semibold text-sm animate-pulse mb-1">
                📅 Tap to Place
              </div>
              <div className="text-green-200 text-xs">
                {selectedActivity.title}
              </div>
            </div>
          </div>
        )}

        {/* Current Time Indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 z-30"></div>
        <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full z-30 shadow-lg" style={{ bottom: '1px' }}>
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>

        {/* Selected time slot indicator */}
        {selectedTimeSlot && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-yellow-500/20 backdrop-blur-sm border-2 border-yellow-400 border-dashed rounded-lg">
            <div className="text-yellow-300 font-semibold text-sm animate-pulse">
              Selected: {selectedTimeSlot}
            </div>
          </div>
        )}

        {/* Moving Timeline */}
        <div 
          ref={timelineRef}
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            width: `${24 * 60 * pixelsPerMinute}px`,
            transform: `translateX(${getTimelinePosition()}px)`,
          }}
        >
          {/* Timeline Base Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-slate-600" style={{ bottom: '16px' }}></div>

          {/* Duration Lines for mobile */}
          <svg 
            className="absolute inset-0 pointer-events-none" 
            style={{ 
              width: `${24 * 60 * pixelsPerMinute}px`,
              height: '100%',
              zIndex: 25
            }}
          >
            {timelineActivities.map((activity, index) => {
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

              const activityStart = hours * 60 + mins;
              const startPosition = activityStart * pixelsPerMinute;
              
              const durationMinutes = parseDurationToMinutes(activity.duration || '15 min');
              const endPosition = startPosition + (durationMinutes * pixelsPerMinute);
              
              const category = activity.customCategory || activity.category || 'custom';
              const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.custom;
              const verticalOffset = CATEGORY_VERTICAL_OFFSETS[category as keyof typeof CATEGORY_VERTICAL_OFFSETS] || CATEGORY_VERTICAL_OFFSETS.custom;
              
              const lineY = 96 - 16 - verticalOffset; // Mobile container height - timeline base - category offset
              
              return (
                <g key={`duration-${activity.id || index}`}>
                  <line
                    x1={startPosition}
                    y1={lineY}
                    x2={endPosition}
                    y2={lineY}
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <circle cx={startPosition} cy={lineY} r="1.5" fill={color} opacity="0.8" />
                  <circle cx={endPosition} cy={lineY} r="1.5" fill={color} opacity="0.8" />
                </g>
              );
            })}
          </svg>

          {/* Mobile Time Markers - Every 3 hours for readability */}
          {Array.from({ length: 8 }, (_, i) => i * 3).map((hour) => (
            <div key={`hour-${hour}`}>
              <div 
                className="absolute w-px h-3 bg-slate-500"
                style={{ 
                  left: `${hour * 60 * pixelsPerMinute}px`,
                  bottom: '16px'
                }}
              />
              <div 
                className="absolute text-xs text-slate-400 font-mono text-center"
                style={{ 
                  left: `${hour * 60 * pixelsPerMinute - 15}px`,
                  width: '30px',
                  bottom: '2px'
                }}
              >
                {hour === 0 ? '12a' : hour <= 11 ? `${hour}a` : hour === 12 ? '12p' : `${hour-12}p`}
              </div>
            </div>
          ))}

          {/* Mobile Activity Icons - Larger touch targets */}
          {timelineActivities.map((activity, index) => {
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
            
            const activityStart = hours * 60 + mins;
            const position = activityStart * pixelsPerMinute;
            
            const displayTime = hours === 0 ? '12:00a' : 
                              hours <= 11 ? `${hours}:${mins.toString().padStart(2, '0')}a` : 
                              hours === 12 ? `12:${mins.toString().padStart(2, '0')}p` : 
                              `${hours-12}:${mins.toString().padStart(2, '0')}p`;
            
            const activityIcon = activity.icon || '⭐';
            const activityName = activity.name || activity.title || 'Activity';
            const isDroppedActivity = !!activity.scheduledTime;
            const isActivityFaded = fadedActivities.has(activity.id);
            
            return (
              <div
                key={`${activity.id || activity.time}-${index}`}
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${position}px`,
                  top: '4px',
                  transform: 'translateX(-50%)',
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  // Show context menu for any timeline activity
                  setContextMenu({
                    visible: true,
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    activity: activity
                  });
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Right-click context menu for desktop
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    activity: activity
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Single click for desktop - show context menu immediately
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    activity: activity
                  });
                }}
              >
                {/* Mobile Activity Icon - Larger for better touch */}
                <div className="relative">
                  <div className={`transition-all duration-300 overflow-hidden ${
                    isDroppedActivity 
                      ? isActivityFaded 
                        ? 'w-8 h-8 flex items-center justify-center' 
                        : 'w-8 h-8 rounded-full flex items-center justify-center bg-green-600 ring-1 ring-green-400' 
                      : 'w-8 h-8 rounded-full flex items-center justify-center bg-black'
                  }`}>
                    {(activityIcon.startsWith('/') || activityIcon.startsWith('data:')) ? (
                      <img 
                        src={activityIcon} 
                        alt={activityName}
                        className={`w-full h-full object-cover ${isActivityFaded ? '' : 'rounded-full'}`}
                        draggable={false}
                      />
                    ) : (
                      <span className="text-sm">{activityIcon}</span>
                    )}
                  </div>
                </div>
                
                {/* Mobile activity time label */}
                <div className="text-xs text-slate-300 font-mono mt-1 whitespace-nowrap">
                  {displayTime.replace(':00', '')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Context Menu */}
      {contextMenu?.visible && (
        <div 
          className="fixed bg-slate-800 border-2 border-red-500 rounded-lg shadow-xl min-w-32 z-50"
          style={{ 
            left: `${Math.min(contextMenu.x, window.innerWidth - 150)}px`, 
            top: `${Math.max(contextMenu.y - 120, 10)}px`,
          }}
        >
          <div className="py-1">
            <button
              className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
              onClick={() => {
                // Enable move mode - mark this activity for repositioning
                setMoveMode({ 
                  isActive: true, 
                  activity: contextMenu.activity 
                });
                setContextMenu(null);
              }}
            >
              <span className="text-blue-500">↔️</span>
              Move
            </button>
            <button
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
              onClick={() => {
                if (onActivityRemove) {
                  onActivityRemove(contextMenu.activity);
                }
                setContextMenu(null);
              }}
            >
              <span className="text-red-500">⊗</span>
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Mobile Controls */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>Zoom</span>
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              onClick={() => setZoomLevel(level)}
              className={`w-6 h-6 rounded text-xs font-semibold transition-all duration-200 ${
                zoomLevel === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-600 text-slate-300'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        
        <button
          onClick={resetToNow}
          className={`px-3 py-1 ${theme?.buttonPrimary || 'bg-blue-600 hover:bg-blue-700 text-white'} rounded text-xs font-semibold transition-colors`}
        >
          NOW
        </button>
      </div>

      {/* Mobile instructions */}
      <div className="mt-2 space-y-1">
        {/* Dynamic Help Area */}
        <div className="text-center text-xs min-h-[20px]">
          {moveMode?.isActive ? (
            <span className="text-blue-400 font-semibold">
              ↔️ Moving {moveMode.activity?.title || moveMode.activity?.name} - Tap timeline to place it
            </span>
          ) : selectedActivity ? (
            <span className="text-green-400 font-semibold">
              ✨ Tap timeline to place {selectedActivity.title}
            </span>
          ) : (
            <span className="text-slate-400">
              💡 Press blue arrows to scroll timeline. Press Inventory item to add to timeline. Press item on timeline to edit.
            </span>
          )}
        </div>
        </div>
      </div>

      {/* Move Mode Cancel Button - Bottom Right */}
      {moveMode?.isActive && (
        <button
          onClick={() => setMoveMode(null)}
          className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors shadow-lg"
          title="Cancel move mode"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default GamelikeTimelineMobile;