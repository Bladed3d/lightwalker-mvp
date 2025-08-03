'use client'

import { useState, useRef } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Clock, 
  Target, 
  Zap, 
  User,
  Gift,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Activity } from '@/types/daily-use';

interface ExtraCreditCarouselProps {
  extraActivities: Activity[];
  onActivityDragStart: (activity: Activity) => void;
  onActivitySelect: (activity: Activity) => void;
}

export default function ExtraCreditCarousel({
  extraActivities,
  onActivityDragStart,
  onActivitySelect
}: ExtraCreditCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Items per view (responsive)
  const itemsPerView = 3;
  const maxIndex = Math.max(0, extraActivities.length - itemsPerView);

  // Navigation functions
  const scrollLeft = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const scrollRight = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, activity: Activity, index: number) => {
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedIndex(index);
    onActivityDragStart(activity);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Get visible activities
  const visibleActivities = extraActivities.slice(currentIndex, currentIndex + itemsPerView);

  // Helper functions
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-400 bg-green-500/20';
    if (difficulty <= 6) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
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

  const getBonusPoints = (activity: Activity) => {
    // Extra credit activities give bonus points
    return Math.floor(activity.points * 1.5);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Extra Credit</h3>
            <p className="text-xs text-slate-400">Bonus activities for extra growth</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 px-2">
            {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, extraActivities.length)} of {extraActivities.length}
          </span>
          <button
            onClick={scrollRight}
            disabled={currentIndex >= maxIndex}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={carouselRef}
          className="flex space-x-3 h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView + 8)}%)` }}
        >
          {extraActivities.map((activity, index) => {
            const isDragged = draggedIndex === index;
            const bonusPoints = getBonusPoints(activity);

            return (
              <div
                key={activity.id}
                className={`flex-shrink-0 w-full h-full transition-all duration-200 ${
                  isDragged ? 'scale-95 opacity-50' : 'hover:scale-105'
                }`}
                style={{ width: `calc(${100 / itemsPerView}% - 0.5rem)` }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, activity, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Activity Card */}
                <div 
                  className="h-full bg-gradient-to-br from-slate-700/60 to-slate-800/60 rounded-xl border-2 border-slate-600 hover:border-yellow-500 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden group"
                  onClick={() => onActivitySelect(activity)}
                >
                  {/* Bonus Badge */}
                  <div className="absolute -top-1 -right-1 z-10">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-2 py-1 flex items-center space-x-1 shadow-lg">
                      <Star className="w-3 h-3 text-white" />
                      <span className="text-xs font-bold text-white">+{bonusPoints - activity.points}</span>
                    </div>
                  </div>

                  {/* Role Model Color Strip */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: activity.roleModelColor }}
                  />

                  {/* Card Content */}
                  <div className="p-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start space-x-3 mb-3">
                      {/* Category Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getCategoryIcon(activity.category)}
                      </div>
                      
                      {/* Title and Role Model */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {activity.roleModel}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mb-4 flex-1 line-clamp-3">
                      {activity.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2">
                      {/* Duration and Difficulty */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{activity.duration}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                          {activity.difficulty}/9
                        </div>
                      </div>

                      {/* Points */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-slate-400">
                          <Target className="w-3 h-3" />
                          <span className="capitalize">{activity.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-white line-through">{activity.points}</span>
                          <span className="text-sm font-bold text-yellow-400">{bonusPoints}</span>
                        </div>
                      </div>

                      {/* Attribute */}
                      <div className="text-xs text-slate-300 text-center bg-slate-600/30 rounded-md py-1 px-2 truncate">
                        {activity.attribute}
                      </div>
                    </div>
                  </div>

                  {/* Drag Indicator */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute top-2 left-2 text-xs text-blue-400 bg-blue-500/20 rounded-md px-2 py-1">
                      Drag to Timeline
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-500/0 via-orange-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:via-orange-500/5 group-hover:to-yellow-500/10 transition-all duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-4 pt-3 border-t border-slate-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-yellow-400">
              <Gift className="w-4 h-4" />
              <span className="font-medium">Bonus Activities</span>
            </div>
            <span className="text-slate-400">
              50% more points than scheduled
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>{extraActivities.length} available</span>
          </div>
        </div>
      </div>

      {/* Drag Instruction */}
      <div className="mt-2 text-center">
        <p className="text-xs text-slate-500">
          Drag activities to your timeline to schedule them
        </p>
      </div>
    </div>
  );
}