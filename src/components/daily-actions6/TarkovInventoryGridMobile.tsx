'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { ActivityPreference } from '@/types/daily-use';
import { applyPreferencesToActivities } from '@/lib/activity-preferences';
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

interface TarkovInventoryGridMobileProps {
  theme: ThemeConfig;
  onActivityEdit?: (activity: ActivityTemplate) => void;
  activityPreferences?: ActivityPreference[];
  timelineActivities?: any[];
  onCreateNewActivity?: () => void;
  onActivitiesProcessed?: (activitiesWithPreferences: ActivityTemplate[]) => void;
  selectedActivity?: ActivityTemplate | null;
  onActivitySelect?: (activity: ActivityTemplate | null) => void;
}

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

export default function TarkovInventoryGridMobile({ 
  theme, 
  onActivityEdit, 
  activityPreferences = [], 
  timelineActivities = [], 
  onCreateNewActivity, 
  onActivitiesProcessed,
  selectedActivity,
  onActivitySelect
}: TarkovInventoryGridMobileProps) {
  const [hoveredActivity, setHoveredActivity] = useState<ActivityTemplate | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all-categories');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Mobile-optimized grid columns (2-4 columns max)
  const [containerWidth, setContainerWidth] = useState(320);
  const mobileColumns = useMemo(() => {
    const cellSize = 80; // Mobile cell size
    const minColumns = 2;
    const maxColumns = 4;
    const calculatedColumns = Math.floor(containerWidth / cellSize);
    return Math.max(minColumns, Math.min(maxColumns, calculatedColumns));
  }, [containerWidth]);

  // Track container width for responsive columns
  useEffect(() => {
    const updateContainerWidth = () => {
      if (gridRef.current) {
        const width = gridRef.current.offsetWidth;
        setContainerWidth(width);
      }
    };

    updateContainerWidth();

    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (gridRef.current) {
      resizeObserver.observe(gridRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    if (activityPreferences.length === 0) {
      return searchFilteredActivities;
    }
    
    if (searchFilteredActivities.length === 0) {
      return [];
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
      icon: template.icon,
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
      
      return {
        ...template,
        duration: activity.duration,
        points: activity.points,
        difficulty: activity.difficulty,
        title: activity.title,
        icon: activity.icon,
        gridSize: preference?.customGridSize || template.gridSize || { w: 1, h: 1 }
      };
    });
    
    return result;
  }, [activityPreferences, searchFilteredActivities]);

  // Notify parent component of the processed activities with preferences
  React.useEffect(() => {
    if (onActivitiesProcessed && activitiesWithPreferences.length > 0) {
      onActivitiesProcessed(activitiesWithPreferences);
    }
  }, [activitiesWithPreferences, onActivitiesProcessed]);

  // Handle mobile activity selection
  const handleActivityTap = (activity: ActivityTemplate) => {
    if (activity.id === 'create-new-activity') {
      if (onCreateNewActivity) {
        onCreateNewActivity();
      }
      return;
    }

    // Toggle selection
    if (selectedActivity?.id === activity.id) {
      if (onActivitySelect) {
        onActivitySelect(null); // Deselect
      }
    } else {
      if (onActivitySelect) {
        onActivitySelect(activity); // Select new activity
      }
    }
  };

  // Mobile grid layout with simple CSS Grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${mobileColumns}, 1fr)`,
    gap: '8px',
    padding: '8px'
  };

  return (
    <>
      {/* Mobile Tarkov-Style Inventory Grid */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-lg p-3 shadow-2xl relative">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-green-400 font-mono text-sm font-semibold tracking-wider">
              INVENTORY
            </h3>
            <div className="text-slate-400 font-mono text-xs">
              {isLoadingActivities ? (
                <span className="text-blue-400">[LOADING...]</span>
              ) : (
                <>
                  [{activitiesWithPreferences.length}]
                  {searchQuery && <span className="text-orange-400"> [FILTERED]</span>}
                </>
              )}
            </div>
          </div>
          
          {/* Search Toggle Button */}
          <button
            onClick={() => {
              setShowSearchBar(!showSearchBar);
              if (!showSearchBar && searchQuery) {
                setSearchQuery(''); // Clear search when hiding
              }
            }}
            className={`p-2 rounded-lg transition-colors ${
              showSearchBar || searchQuery 
                ? 'bg-slate-700 text-green-400' 
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
            }`}
            title="Search activities"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Search and Filter */}
        <div className="flex flex-col space-y-2 mb-3">
          {/* Search Input - Conditional */}
          {showSearchBar && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-500 focus:border-slate-400 focus:outline-none transition-colors font-mono text-sm"
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
          )}

          {/* Filter Dropdown - Always Visible */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-mono text-sm"
            >
              <div className="flex items-center space-x-2">
                <span>{FILTER_OPTIONS.find(opt => opt.id === selectedFilter)?.icon}</span>
                <span className="truncate">{FILTER_OPTIONS.find(opt => opt.id === selectedFilter)?.label}</span>
              </div>
              <span className="text-slate-400">▼</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFilter(option.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0 ${
                      selectedFilter === option.id ? 'bg-slate-700 text-green-400' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{option.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-medium truncate">{option.label}</div>
                        {option.description && (
                          <div className="font-mono text-xs text-slate-500 truncate">{option.description}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Grid Container */}
        <div
          ref={gridRef}
          className="border border-slate-600"
          style={gridStyle}
        >
          {activitiesWithPreferences.map((activity, index) => {
            const colors = getRarityColors(activity.rarity);
            const isSelected = selectedActivity?.id === activity.id;
            
            return (
              <div
                key={activity.id}
                className={`
                  relative bg-black border-2 cursor-pointer transition-all duration-300
                  flex items-center justify-center aspect-square
                  ${activity.id === 'create-new-activity' 
                    ? 'border-green-500 bg-green-900/20 hover:bg-green-800/30 hover:border-green-400' 
                    : isSelected 
                      ? 'border-yellow-400 bg-yellow-900/20 shadow-lg shadow-yellow-400/30'
                      : `${colors.border} hover:border-slate-400 ${colors.glow}`
                  }
                `}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none', // Prevents iOS context menu
                  WebkitTapHighlightColor: 'transparent', // Removes tap highlight
                  touchAction: 'manipulation' // Better touch response
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleActivityTap(activity);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleActivityTap(activity);
                }}
                onContextMenu={(e) => {
                  e.preventDefault(); // Prevent browser context menu completely
                }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                
                {/* Timeline usage indicator */}
                {(() => {
                  const timelineCount = timelineActivities.filter(ta => {
                    const taId = ta.id || ta.name?.toLowerCase().replace(/\s+/g, '-');
                    return taId === activity.id || ta.title === activity.title;
                  }).length;
                  
                  if (timelineCount > 0) {
                    return (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl z-10 flex items-center">
                        <div className="w-1 h-1 bg-white rounded-full mr-1"></div>
                        {timelineCount}
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Category color dot */}
                {activity.id !== 'create-new-activity' && (
                  <div 
                    className="absolute bottom-1 left-1 w-2 h-2 rounded-full z-10 shadow-md border border-black/20"
                    style={{ 
                      backgroundColor: getCategoryColor(activity, activityPreferences),
                      boxShadow: `0 0 4px ${getCategoryColor(activity, activityPreferences)}40`
                    }}
                  />
                )}
                
                {/* Activity Image or Emoji */}
                {activity.id === 'create-new-activity' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-2xl text-green-400 mb-1">➕</div>
                    <div className="text-xs text-green-300 font-bold leading-tight">CREATE</div>
                  </div>
                ) : (activity.icon.startsWith('/') || activity.icon.startsWith('data:')) ? (
                  <img 
                    src={activity.icon} 
                    alt={activity.title}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  />
                ) : (
                  <div className="text-xl md:text-2xl select-none opacity-30">
                    {activity.icon}
                  </div>
                )}
                
                {/* Points indicator */}
                <div className="absolute bottom-1 right-1 text-white text-xs font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {activity.points}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile selection instruction */}
        {selectedActivity && (
          <div className="mt-2 text-center text-xs text-yellow-400 font-mono">
            Selected: {selectedActivity.title} - Tap timeline to place
          </div>
        )}
      </div>

      {/* Mobile Tooltip */}
      {hoveredActivity && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-slate-800 border-2 border-slate-600 rounded-lg p-3 shadow-2xl">
          <div className="mb-2">
            <h4 className="text-green-400 font-semibold font-mono text-sm">{hoveredActivity.title}</h4>
          </div>
          <p className="text-slate-300 text-xs mb-2">{hoveredActivity.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500">Points:</span>
              <span className="text-yellow-400 font-bold ml-1">{hoveredActivity.points}</span>
            </div>
            <div>
              <span className="text-slate-500">Duration:</span>
              <span className="text-blue-400 ml-1">{hoveredActivity.duration}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}