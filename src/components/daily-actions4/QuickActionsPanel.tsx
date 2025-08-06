'use client'

import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Filter, Search, Upload, Sparkles } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { ActivityPreference } from '@/types/daily-use';
import { saveActivityImageAndGridPreference } from '@/lib/activity-preferences';
import { ActivityTemplate } from './TarkovInventoryGrid';

interface QuickActionsPanelProps {
  theme: ThemeConfig;
  isVisible: boolean;
  onClose: () => void;
  activityTemplates: ActivityTemplate[];
  activityPreferences?: ActivityPreference[];
  timelineActivities?: any[];
}

type FilterType = 'all' | 'no-image' | 'has-image' | 'emoji-only';

export default function QuickActionsPanel({ 
  theme, 
  isVisible, 
  onClose, 
  activityTemplates,
  activityPreferences = [],
  timelineActivities = []
}: QuickActionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityTemplate | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedGridSize, setSelectedGridSize] = useState<{w: number, h: number}>({ w: 1, h: 1 });

  // Reset state when panel opens/closes
  useEffect(() => {
    if (isVisible) {
      setSelectedActivity(null);
      setSearchQuery('');
      setFilterType('all');
    }
  }, [isVisible]);

  // Initialize grid size when activity is selected
  useEffect(() => {
    if (selectedActivity) {
      const currentGridSize = selectedActivity.gridSize || { w: 1, h: 1 };
      setSelectedGridSize(currentGridSize);
      console.log('🎯 Initialized grid size for', selectedActivity.title, ':', currentGridSize);
    }
  }, [selectedActivity]);

  if (!isVisible) return null;

  // Defensive check for activityTemplates
  if (!activityTemplates || activityTemplates.length === 0) {
    return null;
  }

  // Merge all activity sources with proper deduplication
  const getAllUniqueActivities = () => {
    const allActivities = new Map();
    
    // Priority order: User preferences > System defaults > Timeline activities > Templates
    // This ensures user customizations take precedence
    
    // 1. Add hardcoded templates first (lowest priority)
    activityTemplates.forEach(template => {
      allActivities.set(template.id, {
        ...template,
        source: 'template'
      });
    });
    
    // 2. Add timeline activities (override templates if same ID)
    timelineActivities.forEach(timelineActivity => {
      if (timelineActivity.title) {
        const activityId = timelineActivity.id || timelineActivity.title.toLowerCase().replace(/\s+/g, '-');
        const templateActivity: ActivityTemplate = {
          id: activityId,
          title: timelineActivity.title,
          icon: timelineActivity.icon || '❓',
          category: timelineActivity.category || 'timeline',
          points: timelineActivity.points || 10,
          rarity: timelineActivity.rarity || 'common',
          duration: timelineActivity.duration || '5 min',
          difficulty: timelineActivity.difficulty || 1,
          description: timelineActivity.description || `Timeline activity: ${timelineActivity.title}`,
          gridSize: timelineActivity.gridSize || { w: 1, h: 1 },
          source: 'timeline'
        };
        allActivities.set(activityId, templateActivity);
      }
    });
    
    // 3. Add activities from preferences (highest priority - these override everything)
    activityPreferences.forEach(preference => {
      if (preference.activityTitle) {
        const templateActivity: ActivityTemplate = {
          id: preference.activityId,
          title: preference.activityTitle,
          icon: preference.customIcon || '📝',
          category: preference.customCategory || 'database',
          points: preference.customPoints || 10,
          rarity: 'common',
          duration: preference.customDuration || '5 min',
          difficulty: preference.customDifficulty || 1,
          description: preference.customDescription || `Activity: ${preference.activityTitle}`,
          gridSize: (preference.customGridSize as { w: number; h: number }) || { w: 1, h: 1 },
          source: preference.sessionId === 'system-default' ? 'system' : 'user'
        };
        allActivities.set(preference.activityId, templateActivity);
      }
    });
    
    return Array.from(allActivities.values());
  };

  // Apply preferences to all activities
  const activitiesWithPreferences = getAllUniqueActivities().map(template => {
    const preference = activityPreferences.find(p => p.activityId === template.id);
    return {
      ...template,
      icon: preference?.customImageUrl || template.icon,
      gridSize: preference?.customGridSize || template.gridSize || { w: 1, h: 1 }
    };
  });

  // Filter activities based on search and filter type
  const filteredActivities = activitiesWithPreferences.filter(activity => {
    // Search filter
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Type filter
    switch (filterType) {
      case 'no-image':
        return !activity.icon.startsWith('/') && !activity.icon.startsWith('data:');
      case 'has-image':
        return activity.icon.startsWith('/') || activity.icon.startsWith('data:');
      case 'emoji-only':
        return !activity.icon.startsWith('/') && !activity.icon.startsWith('data:');
      case 'all':
      default:
        return true;
    }
  });

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 text-gray-300';
      case 'uncommon': return 'border-green-500 text-green-300';
      case 'rare': return 'border-blue-500 text-blue-300';
      case 'epic': return 'border-purple-500 text-purple-300';
      case 'legendary': return 'border-yellow-500 text-yellow-300';
      default: return 'border-gray-500 text-gray-300';
    }
  };

  const handleActivitySelect = (activity: ActivityTemplate) => {
    setSelectedActivity(activity);
    setSelectedGridSize(activity.gridSize || { w: 1, h: 1 });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedActivity) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        
        try {
          const result = await saveActivityImageAndGridPreference(
            selectedActivity.id,
            selectedActivity.title,
            imageDataUrl,
            selectedGridSize,
            'upload',
            undefined,
            {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedAt: new Date().toISOString()
            }
          );

          if (result.success) {
            console.log('✅ Quick Actions image saved successfully!');
            
            // Trigger refresh
            window.dispatchEvent(new CustomEvent('activityImageUpdated', {
              detail: { activityId: selectedActivity.id, imageUrl: imageDataUrl }
            }));
            
            // Close activity selector
            setSelectedActivity(null);
          } else {
            console.error('❌ Failed to save image:', result.error);
            alert('Failed to save image. Please try again.');
          }
        } catch (error) {
          console.error('❌ Error saving image:', error);
          alert('Error saving image. Please try again.');
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className={`${theme.cardBackground} rounded-xl shadow-2xl border ${theme.cardBorder} w-full max-w-4xl max-h-[90vh] overflow-hidden bg-opacity-100`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Manage Activity Images</h2>
            <div className="text-sm text-gray-400">
              {filteredActivities.length} activities
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-600 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Activities', count: activitiesWithPreferences.length },
              { key: 'no-image', label: 'Need Images', count: activitiesWithPreferences.filter(a => !a.icon.startsWith('/') && !a.icon.startsWith('data:')).length },
              { key: 'has-image', label: 'Has Images', count: activitiesWithPreferences.filter(a => a.icon.startsWith('/') || a.icon.startsWith('data:')).length },
              { key: 'emoji-only', label: 'Emoji Only', count: activitiesWithPreferences.filter(a => !a.icon.startsWith('/') && !a.icon.startsWith('data:')).length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as FilterType)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterType === filter.key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>

        {/* Activity Grid */}
        <div className="p-4 overflow-y-auto max-h-80">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredActivities.map((activity) => {
              const hasCustomImage = activity.icon.startsWith('/') || activity.icon.startsWith('data:');
              
              return (
                <div
                  key={activity.id}
                  onClick={() => handleActivitySelect(activity)}
                  className={`relative bg-black border-2 rounded-lg p-3 cursor-pointer transition-all hover:border-purple-400 ${getRarityColors(activity.rarity)}`}
                >
                  {/* Activity Icon/Image */}
                  <div className="aspect-square flex items-center justify-center mb-2">
                    {hasCustomImage ? (
                      <img 
                        src={activity.icon} 
                        alt={activity.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="text-2xl opacity-60">
                        {activity.icon}
                      </div>
                    )}
                  </div>
                  
                  {/* Activity Title */}
                  <div className="text-xs text-center font-medium truncate" title={activity.title}>
                    {activity.title}
                  </div>
                  
                  {/* Image Status Indicator */}
                  <div className="absolute top-1 right-1">
                    {hasCustomImage ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Grid Size Badge */}
                  {activity.gridSize && (activity.gridSize.w !== 1 || activity.gridSize.h !== 1) && (
                    <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">
                      {activity.gridSize.w}×{activity.gridSize.h}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activities found matching your search.</p>
            </div>
          )}
        </div>

        {/* Activity Editor - appears when activity is selected */}
        {selectedActivity && (
          <div className="border-t border-gray-600 p-6 bg-gray-800 max-h-60 overflow-y-auto">
            <div className="flex items-start space-x-6">
              {/* Visual Preview Grid */}
              <div className="flex-shrink-0">
                <p className="text-sm text-gray-300 mb-3">Preview (Grid {selectedGridSize.w}×{selectedGridSize.h}):</p>
                <div 
                  className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                  style={{
                    width: `${selectedGridSize.w * 80}px`,
                    height: `${selectedGridSize.h * 80}px`,
                    aspectRatio: `${selectedGridSize.w} / ${selectedGridSize.h}`
                  }}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Vertical lines */}
                    {Array.from({ length: selectedGridSize.w - 1 }, (_, i) => (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0 w-px bg-white/30"
                        style={{ left: `${((i + 1) / selectedGridSize.w) * 100}%` }}
                      />
                    ))}
                    {/* Horizontal lines */}
                    {Array.from({ length: selectedGridSize.h - 1 }, (_, i) => (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0 h-px bg-white/30"
                        style={{ top: `${((i + 1) / selectedGridSize.h) * 100}%` }}
                      />
                    ))}
                    {/* Border grid lines */}
                    <div className="absolute inset-0 border border-white/30 rounded-lg"></div>
                  </div>
                  
                  {/* Activity Image */}
                  <div className="absolute inset-2">
                    {(selectedActivity.icon.startsWith('/') || selectedActivity.icon.startsWith('data:')) ? (
                      <img 
                        src={selectedActivity.icon} 
                        alt={selectedActivity.title}
                        className="w-full h-full object-fill rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-700 rounded">
                        {selectedActivity.icon}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Info & Upload */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedActivity.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{selectedActivity.description}</p>
                
                {/* Upload Image Section */}
                <div className="mb-6">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isUploadingImage 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600 cursor-pointer'
                    }`}>
                      {isUploadingImage ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload Custom Image</span>
                        </>
                      )}
                    </div>
                  </label>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                </div>

                {/* Grid Size Selector */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-300 mb-3">Grid Layout</p>
                    
                  {/* Grid Option Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { w: 1, h: 1, label: '1×1' },
                      { w: 2, h: 1, label: '2×1' },
                      { w: 1, h: 2, label: '1×2' },
                      { w: 2, h: 2, label: '2×2' }
                    ].map((gridOption) => (
                      <button
                        key={`${gridOption.w}-${gridOption.h}`}
                        onClick={() => setSelectedGridSize(gridOption)}
                        className={`px-3 py-2 text-sm rounded transition-all ${
                          selectedGridSize.w === gridOption.w && selectedGridSize.h === gridOption.h
                            ? 'bg-purple-500 text-white border-2 border-purple-400'
                            : 'bg-gray-600 text-gray-300 border-2 border-gray-500 hover:border-gray-400'
                        }`}
                      >
                        {gridOption.label}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    Choose how many grid slots this activity should occupy
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-start space-x-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={async () => {
                      try {
                        // Save grid size change without uploading new image
                        const result = await saveActivityImageAndGridPreference(
                          selectedActivity.id,
                          selectedActivity.title,
                          selectedActivity.icon, // Keep existing image
                          selectedGridSize, // Save new grid size
                          selectedActivity.icon.startsWith('data:') ? 'upload' : 'template'
                        );
                        
                        if (result.success) {
                          console.log('✅ Grid size saved successfully!');
                          
                          // Trigger page refresh to reload preferences
                          window.dispatchEvent(new CustomEvent('activityImageUpdated', {
                            detail: { 
                              activityId: selectedActivity.id, 
                              gridSize: selectedGridSize
                            }
                          }));
                          
                          setSelectedActivity(null);
                        } else {
                          console.error('❌ Failed to save grid size:', result.error);
                          alert('Failed to save grid size. Please try again.');
                        }
                      } catch (error) {
                        console.error('❌ Error saving grid size:', error);
                        alert('Error saving grid size. Please try again.');
                      }
                    }}
                    className="px-6 py-3 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-3 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}