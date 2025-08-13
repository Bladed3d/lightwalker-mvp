'use client'

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';

// PHASE 1 FIX: useTrackedEffect for debugging drag-related effects
const useTrackedEffect = (
  effect: React.EffectCallback, 
  deps: React.DependencyList | undefined,
  debugName: string
) => {
  return useEffect(() => {
    const effectTraceId = `effect_${debugName}_${Date.now()}`;
    
    console.log(`🔍 TRACKED EFFECT [${debugName}] triggered:`, {
      traceId: effectTraceId,
      dependencies: deps,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Add to debug trace
    if ((window as any).__LIGHTWALKER_TRACE__) {
      const trace = {
        timestamp: Date.now(),
        action: 'EFFECT_TRIGGERED',
        source: `useTrackedEffect-${debugName}`,
        data: {
          effectName: debugName,
          depsCount: deps?.length || 0,
          traceId: effectTraceId
        }
      };
      
      if (!(window as any).__LIGHTWALKER_TRACE__.has('tracked-effects')) {
        (window as any).__LIGHTWALKER_TRACE__.set('tracked-effects', []);
      }
      (window as any).__LIGHTWALKER_TRACE__.get('tracked-effects').push(trace);
    }
    
    return effect();
  }, deps);
};
import { 
  DndContext,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  Active,
  Over,
  CollisionDetection
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, Search } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { ActivityPreference } from '@/types/daily-use';
import { applyPreferencesToActivities } from '@/lib/activity-preferences';
import { 
  GridLayoutEngine, 
  createGridItemFromActivity, 
  applyCustomGridSizes, 
  generateGridStyles,
  shouldReorganizeLayout,
  calculateLayoutTransitions
} from '@/lib/grid-layout';
import type { GridLayout } from '@/lib/grid-layout';
import { 
  FILTER_OPTIONS, 
  getActivitiesFromDatabase
} from '@/lib/database-activity-filter';

// Category color mapping (7 core categories + legacy fallbacks)
const CATEGORY_COLORS = {
  // Core 7 categories
  mindfulness: '#3B82F6',    // blue
  physical: '#10B981',       // green  
  creativity: '#F59E0B',     // orange
  communication: '#8B4513',  // brown
  learning: '#8B5CF6',       // purple
  productivity: '#06B6D4',   // teal
  relationships: '#EC4899',  // pink
  // Legacy category fallbacks (will be remapped later)
  creative: '#F59E0B',       // → creativity
  'decision-making': '#06B6D4', // → productivity
  reflection: '#3B82F6',     // → mindfulness
  'self-care': '#10B981',    // → physical
  growth: '#8B5CF6',         // → learning
  nutrition: '#10B981',      // → physical
  companionship: '#EC4899',  // → relationships
  sleep: '#10B981',          // → physical
  morning: '#10B981',        // → physical
  work: '#06B6D4',           // → productivity
  social: '#EC4899',         // → relationships
  custom: '#9CA3AF',      // neutral gray
} as const;

// Get category color for activity (supports custom categories from preferences)
const getCategoryColor = (activity: ActivityTemplate, activityPreferences: ActivityPreference[]): string => {
  // Check if activity has custom category preference
  const preference = activityPreferences.find(p => p.activityId === activity.id);
  const category = preference?.customCategory || activity.category;
  
  // Return color from mapping or default gray for unknown categories
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#9CA3AF';
};

export interface ActivityTemplate {
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

// SortableGridItem Component for DnD Kit
interface SortableGridItemProps {
  activity: ActivityTemplate;
  index: number;
  itemStyle: React.CSSProperties;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  activityPreferences: ActivityPreference[];
  timelineActivities: any[];
  onActivityEdit?: (activity: ActivityTemplate) => void;
  onCreateNewActivity?: () => void;
  handleMouseEnter: (activity: ActivityTemplate, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  isMobileView: boolean;
}

function SortableGridItem({
  activity,
  index,
  itemStyle,
  isDragging,
  setIsDragging,
  activityPreferences,
  timelineActivities,
  onActivityEdit,
  onCreateNewActivity,
  handleMouseEnter,
  handleMouseLeave,
  isMobileView
}: SortableGridItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging
  } = useSortable({
    id: activity.id,
    data: {
      type: 'Activity',
      activity
    }
  });

  // Update drag state for tooltip management - avoid infinite loop
  React.useEffect(() => {
    setIsDragging(isCurrentlyDragging);
  }, [isCurrentlyDragging, setIsDragging]);

  const colors = getRarityColors(activity.rarity);
  
  // Store itemStyle when drag starts to freeze dimensions
  const [frozenItemStyle, setFrozenItemStyle] = useState(itemStyle);
  useEffect(() => {
    if (isCurrentlyDragging && !frozenItemStyle.width) {
      console.log('🧊 ITEM FREEZE - Freezing item style for:', activity.id, {
        currentStyle: itemStyle,
        willFreezeAs: itemStyle
      });
      setFrozenItemStyle(itemStyle);
    } else if (!isCurrentlyDragging) {
      if (frozenItemStyle.width) {
        console.log('🔥 ITEM UNFREEZE - Unfreezing item style for:', activity.id);
      }
      setFrozenItemStyle({});
    }
  }, [isCurrentlyDragging, itemStyle, activity.id]);
  
  // FREEZE itemStyle during drag to prevent resizing
  const frozenStyle = useMemo(() => {
    const result = isCurrentlyDragging ? frozenItemStyle : itemStyle;
    
    if (isCurrentlyDragging && activity.id === 'lunch') {
      console.log('🍽️ LUNCH ITEM DEBUG - Style selection:', {
        isCurrentlyDragging,
        hasFrozenStyle: Object.keys(frozenItemStyle).length > 0,
        frozenStyleWidth: frozenItemStyle.width,
        frozenStyleHeight: frozenItemStyle.height,
        currentItemStyleWidth: itemStyle.width,
        currentItemStyleHeight: itemStyle.height,
        resultWidth: result.width,
        resultHeight: result.height,
        usingFrozen: isCurrentlyDragging && Object.keys(frozenItemStyle).length > 0
      });
    }
    
    return result;
  }, [isCurrentlyDragging, itemStyle, frozenItemStyle, activity.id]);

  // DRAG OVERLAY SOLUTION: Hide original item during drag, DragOverlay will show floating version
  const style = {
    ...frozenStyle, // Use frozen style during drag to prevent resizing
    transform: CSS.Transform.toString(transform), // DnD Kit transform for dragging
    transition: transition || (isCurrentlyDragging ? 'none' : 'all 300ms ease'),
    // CRITICAL FIX: Make original item invisible during drag to prevent snap-back
    ...(isCurrentlyDragging ? { 
      opacity: 0.3, // Make original semi-transparent but keep layout
      pointerEvents: 'none', // Disable interactions on original
      transform: CSS.Transform.toString(transform) // Maintain position
    } : {}),
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-black border border-slate-600
        flex items-center justify-center cursor-pointer transition-all duration-300
        ${activity.id === 'create-new-activity' 
          ? 'border-green-500 bg-green-900/20 hover:bg-green-800/30 hover:border-green-400' 
          : isCurrentlyDragging ? 'opacity-90 shadow-2xl z-50' : 'hover:border-slate-400'
        }
      `}
      onMouseEnter={(e) => handleMouseEnter(activity, e)}
      onMouseLeave={handleMouseLeave}
      onClick={activity.id === 'create-new-activity' ? (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onCreateNewActivity) {
          onCreateNewActivity();
        }
      } : undefined}
    >
      {/* Timeline usage indicator */}
      {(() => {
        const timelineCount = timelineActivities.filter(ta => {
          const taId = ta.id || ta.name?.toLowerCase().replace(/\s+/g, '-');
          return taId === activity.id || ta.title === activity.title;
        }).length;
        
        if (timelineCount > 0) {
          return (
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl z-10 flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
              {timelineCount}
            </div>
          );
        }
        return null;
      })()}
      
      {/* Category color dot - bottom-left corner */}
      {activity.id !== 'create-new-activity' && (
        <div 
          className="absolute bottom-1 left-1 w-2 h-2 rounded-full z-10 shadow-md border border-black/20"
          style={{ 
            backgroundColor: getCategoryColor(activity, activityPreferences),
            boxShadow: `0 0 6px ${getCategoryColor(activity, activityPreferences)}40`
          }}
          title={(() => {
            const preference = activityPreferences.find(p => p.activityId === activity.id);
            const category = preference?.customCategory || activity.category;
            return `Category: ${category}`;
          })()}
        />
      )}
      
      {/* Enhanced drop time popup when dragging */}
      {isCurrentlyDragging && (
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
      {activity.id === 'create-new-activity' ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="text-4xl text-green-400 mb-1">➕</div>
          <div className="text-xs text-green-300 font-bold">CREATE</div>
          <div className="text-xs text-green-300 font-bold">NEW</div>
        </div>
      ) : (activity.icon.startsWith('/') || activity.icon.startsWith('data:')) ? (
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
    </div>
  );
}

interface TarkovInventoryGridProps {
  theme: ThemeConfig;
  onDragEnd?: (result: any) => void;
  onActivityEdit?: (activity: ActivityTemplate) => void;
  activityPreferences?: ActivityPreference[];
  timelineActivities?: any[];
  onCreateNewActivity?: () => void;
  onActivitiesProcessed?: (activitiesWithPreferences: ActivityTemplate[]) => void;
  isMobileView?: boolean;
}

// DEPRECATED: Hardcoded templates removed - all activities now loaded from database
// This ensures consistent data and eliminates duplicate sources of truth

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

// DRAG OVERLAY SOLUTION: Separate component for the floating drag overlay
function DragOverlayItem({ activity, activityPreferences }: { 
  activity: ActivityTemplate; 
  activityPreferences: ActivityPreference[];
}) {
  const colors = getRarityColors(activity.rarity);

  return (
    <div
      className={`
        relative bg-black border border-slate-600
        flex items-center justify-center cursor-grabbing
        opacity-95 shadow-2xl scale-105 rotate-2 z-50
        ${colors.border} ${colors.glow}
      `}
      style={{
        width: '100px', // Fixed size for overlay
        height: '100px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none' // Critical: prevent interference with drop detection
      }}
    >
      {/* Category color dot */}
      <div 
        className="absolute bottom-1 left-1 w-2 h-2 rounded-full z-10 shadow-md border border-black/20"
        style={{ 
          backgroundColor: getCategoryColor(activity, activityPreferences),
          boxShadow: `0 0 6px ${getCategoryColor(activity, activityPreferences)}40`
        }}
      />
      
      {/* Activity Image or Emoji */}
      {(activity.icon.startsWith('/') || activity.icon.startsWith('data:')) ? (
        <img 
          src={activity.icon} 
          alt={activity.title}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="text-3xl md:text-4xl select-none opacity-90">
          {activity.icon}
        </div>
      )}
      
      {/* Item count */}
      <div className="absolute bottom-1 right-1 text-white text-xs font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {activity.points}
      </div>

      {/* Dragging indicator */}
      <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
        <div className="text-white text-xs font-bold">↗</div>
      </div>
    </div>
  );
}

// PHASE 2 FIX: Enhanced Edit Drop Zone with Better Visual Feedback
function EditDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'activity-edit-zone',
    data: {
      type: 'EditZone'
    }
  });

  console.log('🔶 PHASE 2: EditDropZone render - isOver:', isOver, 'at', new Date().toLocaleTimeString());

  return (
    <div className="absolute bottom-0 right-0 w-32 h-32" style={{ zIndex: 999 }}>
      {/* PHASE 2 SOLUTION: Enhanced drop zone with better hit area */}
      <div
        ref={setNodeRef}
        className="absolute bottom-1 right-1 w-16 h-16"
        style={{
          pointerEvents: 'auto', // Critical: Must be auto for pointerWithin detection
          zIndex: 998,
          // Expanded hit area for easier targeting - full triangle area
          borderRadius: '0 0 8px 0'
        }}
      />
      
      {/* PHASE 2 ENHANCEMENT: Enhanced visual feedback overlay */}
      {isOver && (
        <div
          className="absolute bottom-1 right-1 w-24 h-24 bg-orange-400/60 border-2 border-orange-300 border-dashed transition-all duration-200 animate-pulse"
          style={{
            clipPath: 'polygon(100% 100%, 100% 40%, 40% 100%)',
            pointerEvents: 'none', // Never block pointer detection
            zIndex: 999,
            boxShadow: '0 0 20px rgba(251, 146, 60, 0.6)' // Orange glow effect
          }}
        />
      )}
      
      {/* PHASE 2 ENHANCEMENT: Enhanced triangle with better feedback */}
      <img 
        src="/activity-icons/drag-here-triangle.png"
        alt="Drop Here to Edit Activity"
        className={`absolute bottom-1 right-1 transition-all duration-200 ${
          isOver ? 'w-20 h-20 opacity-100 scale-125 drop-shadow-lg' : 'w-16 h-16 opacity-90 hover:opacity-100'
        }`}
        style={{ 
          zIndex: 997, // Below overlay but visible
          pointerEvents: 'none', // Critical for smooth dragging
          filter: isOver ? 'brightness(1.3) saturate(1.2)' : 'brightness(1.0)'
        }}
      />
      
      {/* PHASE 2 ADDITION: Instructional text when hovering */}
      {isOver && (
        <div 
          className="absolute bottom-24 right-0 bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg animate-bounce"
          style={{ zIndex: 1000 }}
        >
          Drop to Edit!
        </div>
      )}
    </div>
  );
}

export default function TarkovInventoryGrid({ theme, onDragEnd, onActivityEdit, activityPreferences = [], timelineActivities = [], onCreateNewActivity, onActivitiesProcessed, isMobileView = false }: TarkovInventoryGridProps) {
  const [hoveredActivity, setHoveredActivity] = useState<ActivityTemplate | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentLayout, setCurrentLayout] = useState<GridLayout | null>(null);
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('my-activities');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeActivity, setActiveActivity] = useState<ActivityTemplate | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // DnD Kit sensor configuration with mobile optimization
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Desktop: 8px tolerance for accidental drags
      // Mobile: Reduced tolerance for better touch experience
      activationConstraint: {
        distance: isMobileView ? 5 : 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Proven community solution: pointer-based collision detection
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // RESEARCH FINDING: Use pointerWithin for precision with visual elements
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      // Prioritize edit zone if it's in the collision list
      const editZoneCollision = pointerCollisions.find(
        collision => collision.id === 'activity-edit-zone'
      );
      
      if (editZoneCollision) {
        console.log('🎯 POINTER-BASED EDIT ZONE detected!', editZoneCollision);
        return [editZoneCollision];
      }
      
      console.log('🔄 Pointer collision detected:', pointerCollisions);
      return pointerCollisions;
    }
    
    // Fallback to rectangle intersection for edge cases
    return rectIntersection(args);
  }, []
  );


  // Calculate optimal columns based on container width
  const [containerWidth, setContainerWidth] = useState(1000);
  const optimalColumns = useMemo(() => {
    const cellSize = isMobileView ? 60 : 100;
    const minColumns = 2; // Always show at least 2 columns
    const maxColumns = isMobileView ? 6 : 12; // Reasonable limits
    const calculatedColumns = Math.floor(containerWidth / cellSize);
    return Math.max(minColumns, Math.min(maxColumns, calculatedColumns));
  }, [containerWidth, isMobileView]);
  
  const layoutEngine = useMemo(() => new GridLayoutEngine(optimalColumns), [optimalColumns]);

  // Track container width for responsive columns
  useEffect(() => {
    const updateContainerWidth = () => {
      if (gridRef.current) {
        const width = gridRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    // Initial width
    updateContainerWidth();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isMobileView]);

  // Fix Next.js SSR/CSR mismatch for React Beautiful DND
  if (typeof window === 'undefined') {
    return null;
  }

  const handleMouseEnter = (activity: ActivityTemplate, e: React.MouseEvent) => {
    // Don't show tooltip during drag operations
    if (isDragging) return;
    
    setHoveredActivity(activity);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Clear tooltip if we're dragging
    if (isDragging && hoveredActivity) {
      setHoveredActivity(null);
      return;
    }
    
    if (hoveredActivity && !isDragging) {
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredActivity(null);
  };

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        console.log('🔘 Clicking outside dropdown, closing');
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  // Database-first filtered activities
  const [filteredActivities, setFilteredActivities] = useState<ActivityTemplate[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  
  // Load activities from database
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoadingActivities(true);
      console.log('🗄️ Loading activities from database for filter:', selectedFilter);
      
      if (selectedFilter === 'create-new') {
        // Return a placeholder for creating new activity
        setFilteredActivities([{
          id: 'create-new-activity',
          title: 'Create New Activity', 
          icon: '➕',
          category: 'custom',
          points: 25,
          rarity: 'uncommon' as const,
          duration: '15 min',
          difficulty: 2,
          description: 'Click to create a custom activity',
          gridSize: { w: 2, h: 1 }
        }]);
        setIsLoadingActivities(false);
        return;
      }
      
      try {
        const result = await getActivitiesFromDatabase(
          selectedFilter,
          activityPreferences,
          timelineActivities
        );
        
        console.log(`✅ Loaded ${result.count} activities from database`);
        
        // Transform database activities to ActivityTemplate format
        const activities: ActivityTemplate[] = result.activities.map(activity => ({
          id: activity.id,
          title: activity.title,
          icon: activity.icon,
          category: activity.category,
          points: activity.points,
          rarity: activity.rarity,
          duration: activity.duration,
          difficulty: activity.difficulty,
          description: activity.description || '',
          gridSize: activity.gridSize || { w: 1, h: 1 }
        }));
        
        setFilteredActivities(activities);
      } catch (error) {
        console.error('❌ Error loading activities:', error);
        setFilteredActivities([]);
      } finally {
        setIsLoadingActivities(false);
      }
    };
    
    loadActivities();
  }, [selectedFilter, activityPreferences, timelineActivities]);

  // Apply search filter to filtered activities
  const searchFilteredActivities = React.useMemo(() => {
    if (isLoadingActivities) {
      return [];
    }
    
    if (!searchQuery.trim()) {
      return filteredActivities;
    }
    
    const query = searchQuery.toLowerCase();
    return filteredActivities.filter(activity => {
      return activity.title.toLowerCase().includes(query) ||
             activity.category.toLowerCase().includes(query) ||
             (activity.description && activity.description.toLowerCase().includes(query));
    });
  }, [filteredActivities, searchQuery, isLoadingActivities]);

  // Apply saved preferences to search-filtered activities
  const activitiesWithPreferences = React.useMemo(() => {
    console.log('🎨 TarkovInventoryGrid applying preferences:', activityPreferences.length, 'preferences');
    
    if (activityPreferences.length === 0) {
      console.log('📝 No preferences to apply, using search-filtered activities');
      return searchFilteredActivities;
    }
    
    console.log('🔧 Activity preferences:', activityPreferences);
    
    // Use search-filtered activities instead of all templates
    if (searchFilteredActivities.length === 0) {
      return [];
    }
    
    // If search-filtered activities already have preferences applied (from smart filter), return them
    if (searchFilteredActivities[0]?.customized) {
      return searchFilteredActivities;
    }
    
    // Convert search-filtered activities to Activity format temporarily for preferences application
    const activitiesForPrefs = searchFilteredActivities.map(template => ({
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
    
    // Convert back to template format and apply custom grid sizes
    const result = withPreferences.map((activity, index) => {
      const template = searchFilteredActivities[index];
      const preference = activityPreferences.find(p => p.activityId === template.id);
      
      const updated = {
        ...template,
        duration: activity.duration,
        points: activity.points,
        difficulty: activity.difficulty,
        title: activity.title,
        icon: activity.icon, // Apply custom images from preferences
        gridSize: preference?.customGridSize || template.gridSize || { w: 1, h: 1 }
      };
      
      // Enhanced debugging for "Read" activity icon issue - ONLY during drag operations
      if (template.title.toLowerCase().includes('read') && template.id === 'read') {
        const gridDebugInfo = {
          templateId: template.id,
          templateTitle: template.title,
          templateIcon: template.icon,
          activityIcon: activity.icon,
          finalIcon: updated.icon,
          hasPreference: !!preference,
          preferenceImageUrl: preference?.customImageUrl,
          iconIsCustomImage: updated.icon.startsWith('/') || updated.icon.startsWith('data:')
        };
        
        // Only log once and store in window
        if (!(window as any).readDebugLogged) {
          console.warn('📖 TARKOV GRID READ DEBUG:', gridDebugInfo);
          (window as any).readDebugLogged = true;
        }
        
        // Store in window for manual inspection
        (window as any).lastReadGridDebug = gridDebugInfo;
      }
      
      // Debug grid size application for all activities with custom grid sizes
      if (preference?.customGridSize) {
        console.log(`🎯 ${template.id} grid size applied:`, {
          templateId: template.id,
          originalGridSize: template.gridSize,
          preferenceGridSize: preference.customGridSize,
          finalGridSize: updated.gridSize
        });
      }
      
      // Special debug for conflict-resolution activity (has hardcoded template size)
      if (template.id === 'conflict-resolution') {
        console.log(`⚔️ Conflict Resolution processing:`, {
          templateId: template.id,
          templateGridSize: template.gridSize,
          hasPreference: !!preference,
          preferenceCustomGridSize: preference?.customGridSize,
          finalGridSize: updated.gridSize,
          preferenceWins: !!preference?.customGridSize
        });
      }
      
      return updated;
    });
    
    return result;
  }, [activityPreferences, searchFilteredActivities]);

  // DnD Kit drag handlers (placed after activitiesWithPreferences definition)
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragTraceId = `drag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🎯 DnD Kit drag started:', {
      traceId: dragTraceId,
      activeId: event.active.id,
      currentIsDragging: isDragging
    });
    
    console.log('🐛 CRITICAL DEBUG - Drag Start State Check:', {
      traceId: dragTraceId,
      isDraggingBefore: isDragging,
      frozenLayoutExists: !!frozenLayout,
      frozenStylesCount: frozenItemStyles?.size || 0,
      activitiesCount: activitiesWithPreferences.length
    });
    
    // PHASE 1 FIX: Enhanced debug tracing with breadcrumbs
    if ((window as any).__LIGHTWALKER_TRACE__) {
      const trace = {
        timestamp: Date.now(),
        action: 'DRAG_START',
        source: 'DnDKit-TarkovGrid',
        traceId: dragTraceId,
        data: {
          activeId: event.active.id,
          activeData: event.active.data.current,
          currentLayoutFrozen: !!frozenLayout,
          currentStylesFrozen: (frozenItemStyles?.size || 0) > 0
        }
      };
      
      if (!(window as any).__LIGHTWALKER_TRACE__.has('dnd-kit-events')) {
        (window as any).__LIGHTWALKER_TRACE__.set('dnd-kit-events', []);
      }
      (window as any).__LIGHTWALKER_TRACE__.get('dnd-kit-events').push(trace);
      
      // Store drag trace ID for cross-component tracking
      (window as any).__CURRENT_DRAG_TRACE__ = dragTraceId;
    }
    
    // Add breadcrumb for layout freeze state
    console.log('🍞 DRAG START BREADCRUMB:', {
      traceId: dragTraceId,
      freezeState: {
        layoutFrozen: !!frozenLayout,
        stylesFrozen: (frozenItemStyles?.size || 0) > 0,
        willFreeze: !frozenLayout && (frozenItemStyles?.size || 0) === 0
      }
    });
    
    console.log('🚨 CRITICAL DEBUG - Setting isDragging to TRUE');
    setIsDragging(true);
    setHoveredActivity(null); // Clear tooltips during drag
    
    // Store dragged activity for cross-library compatibility AND drag overlay
    const activity = activitiesWithPreferences.find(a => a.id === event.active.id);
    if (activity) {
      setActiveActivity(activity); // Set active activity for DragOverlay
      
      (window as any).currentDraggedActivity = {
        ...activity,
        source: 'dnd-kit',
        traceId: dragTraceId,
        startTime: Date.now()
      };
      
      console.log('📦 Activity prepared for drag with overlay:', {
        activityId: activity.id,
        activityTitle: activity.title,
        gridSize: activity.gridSize,
        currentGridSize: activity.gridSize,
        traceId: dragTraceId
      });
    }
  }, [activitiesWithPreferences, frozenLayout, frozenItemStyles?.size || 0]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Enhanced debug logging for drop zone detection
    console.log('🔄 DnD Kit drag over:', {
      activeId: event.active.id,
      overId: event.over?.id,
      overData: event.over?.data?.current,
      collisions: event.collisions?.length || 0
    });
    
    // Handle cross-library drop zone detection
    if (event.over?.id === 'timeline' || event.over?.data?.current?.type === 'Timeline') {
      // Timeline drop - update time display in popup
      const activity = activitiesWithPreferences.find(a => a.id === event.active.id);
      if (activity) {
        const timeDisplay = document.getElementById(`drop-time-${activity.id}`);
        if (timeDisplay) {
          // This will be updated by timeline's drop detection
          timeDisplay.textContent = 'Timeline';
        }
      }
    }

    // Special logging for edit zone detection
    if (event.over?.id === 'activity-edit-zone') {
      console.log('🎯 EDIT ZONE DETECTED!', event.over);
    }
  }, [activitiesWithPreferences]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const dragTraceId = (window as any).__CURRENT_DRAG_TRACE__ || 'unknown';
    
    console.log('🏁 DnD Kit drag ended:', {
      traceId: dragTraceId,
      event: event,
      duration: (window as any).currentDraggedActivity?.startTime ? 
        Date.now() - (window as any).currentDraggedActivity.startTime : 'unknown'
    });
    
    // PHASE 1 FIX: Add breadcrumb for drag end state
    console.log('🍞 DRAG END BREADCRUMB:', {
      traceId: dragTraceId,
      freezeState: {
        layoutWasFrozen: !!frozenLayout,
        stylesWereFrozen: (frozenItemStyles?.size || 0) > 0,
        willUnfreeze: true
      }
    });
    
    setTimeout(() => {
      setIsDragging(false);
      setActiveActivity(null); // Clear active activity for DragOverlay
    }, 100); // Delay to prevent tooltip flashing
    
    const { active, over } = event;
    
    if (!over) {
      console.log('❌ No drop target');
      return;
    }


    // PHASE 2 FIX: Handle edit zone drops - Enhanced for DurationScreen Integration
    if (over.id === 'activity-edit-zone') {
      console.log('🔶 PHASE 2: Orange triangle drop detected!', {
        activeId: active.id,
        overId: over.id,
        traceId: dragTraceId
      });
      
      console.log('🚨 CRITICAL DEBUG - Triangle Drop Analysis:', {
        activeId: active.id,
        overId: over.id,
        overData: over.data?.current,
        activitiesWithPreferencesCount: activitiesWithPreferences.length,
        availableActivityIds: activitiesWithPreferences.map(a => a.id),
        onActivityEditAvailable: !!onActivityEdit
      });
      
      const activity = activitiesWithPreferences.find(a => a.id === active.id);
      if (activity) {
        console.log('📋 Activity found for edit:', {
          id: activity.id,
          title: activity.title,
          icon: activity.icon,
          duration: activity.duration,
          points: activity.points,
          gridSize: activity.gridSize
        });
        
        // PHASE 2 SOLUTION: Call onActivityEdit callback to trigger DurationScreen
        if (onActivityEdit) {
          console.log('🎯 Calling onActivityEdit to open DurationScreen');
          console.log('🚨 CRITICAL DEBUG - Calling onActivityEdit with:', activity);
          onActivityEdit(activity);
        } else {
          console.error('❌ PHASE 2 ERROR: onActivityEdit callback not available!');
        }
      } else {
        console.error('❌ PHASE 2 ERROR: Activity not found for edit!', {
          activeId: active.id,
          availableIds: activitiesWithPreferences.map(a => a.id)
        });
      }
      return;
    }

    // Handle internal grid reordering (if needed)
    if (active.id !== over.id) {
      console.log('🔄 Internal grid reorder:', active.id, '→', over.id);
      // Grid reordering logic here if needed
    }
  }, [activitiesWithPreferences, onDragEnd, onActivityEdit]);

  // Notify parent component of the processed activities with preferences
  React.useEffect(() => {
    if (onActivitiesProcessed && activitiesWithPreferences.length > 0) {
      onActivitiesProcessed(activitiesWithPreferences);
    }
  }, [activitiesWithPreferences, onActivitiesProcessed]);

  // PHASE 1 FIX: Frozen Layout State During Drag Operations  
  const [frozenLayout, setFrozenLayout] = useState<GridLayout | null>(null);
  
  // Calculate dynamic grid layout - COMPLETELY PREVENT recalculation during drag
  const gridLayout = useMemo(() => {
    // Add debug trace for layout calculations
    if ((window as any).__LIGHTWALKER_TRACE__) {
      const trace = {
        timestamp: Date.now(),
        action: 'LAYOUT_CALCULATION',
        source: 'TarkovInventoryGrid',
        data: {
          isDragging,
          activitiesCount: activitiesWithPreferences.length,
          hasFrozenLayout: !!frozenLayout,
          willRecalculate: !isDragging
        }
      };
      
      if (!(window as any).__LIGHTWALKER_TRACE__.has('layout-calculations')) {
        (window as any).__LIGHTWALKER_TRACE__.set('layout-calculations', []);
      }
      (window as any).__LIGHTWALKER_TRACE__.get('layout-calculations').push(trace);
    }
    
    console.log('📐 Layout calculation triggered:', {
      isDragging,
      activitiesCount: activitiesWithPreferences.length,
      hasFrozenLayout: !!frozenLayout
    });
    
    // PHASE 1 SOLUTION: Return frozen layout during drag to prevent ANY recalculation
    if (isDragging && frozenLayout) {
      console.log('❄️ RETURNING FROZEN LAYOUT - No recalculation during drag!');
      return frozenLayout;
    }
    
    // Only calculate new layout when NOT dragging
    console.log('🔄 Calculating fresh layout (not dragging)');
    
    // Create grid items from activities with title for alphabetical sorting
    const gridItems = activitiesWithPreferences.map(activity => {
      const gridItem = createGridItemFromActivity({
        id: activity.id,
        title: activity.title,
        gridSize: activity.gridSize
      });
      
      // Debug grid item creation
      if (activity.gridSize && (activity.gridSize.w !== 1 || activity.gridSize.h !== 1)) {
        console.log(`📦 Created grid item for ${activity.id}:`, {
          activityGridSize: activity.gridSize,
          gridItemSize: { w: gridItem.w, h: gridItem.h }
        });
      }
      
      return gridItem;
    });
    
    // Calculate optimal layout
    const layout = layoutEngine.calculateLayout(gridItems);
    
    console.log('✅ Grid layout calculated:', {
      totalHeight: layout.totalHeight,
      itemCount: layout.items.size,
      gridWidth: layout.gridWidth
    });
    
    return layout;
  }, [activitiesWithPreferences, layoutEngine, isDragging, frozenLayout]);

  // Generate CSS styles for the grid - FREEZE itemStyles during drag
  const { containerStyle, itemStyles } = useMemo(() => {
    const cellSize = isMobileView ? 60 : 100; // Smaller cells on mobile
    return generateGridStyles(gridLayout, cellSize);
  }, [gridLayout, isMobileView]);

  // PHASE 1 FIX: Enhanced Frozen Layout Management System
  const [frozenItemStyles, setFrozenItemStyles] = useState(new Map());
  
  // PHASE 1 FIX: Use useTrackedEffect for drag freeze management
  useTrackedEffect(() => {
    console.log('🔍 Comprehensive freeze effect triggered:', {
      isDragging,
      hasFrozenLayout: !!frozenLayout,
      frozenStylesSize: frozenItemStyles?.size || 0
    });
    
    console.log('🚨 CRITICAL DEBUG - Freeze Effect Analysis:', {
      isDragging,
      hasFrozenLayout: !!frozenLayout,
      frozenStylesSize: frozenItemStyles?.size || 0,
      shouldFreeze: isDragging && !frozenLayout && (frozenItemStyles?.size || 0) === 0,
      shouldUnfreeze: !isDragging && (frozenLayout || (frozenItemStyles?.size || 0) > 0),
      gridLayoutAvailable: !!gridLayout,
      itemStylesAvailable: !!itemStyles,
      gridLayoutItemCount: gridLayout?.items?.size || 0,
      itemStylesCount: itemStyles?.size || 0
    });
    
    if (isDragging && !frozenLayout && (frozenItemStyles?.size || 0) === 0) {
      console.log('❄️ FREEZING COMPLETE LAYOUT STATE - Preventing 1x1 → 2x2 growth!');
      console.log('🚨 CRITICAL DEBUG - Freezing with:', {
        gridLayoutItems: gridLayout?.items?.size || 0,
        itemStylesCount: itemStyles?.size || 0,
        gridLayoutTotalHeight: gridLayout?.totalHeight
      });
      
      // Freeze current layout to prevent recalculation
      setFrozenLayout(gridLayout);
      
      // Freeze current item styles to prevent CSS changes
      setFrozenItemStyles(new Map(itemStyles));
      
      // Add debug trace
      if ((window as any).__LIGHTWALKER_TRACE__) {
        const trace = {
          timestamp: Date.now(),
          action: 'LAYOUT_FROZEN',
          source: 'TarkovInventoryGrid',
          data: {
            frozenLayoutItems: gridLayout.items.size,
            frozenStylesCount: itemStyles.size,
            layoutTotalHeight: gridLayout.totalHeight
          }
        };
        
        if (!(window as any).__LIGHTWALKER_TRACE__.has('freeze-events')) {
          (window as any).__LIGHTWALKER_TRACE__.set('freeze-events', []);
        }
        (window as any).__LIGHTWALKER_TRACE__.get('freeze-events').push(trace);
      }
      
    } else if (!isDragging && (frozenLayout || (frozenItemStyles?.size || 0) > 0)) {
      console.log('🔥 UNFREEZING LAYOUT STATE - Drag operation completed');
      
      // Release frozen state
      setFrozenLayout(null);
      setFrozenItemStyles(new Map());
      
      // Add debug trace
      if ((window as any).__LIGHTWALKER_TRACE__) {
        const trace = {
          timestamp: Date.now(),
          action: 'LAYOUT_UNFROZEN',
          source: 'TarkovInventoryGrid',
          data: {
            wasLayoutFrozen: !!frozenLayout,
            hadFrozenStyles: (frozenItemStyles?.size || 0) > 0
          }
        };
        
        if (!(window as any).__LIGHTWALKER_TRACE__.has('freeze-events')) {
          (window as any).__LIGHTWALKER_TRACE__.set('freeze-events', []);
        }
        (window as any).__LIGHTWALKER_TRACE__.get('freeze-events').push(trace);
      }
    }
  }, [isDragging, gridLayout, itemStyles, frozenLayout, frozenItemStyles?.size || 0], 'drag-freeze-management');

  // Use frozen styles during drag to maintain sizes
  const currentItemStyles = isDragging && (frozenItemStyles?.size || 0) > 0 ? frozenItemStyles : itemStyles;

  // Update current layout and handle transitions
  useEffect(() => {
    if (shouldReorganizeLayout(
      currentLayout ? Array.from(currentLayout.items.entries()).map(([id, pos]) => ({ id, w: pos.w, h: pos.h })) : [],
      Array.from(gridLayout.items.entries()).map(([id, pos]) => ({ id, w: pos.w, h: pos.h }))
    )) {
      console.log('🔄 Layout reorganization triggered');
      setIsLayoutTransitioning(true);
      
      // Smooth transition delay
      const transitionTimeout = setTimeout(() => {
        setCurrentLayout(gridLayout);
        setIsLayoutTransitioning(false);
      }, 50);
      
      return () => clearTimeout(transitionTimeout);
    } else {
      setCurrentLayout(gridLayout);
    }
  }, [gridLayout, currentLayout]);

  // Listen for grid layout change events from preference saves
  useEffect(() => {
    const handleGridLayoutChange = (event: any) => {
      const { activityId, newGridSize, imageUrl } = event.detail;
      console.log('🎛️ Grid layout change event received:', { activityId, newGridSize, imageUrl });
      
      // Force re-calculation of layout by updating state
      // The layout will be automatically recalculated due to dependency on activitiesWithPreferences
      setIsLayoutTransitioning(true);
      setTimeout(() => setIsLayoutTransitioning(false), 300);
    };

    window.addEventListener('gridLayoutChanged', handleGridLayoutChange);
    return () => window.removeEventListener('gridLayoutChanged', handleGridLayoutChange);
  }, []);

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
              {isLoadingActivities ? (
                <span className="text-blue-400">[LOADING DATABASE...]</span>
              ) : (
                <>
                  [{activitiesWithPreferences.length} ITEMS] 
                  [{activitiesWithPreferences.filter(a => a.gridSize && (a.gridSize.w !== 1 || a.gridSize.h !== 1)).length} CUSTOM]
                  {searchQuery && <span className="text-orange-400"> [FILTERED]</span>}
                  <span className="text-green-400"> [DATABASE]</span>
                </>
              )}
            </div>
          </div>
          {/* Search and Filter Controls */}
          <div className={`${isMobileView ? 'flex flex-col space-y-2' : 'flex items-center space-x-2'}`}>
            {/* Filter Dropdown - Show first on mobile */}
            <div className={`relative ${isMobileView ? 'order-1' : 'order-2'}`} ref={dropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center justify-between px-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-mono text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span>{FILTER_OPTIONS.find(opt => opt.id === selectedFilter)?.icon}</span>
                  <span>{FILTER_OPTIONS.find(opt => opt.id === selectedFilter)?.label}</span>
                </div>
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔘 Filter option clicked:', option.id);
                        setSelectedFilter(option.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                        selectedFilter === option.id ? 'bg-slate-700 text-green-400' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm">{option.icon}</span>
                        <div>
                          <div className="font-mono text-xs font-medium">{option.label}</div>
                          {option.description && (
                            <div className="font-mono text-xs text-slate-500">{option.description}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input - Show second on mobile */}
            <div className={`relative ${isMobileView ? 'order-2' : 'order-1'}`}>
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-7 pr-3 py-1 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-500 focus:border-slate-400 focus:outline-none transition-colors font-mono text-xs ${isMobileView ? 'w-full' : 'w-40'}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  <div className="w-3 h-3 text-xs">×</div>
                </button>
              )}
            </div>
          </div>
        </div>


        {/* DnD Kit Grid Container - Using parent context from page.tsx */}
        {/* Removed nested DndContext - grid uses parent context */}
          <SortableContext 
            items={activitiesWithPreferences.map(a => a.id)}
            strategy={rectSortingStrategy}
          >
            <div
              ref={gridRef}
              className={`border border-slate-600 transition-opacity duration-200 ${
                isLayoutTransitioning ? 'opacity-75' : 'opacity-100'
              } ${isMobileView ? 'max-w-full' : ''}`}
              style={{ 
                ...containerStyle,
                gap: '1px', // Small gap for visual separation
                ...(isMobileView ? {
                  maxWidth: '100%',
                  width: '100%',
                  overflow: 'hidden'
                } : {})
              }}
              onMouseMove={handleMouseMove}
            >
              {activitiesWithPreferences.map((activity, index) => {
                const itemStyle = currentItemStyles.get(activity.id) || {};
                
                return (
                  <SortableGridItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                    itemStyle={itemStyle}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    activityPreferences={activityPreferences}
                    timelineActivities={timelineActivities}
                    onActivityEdit={onActivityEdit}
                    onCreateNewActivity={onCreateNewActivity}
                    handleMouseEnter={handleMouseEnter}
                    handleMouseLeave={handleMouseLeave}
                    isMobileView={isMobileView}
                  />
                );
              })}
            </div>
          </SortableContext>
          {/* Orange Edit Triangle - Bottom Right Corner - DnD Kit Drop Zone */}
          <EditDropZone />

          {/* DRAG OVERLAY SOLUTION: Needs to be in parent DndContext now
          <DragOverlay
            dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeActivity ? (
              <DragOverlayItem 
                activity={activeActivity} 
                activityPreferences={activityPreferences}
              />
            ) : null}
          </DragOverlay>
          */}

        {/* End removed DndContext */}
      </div>

      {/* Tooltip - don't show during drag operations */}
      {hoveredActivity && !isDragging && (
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
                <span className="text-slate-500">Category:</span>
                <span className="ml-1 capitalize" style={{ color: getCategoryColor(hoveredActivity, activityPreferences) }}>
                  {hoveredActivity.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}