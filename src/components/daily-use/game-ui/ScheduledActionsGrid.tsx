'use client'

import { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Clock, 
  CheckCircle2, 
  Play, 
  Circle, 
  Target, 
  Zap, 
  User,
  Timer,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Activity } from '@/types/daily-use';

interface ScheduledActionsGridProps {
  activities: Activity[];
  onActivityComplete: (activityId: string) => Promise<void>;
  onActivityDragStart: (activity: Activity) => void;
  layout: 'compact' | 'detailed';
  particleEffects: boolean;
}

export default function ScheduledActionsGrid({
  activities,
  onActivityComplete,
  onActivityDragStart,
  layout,
  particleEffects
}: ScheduledActionsGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [celebrationEffects, setCelebrationEffects] = useState<Set<number>>(new Set());

  // Create 4x4 grid (16 slots)
  const gridSlots = Array.from({ length: 16 }, (_, index) => {
    const activity = activities[index];
    return {
      index,
      activity,
      isEmpty: !activity
    };
  });

  // Handle activity completion with celebration
  const handleActivityComplete = async (activityId: string, slotIndex: number) => {
    setCompletingActivity(activityId);
    
    try {
      await onActivityComplete(activityId);
      
      // Trigger celebration effect
      if (particleEffects) {
        setCelebrationEffects(prev => {
          const newSet = new Set(prev);
          newSet.add(slotIndex);
          return newSet;
        });
        setTimeout(() => {
          setCelebrationEffects(prev => {
            const newSet = new Set(prev);
            newSet.delete(slotIndex);
            return newSet;
          });
        }, 2000);
      }
    } finally {
      setCompletingActivity(null);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, activity: Activity) => {
    e.dataTransfer.effectAllowed = 'move';
    onActivityDragStart(activity);
  };

  // Get slot appearance based on activity state
  const getSlotAppearance = (activity: Activity | undefined, slotIndex: number) => {
    if (!activity) {
      return {
        background: 'bg-slate-700/30 border-slate-600',
        hover: 'hover:bg-slate-700/50 hover:border-slate-500',
        content: 'empty'
      };
    }

    const isCompleted = activity.isCompleted;
    const isOverdue = isActivityOverdue(activity);
    const isCurrent = isActivityCurrent(activity);
    const isCelebrating = celebrationEffects.has(slotIndex);

    if (isCelebrating) {
      return {
        background: 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400',
        hover: '',
        content: 'celebrating'
      };
    }

    if (isCompleted) {
      return {
        background: 'bg-gradient-to-br from-green-600/20 to-green-500/20 border-green-500',
        hover: 'hover:from-green-600/30 hover:to-green-500/30',
        content: 'completed'
      };
    }

    if (isCurrent) {
      return {
        background: 'bg-gradient-to-br from-blue-600/20 to-blue-500/20 border-blue-500 animate-pulse',
        hover: 'hover:from-blue-600/30 hover:to-blue-500/30',
        content: 'current'
      };
    }

    if (isOverdue) {
      return {
        background: 'bg-gradient-to-br from-red-600/20 to-red-500/20 border-red-500',
        hover: 'hover:from-red-600/30 hover:to-red-500/30',
        content: 'overdue'
      };
    }

    return {
      background: `bg-gradient-to-br from-purple-600/20 to-purple-500/20 border-purple-500/50`,
      hover: 'hover:from-purple-600/30 hover:to-purple-500/30 hover:border-purple-400',
      content: 'scheduled'
    };
  };

  // Helper functions
  const isActivityCurrent = (activity: Activity) => {
    if (!activity.scheduledTime) return false;
    const now = new Date();
    const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
    const activityTime = hours * 60 + minutes;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return Math.abs(activityTime - currentTime) <= 30; // Within 30 minutes
  };

  const isActivityOverdue = (activity: Activity) => {
    if (!activity.scheduledTime || activity.isCompleted) return false;
    const now = new Date();
    const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
    const activityTime = hours * 60 + minutes;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return currentTime > activityTime + 30; // More than 30 minutes past
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-400';
    if (difficulty <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'mindfulness': '🧘',
      'decision-making': '🎯',
      'communication': '💬',
      'reflection': '🤔',
      'physical': '💪',
      'creative': '🎨'
    };
    return icons[category] || '⭐';
  };

  const getStatusIcon = (activity: Activity) => {
    if (activity.isCompleted) return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (isActivityCurrent(activity)) return <Play className="w-4 h-4 text-blue-400" />;
    if (isActivityOverdue(activity)) return <AlertCircle className="w-4 h-4 text-red-400" />;
    return <Circle className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Scheduled Actions</h3>
            <p className="text-xs text-slate-400">
              {activities.filter(a => a.isCompleted).length} of {activities.length} complete
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{activities.length}</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {activities.filter(a => a.isCompleted).length}
            </div>
            <div className="text-xs text-slate-400">Done</div>
          </div>
        </div>
      </div>

      {/* 4x4 Grid */}
      <div className="flex-1 grid grid-cols-4 gap-2 p-2 bg-slate-900/30 rounded-lg border border-slate-600">
        {gridSlots.map((slot) => {
          const appearance = getSlotAppearance(slot.activity, slot.index);
          const isHovered = hoveredSlot === slot.index;

          return (
            <div
              key={slot.index}
              className={`
                relative aspect-square rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${appearance.background} ${appearance.hover}
                ${isHovered ? 'scale-105 shadow-lg' : ''}
              `}
              onMouseEnter={() => setHoveredSlot(slot.index)}
              onMouseLeave={() => setHoveredSlot(null)}
              draggable={slot.activity && !slot.activity.isCompleted}
              onDragStart={(e) => slot.activity && handleDragStart(e, slot.activity)}
            >
              {slot.activity ? (
                <>
                  {/* Activity Content */}
                  <div className="absolute inset-1 flex flex-col justify-between">
                    {/* Top Section */}
                    <div className="flex items-start justify-between">
                      {/* Category Icon */}
                      <div className="text-lg">
                        {getCategoryIcon(slot.activity.category)}
                      </div>
                      
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {getStatusIcon(slot.activity)}
                      </div>
                    </div>

                    {/* Middle Section - Title */}
                    {layout === 'detailed' && (
                      <div className="flex-1 flex items-center justify-center px-1">
                        <p className="text-xs font-medium text-white text-center leading-tight line-clamp-2">
                          {slot.activity.title}
                        </p>
                      </div>
                    )}

                    {/* Bottom Section */}
                    <div className="flex items-end justify-between">
                      {/* Time */}
                      <div className="text-xs text-slate-300">
                        {slot.activity.scheduledTime || 'TBD'}
                      </div>
                      
                      {/* Difficulty */}
                      <div className={`text-xs font-bold ${getDifficultyColor(slot.activity.difficulty)}`}>
                        {slot.activity.difficulty}
                      </div>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                    {slot.activity.points}
                  </div>

                  {/* Role Model Color Strip */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                    style={{ backgroundColor: slot.activity.roleModelColor }}
                  />

                  {/* Completion Button */}
                  {!slot.activity.isCompleted && isHovered && (
                    <button
                      onClick={() => handleActivityComplete(slot.activity!.id, slot.index)}
                      disabled={completingActivity === slot.activity.id}
                      className="absolute inset-0 bg-green-600/80 hover:bg-green-600/90 rounded-lg flex items-center justify-center transition-all"
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </button>
                  )}

                  {/* Celebration Effect */}
                  {celebrationEffects.has(slot.index) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                    </div>
                  )}
                </>
              ) : (
                /* Empty Slot */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-dashed border-slate-500 rounded-lg flex items-center justify-center">
                    <Circle className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              )}

              {/* Hover Tooltip */}
              {slot.activity && isHovered && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-50">
                  <div className="bg-slate-900 border border-slate-600 rounded-lg p-2 shadow-xl min-w-48">
                    <div className="text-sm font-medium text-white mb-1">
                      {slot.activity.title}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {slot.activity.description}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-300">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{slot.activity.duration}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{slot.activity.roleModel}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{slot.activity.points} pts</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Daily Progress</span>
          <span className="text-white">
            {Math.round((activities.filter(a => a.isCompleted).length / activities.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(activities.filter(a => a.isCompleted).length / activities.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}