import React, { useState, useEffect, useRef } from 'react';

const SimpleAccurateTimeline = () => {
  // Use a fixed initial time to prevent hydration mismatch
  const [currentTime, setCurrentTime] = useState(() => {
    // Fixed time for consistent server/client rendering
    const fixedTime = new Date();
    fixedTime.setHours(12, 0, 0, 0); // Always start at noon
    return fixedTime;
  });
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fix hydration by setting real time after mount
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date()); // Set actual current time after hydration
  }, []);

  // FIXED SCALE: 4 pixels per minute (like original working timeline)
  const pixelsPerMinute = 4;

  // Sample activities for the day (same as original)
  const activities = [
    { time: '07:00', name: 'Wake', icon: '🌅', duration: 15, energy: 'low' },
    { time: '07:15', name: 'Meditate', icon: '🧘', duration: 30, energy: 'calm' },
    { time: '07:45', name: 'Run', icon: '🏃', duration: 45, energy: 'high' },
    { time: '08:30', name: 'Bath', icon: '🚿', duration: 20, energy: 'refresh' },
    { time: '08:50', name: 'Breakfast', icon: '🍳', duration: 30, energy: 'fuel' },
    { time: '09:20', name: 'Read', icon: '📖', duration: 40, energy: 'focus' },
    { time: '10:00', name: 'Deep Work', icon: '💻', duration: 120, energy: 'intense' },
    { time: '12:00', name: 'Lunch', icon: '🥗', duration: 45, energy: 'fuel' },
    { time: '12:45', name: 'Walk', icon: '🚶', duration: 30, energy: 'moderate' },
    { time: '13:15', name: 'Create', icon: '💻', duration: 90, energy: 'flow' },
    { time: '14:45', name: 'Connect', icon: '👥', duration: 60, energy: 'social' },
    { time: '15:45', name: 'Recharge', icon: '☕', duration: 15, energy: 'pause' },
    { time: '16:00', name: 'Innovate', icon: '🎨', duration: 90, energy: 'creative' },
    { time: '17:30', name: 'Train', icon: '💪', duration: 45, energy: 'peak' },
    { time: '18:15', name: 'Nourish', icon: '🍽️', duration: 45, energy: 'calm' },
    { time: '19:00', name: 'Bond', icon: '👨‍👩‍👧', duration: 90, energy: 'love' },
    { time: '20:30', name: 'Learn', icon: '📚', duration: 60, energy: 'growth' },
    { time: '21:30', name: 'Reflect', icon: '✍️', duration: 30, energy: 'wisdom' },
    { time: '22:00', name: 'Rest', icon: '😴', duration: 480, energy: 'restore' }
  ];

  // Update current time (like original - every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Calculate timeline position with dynamic centering
  const getTimelinePosition = () => {
    const time = selectedTime || currentTime;
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Get actual container width for proper centering
    const containerWidth = timelineRef.current?.clientWidth || 800;
    const centerPoint = containerWidth / 2;
    
    return -(totalMinutes * pixelsPerMinute) + centerPoint;
  };

  // Get current activity (simplified)
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
    return activities[0]; // Default to first activity
  };

  // Drag handlers (simplified from working timeline)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setDragStartTime(selectedTime || currentTime);
    setIsPaused(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartX;
    
    // VERY SLOW DRAG: Make dragging extremely controlled
    // Reduce sensitivity by factor of 50 for very slow, precise dragging
    const sensitivityFactor = 0.02; // 50x less sensitive
    const deltaMinutes = (deltaX / pixelsPerMinute) * sensitivityFactor;
    const deltaMilliseconds = deltaMinutes * 60000;
    
    const newTime = new Date(dragStartTime!.getTime() + deltaMilliseconds);
    setSelectedTime(newTime);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const resetToNow = () => {
    setSelectedTime(null);
    setIsPaused(false);
  };

  const currentActivity = getCurrentActivity();
  const displayTime = selectedTime || currentTime;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      {/* Header with NOW button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Simple Accurate Timeline</h2>
        <button
          onClick={resetToNow}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          NOW
        </button>
      </div>

      {/* Main Layout: Left Panel + Timeline */}
      <div className="flex gap-6">
        
        {/* Left Panel - Current Activity */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            {/* Large Activity Icon */}
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-3 mx-auto">
              <span className="text-3xl">{currentActivity?.icon || '🌟'}</span>
            </div>
            
            {/* Activity Name */}
            <h3 className="text-lg font-semibold text-white mb-1">
              {currentActivity?.name || 'Free Time'}
            </h3>
            
            {/* Current Time - EXACTLY what the timeline is showing */}
            <div className="text-xl text-blue-400 font-mono mb-2">
              {mounted ? displayTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }).replace(/\s?(AM|PM)/, (match, period) => period.toLowerCase()) : '--:--'}
            </div>

            {/* Status */}
            <div className="text-sm text-gray-300">
              {selectedTime ? 'Timeline View' : 'Live Time'}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="flex-1">
          {/* Timeline Container */}
          <div 
            className={`relative bg-black border-2 border-slate-700 rounded-lg h-32 overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            
            {/* Current Time Indicator - Blue dot and line (stays centered) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 z-30"></div>
            <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full z-30 shadow-lg shadow-blue-400/50" style={{ bottom: '3px' }}>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>

            {/* Moving Timeline - EXACT COPY from original */}
            <div 
              ref={timelineRef}
              className="absolute inset-0 transition-transform duration-1000 ease-out"
              style={{
                width: `${24 * 60 * pixelsPerMinute}px`, // 24 hours * 60 minutes * 4px = 5760px
                transform: `translateX(${getTimelinePosition()}px)`,
              }}
            >
              {/* Timeline Base Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-slate-600" style={{ bottom: '18px' }}></div>

              {/* Hour Markers (like original - every 240px for 1 hour) */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={`hour-${i}`}>
                  <div 
                    className="absolute w-px h-4 bg-slate-500"
                    style={{ 
                      left: `${i * 60 * pixelsPerMinute}px`, // 60 minutes * 4px = 240px per hour
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

              {/* Activity Icons - EXACTLY like original */}
              {activities.map((activity, index) => {
                const [hours, mins] = activity.time.split(':').map(Number);
                const position = (hours * 60 + mins) * pixelsPerMinute; // EXACT COPY from original
                
                // Simple current activity detection
                const time = selectedTime || currentTime;
                const currentMinutes = time.getHours() * 60 + time.getMinutes();
                const activityStart = hours * 60 + mins;
                const isCurrent = Math.abs(currentMinutes - activityStart) < 30; // Within 30 minutes
                
                return (
                  <div
                    key={index}
                    className="absolute flex flex-col items-center"
                    style={{ 
                      left: `${position}px`, // NO OFFSET - exact position like original
                      top: '20px'
                    }}
                  >
                    {/* Activity Time (above icon) */}
                    <div className="text-xs text-slate-300 font-mono mb-1 whitespace-nowrap">
                      {activity.time}
                    </div>
                    
                    {/* Activity Icon */}
                    <div className={`w-12 h-12 bg-black rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-400/30' : ''
                    }`}>
                      <span className="text-2xl">{activity.icon}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-4 text-center">
            <div className="text-xs text-slate-400">
              Fixed Scale: {pixelsPerMinute}px/min | {isDragging ? 'Dragging' : isPaused ? 'Paused' : 'Live'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAccurateTimeline;