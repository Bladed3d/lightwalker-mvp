'use client'

// Simple Timeline Component - Bulletproof against "Cannot access before initialization" errors
// Uses basic function declarations and simple structure to prevent temporal dead zones

import React from 'react';
import { Clock, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

// Import the actual Activity type to avoid mismatches
import { Activity } from '@/types/daily-use';

interface SimpleTimelineProps {
  activities: Activity[];
  currentTime: Date;
  onActivityComplete: (id: string) => void;
}

// Main component using function declaration to avoid hoisting issues
export default function SimpleTimeline(props: SimpleTimelineProps) {
  // Simple destructuring with defaults
  const activities = props.activities || [];
  const currentTime = props.currentTime || new Date();
  const onActivityComplete = props.onActivityComplete || (() => {});

  // Simple state with explicit initialization
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [isAutoScroll, setIsAutoScroll] = React.useState(true);

  // Simple functions using function declarations
  function scrollLeft() {
    setScrollPosition(prev => Math.max(0, prev - 300));
    setIsAutoScroll(false);
  }

  function scrollRight() {
    setScrollPosition(prev => prev + 300);
    setIsAutoScroll(false);
  }

  function resetToNow() {
    setScrollPosition(0);
    setIsAutoScroll(true);
  }

  function handleActivityClick(activityId: string) {
    onActivityComplete(activityId);
  }

  // Simple time formatting
  function formatTime(time: Date) {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Simple activity status determination
  function getActivityStatus(activity: Activity) {
    if (activity.isCompleted) return 'completed';
    return 'pending';
  }

  // Simple CSS classes without complex logic
  function getActivityClasses(activity: Activity) {
    const baseClasses = 'flex-shrink-0 p-4 rounded-lg border transition-colors cursor-pointer min-w-[160px]';
    
    if (activity.isCompleted) {
      return baseClasses + ' bg-green-800 border-green-600 text-green-100';
    }
    
    return baseClasses + ' bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600';
  }

  // Simple render without complex logic
  return (
    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-400" />
          Daily Timeline
        </h3>
        <div className="text-sm text-slate-400">
          Current: {formatTime(currentTime)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            type="button"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={resetToNow}
          className="px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
          <span>NOW</span>
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div 
          className="flex space-x-4 overflow-hidden"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={getActivityClasses(activity)}
              onClick={() => handleActivityClick(activity.id)}
            >
              <div className="text-sm font-medium mb-2">{activity.scheduledTime || 'No time'}</div>
              <div className="text-base font-semibold mb-1">{activity.title}</div>
              <div className="text-xs opacity-75">{activity.points} points</div>
              {activity.isCompleted && (
                <div className="text-xs text-green-400 mt-2">✓ Completed</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 text-center text-sm text-slate-400">
        Showing {activities.length} activities
        {isAutoScroll && ' • Auto-centered on current time'}
      </div>
    </div>
  );
}