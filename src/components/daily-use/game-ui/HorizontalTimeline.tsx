'use client'

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  CheckCircle2, 
  Circle,
  Target,
  Zap
} from 'lucide-react';
import { DailySchedule, Activity } from '@/types/daily-use';

interface HorizontalTimelineProps {
  schedule: DailySchedule;
  currentTime: Date;
  autoScroll: boolean;
  onSlotDrop: (timeSlot: string, activity: Activity) => void;
  onTimeSlotSelect: (slot: string) => void;
  selectedSlot: string | null;
  draggedActivity: Activity | null;
}

export default function HorizontalTimeline({
  schedule,
  currentTime,
  autoScroll,
  onSlotDrop,
  onTimeSlotSelect,
  selectedSlot,
  draggedActivity
}: HorizontalTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [visibleStartHour, setVisibleStartHour] = useState(currentTime.getHours() - 2);

  // Generate time slots (24 hours, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const activity = schedule.activities.find(a => a.scheduledTime === timeString);
        
        slots.push({
          time: timeString,
          hour,
          minute,
          activity,
          isPast: isTimePast(hour, minute),
          isCurrent: isCurrentTime(hour, minute),
          isNear: isNearCurrentTime(hour, minute)
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Auto-scroll to current time
  useEffect(() => {
    if (autoScroll && timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollPosition = (currentHour - 2) * 120; // Each hour slot is ~120px
      
      timelineRef.current.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [autoScroll, currentTime]);

  // Helper functions - using function declarations to avoid temporal dead zone
  function isTimePast(hour: number, minute: number) {
    const slotTime = hour * 60 + minute;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return slotTime < now;
  }

  function isCurrentTime(hour: number, minute: number) {
    const slotTime = hour * 60 + minute;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return Math.abs(slotTime - now) <= 15; // Within 15 minutes
  }

  function isNearCurrentTime(hour: number, minute: number) {
    const slotTime = hour * 60 + minute;
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    return Math.abs(slotTime - now) <= 60; // Within 1 hour
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, timeSlot: string) => {
    e.preventDefault();
    if (draggedActivity) {
      onSlotDrop(timeSlot, draggedActivity);
    }
  };

  // Manual scroll controls
  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 240; // 2 hours worth
      const currentScroll = timelineRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      timelineRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  // Get current time indicator
  const getCurrentTimePosition = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startOfDay = 0;
    const pixelsPerMinute = 120 / 60; // 120px per hour / 60 minutes
    return (now - startOfDay) * pixelsPerMinute;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Daily Timeline</h3>
          <span className="text-sm text-slate-400">
            {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Manual Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scrollTimeline('left')}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <span className="text-xs text-slate-500">Scroll</span>
          <button
            onClick={() => scrollTimeline('right')}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative h-16 overflow-hidden">
        {/* Scrollable Timeline */}
        <div 
          ref={timelineRef}
          className="flex overflow-x-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 h-full pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {timeSlots.map((slot, index) => (
            <div
              key={slot.time}
              className={`flex-shrink-0 w-30 h-12 relative cursor-pointer transition-all duration-200 ${
                selectedSlot === slot.time ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => onTimeSlotSelect(slot.time)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slot.time)}
            >
              {/* Time Slot Background */}
              <div className={`w-full h-full rounded-lg border-2 border-dashed transition-all ${
                slot.isCurrent
                  ? 'bg-blue-500/20 border-blue-400'
                  : slot.isNear
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : slot.isPast
                      ? 'bg-slate-700/30 border-slate-600'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
              } ${
                draggedActivity ? 'border-green-400 bg-green-500/10' : ''
              }`}>
                
                {/* Time Label */}
                <div className={`text-xs font-medium px-2 py-1 ${
                  slot.isCurrent
                    ? 'text-blue-300'
                    : slot.isPast
                      ? 'text-slate-500'
                      : 'text-slate-300'
                }`}>
                  {slot.time}
                </div>

                {/* Activity Preview */}
                {slot.activity && (
                  <div className={`absolute inset-2 rounded-md p-1 text-xs ${
                    slot.activity.isCompleted
                      ? 'bg-green-600/80 border border-green-400'
                      : slot.isCurrent
                        ? 'bg-blue-600/80 border border-blue-400'
                        : 'bg-purple-600/80 border border-purple-400'
                  }`}>
                    <div className="flex items-center justify-between h-full">
                      <div className="truncate flex-1">
                        <div className="font-medium text-white truncate">
                          {slot.activity.title}
                        </div>
                        <div className="text-slate-300 truncate">
                          {slot.activity.duration}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-1">
                        {slot.activity.isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-green-300" />
                        ) : slot.isCurrent ? (
                          <Play className="w-3 h-3 text-blue-300" />
                        ) : (
                          <Circle className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Drop Zone Highlight */}
                {draggedActivity && (
                  <div className="absolute inset-0 bg-green-400/20 border-2 border-green-400 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-300" />
                  </div>
                )}
              </div>

              {/* Current Time Indicator */}
              {slot.isCurrent && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                  <div className="w-1 h-14 bg-blue-400 rounded-full shadow-lg">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-lg animate-pulse">
                      <div className="absolute inset-1 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ 
              width: `${(schedule.completedCount / schedule.activities.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Timeline Stats */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400">
            {schedule.completedCount} of {schedule.activities.length} completed
          </span>
          <span className="text-blue-400">
            {schedule.totalPoints} points earned
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-medium">
            {Math.round(schedule.completionPercentage)}% complete
          </span>
        </div>
      </div>
    </div>
  );
}