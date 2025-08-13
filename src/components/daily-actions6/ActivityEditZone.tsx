'use client'

import React, { useState, useEffect } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Clock, 
  Settings, 
  Target, 
  Trash2, 
  Save,
  X,
  Plus,
  Minus,
  Calendar
} from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';

interface ActivityEditItem {
  id: string;
  title: string;
  duration: string;
  scheduledTime?: string;
  points: number;
  icon: string;
  category: string;
  originalDuration: string; // Store original for comparison
}

interface ActivityEditZoneProps {
  theme: ThemeConfig;
  isVisible: boolean;
  editingActivities: ActivityEditItem[];
  onActivityUpdate: (activityId: string, updates: { duration: string; points?: number }) => void;
  onActivityRemove: (activityId: string) => void;
  onActivityDiscard: (activityId: string) => void;
  onActivityPlace: (activity: ActivityEditItem) => void;
}

export default function ActivityEditZone({ 
  theme, 
  isVisible, 
  editingActivities,
  onActivityUpdate, 
  onActivityRemove,
  onActivityDiscard,
  onActivityPlace 
}: ActivityEditZoneProps) {
  const [localEditingActivities, setLocalEditingActivities] = useState<ActivityEditItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  
  // Sync with parent state
  useEffect(() => {
    setLocalEditingActivities(editingActivities);
  }, [editingActivities]);

  // Duration options for quick selection
  const durationOptions = [
    '5 min', '10 min', '15 min', '20 min', '30 min', 
    '45 min', '60 min', '90 min', '120 min'
  ];

  const handleDurationChange = (activityId: string, newDuration: string) => {
    setLocalEditingActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { 
              ...activity, 
              duration: newDuration,
              // Adjust points based on duration (rough calculation)
              points: Math.round(parseInt(newDuration) * 2)
            }
          : activity
      )
    );
  };

  const handleSaveActivity = (activityId: string) => {
    const activity = localEditingActivities.find(a => a.id === activityId);
    if (activity) {
      onActivityUpdate(activityId, {
        duration: activity.duration,
        points: activity.points
      });
      setSelectedActivity(null);
    }
  };

  const handleRemoveActivity = (activityId: string) => {
    onActivityRemove(activityId);
    if (selectedActivity === activityId) {
      setSelectedActivity(null);
    }
  };

  const handleDiscardChanges = (activityId: string) => {
    onActivityDiscard(activityId);
    if (selectedActivity === activityId) {
      setSelectedActivity(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mt-4">
      <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.cardText} flex items-center`}>
            <Settings className="w-5 h-5 mr-2 text-orange-500" />
            Activity Edit Zone
          </h3>
          <div className={`text-xs ${theme.cardSubtext} bg-orange-50 px-2 py-1 rounded`}>
            Drag activities from timeline above to edit
          </div>
        </div>

        {/* Drop zone for activities */}
        <Droppable droppableId="activity-edit-zone" type="ACTIVITY">
          {(provided, snapshot) => {
            // Handle drops from timeline
            if (snapshot.isDraggingOver && !localEditingActivities.find(a => a.id === snapshot.draggingOverWith)) {
              console.log('🎯 New activity dragged into edit zone:', snapshot.draggingOverWith);
            }
            
            return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-32 border-2 border-dashed rounded-lg p-4 transition-colors ${
                snapshot.isDraggingOver 
                  ? 'border-orange-400 bg-orange-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {localEditingActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Drag activities from the Activity Library to customize before placing on timeline
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Adjust duration, points, and other settings, then place on timeline when ready
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localEditingActivities.map((activity, index) => (
                    <Draggable 
                      key={activity.id} 
                      draggableId={`edit-${activity.id}`} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${theme.cardBackground} border rounded-lg p-4 ${
                            snapshot.isDragging ? 'shadow-lg rotate-2' : 'shadow-sm'
                          } ${selectedActivity === activity.id ? 'ring-2 ring-orange-500' : ''}`}
                          onClick={() => setSelectedActivity(
                            selectedActivity === activity.id ? null : activity.id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                {(activity.icon.startsWith('/') || activity.icon.startsWith('data:')) ? (
                                  <img 
                                    src={activity.icon} 
                                    alt={activity.title}
                                    className="w-6 h-6 object-contain"
                                  />
                                ) : (
                                  <span className="text-lg">{activity.icon}</span>
                                )}
                              </div>
                              <div>
                                <h4 className={`font-medium ${theme.cardText}`}>
                                  {activity.title}
                                </h4>
                                <p className={`text-sm ${theme.cardSubtext}`}>
                                  {activity.scheduledTime && `Scheduled: ${activity.scheduledTime}`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <div className={`text-sm font-medium ${theme.cardText}`}>
                                  {activity.duration}
                                </div>
                                <div className={`text-xs ${theme.cardSubtext}`}>
                                  {activity.points} pts
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveActivity(activity.id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded edit controls */}
                          {selectedActivity === activity.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                              {/* Duration adjustment */}
                              <div>
                                <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                                  Duration
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {durationOptions.map(duration => (
                                    <button
                                      key={duration}
                                      onClick={() => handleDurationChange(activity.id, duration)}
                                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                        activity.duration === duration
                                          ? 'bg-orange-500 text-white'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                    >
                                      {duration}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom duration input */}
                              <div>
                                <label className={`block text-sm font-medium ${theme.cardText} mb-2`}>
                                  Custom Duration
                                </label>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={parseInt(activity.duration)}
                                    onChange={(e) => handleDurationChange(activity.id, `${e.target.value} min`)}
                                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                  />
                                  <span className="text-sm text-gray-600">minutes</span>
                                </div>
                              </div>

                              {/* Points preview */}
                              <div className="flex items-center justify-between text-sm">
                                <span className={theme.cardSubtext}>
                                  Points: {activity.points} 
                                  {activity.originalDuration !== activity.duration && (
                                    <span className="text-orange-600 ml-1">
                                      (changed from {Math.round(parseInt(activity.originalDuration) * 2)})
                                    </span>
                                  )}
                                </span>
                              </div>

                              {/* Action buttons */}
                              <div className="flex space-x-2">
                                {activity.scheduledTime ? (
                                  // Timeline activity - Save/Discard buttons
                                  <>
                                    <button
                                      onClick={() => handleSaveActivity(activity.id)}
                                      className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                    >
                                      <Save className="w-4 h-4" />
                                      <span>Save Changes</span>
                                    </button>
                                    <button
                                      onClick={() => handleDiscardChanges(activity.id)}
                                      className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>Discard</span>
                                    </button>
                                  </>
                                ) : (
                                  // Library activity - Place on Timeline button
                                  <>
                                    <button
                                      onClick={() => onActivityPlace(activity)}
                                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                    >
                                      <Calendar className="w-4 h-4" />
                                      <span>Place on Timeline</span>
                                    </button>
                                    <button
                                      onClick={() => handleDiscardChanges(activity.id)}
                                      className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                                    >
                                      <X className="w-4 h-4" />
                                      <span>Discard</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
              {provided.placeholder}
            </div>
            );
          }}
        </Droppable>

        {/* Instructions */}
        <div className={`mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg`}>
          <h4 className="text-sm font-medium text-blue-800 mb-1">How to use:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Drag activities from the Activity Library to customize settings</li>
            <li>• Click on an activity to expand editing options</li>
            <li>• Adjust duration using quick buttons or custom input</li>
            <li>• Click "Place on Timeline" to add customized activity</li>
            <li>• Use "Discard" to cancel and remove from edit zone</li>
          </ul>
        </div>
      </div>
    </div>
  );
}