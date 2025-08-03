'use client'

import { useState } from 'react';
import { 
  Sparkles,
  X,
  Star,
  Crown
} from 'lucide-react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ThemeConfig } from '@/lib/theme-config';

interface ActivityTemplate {
  id: string;
  title: string;
  icon: string;
  category: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  duration: string;
  difficulty: number;
}

interface SimpleActivityLibraryProps {
  isVisible: boolean;
  theme: ThemeConfig;
  onToggle: () => void;
  onDragEnd?: (result: any) => void;
}

const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  // Common Activities (15-20 points)
  { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '🧘‍♂️', category: 'mindfulness', points: 15, rarity: 'common', duration: '5 min', difficulty: 1 },
  { id: 'quick-walk', title: 'Quick Walk', icon: '🚶‍♂️', category: 'physical', points: 20, rarity: 'common', duration: '10 min', difficulty: 1 },
  { id: 'hydrate', title: 'Hydrate', icon: '💧', category: 'physical', points: 15, rarity: 'common', duration: '1 min', difficulty: 1 },
  { id: 'posture-check', title: 'Posture Check', icon: '🏃‍♂️', category: 'physical', points: 15, rarity: 'common', duration: '2 min', difficulty: 1 },
  
  // Uncommon Activities (25-35 points)
  { id: 'strategic-planning', title: 'Strategic Planning', icon: '🎯', category: 'decision-making', points: 30, rarity: 'uncommon', duration: '15 min', difficulty: 2 },
  { id: 'creative-thinking', title: 'Creative Thinking', icon: '💡', category: 'creative', points: 25, rarity: 'uncommon', duration: '10 min', difficulty: 2 },
  { id: 'gratitude-practice', title: 'Gratitude Practice', icon: '🙏', category: 'mindfulness', points: 30, rarity: 'uncommon', duration: '5 min', difficulty: 2 },
  { id: 'skill-practice', title: 'Skill Practice', icon: '🎨', category: 'creative', points: 35, rarity: 'uncommon', duration: '20 min', difficulty: 2 },
  
  // Rare Activities (40-55 points)
  { id: 'empathy-practice', title: 'Empathy Practice', icon: '💝', category: 'communication', points: 45, rarity: 'rare', duration: '15 min', difficulty: 3 },
  { id: 'deep-reflection', title: 'Deep Reflection', icon: '🏛️', category: 'reflection', points: 50, rarity: 'rare', duration: '30 min', difficulty: 3 },
  { id: 'problem-solving', title: 'Problem Solving', icon: '🧩', category: 'decision-making', points: 40, rarity: 'rare', duration: '25 min', difficulty: 3 },
  { id: 'mentoring', title: 'Mentoring Others', icon: '👨‍🏫', category: 'communication', points: 55, rarity: 'rare', duration: '30 min', difficulty: 3 },
  
  // Epic Activities (60-75 points)
  { id: 'leadership-moment', title: 'Leadership Moment', icon: '👑', category: 'communication', points: 70, rarity: 'epic', duration: '45 min', difficulty: 4 },
  { id: 'innovation-session', title: 'Innovation Session', icon: '🚀', category: 'creative', points: 65, rarity: 'epic', duration: '60 min', difficulty: 4 },
  { id: 'conflict-resolution', title: 'Conflict Resolution', icon: '🤝', category: 'communication', points: 75, rarity: 'epic', duration: '30 min', difficulty: 4 },
  
  // Legendary Activities (80+ points)
  { id: 'life-changing-decision', title: 'Life-Changing Decision', icon: '🌟', category: 'decision-making', points: 100, rarity: 'legendary', duration: '90 min', difficulty: 5 },
  { id: 'inspire-others', title: 'Inspire Others', icon: '✨', category: 'communication', points: 90, rarity: 'legendary', duration: '60 min', difficulty: 5 },
  { id: 'master-skill', title: 'Master New Skill', icon: '🏆', category: 'creative', points: 85, rarity: 'legendary', duration: '120 min', difficulty: 5 }
];

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

export default function SimpleActivityLibrary({ isVisible, theme, onToggle, onDragEnd }: SimpleActivityLibraryProps) {
  // Fix Next.js SSR/CSR mismatch for React Beautiful DND
  if (typeof window === 'undefined') {
    return null;
  }

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'mindfulness', 'physical', 'decision-making', 'creative', 'communication', 'reflection'];
  
  const filteredActivities = selectedCategory === 'all' 
    ? ACTIVITY_TEMPLATES 
    : ACTIVITY_TEMPLATES.filter(activity => activity.category === selectedCategory);

  if (!isVisible) return null;

  console.log('📚 Activity Library loaded with', filteredActivities.length, 'activities');

  return (
    <div className={`${theme.libraryBackground} border ${theme.libraryBorder} rounded-xl shadow-2xl h-fit`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.libraryBorder}`}>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className={`${theme.libraryText} font-semibold`}>Activity Library</h3>
        </div>
        <button
          onClick={onToggle}
          className={`${theme.libraryText} opacity-70 hover:opacity-100 transition-colors`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Filter */}
      <div className={`p-4 border-b ${theme.libraryBorder}`}>
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === category
                  ? theme.libraryCategoryButtonActive
                  : theme.libraryCategoryButton
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Cards */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <Droppable droppableId="activity-library" type="ACTIVITY">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
                {filteredActivities.map((activity, index) => {
                  return (
                    <Draggable key={activity.id} draggableId={activity.id} index={index}>
                      {(provided, snapshot) => {
                        // Only log when dragging state changes
                        if (snapshot.isDragging) {
                          console.log('🎯 DRAGGING:', activity.title);
                        }
                        
                        return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`relative cursor-pointer p-3 rounded-lg border-2 ${getRarityBorder(activity.rarity)} 
                                   bg-gradient-to-br ${getRarityGradient(activity.rarity)} text-white transition-all duration-200 
                                   ${snapshot.isDragging ? 'scale-105 shadow-xl z-50' : 'hover:scale-105 hover:shadow-lg'}
                                   select-none`}
                        style={{
                          ...provided.draggableProps.style,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      >
                        {/* Show drop time when dragging */}
                        {snapshot.isDragging && (
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-400 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-50 animate-pulse">
                            <span id={`drop-time-${activity.id}`}>Drop Time</span>
                          </div>
                        )}
                        {/* Legendary Glow Effect */}
                        {activity.rarity === 'legendary' && (
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-600/20 animate-pulse rounded-lg" />
                        )}
                        
                        <div className="relative flex items-center space-x-3">
                          {/* Activity Icon */}
                          <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xl">{activity.icon}</span>
                          </div>
                          
                          {/* Activity Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{activity.title}</h4>
                            <div className="flex items-center justify-between text-xs opacity-90">
                              <span>{activity.duration}</span>
                              <span>Lv.{activity.difficulty}</span>
                            </div>
                          </div>
                          
                          {/* Points Badge */}
                          <div className="bg-black/40 px-2 py-1 rounded-full flex-shrink-0">
                            <span className="text-xs font-bold">{activity.points}pts</span>
                          </div>
                        </div>
                        
                        {/* Rarity Indicator */}
                        <div className="absolute -top-1 left-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRarityGradient(activity.rarity)}`} />
                        </div>
                        
                        {/* Epic/Legendary Crown */}
                        {(activity.rarity === 'epic' || activity.rarity === 'legendary') && (
                          <div className="absolute -top-1 right-2">
                            <Crown className="w-3 h-3 text-yellow-400" />
                          </div>
                        )}
                      </div>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
          )}
          </Droppable>
      </div>
      
      {/* Instructions */}
      <div className={`p-4 border-t ${theme.libraryBorder} ${theme.libraryBackground} opacity-80`}>
        <div className={`text-xs ${theme.libraryText} text-center opacity-70`}>
          <div className="flex items-center justify-center space-x-1 mb-1">
            <span>👆</span>
            <span>Drag activities to timeline slots</span>
          </div>
          <div className="opacity-60">No complex pop-ups needed!</div>
        </div>
      </div>
    </div>
  );
}