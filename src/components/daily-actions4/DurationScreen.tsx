'use client'

import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Clock, 
  Settings, 
  Target, 
  Save,
  Calendar,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { saveActivityImageAndGridPreference } from '@/lib/activity-preferences';

interface ActivityEditItem {
  id: string;
  title: string;
  duration: string;
  scheduledTime?: string;
  points: number;
  icon: string;
  category: string;
  originalDuration: string;
  instructions?: string;
  isRecurring?: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    endDate?: string;
    maxOccurrences?: number;
    skipHolidays?: boolean;
    customDates?: string[];
    time?: string;
  };
}

interface DurationScreenProps {
  theme: ThemeConfig;
  isVisible: boolean;
  onActivitySave: (activity: ActivityEditItem) => void;
  onActivityPlace: (activity: ActivityEditItem, timePosition: string) => void;
  onBack: () => void;
}

export default function DurationScreen({ 
  theme, 
  isVisible, 
  onActivitySave,
  onActivityPlace,
  onBack
}: DurationScreenProps) {
  const [currentActivity, setCurrentActivity] = useState<ActivityEditItem | null>(null);
  const [showTimePosition, setShowTimePosition] = useState(false);
  const [timePosition, setTimePosition] = useState('12:00p');
  
  // New editing states
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  
  // Recurring schedule states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [maxOccurrences, setMaxOccurrences] = useState<number | null>(null);
  const [recurringTime, setRecurringTime] = useState('9:00a');
  
  // Art Studio - Image customization state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number, aspectRatio: number} | null>(null);
  const [suggestedGridSize, setSuggestedGridSize] = useState<{w: number, h: number} | null>(null);
  const [selectedGridSize, setSelectedGridSize] = useState<{w: number, h: number} | null>(null);

  // Listen for dropped activities from main page
  useEffect(() => {
    const handleActivityDropped = async (event: any) => {
      const activity = event.detail;
      console.log('📥 Duration screen received dropped activity:', activity);
      
      // Reset image-related state for new activity
      setCustomImagePreview(null);
      setImageDimensions(null);
      setSuggestedGridSize(null);
      
      // Extract base activity ID for timeline lookup
      let baseActivityId = activity.id;
      if (activity.id.startsWith('edit-') && activity.id.includes('-')) {
        const parts = activity.id.split('-');
        if (parts.length >= 3) {
          baseActivityId = parts.slice(2).join('-');
        }
      }
      
      console.log('🔍 Looking for timeline activity with base ID:', baseActivityId);
      
      // Check if this activity exists on the timeline with database settings
      let timelineActivity = null;
      try {
        const sessionId = localStorage.getItem('lightwalker_session_id');
        if (sessionId) {
          const response = await fetch(`/api/timeline-activities?sessionId=${sessionId}`);
          if (response.ok) {
            const result = await response.json();
            const timelineActivities = result.timelineActivities || [];
            
            // Find timeline activity that matches this base activity
            timelineActivity = timelineActivities.find((ta: any) => ta.activityId === baseActivityId);
            
            if (timelineActivity) {
              console.log('✅ Found timeline activity with database settings:', timelineActivity);
            } else {
              console.log('ℹ️ No timeline activity found for:', baseActivityId);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error loading timeline activity:', error);
      }
      
      // Use timeline settings if available, otherwise use passed activity data
      const finalActivity = timelineActivity ? {
        ...activity,
        duration: timelineActivity.customDuration || timelineActivity.duration || activity.duration,
        points: timelineActivity.customPoints || timelineActivity.points || activity.points,
        isRecurring: timelineActivity.isRecurring || false,
        recurringPattern: timelineActivity.recurringPattern || undefined,
        scheduledTime: timelineActivity.scheduledTime,
        timelineId: timelineActivity.id // Store timeline ID for updates
      } : activity;
      
      // Initialize grid size based on activity's current grid size
      const currentGridSize = finalActivity.gridSize || { w: 1, h: 1 };
      setSelectedGridSize(currentGridSize);
      console.log('🎯 Initialized grid size for', finalActivity.title, ':', currentGridSize);
      
      // Initialize editing states
      setEditingTitle(finalActivity.title || finalActivity.name || '');
      setEditingDescription(finalActivity.description || '');
      setEditingInstructions(finalActivity.instructions || '');
      
      // Initialize recurring states from timeline data
      setIsRecurring(finalActivity.isRecurring || false);
      setRecurringType(finalActivity.recurringPattern?.type || 'daily');
      setRecurringInterval(finalActivity.recurringPattern?.interval || 1);
      setSelectedDaysOfWeek(finalActivity.recurringPattern?.daysOfWeek || []);
      setRecurringEndDate(finalActivity.recurringPattern?.endDate || '');
      setMaxOccurrences(finalActivity.recurringPattern?.maxOccurrences || null);
      setRecurringTime(finalActivity.recurringPattern?.time || finalActivity.scheduledTime || '9:00a');
      
      console.log('📋 Final activity settings loaded:', {
        duration: finalActivity.duration,
        points: finalActivity.points,
        isRecurring: finalActivity.isRecurring,
        fromTimeline: !!timelineActivity
      });
      
      setCurrentActivity(finalActivity);
    };

    window.addEventListener('activityDropped', handleActivityDropped);
    return () => window.removeEventListener('activityDropped', handleActivityDropped);
  }, []);

  // Update current activity when grid size selection changes
  useEffect(() => {
    if (selectedGridSize && currentActivity) {
      setCurrentActivity(prev => {
        if (!prev) return null;
        return {
          ...prev,
          gridSize: selectedGridSize
        };
      });
    }
  }, [selectedGridSize]);

  // Duration options for slider
  const durationOptions = [5, 10, 15, 20, 30, 40, 45, 60, 90, 120];

  const handleDurationChange = (newDuration: string) => {
    if (currentActivity) {
      setCurrentActivity(prev => {
        if (!prev) return null;
        
        const updated = {
          ...prev,
          duration: newDuration,
          points: Math.round(parseInt(newDuration) * 2) // Adjust points based on duration
        };
        
        console.log('🔧 DurationScreen updating activity:', {
          before: { duration: prev.duration, points: prev.points, difficulty: prev.difficulty },
          after: { duration: updated.duration, points: updated.points, difficulty: updated.difficulty }
        });
        
        return updated;
      });
    }
  };

  const handleCustomDurationChange = (minutes: string) => {
    handleDurationChange(`${minutes} min`);
  };

  const handleTitleChange = (newTitle: string) => {
    setEditingTitle(newTitle);
    if (currentActivity) {
      setCurrentActivity(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const handleDescriptionChange = (newDescription: string) => {
    setEditingDescription(newDescription);
    if (currentActivity) {
      setCurrentActivity(prev => prev ? { ...prev, description: newDescription } : null);
    }
  };

  const handleInstructionsChange = (newInstructions: string) => {
    setEditingInstructions(newInstructions);
    if (currentActivity) {
      setCurrentActivity(prev => prev ? { ...prev, instructions: newInstructions } : null);
    }
  };

  const handleDurationSliderChange = (minutes: number) => {
    handleDurationChange(`${minutes} min`);
  };

  const handleRecurringToggle = (enabled: boolean) => {
    setIsRecurring(enabled);
    if (currentActivity) {
      setCurrentActivity(prev => prev ? { 
        ...prev, 
        isRecurring: enabled,
        recurringPattern: enabled ? {
          type: recurringType,
          interval: recurringInterval,
          daysOfWeek: selectedDaysOfWeek,
          endDate: recurringEndDate || undefined,
          maxOccurrences: maxOccurrences || undefined,
          time: recurringTime
        } : undefined
      } : null);
    }
  };

  const handleRecurringTypeChange = (type: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setRecurringType(type);
    // Auto-set sensible defaults for weekly pattern
    if (type === 'weekly' && selectedDaysOfWeek.length === 0) {
      const today = new Date().getDay();
      setSelectedDaysOfWeek([today]);
    }
    updateRecurringPattern();
  };

  const handleDayOfWeekToggle = (day: number) => {
    const newDays = selectedDaysOfWeek.includes(day)
      ? selectedDaysOfWeek.filter(d => d !== day)
      : [...selectedDaysOfWeek, day].sort();
    setSelectedDaysOfWeek(newDays);
    updateRecurringPattern();
  };

  const handleRecurringTimeChange = (time: string) => {
    setRecurringTime(time);
    updateRecurringPattern();
  };

  const updateRecurringPattern = () => {
    if (currentActivity && isRecurring) {
      setCurrentActivity(prev => prev ? {
        ...prev,
        recurringPattern: {
          type: recurringType,
          interval: recurringInterval,
          daysOfWeek: selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : undefined,
          endDate: recurringEndDate || undefined,
          maxOccurrences: maxOccurrences || undefined,
          time: recurringTime
        }
      } : null);
    }
  };

  const handleSave = () => {
    if (currentActivity) {
      onActivitySave(currentActivity);
      setCurrentActivity(null);
      onBack(); // Close the edit screen after saving
    }
  };

  const handlePlaceOnTimeline = () => {
    setShowTimePosition(true);
  };

  const handleTimePositionDone = () => {
    if (currentActivity) {
      onActivityPlace(currentActivity, timePosition);
      setCurrentActivity(null);
      setShowTimePosition(false);
      setTimePosition('12:00p'); // Reset for next use
    }
  };

  // Art Studio - Image analysis functions
  const analyzeImageDimensions = (file: File): Promise<{width: number, height: number, aspectRatio: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        resolve({ width: img.width, height: img.height, aspectRatio });
        URL.revokeObjectURL(img.src); // Clean up memory
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const calculateOptimalGridSize = (aspectRatio: number): {w: number, h: number} => {
    // Wide images (landscape)
    if (aspectRatio > 1.8) return { w: 2, h: 1 };
    // Very tall images (portrait)
    if (aspectRatio < 0.6) return { w: 1, h: 2 };
    // Large square-ish images
    if (aspectRatio > 1.2 && aspectRatio <= 1.8) return { w: 2, h: 2 };
    // Default square
    return { w: 1, h: 1 };
  };

  // Art Studio - Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentActivity) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);

      // Analyze image dimensions first
      const dimensions = await analyzeImageDimensions(file);
      const suggestedGrid = calculateOptimalGridSize(dimensions.aspectRatio);
      
      console.log('🖼️ Image analysis:', {
        dimensions: `${dimensions.width}x${dimensions.height}`,
        aspectRatio: dimensions.aspectRatio.toFixed(2),
        suggestedGrid: `${suggestedGrid.w}x${suggestedGrid.h}`
      });
      
      setImageDimensions(dimensions);
      setSuggestedGridSize(suggestedGrid);
      setSelectedGridSize(suggestedGrid); // Default to suggested

      // Convert file to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        
        // Set preview immediately
        setCustomImagePreview(imageDataUrl);
        
        // Update current activity with new image
        setCurrentActivity(prev => {
          if (!prev) return null;
          return {
            ...prev,
            icon: imageDataUrl
          };
        });

        // Save to database/preferences with grid size
        try {
          const gridSizeToSave = selectedGridSize || suggestedGrid;
          
          // Extract base activity ID from edit ID (e.g., "edit-123456-mentoring" -> "mentoring")
          let baseActivityId = currentActivity.id;
          if (currentActivity.id.startsWith('edit-') && currentActivity.id.includes('-')) {
            const parts = currentActivity.id.split('-');
            if (parts.length >= 3) {
              baseActivityId = parts.slice(2).join('-'); // Get everything after "edit-timestamp-"
            }
          }
          
          console.log('💾 Saving image with extracted ID:', {
            originalId: currentActivity.id,
            extractedId: baseActivityId,
            gridSize: gridSizeToSave,
            selectedGridSize: selectedGridSize,
            suggestedGridSize: suggestedGrid
          });
          
          const result = await saveActivityImageAndGridPreference(
            baseActivityId, // Use extracted base ID instead of generated ID
            currentActivity.title,
            imageDataUrl,
            gridSizeToSave,
            'upload',
            undefined,
            {
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedAt: new Date().toISOString(),
              originalDimensions: dimensions,
              suggestedGridSize: suggestedGrid,
              selectedGridSize: gridSizeToSave
            }
          );

          if (result.success) {
            console.log('✅ Custom image saved successfully!');
            
            // Trigger a page refresh to reload preferences
            window.dispatchEvent(new CustomEvent('activityImageUpdated', {
              detail: { activityId: currentActivity.id, imageUrl: imageDataUrl }
            }));
          } else {
            console.error('❌ Failed to save custom image:', result.error);
          }
        } catch (error) {
          console.error('❌ Error saving custom image:', error);
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

  if (!isVisible) return null;

  if (showTimePosition && currentActivity) {
    // Time Position Screen
    return (
      <div className="mt-4">
        <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Place on Timeline: {currentActivity.title}
            </h3>
            <button
              onClick={() => setShowTimePosition(false)}
              className={`p-2 ${theme.cardHover} rounded-lg transition-colors`}
            >
              <ArrowLeft className={`w-4 h-4 ${theme.cardSubtext}`} />
            </button>
          </div>

          {/* Activity Summary with Big Graphic */}
          <div className={`p-4 ${theme.statsBackground} rounded-lg mb-6`}>
            <div className="flex items-center space-x-4">
              {/* Big Activity Graphic */}
              <div className="flex-shrink-0">
                {(currentActivity.icon.startsWith('/') || currentActivity.icon.startsWith('data:')) ? (
                  <div className="w-20 h-20 bg-gray-800 rounded-lg p-2 shadow-lg">
                    <img 
                      src={currentActivity.icon} 
                      alt={currentActivity.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-4xl">{currentActivity.icon}</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className={`text-lg font-medium ${theme.cardText}`}>{currentActivity.title}</h4>
                <p className={`text-sm ${theme.cardSubtext}`}>
                  Duration: {currentActivity.duration} • Points: {currentActivity.points}
                </p>
              </div>
            </div>
          </div>

          {/* Time Position Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Time Position:
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="time"
                value={timePosition.includes('a') || timePosition.includes('p') ? 
                  convertTo24Hour(timePosition) : timePosition}
                onChange={(e) => {
                  const time24 = e.target.value;
                  const time12 = convertTo12Hour(time24);
                  setTimePosition(time12);
                }}
                className="px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-lg font-mono text-white focus:bg-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
              />
              <span className="text-sm text-gray-300">
                Will place at: <strong className="text-white">{timePosition}</strong>
              </span>
            </div>
          </div>

          {/* Done Button */}
          <div className="flex justify-end">
            <button
              onClick={handleTimePositionDone}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              <span>Place on Timeline</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Duration Screen
  return (
    <div className="mt-4">
      <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6 relative`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.cardText} flex items-center`}>
            <Settings className="w-5 h-5 mr-2 text-orange-500" />
            Activity Duration Settings
          </h3>
          <button
            onClick={onBack}
            className={`p-2 ${theme.cardHover} rounded-lg transition-colors`}
          >
            <ArrowLeft className={`w-4 h-4 ${theme.cardSubtext}`} />
          </button>
        </div>

        {/* Drop Zone with Activity Display */}
        <Droppable droppableId="duration-screen-drop" type="ACTIVITY">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`mb-6 min-h-[120px] rounded-lg transition-colors ${
                snapshot.isDraggingOver 
                  ? 'bg-orange-500/10 border-2 border-dashed border-orange-500' 
                  : 'border-2 border-dashed border-transparent'
              }`}
            >
              {currentActivity ? (
                // Compact Activity Display
                <div className="flex items-center space-x-4 p-4">
                  {/* Activity Graphic */}
                  <div className="flex-shrink-0">
                    {(customImagePreview || currentActivity.icon) && ((customImagePreview || currentActivity.icon).startsWith('/') || (customImagePreview || currentActivity.icon).startsWith('data:')) ? (
                      <div className="w-16 h-16 bg-gray-800 rounded-lg p-2 shadow-lg">
                        <img 
                          src={customImagePreview || currentActivity.icon} 
                          alt={editingTitle}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (customImagePreview || currentActivity.icon) ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{customImagePreview || currentActivity.icon}</span>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                        <Settings className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Activity Info */}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{editingTitle || currentActivity.title || 'Activity'}</h4>
                    <p className="text-sm text-gray-300">
                      Duration: {currentActivity.duration} • Points: {currentActivity.points}
                    </p>
                  </div>
                </div>
              ) : (
                // Drop instruction
                <div className="flex items-center justify-center h-full p-4">
                  <div className="text-center">
                    <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="text-base font-medium text-white mb-1">
                      Drag Activity Here to Edit
                    </h4>
                    <p className="text-xs text-gray-400">
                      Drop an activity from the inventory to customize
                    </p>
                  </div>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Two-Column Layout: Left side for settings, Right side for content editing */}
        {currentActivity && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Image Customization, Settings, and Controls */}
            <div className="space-y-6">
              {/* Art Studio - Image Customization Section */}
              <div className={`p-4 ${theme.statsBackground} rounded-lg`}>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-purple-400" />
                  Customize Activity Image
                </h4>
                
                <div className="flex items-start space-x-6">
                  {/* Visual Preview Grid */}
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-300 mb-3">Preview:</p>
                    <div 
                      className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                      style={{
                        width: `${(selectedGridSize?.w || 1) * 80}px`,
                        height: `${(selectedGridSize?.h || 1) * 80}px`,
                        aspectRatio: `${selectedGridSize?.w || 1} / ${selectedGridSize?.h || 1}`
                      }}
                    >
                      {/* Grid Lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Vertical lines */}
                        {Array.from({ length: (selectedGridSize?.w || 1) - 1 }, (_, i) => (
                          <div
                            key={`v-${i}`}
                            className="absolute top-0 bottom-0 w-px bg-white/30"
                            style={{ left: `${((i + 1) / (selectedGridSize?.w || 1)) * 100}%` }}
                          />
                        ))}
                        {/* Horizontal lines */}
                        {Array.from({ length: (selectedGridSize?.h || 1) - 1 }, (_, i) => (
                          <div
                            key={`h-${i}`}
                            className="absolute left-0 right-0 h-px bg-white/30"
                            style={{ top: `${((i + 1) / (selectedGridSize?.h || 1)) * 100}%` }}
                          />
                        ))}
                        {/* Border grid lines */}
                        <div className="absolute inset-0 border border-white/30 rounded-lg"></div>
                      </div>
                      
                      {/* Activity Image */}
                      <div className="absolute inset-2 group cursor-pointer" onClick={() => document.getElementById('image-upload-input')?.click()}>
                        {(currentActivity.icon.startsWith('/') || currentActivity.icon.startsWith('data:')) ? (
                          <img 
                            src={customImagePreview || currentActivity.icon} 
                            alt={currentActivity.title}
                            className="w-full h-full object-fill rounded"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                            <span className="text-2xl">{currentActivity.icon}</span>
                          </div>
                        )}
                        
                        {/* Upload overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                          <Upload className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Upload Controls & Grid Selector */}
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        id="image-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors w-fit ${
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
                            <span>Upload Image</span>
                          </>
                        )}
                      </div>
                    </label>
                    
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG up to 5MB
                    </p>
                    
                    {/* Image dimensions info */}
                    {imageDimensions && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Image: {imageDimensions.width}×{imageDimensions.height} (ratio: {imageDimensions.aspectRatio.toFixed(2)})
                        </p>
                        {suggestedGridSize && (
                          <p className="text-xs text-green-400">
                            💡 Suggested grid size: {suggestedGridSize.w}×{suggestedGridSize.h} based on image ratio
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Future: AI Generation Button */}
                    <button 
                      disabled
                      className="mt-2 flex items-center space-x-2 px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed opacity-50 w-fit"
                      title="AI Generation coming soon!"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI Generate</span>
                      <span className="text-xs">(Soon)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid Layout Buttons */}
              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-3`}>
                  Grid Layout
                </label>
                <div className="grid grid-cols-2 gap-2 max-w-48">
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
                        selectedGridSize?.w === gridOption.w && selectedGridSize?.h === gridOption.h
                          ? 'bg-purple-500 text-white border-2 border-purple-400'
                          : 'bg-gray-600 text-gray-300 border-2 border-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {gridOption.label}
                      {suggestedGridSize?.w === gridOption.w && suggestedGridSize?.h === gridOption.h && (
                        <span className="ml-1 text-green-400">💡</span>
                      )}
                    </button>
                  ))}
                </div>
                {suggestedGridSize && (
                  <p className="text-xs text-green-400 mt-2">
                    💡 Suggested: {suggestedGridSize.w}×{suggestedGridSize.h} based on image ratio
                  </p>
                )}
              </div>

              {/* Duration Slider */}
              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-3`}>
                  Duration: {currentActivity.duration}
                </label>
                <div className="space-y-3">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max={durationOptions.length - 1}
                    value={Math.max(0, durationOptions.findIndex(d => d === parseInt(currentActivity.duration)))}
                    onChange={(e) => handleDurationSliderChange(durationOptions[parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${(Math.max(0, durationOptions.findIndex(d => d === parseInt(currentActivity.duration))) / (durationOptions.length - 1)) * 100}%, #4b5563 ${(Math.max(0, durationOptions.findIndex(d => d === parseInt(currentActivity.duration))) / (durationOptions.length - 1)) * 100}%, #4b5563 100%)`,
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  {/* Duration markers */}
                  <div className="flex justify-between text-xs text-gray-400">
                    {durationOptions.map((duration, index) => (
                      <span
                        key={duration}
                        className={`cursor-pointer hover:text-white transition-colors ${
                          parseInt(currentActivity.duration) === duration ? 'text-orange-400 font-bold' : ''
                        }`}
                        onClick={() => handleDurationSliderChange(duration)}
                      >
                        {duration}
                      </span>
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-300">
                    Minutes • Points: {currentActivity.points}
                    {currentActivity.originalDuration !== currentActivity.duration && (
                      <span className="text-orange-400 ml-2">
                        (was {Math.round(parseInt(currentActivity.originalDuration) * 2)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recurring Schedule */}
              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-3`}>
                  Recurring Schedule
                </label>
                
                {/* Enable Recurring Toggle */}
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    onClick={() => handleRecurringToggle(!isRecurring)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isRecurring 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isRecurring ? 'bg-white' : 'bg-gray-400'}`} />
                    <span className="text-sm">Repeat Activity</span>
                  </button>
                  {isRecurring && (
                    <span className="text-xs text-green-400">✓ This activity will repeat automatically</span>
                  )}
                </div>

                {/* Recurring Options */}
                {isRecurring && (
                  <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                    {/* Recurring Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">Repeat Pattern</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'custom', label: 'Custom' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleRecurringTypeChange(option.value as any)}
                            className={`px-3 py-2 text-xs rounded transition-colors ${
                              recurringType === option.value
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recurring Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Repeat Time
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="time"
                          value={recurringTime.includes('a') || recurringTime.includes('p') ? 
                            convertTo24Hour(recurringTime) : recurringTime}
                          onChange={(e) => {
                            const time24 = e.target.value;
                            const time12 = convertTo12Hour(time24);
                            handleRecurringTimeChange(time12);
                          }}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:bg-gray-600 focus:border-blue-400 focus:outline-none transition-colors"
                        />
                        <span className="text-xs text-gray-300">
                          Will repeat at: <strong className="text-green-400">{recurringTime}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Weekly Day Selection */}
                    {recurringType === 'weekly' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">Days of Week</label>
                        <div className="grid grid-cols-7 gap-1">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <button
                              key={day}
                              onClick={() => handleDayOfWeekToggle(index)}
                              className={`px-2 py-2 text-xs rounded transition-colors ${
                                selectedDaysOfWeek.includes(index)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        {selectedDaysOfWeek.length > 0 && (
                          <p className="text-xs text-blue-400 mt-1">
                            Repeats: {selectedDaysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Daily/Weekly Interval */}
                    {(recurringType === 'daily' || recurringType === 'weekly') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-2">
                          Every {recurringInterval} {recurringType === 'daily' ? 'day(s)' : 'week(s)'}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max={recurringType === 'daily' ? '30' : '12'}
                          value={recurringInterval}
                          onChange={(e) => setRecurringInterval(parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>1</span>
                          <span className="text-orange-400 font-bold">{recurringInterval}</span>
                          <span>{recurringType === 'daily' ? '30' : '12'}</span>
                        </div>
                      </div>
                    )}

                    {/* End Date (Optional) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">End Date (Optional)</label>
                      <input
                        type="date"
                        value={recurringEndDate}
                        onChange={(e) => setRecurringEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-xs"
                      />
                      {recurringEndDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Will stop repeating after {new Date(recurringEndDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handlePlaceOnTimeline}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Place on Timeline</span>
                </button>
              </div>
            </div>

            {/* Right Column: Title, Philosophy and Instructions Editing */}
            <div className="space-y-6">
              {/* Title Editing */}
              <div>
                <label className={`block text-sm font-medium ${theme.cardText} mb-3`}>
                  Activity Title
                </label>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter activity title..."
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:bg-gray-500 focus:border-orange-400 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will be displayed on the activity card
                </p>
              </div>

              {/* Philosophy Editing */}
              <div>
                <label className={`block text-sm font-medium text-blue-400 mb-3 flex items-center`}>
                  <span className="mr-2">Philosophy</span>
                  <span className="text-xs text-gray-400 font-normal">(Meaning & Context)</span>
                </label>
                <textarea
                  value={editingDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Enter the philosophical meaning or personal significance of this activity..."
                  rows={4}
                  className="w-full px-4 py-2 bg-blue-900/20 border border-blue-500/50 rounded-lg text-white placeholder-blue-300/60 focus:bg-blue-900/30 focus:border-blue-400 focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-blue-400 mt-1">
                  This provides philosophical context and deeper meaning
                </p>
              </div>

              {/* Instructions Editing */}
              <div>
                <label className={`block text-sm font-medium text-green-400 mb-3 flex items-center`}>
                  <span className="mr-2">Practice</span>
                  <span className="text-xs text-gray-400 font-normal">(Step-by-Step)</span>
                </label>
                <textarea
                  value={editingInstructions}
                  onChange={(e) => handleInstructionsChange(e.target.value)}
                  placeholder="Enter detailed step-by-step instructions for this activity..."
                  rows={4}
                  className="w-full px-4 py-2 bg-green-900/20 border border-green-500/50 rounded-lg text-white placeholder-green-300/60 focus:bg-green-900/30 focus:border-green-400 focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-green-400 mt-1">
                  Provide clear, actionable steps for completing this activity
                </p>
              </div>

              {/* Instructions Window Preview */}
              <div className={`p-4 ${theme.statsBackground} rounded-lg`}>
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <span className="mr-2">Instructions Window Preview</span>
                  <span className="text-xs text-gray-500">(How it appears to users)</span>
                </h4>
                <div className="space-y-3">
                  <h5 className="text-white font-semibold text-base">{editingTitle || 'Activity Title'}</h5>
                  
                  {/* Philosophy Section Preview */}
                  {editingDescription && (
                    <div className="mb-4">
                      <h6 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Philosophy</h6>
                      <div className="text-sm text-gray-200 leading-relaxed italic bg-slate-700/30 p-3 rounded border-l-4 border-blue-400">
                        {editingDescription}
                      </div>
                    </div>
                  )}
                  
                  {/* Practice Section Preview */}
                  <div className="mb-4">
                    <h6 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Practice</h6>
                    <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                      {editingInstructions || 'Activity instructions will appear here...'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400 pt-2 border-t border-gray-600">
                    <span>Duration: {currentActivity.duration}</span>
                    <span>Points: {currentActivity.points}</span>
                    <span>Grid: {selectedGridSize?.w || 1}×{selectedGridSize?.h || 1}</span>
                  </div>
                  {isRecurring && (
                    <div className="mt-2 p-2 bg-green-900/30 border border-green-700 rounded">
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-300 font-medium">Recurring Activity</span>
                      </div>
                      <p className="text-xs text-green-400 mt-1">
                        {recurringType === 'daily' && `Repeats every ${recurringInterval} day${recurringInterval > 1 ? 's' : ''}`}
                        {recurringType === 'weekly' && selectedDaysOfWeek.length > 0 && 
                          `Repeats ${selectedDaysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                        }
                        {recurringType === 'monthly' && `Repeats every ${recurringInterval} month${recurringInterval > 1 ? 's' : ''}`}
                        {recurringEndDate && ` until ${new Date(recurringEndDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for time conversion
function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(/([ap])/);
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours);
  
  if (period === 'p' && hour24 !== 12) hour24 += 12;
  if (period === 'a' && hour24 === 12) hour24 = 0;
  
  return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`;
}

function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const period = hour24 < 12 ? 'a' : 'p';
  
  return `${hour12}:${minutes}${period}`;
}