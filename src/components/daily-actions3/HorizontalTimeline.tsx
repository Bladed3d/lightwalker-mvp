'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '@/types/daily-use';

interface HorizontalTimelineProps {
  activities: Activity[];
}

const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({ activities }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [liveTime, setLiveTime] = useState(() => new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(6); // Higher zoom for more compact view
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pixelsPerMinute = zoomLevel;

  // Convert activities to timeline format
  const timelineActivities = activities.map(activity => {
    if (!activity.scheduledTime) return null;
    
    const icon = activity.category === 'mindfulness' ? '🧘‍♂️' :
                 activity.category === 'decision-making' ? '🎯' :
                 activity.category === 'communication' ? '💝' :
                 activity.category === 'reflection' ? '🏛️' :
                 activity.category === 'physical' ? '💪' :
                 activity.category === 'creative' ? '💡' : '⭐';
    
    return {
      time: activity.scheduledTime,
      name: activity.title,
      icon: icon,
      duration: parseInt(activity.duration) || 30,
      points: activity.points,
      category: activity.category
    };
  }).filter(Boolean);

  // Update current time every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Live timestamp for visual feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timeline position calculation
  const getTimelinePosition = () => {
    const centerX = (containerRef.current?.clientWidth || 800) / 2;
    
    if (isDragging || selectedTime) {
      const baseMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(baseMinutes * pixelsPerMinute) + centerX + scrollOffset;
    } else {
      const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(minutes * pixelsPerMinute) + centerX;
    }
  };

  // Get current activity
  const getCurrentActivity = () => {
    const time = selectedTime || currentTime;
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    
    let closestActivity = null;
    let minTimeDifference = Infinity;
    
    for (const activity of timelineActivities) {
      if (!activity) continue;
      const [hours, mins] = activity.time.split(':').map(Number);
      const activityStart = hours * 60 + mins;
      const timeDifference = Math.abs(currentMinutes - activityStart);
      
      if (timeDifference < minTimeDifference) {
        minTimeDifference = timeDifference;
        closestActivity = activity;
      }
    }
    
    return closestActivity;
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX - scrollOffset);
    setIsPaused(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
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

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const resetToNow = () => {
    setCurrentTime(new Date());
    setSelectedTime(null);
    setScrollOffset(0);
    setIsPaused(false);
  };

  const currentActivity = getCurrentActivity();
  const displayTime = selectedTime || currentTime;

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      {/* Compact Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-4">
          {/* Current Activity Icon */}
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <span className="text-2xl">{currentActivity?.icon || '🌟'}</span>
          </div>
          
          {/* Activity Info */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {currentActivity?.name || 'Free Time'}
            </h3>
            <div className="text-lg text-blue-400 font-mono">
              {displayTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
          </div>

          {/* Points Badge */}
          {currentActivity && (
            <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full">
              🔥 {currentActivity.points} pts
            </div>
          )}
        </div>

        <button
          onClick={resetToNow}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          NOW
        </button>
      </div>

      {/* Timeline Container */}
      <div 
        ref={containerRef}
        className={`relative bg-black border-2 border-slate-700 rounded-lg h-20 overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Current Time Indicator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 z-30"></div>
        <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full z-30" style={{ bottom: '2px' }}>
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>

        {/* Moving Timeline */}
        <div 
          ref={timelineRef}
          className="absolute inset-0 transition-transform duration-1000 ease-out"
          style={{
            width: `${24 * 60 * pixelsPerMinute}px`,
            transform: `translateX(${getTimelinePosition()}px)`,
          }}
        >
          {/* Timeline Base */}
          <div className="absolute left-0 right-0 h-px bg-slate-600" style={{ bottom: '10px' }}></div>

          {/* Hour Markers */}
          {Array.from({ length: 24 }, (_, i) => (
            <div key={`hour-${i}`}>
              <div 
                className="absolute w-px h-2 bg-slate-500"
                style={{ 
                  left: `${i * 60 * pixelsPerMinute}px`,
                  bottom: '10px'
                }}
              />
              <div 
                className="absolute text-xs text-slate-400 font-mono"
                style={{ 
                  left: `${i * 60 * pixelsPerMinute - 15}px`,
                  bottom: '0px'
                }}
              >
                {i === 0 ? '12a' : i <= 11 ? `${i}a` : i === 12 ? '12p' : `${i-12}p`}
              </div>
            </div>
          ))}

          {/* Activity Icons */}
          {timelineActivities.map((activity, index) => {
            if (!activity) return null;
            const [hours, mins] = activity.time.split(':').map(Number);
            const activityStart = hours * 60 + mins;
            const position = activityStart * pixelsPerMinute;
            const isCurrent = currentActivity && activity.time === currentActivity.time;
            
            return (
              <div
                key={index}
                className="absolute flex flex-col items-center"
                style={{ 
                  left: `${position - 16}px`,
                  top: '15px'
                }}
              >
                <div className={`w-8 h-8 bg-black rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/30' : ''
                }`}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra Credit Points Bar */}
      <div className="mt-3 bg-orange-900/30 rounded-lg p-2">
        <div className="text-xs text-orange-400 text-center mb-1">Extra Credit Points</div>
        <div className="h-4 bg-orange-900/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
            style={{ width: '65%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;