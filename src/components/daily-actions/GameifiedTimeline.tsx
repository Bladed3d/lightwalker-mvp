'use client'

import { useState } from 'react';
import { 
  Plus, 
  Clock, 
  Zap,
  Star,
  Trophy,
  Target,
  Sparkles,
  Crown,
  Activity as ActivityIcon,
  MoreHorizontal,
  X
} from 'lucide-react';
import { Activity } from '@/types/daily-use';
import GameifiedActivitySelector from './GameifiedActivitySelector';

interface GameifiedTimelineProps {
  activities: Activity[];
  onActivityAdd: (activity: Partial<Activity>, timeSlot?: string) => void;
  onActivityComplete: (activityId: string) => void;
  onActivitySelect: (activity: Activity) => void;
}

// Generate time slots for the day (6 AM to 10 PM in 30-min intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 22) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export default function GameifiedTimeline({
  activities,
  onActivityAdd,
  onActivityComplete,
  onActivitySelect
}: GameifiedTimelineProps) {
  const [showActivitySelector, setShowActivitySelector] = useState(false);
  const [showFloatingLibrary, setShowFloatingLibrary] = useState(false);
  const [currentTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30}`;
  });

  const timeSlots = generateTimeSlots();
  
  // Group activities by time slots
  const activityByTimeSlot = activities.reduce((acc, activity) => {
    if (activity.scheduledTime) {
      acc[activity.scheduledTime] = activity;
    }
    return acc;
  }, {} as Record<string, Activity>);

  const getActivityRarity = (points: number) => {
    if (points >= 80) return 'legendary';
    if (points >= 60) return 'epic';
    if (points >= 40) return 'rare';
    if (points >= 25) return 'uncommon';
    return 'common';
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400 shadow-lg shadow-yellow-400/50';
      default: return 'border-gray-400';
    }
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'mindfulness': return '🧘‍♂️';
      case 'decision-making': return '🎯';
      case 'communication': return '💝';
      case 'reflection': return '🏛️';
      case 'physical': return '💪';
      case 'creative': return '💡';
      default: return '⭐';
    }
  };

  const isCurrentTimeSlot = (timeSlot: string) => {
    return timeSlot === currentTime;
  };

  const isPastTimeSlot = (timeSlot: string) => {
    const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
    const slotTotalMinutes = slotHour * 60 + slotMinute;
    
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    return slotTotalMinutes < currentTotalMinutes;
  };

  const ActivitySlot = ({ timeSlot, activity }: { timeSlot: string; activity?: Activity }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const isCurrent = isCurrentTimeSlot(timeSlot);
    const isPast = isPastTimeSlot(timeSlot);
    const rarity = activity ? getActivityRarity(activity.points) : 'common';

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!activity && !isPast) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      
      // Handle drop logic would go here
      const draggedData = e.dataTransfer.getData('application/json');
      if (draggedData && !activity && !isPast) {
        try {
          const draggedActivity = JSON.parse(draggedData);
          onActivityAdd(draggedActivity, timeSlot);
        } catch (error) {
          console.error('Error parsing dropped activity:', error);
        }
      }
    };

    if (activity) {
      return (
        <div
          className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
            activity.isCompleted ? 'opacity-75' : ''
          }`}
          onClick={() => onActivitySelect(activity)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Activity Card */}
          <div className={`relative w-full h-24 rounded-lg border-2 ${getRarityBorder(rarity)} 
                           bg-gradient-to-br ${getRarityGradient(rarity)} p-3 text-white overflow-hidden`}>
            
            {/* Legendary Glow Effect */}
            {rarity === 'legendary' && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-600/20 animate-pulse" />
            )}
            
            {/* Completion Overlay */}
            {activity.isCompleted && (
              <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
            
            {/* Current Time Indicator */}
            {isCurrent && !activity.isCompleted && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
            
            {/* Activity Icon */}
            <div className="absolute top-1 left-1 text-xl">
              {getActivityIcon(activity.category)}
            </div>
            
            {/* Points Badge */}
            <div className="absolute top-1 right-1 bg-black/40 px-2 py-0.5 rounded-full">
              <span className="text-xs font-bold">{activity.points}</span>
            </div>
            
            {/* Activity Info */}
            <div className="absolute bottom-1 left-1 right-1">
              <h4 className="font-bold text-xs truncate">{activity.title}</h4>
              <div className="flex items-center justify-between text-xs opacity-90">
                <span>{activity.duration}</span>
                <span>Lv.{activity.difficulty}</span>
              </div>
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          
          {/* Rarity Indicator */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRarityGradient(rarity)}`} />
          </div>
        </div>
      );
    }

    // Empty Slot
    return (
      <div
        className={`relative w-full h-24 border-2 border-dashed rounded-lg transition-all duration-200 ${
          isCurrent 
            ? 'border-cyan-400 bg-cyan-500/10 animate-pulse' 
            : isPast
              ? 'border-gray-600 bg-gray-800/50'
              : isDragOver
                ? 'border-green-400 bg-green-500/20 scale-105'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 cursor-pointer'
        }`}
        onClick={() => !isPast && setShowActivitySelector(true)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Time Label */}
        <div className="absolute top-1 left-1 text-xs text-gray-400">
          {timeSlot}
        </div>
        
        {/* Add Button or Drop Indicator */}
        {!isPast && (
          <div className="absolute inset-0 flex items-center justify-center">
            {isDragOver ? (
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1 animate-bounce">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-green-400 font-medium">Drop Here</span>
              </div>
            ) : (
              <Plus className="w-6 h-6 text-gray-500" />
            )}
          </div>
        )}
        
        {/* Current Time Indicator */}
        {isCurrent && (
          <div className="absolute top-1 right-1 text-cyan-400 animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Today's Adventure</h2>
              <p className="text-gray-300">Build your legendary character through daily actions</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFloatingLibrary(!showFloatingLibrary)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center space-x-2 ${
                showFloatingLibrary
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-blue-500/25'
              } text-white`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{showFloatingLibrary ? 'Hide' : 'Show'} Library</span>
            </button>
            
            <button
              onClick={() => setShowActivitySelector(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-green-500/25 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Full Selector</span>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{activities.filter(a => a.isCompleted).length}</div>
            <div className="text-xs text-gray-300">Completed</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{activities.reduce((sum, a) => a.isCompleted ? sum + a.points : sum, 0)}</div>
            <div className="text-xs text-gray-300">XP Earned</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{activities.length}</div>
            <div className="text-xs text-gray-300">Scheduled</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{Math.round((activities.filter(a => a.isCompleted).length / Math.max(activities.length, 1)) * 100)}%</div>
            <div className="text-xs text-gray-300">Progress</div>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-400" />
            Activity Timeline
          </h3>
          <div className="text-sm text-gray-400">
            Current time: <span className="text-cyan-400 font-bold">{currentTime}</span>
          </div>
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {timeSlots.map((timeSlot) => (
            <div key={timeSlot} className="space-y-1">
              <div className="text-xs text-gray-400 text-center font-medium">
                {timeSlot}
              </div>
              <ActivitySlot 
                timeSlot={timeSlot} 
                activity={activityByTimeSlot[timeSlot]} 
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-600" />
            <span>Common</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" />
            <span>Uncommon</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
            <span>Rare</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
            <span>Epic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" />
            <span>Legendary</span>
          </div>
        </div>
      </div>

      {/* Floating Activity Library */}
      {showFloatingLibrary && (
        <div className="fixed top-20 right-4 z-40 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold text-sm">Quick Add</h4>
            <button
              onClick={() => setShowFloatingLibrary(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {/* Quick activity templates */}
            {[
              { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '🧘‍♂️', points: 15, rarity: 'common' },
              { id: 'strategic-planning', title: 'Strategic Planning', icon: '🎯', points: 30, rarity: 'uncommon' },
              { id: 'creative-thinking', title: 'Creative Thinking', icon: '💡', points: 25, rarity: 'uncommon' },
              { id: 'empathy-practice', title: 'Empathy Practice', icon: '💝', points: 45, rarity: 'rare' }
            ].map((activity) => (
              <div
                key={activity.id}
                className={`relative cursor-pointer p-3 rounded-lg border-2 ${getRarityBorder(activity.rarity)} 
                           bg-gradient-to-br ${getRarityGradient(activity.rarity)} text-white transition-all duration-200 hover:scale-105`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(activity));
                  e.dataTransfer.effectAllowed = 'copy';
                }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-semibold text-xs">{activity.title}</h5>
                    <span className="text-xs opacity-80">{activity.points}pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-400 text-center">
            Drag to timeline slots
          </div>
        </div>
      )}

      {/* Activity Selector Modal */}
      <GameifiedActivitySelector
        isOpen={showActivitySelector}
        onClose={() => setShowActivitySelector(false)}
        onScheduleActivity={(activity, timeSlot) => {
          onActivityAdd(activity, timeSlot);
          setShowActivitySelector(false);
        }}
        scheduledActivities={activities}
        availableTimeSlots={timeSlots}
      />
    </div>
  );
}