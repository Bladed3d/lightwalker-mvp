'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { ChevronDown, Search } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { ActivityPreference } from '@/types/daily-use';
import { applyPreferencesToActivities } from '@/lib/activity-preferences';
import { 
  GridLayoutEngine, 
  GridLayout, 
  createGridItemFromActivity, 
  applyCustomGridSizes, 
  generateGridStyles,
  shouldReorganizeLayout,
  calculateLayoutTransitions
} from '@/lib/grid-layout';
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

export default function TarkovInventoryGrid({ theme, onDragEnd, onActivityEdit, activityPreferences = [], timelineActivities = [], onCreateNewActivity, onActivitiesProcessed, isMobileView = false }: TarkovInventoryGridProps) {
  const [hoveredActivity, setHoveredActivity] = useState<ActivityTemplate | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentLayout, setCurrentLayout] = useState<GridLayout | null>(null);
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('my-activities');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
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

  // Notify parent component of the processed activities with preferences
  React.useEffect(() => {
    if (onActivitiesProcessed && activitiesWithPreferences.length > 0) {
      onActivitiesProcessed(activitiesWithPreferences);
    }
  }, [activitiesWithPreferences, onActivitiesProcessed]);

  // Calculate dynamic grid layout
  const gridLayout = useMemo(() => {
    console.log('📐 Calculating grid layout for', activitiesWithPreferences.length, 'activities');
    
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
    
    // Debug final layout positions for custom-sized items
    for (const [itemId, position] of layout.items) {
      if (position.w !== 1 || position.h !== 1) {
        console.log(`📍 Custom-sized item positioned:`, {
          itemId,
          position: `${position.x},${position.y}`,
          size: `${position.w}x${position.h}`
        });
      }
    }
    
    return layout;
  }, [activitiesWithPreferences, layoutEngine]);

  // Generate CSS styles for the grid
  const { containerStyle, itemStyles } = useMemo(() => {
    const cellSize = isMobileView ? 60 : 100; // Smaller cells on mobile
    return generateGridStyles(gridLayout, cellSize);
  }, [gridLayout, isMobileView]);

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


        {/* Grid Container */}
        <Droppable droppableId="tarkov-inventory" type="ACTIVITY">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                (gridRef as any).current = el;
              }}
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
                const colors = getRarityColors(activity.rarity);
                const itemStyle = itemStyles.get(activity.id) || {};
                
                // Visual debugging - no console spam
                
                return (
                  <Draggable key={activity.id} draggableId={activity.id} index={index}>
                    {(provided, snapshot) => {
                      // Update drag state when any item is being dragged
                      if (snapshot.isDragging && !isDragging) {
                        setIsDragging(true);
                        setHoveredActivity(null); // Clear any existing tooltip
                      } else if (!snapshot.isDragging && isDragging) {
                        // Use a small delay to prevent tooltip flashing after drag ends
                        setTimeout(() => setIsDragging(false), 100);
                      }
                      
                      return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          relative bg-black border border-slate-600
                          flex items-center justify-center cursor-pointer transition-all duration-300
                          ${activity.id === 'create-new-activity' 
                            ? 'border-green-500 bg-green-900/20 hover:bg-green-800/30 hover:border-green-400' 
                            : snapshot.isDragging ? 'opacity-90 shadow-2xl z-50' : 'hover:border-slate-400'
                          }
                          ${isLayoutTransitioning ? 'transition-all duration-500 ease-in-out' : ''}
                        `}
                        style={{
                          ...provided.draggableProps.style,
                          ...itemStyle, // Apply calculated grid position
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none',
                          // Apply scale through style to avoid conflicts with React Beautiful DND
                          transform: snapshot.isDragging 
                            ? `${provided.draggableProps.style?.transform || ''} scale(0.75)`.trim()
                            : provided.draggableProps.style?.transform,
                        }}
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
                        {/* Grid size indicator for custom items - COMMENTED OUT */}
                        {/* {activity.gridSize && (activity.gridSize.w !== 1 || activity.gridSize.h !== 1) && (
                          <div className="absolute top-0 left-0 bg-purple-500 text-white text-xs px-1 rounded-br z-10">
                            {activity.gridSize.w}×{activity.gridSize.h}
                          </div>
                        )} */}
                        
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
                              // Add subtle glow effect
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
                        
                        {/* Inspection checkmark for completed items */}
                        {/* <div className="absolute top-1 right-1 text-green-400 text-xs">✓</div> */}
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

        {/* Orange Edit Triangle - Bottom Right Corner - FIXED DROP ZONE */}
        <Droppable droppableId="activity-edit-zone" type="ACTIVITY">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="absolute bottom-0 right-0 w-20 h-20"
              style={{ 
                pointerEvents: 'auto',
                // Smaller drop zone to avoid UI interference
                minWidth: '80px',
                minHeight: '80px',
                // Ensure drop zone is above other elements
                zIndex: 10
              }}
            >
              {/* Triangular Drop Target - Smaller and triangular to avoid UI interference */}
              <div
                className={`absolute inset-0 w-full h-full transition-all duration-200 ${
                  snapshot.isDraggingOver 
                    ? 'bg-orange-400/20 border-2 border-orange-400 border-dashed' 
                    : 'bg-transparent'
                }`}
                style={{
                  // Triangular shape to match the visual indicator
                  clipPath: 'polygon(100% 100%, 100% 50%, 50% 100%)',
                  pointerEvents: 'auto',
                  cursor: snapshot.isDraggingOver ? 'copy' : 'default'
                }}
              />
              
              {/* Triangle Image with Text */}
              <img 
                src="/activity-icons/drag-here-triangle.png"
                alt="Drag Here to Edit"
                className={`absolute bottom-0 right-0 transition-all duration-200 pointer-events-none ${
                  snapshot.isDraggingOver ? 'w-20 h-20 opacity-90' : 'w-16 h-16'
                }`}
                style={{ zIndex: 11 }}
              />
              
              {/* Required placeholder for React Beautiful DND */}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
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