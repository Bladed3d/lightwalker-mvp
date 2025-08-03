'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Activity, Zap } from 'lucide-react';

const LightwalkerTimeline = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [glowPulse, setGlowPulse] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sample activities for the day
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

  // Energy type colors
  const energyColors = {
    low: 'from-purple-400 to-purple-600',
    calm: 'from-blue-400 to-blue-600',
    high: 'from-red-400 to-orange-500',
    refresh: 'from-cyan-400 to-blue-500',
    fuel: 'from-green-400 to-emerald-500',
    focus: 'from-indigo-400 to-purple-500',
    intense: 'from-pink-500 to-red-500',
    moderate: 'from-teal-400 to-cyan-500',
    flow: 'from-violet-500 to-purple-600',
    social: 'from-yellow-400 to-orange-400',
    pause: 'from-gray-400 to-gray-600',
    creative: 'from-fuchsia-400 to-pink-500',
    peak: 'from-red-500 to-orange-600',
    love: 'from-pink-400 to-rose-500',
    growth: 'from-emerald-400 to-teal-500',
    wisdom: 'from-indigo-500 to-blue-600',
    restore: 'from-purple-500 to-indigo-600'
  };

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(new Date());
      }
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [isPaused]);

  // Pulse effect
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setGlowPulse(prev => !prev);
    }, 2000);
    return () => clearInterval(pulseTimer);
  }, []);

  // Handle container width (initial and on resize)
  useEffect(() => {
    const handleResize = () => {
      if (timelineRef.current) {
        setContainerWidth(timelineRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate timeline position
  const getTimelinePosition = () => {
    const time = selectedTime || currentTime;
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return -(totalMinutes * 4) + (containerWidth / 2);
  };

  // Get current activity
  const getCurrentActivity = () => {
    const time = selectedTime || currentTime;
    let currentMinutes = time.getHours() * 60 + time.getMinutes();

    for (let i = 0; i < activities.length; i++) {
      const [hours, mins] = activities[i].time.split(':').map(Number);
      const activityStart = hours * 60 + mins;
      let activityEnd = activityStart + activities[i].duration;

      if (activityEnd > 1440) {
        // Handle overnight overflow
        if (currentMinutes >= activityStart || currentMinutes < (activityEnd - 1440)) {
          return activities[i];
        }
      } else {
        if (currentMinutes >= activityStart && currentMinutes < activityEnd) {
          return activities[i];
        }
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
    <div className="min-h-screen bg-gray-900 p-6 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            LIGHTWALKER CHRONOSPHERE
          </h1>
          <p className="text-cyan-300 text-lg tracking-wider">QUANTUM TIMELINE INTERFACE</p>
        </div>

        {/* Current Activity Display */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-8 shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-cyan-400/50 shadow-lg">
                <span className="text-5xl">{currentActivity?.icon || '🌟'}</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentActivity?.name || 'Quantum State: Undefined'}
              </h2>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Activity className={`w-5 h-5 ${glowPulse ? 'text-cyan-400' : 'text-cyan-600'} transition-colors duration-1000`} />
                <p className="text-xl text-cyan-300 font-mono">
                  {displayTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </p>
              </div>
              {currentActivity && (
                <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${energyColors[currentActivity.energy as keyof typeof energyColors]} text-white text-sm font-semibold uppercase tracking-wider`}>
                  <Zap className="w-4 h-4 mr-2" />
                  {currentActivity.energy} energy
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-8 shadow-2xl overflow-hidden">
            {/* Quantum Field Lines */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
            </div>

            {/* Current Time Indicator */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400 via-purple-400 to-cyan-400 z-20"></div>
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full ${glowPulse ? 'shadow-lg shadow-cyan-400/50' : ''} transition-shadow duration-1000`}>
              <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping"></div>
            </div>

            {/* Timeline */}
            <div ref={timelineRef} className="relative h-48 overflow-hidden">
              <div
                className="absolute top-1/2 h-0.5 bg-gradient-to-r from-purple-600 via-cyan-600 to-purple-600 transition-transform duration-1000 ease-out"
                style={{
                  width: '5760px',
                  transform: `translateX(${getTimelinePosition()}px)`,
                  boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)'
                }}
              >
                {/* Hour Markers */}
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i}>
                    <div
                      className="absolute top-0 w-px h-8 bg-gradient-to-b from-cyan-400/50 to-transparent"
                      style={{ left: `${i * 240}px` }}
                    />
                    <div
                      className="absolute text-xs text-cyan-400 font-mono"
                      style={{
                        left: `${i * 240 - 15}px`,
                        top: '12px'
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
                  const isCurrent = currentActivity?.time === activity.time;
                  
                  return (
                    <div
                      key={index}
                      className={`absolute -top-20 flex flex-col items-center transition-all duration-300 hover:scale-110 ${isCurrent ? 'scale-110' : ''}`}
                      style={{
                        left: `${position}px`,
                        width: `${width}px`
                      }}
                    >
                      <div className={`relative p-3 rounded-lg bg-gradient-to-br ${energyColors[activity.energy as keyof typeof energyColors]} shadow-lg ${isCurrent ? 'animate-pulse' : ''}`}>
                        <div className="absolute inset-0 rounded-lg bg-white/20 backdrop-blur-sm"></div>
                        <div className="relative text-3xl">{activity.icon}</div>
                      </div>
                      <div className="mt-2 text-xs text-cyan-300 font-semibold whitespace-nowrap uppercase tracking-wider">
                        {activity.name}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {activity.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Controls */}
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={() => navigateTime(-1)}
                className="group relative p-3 rounded-lg bg-gray-700/50 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ChevronLeft className="w-5 h-5 text-cyan-400 relative z-10" />
              </button>
              
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="group relative p-4 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 shadow-lg"
              >
                <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isPaused ?
                  <Play className="w-6 h-6 text-white relative z-10" /> :
                  <Pause className="w-6 h-6 text-white relative z-10" />
                }
              </button>

              <button
                onClick={resetToNow}
                className="group relative px-6 py-3 rounded-lg bg-gray-700/50 border border-purple-500/30 hover:border-purple-400 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="text-purple-300 font-semibold uppercase tracking-wider text-sm relative z-10">NOW</span>
              </button>

              <button
                onClick={() => navigateTime(1)}
                className="group relative p-3 rounded-lg bg-gray-700/50 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ChevronRight className="w-5 h-5 text-cyan-400 relative z-10" />
              </button>
            </div>
          </div>
        </div>

        {/* Quantum Message */}
        <div className="mt-8 text-center">
          <p className="text-cyan-300 text-lg italic opacity-80">
            "Observe the quantum possibilities of your ideal timeline. Each moment is an invitation to align."
          </p>
        </div>
      </div>
    </div>
  );
};

export default function TimelineZ3Page() {
  return <LightwalkerTimeline />;
}