import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

const LightwalkerTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const timelineRef = useRef(null);

  // Sample activities for the day
  const activities = [
    { time: '07:00', name: 'Wake', icon: '🌅', duration: 15 },
    { time: '07:15', name: 'Meditate', icon: '🧘', duration: 30 },
    { time: '07:45', name: 'Run', icon: '🏃', duration: 45 },
    { time: '08:30', name: 'Bath', icon: '🚿', duration: 20 },
    { time: '08:50', name: 'Breakfast', icon: '🍳', duration: 30 },
    { time: '09:20', name: 'Read', icon: '📖', duration: 40 },
    { time: '10:00', name: 'Focus Work', icon: '💻', duration: 120 },
    { time: '12:00', name: 'Lunch', icon: '🥗', duration: 45 },
    { time: '12:45', name: 'Walk', icon: '🚶', duration: 30 },
    { time: '13:15', name: 'Computer', icon: '💻', duration: 90 },
    { time: '14:45', name: 'Meeting', icon: '👥', duration: 60 },
    { time: '15:45', name: 'Break', icon: '☕', duration: 15 },
    { time: '16:00', name: 'Creative', icon: '🎨', duration: 90 },
    { time: '17:30', name: 'Exercise', icon: '💪', duration: 45 },
    { time: '18:15', name: 'Dinner', icon: '🍽️', duration: 45 },
    { time: '19:00', name: 'Family Time', icon: '👨‍👩‍👧', duration: 90 },
    { time: '20:30', name: 'Read', icon: '📚', duration: 60 },
    { time: '21:30', name: 'Journal', icon: '✍️', duration: 30 },
    { time: '22:00', name: 'Sleep', icon: '😴', duration: 480 }
  ];

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [isPaused]);

  // Calculate timeline position
  const getTimelinePosition = () => {
    const time = selectedTime || currentTime;
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    // Center the current time
    return -(totalMinutes * 4) + 400; // 4px per minute, offset to center
  };

  // Get current activity
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

  // Time navigation
  const navigateTime = (direction: number) => {
    const newTime = new Date(selectedTime || currentTime);
    newTime.setMinutes(newTime.getMinutes() + (direction * 30));
    setSelectedTime(newTime);
    setIsPaused(true);
  };

  const resetToNow = () => {
    setSelectedTime(null);
    setIsPaused(false);
  };

  const currentActivity = getCurrentActivity();
  const displayTime = selectedTime || currentTime;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Lightwalker's Day</h2>
        <p className="text-gray-600">Observe and be inspired by your ideal self's activities</p>
      </div>

      {/* Current Activity Display */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
        <div className="text-center">
          <div className="text-6xl mb-2">{currentActivity?.icon || '🌟'}</div>
          <h3 className="text-2xl font-semibold text-gray-800">
            {currentActivity?.name || 'Free Time'}
          </h3>
          <p className="text-lg text-gray-600 mt-2">
            {displayTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </p>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative bg-white rounded-lg p-8 shadow-md overflow-hidden">
        {/* Magnifying Glass Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-40 -ml-20 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500"></div>
        </div>

        {/* Timeline */}
        <div 
          ref={timelineRef}
          className="relative h-40 overflow-hidden"
        >
          <div 
            className="absolute top-1/2 h-1 bg-gray-300 transition-transform duration-1000 ease-out"
            style={{
              width: '5760px', // 24 hours * 60 minutes * 4px
              transform: `translateX(${getTimelinePosition()}px)`
            }}
          >
            {/* Hour Markers */}
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i}>
                <div 
                  className="absolute top-0 w-px h-6 bg-gray-400"
                  style={{ left: `${i * 240}px` }}
                />
                <div 
                  className="absolute text-xs text-gray-600"
                  style={{ 
                    left: `${i * 240 - 10}px`,
                    top: '10px'
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
              const width = activity.duration * 4;
              
              return (
                <div
                  key={index}
                  className="absolute -top-12 flex flex-col items-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    left: `${position}px`,
                    width: `${width}px`
                  }}
                >
                  <div className="text-3xl mb-1">{activity.icon}</div>
                  <div className="text-xs text-gray-700 font-medium whitespace-nowrap">
                    {activity.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={() => navigateTime(-1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            title="30 minutes earlier"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={resetToNow}
            className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Now
          </button>

          <button
            onClick={() => navigateTime(1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            title="30 minutes later"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Inspiration Message */}
      <div className="mt-6 text-center text-gray-600 italic">
        "Your Lightwalker is living their best life. Feel free to join them in any activity that inspires you!"
      </div>
    </div>
  );
};

export default LightwalkerTimeline;