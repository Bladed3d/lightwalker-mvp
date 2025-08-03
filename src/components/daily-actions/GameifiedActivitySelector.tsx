'use client'

import { useState, useRef } from 'react';
import { 
  Plus, 
  Calendar,
  Clock,
  Star,
  Zap,
  Target,
  Crown,
  Gift,
  Sparkles,
  Trophy,
  X,
  DragHandleDots2Icon
} from 'lucide-react';
import { Activity } from '@/types/daily-use';

interface GameifiedActivitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleActivity: (activity: Partial<Activity>, time?: string) => void;
  scheduledActivities: Activity[];
  availableTimeSlots: string[];
}

// Activity Templates with Game-like Visual Design
const ACTIVITY_TEMPLATES = [
  {
    id: 'mindful-breathing',
    title: 'Mindful Breathing',
    icon: '🧘‍♂️',
    color: '#8B5A2B',
    rarity: 'common',
    category: 'mindfulness',
    difficulty: 2,
    duration: '5 min',
    points: 15,
    roleModel: 'Buddha',
    attribute: 'Mindful Awareness',
    description: 'Center yourself with conscious breathing',
    gameDescription: 'Restore mental energy and increase focus',
    unlockLevel: 1
  },
  {
    id: 'strategic-planning',
    title: 'Strategic Planning',
    icon: '🎯',
    color: '#1C1C1E',
    rarity: 'uncommon',
    category: 'decision-making',
    difficulty: 4,
    duration: '15 min',
    points: 30,
    roleModel: 'Steve Jobs',
    attribute: 'Strategic Focus',
    description: 'Plan your priorities with laser focus',
    gameDescription: 'Boost productivity and unlock achievement paths',
    unlockLevel: 3
  },
  {
    id: 'empathy-practice',
    title: 'Empathy Practice',
    icon: '💝',
    color: '#4A90E2',
    rarity: 'rare',
    category: 'communication',
    difficulty: 5,
    duration: '20 min',
    points: 45,
    roleModel: 'Martin Luther King Jr.',
    attribute: 'Empathetic Leadership',
    description: 'Practice deep listening and understanding',
    gameDescription: 'Enhance social skills and leadership abilities',
    unlockLevel: 5
  },
  {
    id: 'creative-thinking',
    title: 'Creative Thinking',
    icon: '💡',
    color: '#FF6B35',
    rarity: 'uncommon',
    category: 'creative',
    difficulty: 3,
    duration: '10 min',
    points: 25,
    roleModel: 'Albert Einstein',
    attribute: 'Intellectual Curiosity',
    description: 'Explore new ideas and perspectives',
    gameDescription: 'Unlock innovation bonuses and creativity buffs',
    unlockLevel: 2
  },
  {
    id: 'courage-challenge',
    title: 'Courage Challenge',
    icon: '⚔️',
    color: '#D4AF37',
    rarity: 'legendary',
    category: 'decision-making',
    difficulty: 8,
    duration: '30 min',
    points: 80,
    roleModel: 'Joan of Arc',
    attribute: 'Courageous Action',
    description: 'Face your fears with bold action',
    gameDescription: 'Epic quest: Overcome major obstacles',
    unlockLevel: 10
  },
  {
    id: 'philosophical-reflection',
    title: 'Philosophical Reflection',
    icon: '🏛️',
    color: '#9C27B0',
    rarity: 'rare',
    category: 'reflection',
    difficulty: 6,
    duration: '25 min',
    points: 50,
    roleModel: 'Marcus Aurelius',
    attribute: 'Philosophical Reflection',
    description: 'Deep contemplation on life and wisdom',
    gameDescription: 'Gain wisdom points and unlock philosophical insights',
    unlockLevel: 7
  }
];

// Extra Credit Activity Templates
const EXTRA_CREDIT_TEMPLATES = [
  {
    id: 'help-colleague',
    title: 'Helped a Colleague',
    icon: '🤝',
    color: '#10B981',
    points: 20,
    category: 'spontaneous-kindness',
    description: 'Assisted someone with their work',
    gameDescription: 'Teamwork bonus activated!'
  },
  {
    id: 'compliment-someone',
    title: 'Gave a Compliment',
    icon: '💬',
    color: '#F59E0B',
    points: 15,
    category: 'social-connection',
    description: 'Brightened someone\'s day with kind words',
    gameDescription: 'Social bond strengthened!'
  },
  {
    id: 'credit-coworker',
    title: 'Credited Coworker',
    icon: '🏆',
    color: '#8B5CF6',
    points: 25,
    category: 'leadership',
    description: 'Recognized someone else\'s contribution',
    gameDescription: 'Leadership points gained!'
  },
  {
    id: 'active-listening',
    title: 'Deep Listening',
    icon: '👂',
    color: '#EC4899',
    points: 18,
    category: 'empathy',
    description: 'Really listened to understand someone',
    gameDescription: 'Empathy skill increased!'
  },
  {
    id: 'problem-solving',
    title: 'Solved a Problem',
    icon: '🧩',
    color: '#06B6D4',
    points: 30,
    category: 'creativity',
    description: 'Found a creative solution to a challenge',
    gameDescription: 'Innovation achievement unlocked!'
  }
];

export default function GameifiedActivitySelector({
  isOpen,
  onClose,
  onScheduleActivity,
  scheduledActivities,
  availableTimeSlots
}: GameifiedActivitySelectorProps) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'extra-credit'>('schedule');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [draggedActivity, setDraggedActivity] = useState<any>(null);
  const [showActivityDetails, setShowActivityDetails] = useState<any>(null);
  
  // Simulated user level for unlocking activities
  const userLevel = 8;

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

  const handleDragStart = (e: React.DragEvent, activity: any) => {
    setDraggedActivity(activity);
    e.dataTransfer.setData('application/json', JSON.stringify(activity));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (timeSlot: string) => {
    if (draggedActivity) {
      onScheduleActivity(draggedActivity, timeSlot);
      setDraggedActivity(null);
    }
  };

  const ActivityCard = ({ activity, isExtraCredit = false }: { activity: any; isExtraCredit?: boolean }) => {
    const isLocked = !isExtraCredit && activity.unlockLevel > userLevel;
    const [isDragging, setIsDragging] = useState(false);
    
    return (
      <div
        className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
          isLocked ? 'opacity-50 cursor-not-allowed' : ''
        } ${isDragging ? 'opacity-60 scale-110' : ''}`}
        draggable={!isLocked && !isExtraCredit}
        onDragStart={(e) => {
          if (!isLocked) {
            setIsDragging(true);
            handleDragStart(e, activity);
          }
        }}
        onDragEnd={() => setIsDragging(false)}
        onClick={() => !isLocked && setShowActivityDetails(activity)}
      >
        {/* Card Container */}
        <div className={`relative w-full h-32 rounded-xl border-2 ${getRarityBorder(activity.rarity)} 
                         bg-gradient-to-br ${getRarityGradient(activity.rarity)} p-4 text-white overflow-hidden`}>
          
          {/* Rarity Glow Effect */}
          {activity.rarity === 'legendary' && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-600/20 animate-pulse" />
          )}
          
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center">
                <Crown className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
                <span className="text-xs">Level {activity.unlockLevel}</span>
              </div>
            </div>
          )}
          
          {/* Activity Icon */}
          <div className="absolute top-2 left-2 text-2xl">
            {activity.icon}
          </div>
          
          {/* Points Badge */}
          <div className="absolute top-2 right-2 bg-black/30 px-2 py-1 rounded-full">
            <span className="text-xs font-bold">{activity.points}pts</span>
          </div>
          
          {/* Activity Info */}
          <div className="absolute bottom-2 left-2 right-2">
            <h3 className="font-bold text-sm truncate">{activity.title}</h3>
            <div className="flex items-center justify-between text-xs opacity-90">
              <span>{activity.duration}</span>
              <span>Lv.{activity.difficulty}</span>
            </div>
          </div>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          {/* Drag Indicator */}
          {!isLocked && !isExtraCredit && (
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-xs text-white/80 bg-black/40 px-2 py-1 rounded-full">
                Drag to timeline
              </div>
            </div>
          )}
        </div>
        
        {/* Rarity Label */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r ${getRarityGradient(activity.rarity)} text-white`}>
            {activity.rarity?.toUpperCase()}
          </span>
        </div>
      </div>
    );
  };

  const TimeSlotGrid = () => (
    <div className="grid grid-cols-6 gap-2 p-4 bg-gray-900 rounded-xl border border-gray-700">
      <div className="col-span-6 text-center text-white font-bold mb-2">Timeline Slots</div>
      {availableTimeSlots.map((timeSlot) => {
        const isOccupied = scheduledActivities.some(a => a.scheduledTime === timeSlot);
        const occupiedActivity = scheduledActivities.find(a => a.scheduledTime === timeSlot);
        
        return (
          <div
            key={timeSlot}
            className={`aspect-square border-2 border-dashed rounded-lg p-2 transition-all duration-200 ${
              isOccupied 
                ? 'border-indigo-400 bg-indigo-500/20' 
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(timeSlot)}
          >
            <div className="text-xs text-gray-300 text-center">{timeSlot}</div>
            {occupiedActivity && (
              <div className="text-center mt-1">
                <div className="text-lg">{occupiedActivity.icon || '📅'}</div>
                <div className="text-xs text-white truncate">{occupiedActivity.title}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Activity Command Center</h2>
              <p className="text-gray-400">Build your legendary day</p>
            </div>
          </div>
          
          {/* Tab Selector */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📅 Schedule Actions
            </button>
            <button
              onClick={() => setActiveTab('extra-credit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'extra-credit'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⭐ Extra Credit
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'schedule' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Library */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-purple-400" />
                  Activity Library
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {ACTIVITY_TEMPLATES.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>

              {/* Timeline Scheduler */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-400" />
                  Today's Schedule
                </h3>
                <TimeSlotGrid />
                
                {/* Instructions */}
                <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    🎮 <strong>How to play:</strong> Drag activities from the library to schedule them on your timeline, or click cards for details!
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    💡 Tip: Close this modal and drag activities directly to time slots on the main timeline
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Extra Credit Actions
              </h3>
              <p className="text-gray-400 mb-6">
                Log spontaneous good deeds and bonus activities you've completed today!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {EXTRA_CREDIT_TEMPLATES.map((activity) => (
                  <div
                    key={activity.id}
                    className="cursor-pointer"
                    onClick={() => onScheduleActivity(activity)}
                  >
                    <ActivityCard activity={activity} isExtraCredit={true} />
                  </div>
                ))}
              </div>
              
              {/* Custom Extra Credit Input */}
              <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                <h4 className="text-white font-semibold mb-3">Custom Good Deed</h4>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="What good deed did you do? (e.g., 'Held door for stranger')"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    +20 XP
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Details Modal */}
        {showActivityDetails && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 max-w-md w-full">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{showActivityDetails.icon}</div>
                <h3 className="text-xl font-bold text-white">{showActivityDetails.title}</h3>
                <p className="text-gray-400">{showActivityDetails.gameDescription}</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Role Model:</span>
                  <span className="text-white">{showActivityDetails.roleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attribute:</span>
                  <span className="text-white">{showActivityDetails.attribute}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Points:</span>
                  <span className="text-yellow-400 font-bold">{showActivityDetails.points} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{showActivityDetails.duration}</span>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    onScheduleActivity(showActivityDetails);
                    setShowActivityDetails(null);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add to Timeline
                </button>
                <button
                  onClick={() => setShowActivityDetails(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}