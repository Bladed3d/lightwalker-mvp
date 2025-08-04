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
  
  // Art Studio - Image customization state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number, aspectRatio: number} | null>(null);
  const [suggestedGridSize, setSuggestedGridSize] = useState<{w: number, h: number} | null>(null);
  const [selectedGridSize, setSelectedGridSize] = useState<{w: number, h: number} | null>(null);

  // Listen for dropped activities from main page
  useEffect(() => {
    const handleActivityDropped = (event: any) => {
      const activity = event.detail;
      console.log('📥 Duration screen received dropped activity:', activity);
      setCurrentActivity(activity);
    };

    window.addEventListener('activityDropped', handleActivityDropped);
    return () => window.removeEventListener('activityDropped', handleActivityDropped);
  }, []);

  // Duration options for quick selection
  const durationOptions = [
    '5 min', '10 min', '15 min', '20 min', '30 min', 
    '45 min', '60 min', '90 min', '120 min'
  ];

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
          const result = await saveActivityImageAndGridPreference(
            currentActivity.id,
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
              className={`mb-6 min-h-[180px] rounded-lg transition-colors ${
                snapshot.isDraggingOver 
                  ? 'bg-orange-500/10 border-2 border-dashed border-orange-500' 
                  : 'border-2 border-dashed border-transparent'
              }`}
            >
              {currentActivity ? (
                // Activity Display with Big Graphic
                <div className="flex items-center space-x-6 p-6">
                  {/* Big Activity Graphic */}
                  <div className="flex-shrink-0">
                    {currentActivity.icon && (currentActivity.icon.startsWith('/') || currentActivity.icon.startsWith('data:')) ? (
                      <div className="w-32 h-32 bg-gray-800 rounded-lg p-3 shadow-xl">
                        <img 
                          src={currentActivity.icon} 
                          alt={currentActivity.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : currentActivity.icon ? (
                      <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-xl">
                        <span className="text-6xl">{currentActivity.icon}</span>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center shadow-xl">
                        <Settings className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Activity Info */}
                  <div className="flex-1 text-left">
                    <h4 className="text-2xl font-bold text-white mb-2">{currentActivity.title}</h4>
                    <p className="text-base text-gray-300">
                      {currentActivity.category === 'mindfulness' && 'Practice mindful awareness and inner peace'}
                      {currentActivity.category === 'physical' && 'Engage in physical activity for health and vitality'}
                      {currentActivity.category === 'creative' && 'Express creativity and innovative thinking'}
                      {currentActivity.category === 'communication' && 'Build connections and practice empathy'}
                      {currentActivity.category === 'decision-making' && 'Make strategic choices and solve problems'}
                      {currentActivity.category === 'reflection' && 'Reflect deeply on experiences and growth'}
                    </p>
                  </div>
                </div>
              ) : (
                // Drop instruction
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-white mb-2">
                      Drag Activity Here to Edit
                    </h4>
                    <p className="text-sm text-gray-400">
                      Drop an activity from the inventory to customize its settings
                    </p>
                  </div>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Art Studio - Image Customization Section */}
        {currentActivity && (
          <div className={`mb-6 p-4 ${theme.statsBackground} rounded-lg`}>
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
                        className="w-full h-full object-contain rounded"
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
                        <span>Upload Image</span>
                      </>
                    )}
                  </div>
                </label>
                
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG up to 5MB
                </p>
                
                {/* Grid Size Selector */}
                {imageDimensions && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-300 mb-3">Grid Layout</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Image: {imageDimensions.width}×{imageDimensions.height} (ratio: {imageDimensions.aspectRatio.toFixed(2)})
                    </p>
                    
                    {/* Compact Grid Selector */}
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
                    
                    {/* Suggestion text */}
                    {suggestedGridSize && (
                      <p className="text-xs text-green-400">
                        💡 Suggested: {suggestedGridSize.w}×{suggestedGridSize.h} based on image ratio
                      </p>
                    )}
                  </div>
                )}
                
                {/* Future: AI Generation Button */}
                <button 
                  disabled
                  className="mt-2 flex items-center space-x-2 px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed opacity-50"
                  title="AI Generation coming soon!"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Generate</span>
                  <span className="text-xs">(Soon)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Duration Settings - always show */}
        <div className="space-y-6">
          {/* Duration Tabs */}
          <div>
            <label className={`block text-sm font-medium ${theme.cardText} mb-3`}>
              Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map(duration => (
                <button
                  key={duration}
                  onClick={() => handleDurationChange(duration)}
                  disabled={!currentActivity}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    currentActivity && currentActivity.duration === duration
                      ? 'bg-orange-500 text-white'
                      : currentActivity
                        ? 'bg-gray-600 text-white hover:bg-gray-500'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration */}
          <div>
            <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
              Custom Duration
            </label>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="number"
                min="1"
                max="300"
                value={currentActivity ? parseInt(currentActivity.duration) : 30}
                onChange={(e) => handleCustomDurationChange(e.target.value)}
                disabled={!currentActivity}
                className={`w-24 px-3 py-2 border border-gray-500 rounded-lg text-sm ${
                  !currentActivity ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white'
                }`}
              />
              <span className="text-sm text-gray-300">minutes</span>
              <span className="text-sm text-gray-300 ml-4">
                Points: {currentActivity ? currentActivity.points : 75}
                {currentActivity && currentActivity.originalDuration !== currentActivity.duration && (
                  <span className="text-orange-600 ml-1">
                    (was {Math.round(parseInt(currentActivity.originalDuration) * 2)})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={!currentActivity}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentActivity
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handlePlaceOnTimeline}
              disabled={!currentActivity}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentActivity
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Place on Timeline</span>
            </button>
          </div>
        </div>
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