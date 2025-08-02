import React, { useState, useEffect, useRef } from 'react';

const GamelikeTimeline = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date()); // Initialize with current time
  const [liveTime, setLiveTime] = useState(() => new Date()); // For live timestamp display
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState<Date | null>(null);
  const [zoomLevel, setZoomLevel] = useState(4); // 4-8 zoom levels (pixels per minute)
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // COORDINATE SYSTEM FOUNDATION: 
  // pixelsPerMinute is the key conversion factor between time and screen position
  // This must be consistent across ALL positioning and drag calculations
  const pixelsPerMinute = zoomLevel;

  // Sample activities for the day
  const activities = [
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
    { time: '22:00', name: 'Rest', icon: '😴', duration: 480, points: 100 }
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


  // WORKING TIMELINE POSITION (from working code)
  const getTimelinePosition = () => {
    const centerX = (containerRef.current?.clientWidth || 800) / 2;
    
    if (isDragging || selectedTime) {
      // When dragging or paused, use base current time position plus offset
      const baseMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return -(baseMinutes * pixelsPerMinute) + centerX + scrollOffset;
    } else {
      // When running normally, position based on current time
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

  const resetToNow = () => {
    setSelectedTime(null);
    setScrollOffset(0);
    setIsPaused(false);
  };


  const currentActivity = getCurrentActivity();
  const displayTime = selectedTime || currentTime;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      {/* Header with NOW button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Daily Timeline</h2>
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
            <div className="text-sm text-gray-300">
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
          {/* Timeline Container */}
          <div 
            ref={containerRef}
            className={`relative bg-black border-2 border-slate-700 rounded-lg h-32 overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
          >
            
            {/* Current Time Indicator - Blue dot and line (stays centered) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400 z-30"></div>
            <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 rounded-full z-30 shadow-lg shadow-blue-400/50" style={{ bottom: '3px' }}>
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>

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
              {activities.map((activity, index) => {
                const [hours, mins] = activity.time.split(':').map(Number);
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
                
                return (
                  <div
                    key={index}
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

          {/* Timeline Zoom Control */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Timeline Zoom</span>
              <span className="text-xs text-slate-300">{zoomLevel}x ({pixelsPerMinute}px/min)</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 5 }, (_, i) => i + 4).map((level) => (
                <button
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={`w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200 ${
                    zoomLevel === level
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Status Display */}
          <div className="flex justify-center items-center mt-4">
            <div className="text-sm text-slate-400">
              {isDragging ? 'Dragging Timeline' : isPaused ? 'Timeline Paused' : 'Live Timeline'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamelikeTimeline;