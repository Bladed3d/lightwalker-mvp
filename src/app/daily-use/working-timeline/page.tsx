'use client'

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';

// SVG Stick Figure Components
const StickFigures = {
  wake: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M20 20 L12 16 M20 20 L28 16 M20 26 L14 34 M20 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M8 8 L12 6 M8 8 L8 12 M32 8 L28 6 M32 8 L32 12" stroke={color} strokeWidth="1" opacity={opacity * 0.7} />
    </svg>
  ),
  
  meditate: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="12" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 16 L20 24 M14 20 L26 20 M14 28 L14 20 L12 24 L10 28 M26 28 L26 20 L28 24 L30 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <circle cx="20" cy="24" r="8" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity={opacity * 0.5} />
    </svg>
  ),
  
  run: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 12 L20 22 M20 16 L14 14 M20 16 L26 20 M20 22 L12 32 M20 22 L24 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M10 34 L30 34" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
    </svg>
  ),
  
  bath: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M10 20 L30 20 L30 30 L10 30 Z" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M15 14 L15 20 M20 14 L20 20 M25 14 L25 20" stroke={color} strokeWidth="1" opacity={opacity * 0.7} />
      <circle cx="12" cy="25" r="1" fill={color} opacity={opacity * 0.5} />
      <circle cx="20" cy="26" r="1" fill={color} opacity={opacity * 0.5} />
      <circle cx="28" cy="25" r="1" fill={color} opacity={opacity * 0.5} />
    </svg>
  ),
  
  eat: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M14 18 L26 18 M14 26 L14 34 M26 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <circle cx="20" cy="22" r="6" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M10 18 L10 14 M30 18 L30 14" stroke={color} strokeWidth="1" opacity={opacity * 0.7} />
    </svg>
  ),
  
  read: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M14 18 L20 20 L26 18 M14 26 L14 34 M26 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <rect x="12" y="20" width="16" height="10" stroke={color} strokeWidth="1.5" fill="none" opacity={opacity} />
      <path d="M16 24 L24 24 M16 27 L24 27" stroke={color} strokeWidth="1" opacity={opacity * 0.7} />
    </svg>
  ),
  
  work: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M14 18 L26 18 M14 26 L14 34 M26 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <rect x="10" y="22" width="20" height="12" stroke={color} strokeWidth="1.5" fill="none" opacity={opacity} />
      <rect x="12" y="24" width="16" height="8" stroke={color} strokeWidth="1" fill="none" opacity={opacity * 0.7} />
    </svg>
  ),
  
  walk: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="8" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 12 L20 22 M20 16 L14 18 M20 16 L26 18 M20 22 L16 32 M20 22 L24 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M10 34 L30 34" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity={opacity * 0.5} />
    </svg>
  ),
  
  meet: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="14" cy="10" r="3" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <circle cx="26" cy="10" r="3" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M14 13 L14 22 M10 16 L18 16 M14 22 L10 30 M14 22 L18 30" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M26 13 L26 22 M22 16 L30 16 M26 22 L22 30 M26 22 L30 30" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M18 16 L22 16" stroke={color} strokeWidth="1" strokeDasharray="1 1" opacity={opacity * 0.7} />
    </svg>
  ),
  
  create: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M14 18 L26 18 M14 26 L14 34 M26 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M26 18 L28 14 L30 16" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <circle cx="28" cy="14" r="6" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity={opacity * 0.5} />
    </svg>
  ),
  
  exercise: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M12 18 L28 18 M14 26 L14 34 M26 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <circle cx="10" cy="18" r="3" stroke={color} strokeWidth="1.5" fill="none" opacity={opacity} />
      <circle cx="30" cy="18" r="3" stroke={color} strokeWidth="1.5" fill="none" opacity={opacity} />
    </svg>
  ),
  
  family: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="14" cy="8" r="3" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <circle cx="26" cy="8" r="3" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <circle cx="20" cy="16" r="2" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M14 11 L14 20 M26 11 L26 20 M20 18 L20 24" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M10 20 L30 20" stroke={color} strokeWidth="1" opacity={opacity * 0.7} />
      <path d="M14 20 L12 28 M14 20 L16 28 M26 20 L24 28 M26 20 L28 28 M20 24 L18 32 M20 24 L22 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
    </svg>
  ),
  
  reflect: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="10" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M20 14 L20 26 M14 18 L26 18 M14 26 L14 34 M26 26 L26 34" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M26 20 L28 18 L30 20 L28 22 Z" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M24 24 L32 24" stroke={color} strokeWidth="1" opacity={opacity * 0.7} />
    </svg>
  ),
  
  sleep: ({ color = "#06b6d4", opacity = 1 }) => (
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="14" r="4" stroke={color} strokeWidth="1.5" opacity={opacity} />
      <path d="M10 22 L30 22 M20 18 L20 22 M12 22 L12 26 M28 22 L28 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity={opacity} />
      <path d="M24 10 L26 8 L28 10 M26 8 L28 6 L30 8 M28 6 L30 4 L32 6" stroke={color} strokeWidth="1" opacity={opacity * 0.5} />
    </svg>
  ),
};

const LightwalkerTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  // Activities with stick figure mappings
  const activities = [
    { time: '07:00', name: 'Wake', figure: 'wake', duration: 15, energy: 'rise' },
    { time: '07:15', name: 'Meditate', figure: 'meditate', duration: 30, energy: 'calm' },
    { time: '07:45', name: 'Run', figure: 'run', duration: 45, energy: 'high' },
    { time: '08:30', name: 'Bath', figure: 'bath', duration: 20, energy: 'refresh' },
    { time: '08:50', name: 'Breakfast', figure: 'eat', duration: 30, energy: 'fuel' },
    { time: '09:20', name: 'Read', figure: 'read', duration: 40, energy: 'focus' },
    { time: '10:00', name: 'Deep Work', figure: 'work', duration: 120, energy: 'intense' },
    { time: '12:00', name: 'Lunch', figure: 'eat', duration: 45, energy: 'fuel' },
    { time: '12:45', name: 'Walk', figure: 'walk', duration: 30, energy: 'moderate' },
    { time: '13:15', name: 'Create', figure: 'create', duration: 90, energy: 'flow' },
    { time: '14:45', name: 'Connect', figure: 'meet', duration: 60, energy: 'social' },
    { time: '15:45', name: 'Recharge', figure: 'meditate', duration: 15, energy: 'pause' },
    { time: '16:00', name: 'Innovate', figure: 'create', duration: 90, energy: 'creative' },
    { time: '17:30', name: 'Train', figure: 'exercise', duration: 45, energy: 'peak' },
    { time: '18:15', name: 'Nourish', figure: 'eat', duration: 45, energy: 'calm' },
    { time: '19:00', name: 'Bond', figure: 'family', duration: 90, energy: 'love' },
    { time: '20:30', name: 'Learn', figure: 'read', duration: 60, energy: 'growth' },
    { time: '21:30', name: 'Reflect', figure: 'reflect', duration: 30, energy: 'wisdom' },
    { time: '22:00', name: 'Rest', figure: 'sleep', duration: 480, energy: 'restore' }
  ];

  // Energy colors for active states
  const energyColors = {
    rise: '#f59e0b',
    calm: '#3b82f6',
    high: '#ef4444',
    refresh: '#06b6d4',
    fuel: '#10b981',
    focus: '#6366f1',
    intense: '#ec4899',
    moderate: '#14b8a6',
    flow: '#8b5cf6',
    social: '#f59e0b',
    pause: '#6b7280',
    creative: '#f43f5e',
    peak: '#f97316',
    love: '#ec4899',
    growth: '#10b981',
    wisdom: '#6366f1',
    restore: '#8b5cf6'
  };

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused && !selectedTime) {
        setCurrentTime(new Date());
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [isPaused, selectedTime]);

  // Calculate timeline position
  const getTimelinePosition = () => {
    const centerX = (containerRef.current?.offsetWidth || 800) / 2;
    
    if (isDragging || selectedTime) {
      // When dragging or paused, use base current time position plus offset
      const baseMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(baseMinutes * 4) + centerX + scrollOffset;
    } else {
      // When running normally, position based on current time
      const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(minutes * 4) + centerX;
    }
  };

  // Get current activity based on time
  const getCurrentActivity = () => {
    const time = selectedTime || currentTime;
    const currentMinutes = time.getHours() * 60 + time.getMinutes();
    
    for (let i = 0; i < activities.length; i++) {
      const [hours, mins] = activities[i].time.split(':').map(Number);
      const activityStart = hours * 60 + mins;
      const activityEnd = activityStart + activities[i].duration;
      
      if (currentMinutes >= activityStart && currentMinutes < activityEnd) {
        return activities[i];
      }
    }
    return null;
  };

  // Get activity in current window
  const getActivityInWindow = () => {
    if (!containerRef.current) return getCurrentActivity();
    
    const timelineOffset = getTimelinePosition();
    const centerX = containerRef.current.offsetWidth / 2;
    const windowHalfWidth = 60;
    
    for (let i = 0; i < activities.length; i++) {
      const [hours, mins] = activities[i].time.split(':').map(Number);
      const position = (hours * 60 + mins) * 4;
      const activityScreenPosition = position + timelineOffset;
      
      if (activityScreenPosition >= (centerX - windowHalfWidth - 20) && 
          activityScreenPosition <= (centerX + windowHalfWidth + 20)) {
        return activities[i];
      }
      
      const activityDuration = activities[i].duration * 4;
      if (activityScreenPosition < centerX && 
          (activityScreenPosition + activityDuration) > centerX) {
        return activities[i];
      }
    }
    
    return getCurrentActivity();
  };

  // Mouse/Touch handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX - scrollOffset);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Calculate new scroll offset
    const newScrollOffset = e.clientX - dragStartX;
    setScrollOffset(newScrollOffset);
    
    // To find what time is at center, we need to reverse the timeline positioning formula
    // Timeline position formula: -(minutes * 4) + centerX + scrollOffset = x
    // When x = centerX (item at center), we get: -(minutes * 4) + scrollOffset = 0
    // Therefore: minutes = scrollOffset / 4
    
    const centerX = (containerRef.current?.offsetWidth || 800) / 2;
    const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // The timeline shows currentTime at center when scrollOffset is 0
    // Positive scrollOffset means we've scrolled to EARLIER times
    // Negative scrollOffset means we've scrolled to LATER times
    const minutesAtCenter = currentTimeMinutes - (newScrollOffset / 4);
    
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
    setIsPaused(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX - scrollOffset);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMouseMove({ clientX: e.touches[0].clientX });
  };

  const resetToNow = () => {
    setSelectedTime(null);
    setScrollOffset(0);
    setIsPaused(false);
  };

  const currentActivity = getActivityInWindow();
  const displayTime = selectedTime || currentTime;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  // Calculate the exact time at the center line
  const getExactTimeAtCenter = () => {
    if (selectedTime) return selectedTime;
    return currentTime;
  };

  return (
    <div className={`bg-gray-900 p-4 overflow-hidden relative ${isDesktop ? 'flex gap-4 h-48' : 'min-h-screen'}`}>
      {/* NOW Button - Top Right of Window */}
      <button
        onClick={resetToNow}
        className="absolute top-2 right-2 z-30 px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 transition-all duration-300 flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4 text-cyan-300" />
        <span className="text-cyan-300 text-sm font-medium">NOW</span>
      </button>

      {/* Current Activity Display */}
      <div className={`relative ${isDesktop ? 'w-1/4' : 'mb-6'}`}>
        <div className="h-full bg-gray-800/60 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 flex flex-col justify-center">
          <div className="text-center">
            {currentActivity && (
              <div className="inline-flex items-center justify-center mb-3 transform scale-125">
                {StickFigures[currentActivity.figure] && StickFigures[currentActivity.figure]({ 
                  color: energyColors[currentActivity.energy], 
                  opacity: 1 
                })}
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-1">
              {currentActivity?.name || 'Transitioning'}
            </h2>
            <p className="text-lg text-cyan-300 font-mono">
              {displayTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className={`relative ${isDesktop ? 'flex-1' : ''}`}>
        <div 
          ref={containerRef}
          className="relative h-full bg-gray-800/60 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Current Time Indicator with Window Box */}
          <div className="absolute left-1/2 bottom-0 w-px bg-gradient-to-b from-cyan-400/20 via-cyan-400 to-cyan-400/60 z-20" style={{ height: '125px' }}></div>
          
          {/* Current Time Window Box */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 border border-cyan-400/30 bg-cyan-400/5 rounded-lg z-10 pointer-events-none" 
            style={{ 
              width: '120px',
              height: '90px',
              bottom: '35px',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent rounded-lg"></div>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400/40"></div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400/40"></div>
          </div>

          {/* Timeline */}
          <div ref={timelineRef} className="relative h-full w-full">
            <div 
              className="absolute h-px bg-cyan-600/30 transition-transform ease-out"
              style={{
                width: '5760px',
                bottom: '30px',
                transform: `translateX(${getTimelinePosition()}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
            >
              {/* Hour Markers */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i}>
                  <div 
                    className="absolute w-px h-4 bg-cyan-400/30"
                    style={{ 
                      left: `${i * 240}px`,
                      bottom: '-2px'
                    }}
                  />
                  <div 
                    className="absolute text-xs text-cyan-400/60 font-mono"
                    style={{ 
                      left: `${i * 240 - 15}px`,
                      bottom: '-25px'
                    }}
                  >
                    {i.toString().padStart(2, '0')}:00
                  </div>
                </div>
              ))}

              {/* Activities */}
              {activities.map((activity, index) => {
                const [hours, mins] = activity.time.split(':').map(Number);
                const position = (hours * 60 + mins) * 4;
                
                const timelineOffset = getTimelinePosition();
                const activityScreenPosition = position + timelineOffset;
                const containerWidth = containerRef.current?.offsetWidth || 800;
                const centerX = containerWidth / 2;
                const windowHalfWidth = 60;
                
                const isInWindow = activityScreenPosition >= (centerX - windowHalfWidth) && 
                                  activityScreenPosition <= (centerX + windowHalfWidth);
                
                const time = selectedTime || currentTime;
                const currentMinutes = time.getHours() * 60 + time.getMinutes();
                const activityMinutes = hours * 60 + mins;
                const minuteDiff = Math.abs(currentMinutes - activityMinutes);
                const opacity = minuteDiff < 60 ? 1 : minuteDiff < 180 ? 0.7 : 0.4;
                
                return (
                  <div
                    key={index}
                    className="absolute flex flex-col items-center transition-all duration-300"
                    style={{ 
                      left: `${position}px`,
                      bottom: '10px'
                    }}
                  >
                    <div className={`transition-all duration-500 transform ${isInWindow ? 'scale-110' : 'hover:scale-110'}`}>
                      {StickFigures[activity.figure] && StickFigures[activity.figure]({ 
                        color: isInWindow ? energyColors[activity.energy] : '#06b6d4',
                        opacity: isInWindow ? 1 : opacity
                      })}
                    </div>
                    <div className={`mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-500 ${
                      isInWindow ? 'text-white' : 'text-cyan-300/60'
                    }`}>
                      {activity.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightwalkerTimeline;