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
import { ThemeConfig } from '@/lib/theme-config';
import { Droppable } from 'react-beautiful-dnd';
import SimpleActivityLibrary from './SimpleActivityLibrary';

interface GameifiedTimelineProps {
  activities: Activity[];
  theme: ThemeConfig;
  onActivityAdd: (activity: Partial<Activity>, timeSlot?: string) => void;
  onActivityComplete: (activityId: string) => void;
  onActivitySelect: (activity: Activity) => void;
  onDragEnd?: (result: any) => void;
}

// Generate time slots for the day (6 AM to 10 PM in 30-min intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 6; hour <= 22; hour++) {
    // Convert to 12-hour format like timeline
    const hour12 = hour === 0 ? '12:00a' : 
                   hour <= 11 ? `${hour}:00a` : 
                   hour === 12 ? '12:00p' : 
                   `${hour-12}:00p`;
    slots.push(hour12);
    
    if (hour < 22) {
      const hour12_30 = hour === 0 ? '12:30a' : 
                        hour <= 11 ? `${hour}:30a` : 
                        hour === 12 ? '12:30p' : 
                        `${hour-12}:30p`;
      slots.push(hour12_30);
    }
  }
  return slots;
};

export default function GameifiedTimeline({
  activities,
  theme,
  onActivityAdd,
  onActivityComplete,
  onActivitySelect,
  onDragEnd
}: GameifiedTimelineProps) {
  const [showSimpleLibrary, setShowSimpleLibrary] = useState(false);
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
          {/* Activity Card - Smaller like reference */}
          <div className={`relative w-full h-20 rounded-lg border-2 ${getRarityBorder(rarity)} 
                           bg-gradient-to-br ${getRarityGradient(rarity)} p-2 text-white overflow-hidden`}>
            
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
        className={`relative w-full h-20 border-2 border-dashed rounded-lg transition-all duration-200 ${
          isCurrent 
            ? 'border-cyan-400 bg-cyan-500/10 animate-pulse' 
            : isPast
              ? 'border-gray-600 bg-gray-800/50'
              : isDragOver
                ? 'border-green-400 bg-green-500/20 scale-105'
                : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 cursor-pointer'
        }`}
        onClick={() => console.log('Slot clicked:', timeSlot)}
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
              onClick={() => setShowSimpleLibrary(!showSimpleLibrary)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center space-x-2 ${
                showSimpleLibrary
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-blue-500/25'
              } text-white`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{showSimpleLibrary ? 'Hide' : 'Show'} Activities</span>
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

      {/* Main Grid Layout */}
      <div className="flex gap-6">
        {/* Timeline Grid */}
        <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-400" />
              Activity Timeline
            </h3>
            <div className="text-sm text-gray-400">
              Current time: <span className="text-cyan-400 font-bold">{currentTime}</span>
            </div>
          </div>

          {/* Time Grid - More compact like reference with React Beautiful DND */}
          <Droppable droppableId="activity-grid" type="ACTIVITY">
            {(provided, snapshot) => {
              // Only log when dragging state changes
              if (snapshot.isDraggingOver) {
                console.log('✅ Grid: DRAGGING OVER', snapshot.draggingOverWith);
              }
              
              return (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 ${
                    snapshot.isDraggingOver ? 'bg-green-500/10 border-2 border-green-400 border-dashed rounded-lg p-2' : ''
                  }`}
                >
                  {timeSlots.map((timeSlot, index) => (
                    <div key={timeSlot} className="space-y-1">
                      <div className="text-xs text-gray-400 text-center font-medium">
                        {timeSlot}
                      </div>
                      <Droppable droppableId={`slot-${timeSlot}`} type="ACTIVITY">
                        {(slotProvided, slotSnapshot) => (
                          <div
                            {...slotProvided.droppableProps}
                            ref={slotProvided.innerRef}
                            className={`relative w-full h-20 border-2 border-dashed rounded-lg transition-all duration-200 ${
                              slotSnapshot.isDraggingOver
                                ? 'border-green-400 bg-green-500/20 scale-105'
                                : activityByTimeSlot[timeSlot]
                                  ? 'border-cyan-400 bg-cyan-500/10'
                                  : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700 cursor-pointer'
                            }`}
                          >
                            {activityByTimeSlot[timeSlot] ? (
                              <div className="p-2 text-center">
                                <div className="text-sm font-semibold">{activityByTimeSlot[timeSlot].title}</div>
                                <div className="text-xs opacity-75">{activityByTimeSlot[timeSlot].duration}</div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-xs text-gray-500">
                                  {slotSnapshot.isDraggingOver ? '📅 Drop Here' : 'Empty'}
                                </div>
                              </div>
                            )}
                            {slotProvided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>

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

        {/* Activity Library - Right beside the grid */}
        {showSimpleLibrary && (
          <div className="w-80 flex-shrink-0">
            <SimpleActivityLibrary 
              isVisible={true}
              theme={theme}
              onToggle={() => setShowSimpleLibrary(false)}
              onDragEnd={onDragEnd}
            />
          </div>
        )}
      </div>


    </div>
  );
}