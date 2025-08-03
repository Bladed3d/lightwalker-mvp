'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  Clock, 
  Zap, 
  Star, 
  Target,
  PlayCircle,
  AlertCircle,
  Trophy,
  Flame,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Activity, DailySchedule } from '@/types/daily-use';

interface ActionInventorySystemProps {
  schedule: DailySchedule;
  onActivitySelect: (activity: Activity) => void;
  onActivityComplete: (activityId: string) => Promise<void>;
  onActivityDragToSlot: (activityId: string, slotIndex: number) => void;
  extraCreditActions: Activity[];
  currentTime: Date;
  syncLevel: number; // 0-100
  activeStreak: number;
  pointsEarned: number;
}

interface InventorySlot {
  id: string;
  activity?: Activity;
  isLocked: boolean;
  slotIndex: number;
}

interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  type: 'completion' | 'points' | 'streak';
  value?: number;
  timestamp: number;
}

export default function ActionInventorySystem({
  schedule,
  onActivitySelect,
  onActivityComplete,
  onActivityDragToSlot,
  extraCreditActions,
  currentTime,
  syncLevel,
  activeStreak,
  pointsEarned
}: ActionInventorySystemProps) {
  const [inventorySlots, setInventorySlots] = useState<InventorySlot[]>([]);
  const [draggedActivity, setDraggedActivity] = useState<Activity | null>(null);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [completionAnimations, setCompletionAnimations] = useState<string[]>([]);

  // Initialize inventory slots (4x4 grid = 16 slots)
  useEffect(() => {
    const slots: InventorySlot[] = [];
    for (let i = 0; i < 16; i++) {
      const scheduledActivity = schedule.activities[i];
      slots.push({
        id: `slot-${i}`,
        activity: scheduledActivity,
        isLocked: false,
        slotIndex: i
      });
    }
    setInventorySlots(slots);
  }, [schedule.activities]);

  // Auto-scroll timeline logic
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const totalMinutesInDay = 24 * 60;
      const position = (minutes / totalMinutesInDay) * 100;
      setTimelinePosition(position);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Handle activity completion with particle effects
  const handleActivityComplete = useCallback(async (activityId: string, slotIndex: number) => {
    const activity = inventorySlots.find(slot => slot.activity?.id === activityId)?.activity;
    if (!activity) return;

    // Add completion animation
    setCompletionAnimations(prev => [...prev, activityId]);

    // Create particle effects
    const newParticles: ParticleEffect[] = [
      {
        id: `completion-${Date.now()}`,
        x: (slotIndex % 4) * 25 + 12.5, // Position based on grid
        y: Math.floor(slotIndex / 4) * 25 + 12.5,
        type: 'completion',
        timestamp: Date.now()
      },
      {
        id: `points-${Date.now()}`,
        x: (slotIndex % 4) * 25 + 12.5,
        y: Math.floor(slotIndex / 4) * 25 + 12.5,
        type: 'points',
        value: activity.points,
        timestamp: Date.now()
      }
    ];

    setParticles(prev => [...prev, ...newParticles]);

    // Call the completion handler
    await onActivityComplete(activityId);

    // Clean up animations after delay
    setTimeout(() => {
      setCompletionAnimations(prev => prev.filter(id => id !== activityId));
      setParticles(prev => prev.filter(p => Date.now() - p.timestamp < 3000));
    }, 3000);
  }, [inventorySlots, onActivityComplete]);

  // Drag and drop handlers
  const handleDragStart = (activity: Activity) => {
    setDraggedActivity(activity);
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setHoveredSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setHoveredSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    if (draggedActivity) {
      onActivityDragToSlot(draggedActivity.id, slotIndex);
      setDraggedActivity(null);
      setHoveredSlot(null);
    }
  };

  // Timeline navigation
  const handleTimelineNavigate = (direction: 'left' | 'right') => {
    setIsAutoScrolling(false);
    setTimelinePosition(prev => {
      const step = 5; // 5% increments
      const newPosition = direction === 'left' ? prev - step : prev + step;
      return Math.max(0, Math.min(100, newPosition));
    });
  };

  const handleSnapToNow = () => {
    setIsAutoScrolling(true);
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const totalMinutesInDay = 24 * 60;
    const position = (minutes / totalMinutesInDay) * 100;
    setTimelinePosition(position);
  };

  // Get current activity based on time
  const getCurrentActivity = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return schedule.activities.find(activity => {
      if (!activity.scheduledTime || activity.isCompleted) return false;
      const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
      const activityMinutes = hours * 60 + minutes;
      return Math.abs(activityMinutes - currentMinutes) <= 30;
    });
  };

  const currentActivity = getCurrentActivity();

  // Calculate sync level color
  const getSyncLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 60) return 'text-yellow-500';
    if (level >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get streak flame color
  const getStreakFlameColor = (streak: number) => {
    if (streak >= 30) return 'text-blue-500';
    if (streak >= 14) return 'text-purple-500';
    if (streak >= 7) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Current Activity Spotlight */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10">
          {/* Stats Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              {/* Sync Level */}
              <div className="text-center">
                <div className="relative w-16 h-16 mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${syncLevel}, 100`}
                      className={getSyncLevelColor(syncLevel)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{syncLevel}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-300">Sync Level</div>
              </div>

              {/* Active Streak */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-2">
                  <Flame className={`w-8 h-8 ${getStreakFlameColor(activeStreak)}`} />
                  <span className="text-white font-bold text-lg ml-1">{activeStreak}</span>
                </div>
                <div className="text-xs text-gray-300">Day Streak</div>
              </div>

              {/* Today's Points */}
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-2">
                  <Star className="w-6 h-6 text-yellow-500 mr-1" />
                  <span className="text-white font-bold text-lg">{pointsEarned}</span>
                </div>
                <div className="text-xs text-gray-300">Points</div>
              </div>
            </div>

            {/* Timeline Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleTimelineNavigate('left')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={handleSnapToNow}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
              >
                NOW
              </button>
              
              <button
                onClick={() => handleTimelineNavigate('right')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Current Activity Hero */}
          {currentActivity && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-pulse" />
                <div className="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">{currentActivity.title}</h2>
              <p className="text-gray-300 mb-4">{currentActivity.description}</p>
              
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-medium">
                <Zap className="w-4 h-4 mr-2" />
                HIGH ENERGY
              </div>
            </div>
          )}

          {/* Timeline Visualization */}
          <div className="mt-8">
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${timelinePosition}%` }}
              />
              
              {/* Activity markers on timeline */}
              {schedule.activities.map((activity, index) => {
                if (!activity.scheduledTime) return null;
                const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
                const position = ((hours * 60 + minutes) / (24 * 60)) * 100;
                
                return (
                  <div
                    key={activity.id}
                    className="absolute top-0 w-4 h-4 -mt-0 transform -translate-x-2"
                    style={{ left: `${position}%` }}
                  >
                    <div 
                      className={`w-4 h-4 rounded-full border-2 border-white ${
                        activity.isCompleted 
                          ? 'bg-green-500' 
                          : activity === currentActivity 
                            ? 'bg-cyan-400 animate-pulse' 
                            : 'bg-gray-400'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Extra Credit Points Progress */}
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-400">Extra Credit Points</span>
              <div className="h-1 bg-white/10 rounded-full mt-1">
                <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Actions Inventory (4x4 Grid) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-cyan-400" />
              Scheduled Actions
            </h3>
            
            <div className="grid grid-cols-4 gap-2 relative">
              {/* Particle Effects Container */}
              <div className="absolute inset-0 pointer-events-none">
                {particles.map((particle) => (
                  <div
                    key={particle.id}
                    className={`absolute animate-ping ${
                      particle.type === 'completion' 
                        ? 'text-green-400' 
                        : particle.type === 'points' 
                          ? 'text-yellow-400' 
                          : 'text-cyan-400'
                    }`}
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {particle.type === 'completion' && <Check className="w-6 h-6" />}
                    {particle.type === 'points' && <span className="text-sm font-bold">+{particle.value}</span>}
                    {particle.type === 'streak' && <Flame className="w-6 h-6" />}
                  </div>
                ))}
              </div>

              {/* Inventory Slots */}
              {inventorySlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`aspect-square rounded-lg border-2 transition-all duration-200 ${
                    slot.activity
                      ? `border-slate-600 ${
                          slot.activity.isCompleted
                            ? 'bg-green-500/20 border-green-500/50'
                            : slot.activity === currentActivity
                              ? 'bg-cyan-500/20 border-cyan-500/50 animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700'
                        }`
                      : hoveredSlot === index
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-800/50 border-dashed'
                  }`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => slot.activity && onActivitySelect(slot.activity)}
                >
                  {slot.activity ? (
                    <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center relative">
                      {/* Activity Icon */}
                      <div className="w-8 h-8 mb-1 flex items-center justify-center">
                        {slot.activity.category === 'mindfulness' && <Clock className="w-6 h-6 text-purple-400" />}
                        {slot.activity.category === 'physical' && <Zap className="w-6 h-6 text-red-400" />}
                        {slot.activity.category === 'creative' && <Star className="w-6 h-6 text-yellow-400" />}
                        {slot.activity.category === 'communication' && <PlayCircle className="w-6 h-6 text-green-400" />}
                        {slot.activity.category === 'decision-making' && <Target className="w-6 h-6 text-blue-400" />}
                        {slot.activity.category === 'reflection' && <Trophy className="w-6 h-6 text-indigo-400" />}
                      </div>
                      
                      {/* Activity Name */}
                      <div className="text-xs text-white font-medium leading-tight mb-1 line-clamp-2">
                        {slot.activity.title}
                      </div>
                      
                      {/* Time & Points */}
                      <div className="absolute top-1 right-1 text-xs text-gray-400">
                        {slot.activity.scheduledTime}
                      </div>
                      <div className="absolute bottom-1 right-1 text-xs text-yellow-400 font-bold">
                        {slot.activity.points}
                      </div>
                      
                      {/* Completion Overlay */}
                      {slot.activity.isCompleted && (
                        <div className="absolute inset-0 bg-green-500/30 rounded-lg flex items-center justify-center">
                          <Check className="w-8 h-8 text-green-400" />
                        </div>
                      )}
                      
                      {/* Completion Animation */}
                      {completionAnimations.includes(slot.activity.id) && (
                        <div className="absolute inset-0 bg-green-500/50 rounded-lg animate-pulse" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-2xl">+</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extra Credit Actions Panel */}
        <div className="space-y-6">
          {/* Extra Credit Actions */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Extra Credit Actions
            </h3>
            
            <div className="space-y-3">
              {extraCreditActions.map((action) => (
                <div
                  key={action.id}
                  draggable
                  onDragStart={() => handleDragStart(action)}
                  className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg cursor-move hover:border-yellow-400/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{action.title}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-bold">{action.points}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{action.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{action.roleModel}</span>
                    <span className="text-xs text-orange-400">Bonus</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Character Development
            </h3>
            
            {/* Attribute Progress Bars */}
            <div className="space-y-3">
              {['Mindfulness', 'Leadership', 'Creativity', 'Resilience'].map((attribute, index) => (
                <div key={attribute}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{attribute}</span>
                    <span className="text-gray-400">{75 + index * 5}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${75 + index * 5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}