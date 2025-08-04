'use client'

import React, { useState, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ThemeConfig } from '@/lib/theme-config';
import { ActivityPreference } from '@/types/daily-use';
import { applyPreferencesToActivities } from '@/lib/activity-preferences';

interface ActivityTemplate {
  id: string;
  title: string;
  icon: string;
  category: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  duration: string;
  difficulty: number;
  description: string;
  gridSize?: { w: number; h: number }; // Width and height in grid units
}

interface TarkovInventoryGridProps {
  theme: ThemeConfig;
  onDragEnd?: (result: any) => void;
  onActivityEdit?: (activity: ActivityTemplate) => void;
  activityPreferences?: ActivityPreference[];
}

const ACTIVITY_TEMPLATES: ActivityTemplate[] = [
  // Common Activities (15-20 points) - sorted alphabetically
  { id: 'hydrate', title: 'Hydrate', icon: '/activity-icons/hydrate.jpg', category: 'physical', points: 15, rarity: 'common', duration: '1 min', difficulty: 1, description: 'Stay hydrated with pure water', gridSize: { w: 1, h: 2 } },
  { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '/activity-icons/meditation.jpg', category: 'mindfulness', points: 15, rarity: 'common', duration: '5 min', difficulty: 1, description: 'Center yourself with conscious breathing' },
  { id: 'posture-check', title: 'Posture Check', icon: '/activity-icons/posture-check.jpg', category: 'physical', points: 15, rarity: 'common', duration: '2 min', difficulty: 1, description: 'Align your spine and shoulders' },
  { id: 'quick-walk', title: 'Quick Walk', icon: '/activity-icons/running.jpg', category: 'physical', points: 20, rarity: 'common', duration: '10 min', difficulty: 1, description: 'Get your body moving with a short walk' },
  
  // Uncommon Activities (25-35 points)
  { id: 'creative-thinking', title: 'Creative Thinking', icon: '/activity-icons/creative-thinking.jpg', category: 'creative', points: 25, rarity: 'uncommon', duration: '10 min', difficulty: 2, description: 'Generate innovative ideas and solutions' },
  { id: 'gratitude-practice', title: 'Gratitude Practice', icon: '/activity-icons/gratitude.jpg', category: 'mindfulness', points: 30, rarity: 'uncommon', duration: '5 min', difficulty: 2, description: 'Acknowledge what you are thankful for' },
  { id: 'skill-practice', title: 'Skill Practice', icon: '/activity-icons/skill-practice.jpg', category: 'creative', points: 35, rarity: 'uncommon', duration: '20 min', difficulty: 2, description: 'Develop a meaningful skill or craft' },
  { id: 'strategic-planning', title: 'Strategic Planning', icon: '/activity-icons/strategic-planning.jpg', category: 'decision-making', points: 30, rarity: 'uncommon', duration: '15 min', difficulty: 2, description: 'Plan your approach to important goals' },
  
  // Rare Activities (40-55 points)
  { id: 'deep-reflection', title: 'Deep Reflection', icon: '/activity-icons/deep-reflection.jpg', category: 'reflection', points: 50, rarity: 'rare', duration: '30 min', difficulty: 3, description: 'Contemplate life\'s deeper meanings' },
  { id: 'empathy-practice', title: 'Empathy Practice', icon: '/activity-icons/empathy.jpg', category: 'communication', points: 45, rarity: 'rare', duration: '15 min', difficulty: 3, description: 'Understand others\' perspectives deeply' },
  { id: 'mentoring', title: 'Mentoring Others', icon: '/activity-icons/mentoring.jpg', category: 'communication', points: 55, rarity: 'rare', duration: '30 min', difficulty: 3, description: 'Guide and teach someone valuable skills' },
  { id: 'problem-solving', title: 'Problem Solving', icon: '/activity-icons/problem-solving.jpg', category: 'decision-making', points: 40, rarity: 'rare', duration: '25 min', difficulty: 3, description: 'Tackle complex challenges systematically' },
  
  // Epic Activities (60-75 points)
  { id: 'conflict-resolution', title: 'Conflict Resolution', icon: '/activity-icons/conflict-resolution.jpg', category: 'communication', points: 75, rarity: 'epic', duration: '30 min', difficulty: 4, description: 'Resolve disputes with wisdom and skill', gridSize: { w: 2, h: 1 } },
  { id: 'innovation-session', title: 'Innovation Session', icon: '/activity-icons/innovation-session.jpg', category: 'creative', points: 65, rarity: 'epic', duration: '60 min', difficulty: 4, description: 'Create breakthrough solutions', gridSize: { w: 2, h: 2 } },
  { id: 'leadership-moment', title: 'Leadership Moment', icon: '/activity-icons/leadership-moment.jpg', category: 'communication', points: 70, rarity: 'epic', duration: '45 min', difficulty: 4, description: 'Lead others toward a common goal' },
  
  // Legendary Activities (80+ points)
  { id: 'inspire-others', title: 'Inspire Others', icon: '/activity-icons/inspire-others.jpg', category: 'communication', points: 90, rarity: 'legendary', duration: '60 min', difficulty: 5, description: 'Motivate people to achieve greatness' },
  { id: 'life-changing-decision', title: 'Life-Changing Decision', icon: '/activity-icons/life-changing-decision.jpg', category: 'decision-making', points: 100, rarity: 'legendary', duration: '90 min', difficulty: 5, description: 'Make a decision that transforms your path' },
  { id: 'master-skill', title: 'Master New Skill', icon: '/activity-icons/learn.jpg', category: 'creative', points: 85, rarity: 'legendary', duration: '120 min', difficulty: 5, description: 'Achieve mastery in a meaningful domain' }
];

const getRarityColors = (rarity: string) => {
  switch (rarity) {
    case 'common': 
      return {
        border: 'border-gray-500',
        background: 'bg-black',
        glow: 'shadow-gray-500/20',
        text: 'text-gray-300'
      };
    case 'uncommon': 
      return {
        border: 'border-green-500',
        background: 'bg-black',
        glow: 'shadow-green-500/30',
        text: 'text-green-300'
      };
    case 'rare': 
      return {
        border: 'border-blue-500',
        background: 'bg-black',
        glow: 'shadow-blue-500/30',
        text: 'text-blue-300'
      };
    case 'epic': 
      return {
        border: 'border-purple-500',
        background: 'bg-black',
        glow: 'shadow-purple-500/30',
        text: 'text-purple-300'
      };
    case 'legendary': 
      return {
        border: 'border-yellow-500',
        background: 'bg-black',
        glow: 'shadow-yellow-500/50',
        text: 'text-yellow-300'
      };
    default: 
      return {
        border: 'border-gray-500',
        background: 'bg-black',
        glow: 'shadow-gray-500/20',
        text: 'text-gray-300'
      };
  }
};

export default function TarkovInventoryGrid({ theme, onDragEnd, onActivityEdit, activityPreferences = [] }: TarkovInventoryGridProps) {
  const [hoveredActivity, setHoveredActivity] = useState<ActivityTemplate | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  // Fix Next.js SSR/CSR mismatch for React Beautiful DND
  if (typeof window === 'undefined') {
    return null;
  }

  const handleMouseEnter = (activity: ActivityTemplate, e: React.MouseEvent) => {
    setHoveredActivity(activity);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredActivity) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredActivity(null);
  };

  // Apply saved preferences to template activities
  const activitiesWithPreferences = React.useMemo(() => {
    console.log('🎨 TarkovInventoryGrid applying preferences:', activityPreferences.length, 'preferences');
    
    if (activityPreferences.length === 0) {
      console.log('📝 No preferences to apply, using default templates');
      return ACTIVITY_TEMPLATES;
    }
    
    console.log('🔧 Activity preferences:', activityPreferences);
    
    // Convert templates to Activity format temporarily for preferences application
    const activitiesForPrefs = ACTIVITY_TEMPLATES.map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
      roleModel: 'Template',
      roleModelId: 'template',
      attribute: 'Personal Growth',
      duration: template.duration,
      difficulty: template.difficulty,
      timeOfDay: 'anytime' as const,
      category: template.category as any,
      scheduledTime: '12:00p',
      isCompleted: false,
      points: template.points,
      icon: template.icon, // Include icon for preferences application
      method: 'Practice with intention',
      benefit: 'Builds character',
      successCriteria: 'Complete with focus',
      roleModelColor: '#6B73FF',
      roleModelArchetype: 'guide' as const,
    }));
    
    const withPreferences = applyPreferencesToActivities(activitiesForPrefs, activityPreferences);
    
    // Convert back to template format
    const result = withPreferences.map((activity, index) => {
      const template = ACTIVITY_TEMPLATES[index];
      const updated = {
        ...template,
        duration: activity.duration,
        points: activity.points,
        difficulty: activity.difficulty,
        title: activity.title,
        icon: activity.icon, // Apply custom images from preferences
      };
      
      if (template.id === 'quick-walk') {
        console.log('🏃 Quick Walk template updated:', {
          templateId: template.id,
          original: { icon: template.icon, duration: template.duration, points: template.points },
          activityFromPrefs: { icon: activity.icon, duration: activity.duration, points: activity.points },
          finalUpdated: { icon: updated.icon, duration: updated.duration, points: updated.points }
        });
      }
      
      return updated;
    });
    
    return result;
  }, [activityPreferences]);

  return (
    <>
      {/* Tarkov-Style Inventory Grid */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-4 shadow-2xl relative">
        {/* Header with Tarkov styling */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-600">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-green-400 font-mono text-lg font-semibold tracking-wider">
              ACTIVITY INVENTORY
            </h3>
            <div className="text-slate-400 font-mono text-sm">
              [{activitiesWithPreferences.length} ITEMS]
            </div>
          </div>
          <div className="text-slate-500 font-mono text-xs">
            DRAG TO DEPLOY
          </div>
        </div>

        {/* Grid Container */}
        <Droppable droppableId="tarkov-inventory" type="ACTIVITY">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                (gridRef as any).current = el;
              }}
              className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-0 border border-slate-600"
              style={{ 
                gridAutoRows: '100px',
                gridAutoFlow: 'row dense'
              }}
              onMouseMove={handleMouseMove}
            >
              {activitiesWithPreferences.map((activity, index) => {
                const colors = getRarityColors(activity.rarity);
                
                return (
                  <Draggable key={activity.id} draggableId={activity.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          relative bg-black border border-slate-600
                          flex items-center justify-center cursor-pointer transition-all duration-200
                          ${snapshot.isDragging ? 'opacity-90 shadow-2xl z-50' : 'hover:border-slate-400'}
                          ${!activity.gridSize ? 'aspect-square' : ''}
                        `}
                        style={{
                          ...provided.draggableProps.style,
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none',
                          // Apply scale through style to avoid conflicts with React Beautiful DND
                          transform: snapshot.isDragging 
                            ? `${provided.draggableProps.style?.transform || ''} scale(0.75)`.trim()
                            : provided.draggableProps.style?.transform,
                          gridColumn: activity.gridSize ? `span ${activity.gridSize.w}` : undefined,
                          gridRow: activity.gridSize ? `span ${activity.gridSize.h}` : undefined
                        }}
                        onMouseEnter={(e) => handleMouseEnter(activity, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {/* Enhanced drop time popup when dragging */}
                        {snapshot.isDragging && (
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-2xl z-[100] animate-pulse border-2 border-green-300 w-24">
                            <div className="text-center">
                              <div className="text-xs opacity-90">Drop at</div>
                              <div id={`drop-time-${activity.id}`} className="text-base font-black w-full">Hover Timeline</div>
                            </div>
                            {/* Arrow pointing down */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-500"></div>
                          </div>
                        )}
                        
                        {/* Activity Image or Emoji */}
                        {(activity.icon.startsWith('/') || activity.icon.startsWith('data:')) ? (
                          <img 
                            src={activity.icon} 
                            alt={activity.title}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="text-3xl md:text-4xl select-none opacity-30">
                            {activity.icon}
                          </div>
                        )}
                        
                        {/* Item count (like ammo count in Tarkov) */}
                        <div className="absolute bottom-1 right-1 text-white text-xs font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {activity.points}
                        </div>
                        
                        {/* Inspection checkmark for completed items */}
                        {/* <div className="absolute top-1 right-1 text-green-400 text-xs">✓</div> */}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Orange Edit Triangle - Bottom Right Corner - FIXED DROP ZONE */}
        <Droppable droppableId="activity-edit-zone" type="ACTIVITY">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="absolute bottom-0 right-0 w-32 h-32"
              style={{ 
                pointerEvents: 'auto',
                // React Beautiful DND requires minimum dimensions for reliable drop detection
                minWidth: '128px',
                minHeight: '128px',
                // Ensure drop zone is above other elements
                zIndex: 10
              }}
            >
              {/* Invisible Drop Target - Full 128x128 area for reliable drop detection */}
              <div
                className={`absolute inset-0 w-full h-full transition-all duration-200 ${
                  snapshot.isDraggingOver 
                    ? 'bg-orange-400/20 border-2 border-orange-400 border-dashed' 
                    : 'bg-transparent'
                }`}
                style={{
                  // Ensure the full area is a valid drop target
                  pointerEvents: 'auto',
                  cursor: snapshot.isDraggingOver ? 'copy' : 'default'
                }}
              />
              
              {/* Triangle Image with Text */}
              <img 
                src="/activity-icons/drag-here-triangle.png"
                alt="Drag Here to Edit"
                className={`absolute bottom-0 right-0 transition-all duration-200 pointer-events-none ${
                  snapshot.isDraggingOver ? 'w-32 h-32 opacity-90' : 'w-24 h-24'
                }`}
                style={{ zIndex: 11 }}
              />
              
              {/* Required placeholder for React Beautiful DND */}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Tooltip */}
      {hoveredActivity && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-4 shadow-2xl max-w-xs">
            <div className="mb-2">
              <h4 className="text-green-400 font-semibold font-mono text-lg">{hoveredActivity.title}</h4>
            </div>
            <p className="text-slate-300 text-sm mb-3">{hoveredActivity.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Points:</span>
                <span className="text-yellow-400 font-bold ml-1">{hoveredActivity.points}</span>
              </div>
              <div>
                <span className="text-slate-500">Duration:</span>
                <span className="text-blue-400 ml-1">{hoveredActivity.duration}</span>
              </div>
              <div>
                <span className="text-slate-500">Difficulty:</span>
                <span className="text-red-400 ml-1">Level {hoveredActivity.difficulty}</span>
              </div>
              <div>
                <span className="text-slate-500">Rarity:</span>
                <span className={`ml-1 capitalize ${getRarityColors(hoveredActivity.rarity).text}`}>
                  {hoveredActivity.rarity}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}