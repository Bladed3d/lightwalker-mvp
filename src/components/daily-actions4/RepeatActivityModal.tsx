'use client'

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';

interface RepeatActivityModalProps {
  theme?: ThemeConfig;
  isVisible: boolean;
  activity: any;
  position: { x: number; y: number };
  onSave: (activity: any, repeatConfig: any) => void;
  onCancel: () => void;
}

export default function RepeatActivityModal({
  theme,
  isVisible,
  activity,
  position,
  onSave,
  onCancel
}: RepeatActivityModalProps) {
  // Repeat configuration state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [duration, setDuration] = useState('15 min');

  // Duration options for slider
  const durationOptions = [5, 10, 15, 20, 30, 40, 45, 60, 90, 120];

  // Initialize from activity data
  useEffect(() => {
    if (activity) {
      setDuration(activity.duration || '15 min');
      setIsRecurring(activity.isRecurring || false);
      setRecurringType(activity.recurringPattern?.type || 'daily');
      setSelectedDaysOfWeek(activity.recurringPattern?.daysOfWeek || []);
    }
  }, [activity]);

  const handleDayOfWeekToggle = (day: number) => {
    const newDays = selectedDaysOfWeek.includes(day)
      ? selectedDaysOfWeek.filter(d => d !== day)
      : [...selectedDaysOfWeek, day].sort();
    setSelectedDaysOfWeek(newDays);
  };

  const handleSave = () => {
    const repeatConfig = {
      isRecurring,
      recurringPattern: isRecurring ? {
        type: recurringType,
        daysOfWeek: recurringType === 'weekly' ? selectedDaysOfWeek : undefined,
        interval: 1
      } : undefined,
      duration
    };

    onSave(activity, repeatConfig);
  };

  if (!isVisible || !activity) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div 
        className="fixed bg-slate-800 border-2 border-blue-500 rounded-xl shadow-2xl z-50 w-80"
        style={{ 
          left: `${Math.min(position.x, window.innerWidth - 320)}px`, 
          top: `${Math.min(position.y - 100, window.innerHeight - 400)}px`,
          backgroundColor: '#1e293b' // Solid slate-800 background
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Set Repeat</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Activity Info */}
          <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              {(activity.icon?.startsWith('/') || activity.icon?.startsWith('data:')) ? (
                <img 
                  src={activity.icon} 
                  alt={activity.title}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <span className="text-lg">{activity.icon || '🌟'}</span>
              )}
            </div>
            <div>
              <h4 className="text-white font-medium">{activity.title || activity.name}</h4>
              <p className="text-sm text-gray-300">
                {activity.time || activity.scheduledTime} • {activity.points || 20} pts
              </p>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Duration: {duration}
            </label>
            <input
              type="range"
              min="0"
              max={durationOptions.length - 1}
              value={Math.max(0, durationOptions.findIndex(d => d === parseInt(duration)))}
              onChange={(e) => {
                const newDuration = durationOptions[parseInt(e.target.value)];
                setDuration(`${newDuration} min`);
              }}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span>
              <span>30</span>
              <span>60</span>
              <span>120</span>
            </div>
          </div>

          {/* Enable Recurring Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Make Recurring</label>
            <button
              onClick={() => setIsRecurring(!isRecurring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isRecurring ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isRecurring ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Recurring Options */}
          {isRecurring && (
            <div className="space-y-3 p-3 bg-slate-700 rounded-lg">
              {/* Pattern Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Repeat Pattern</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRecurringType(option.value as any)}
                      className={`px-3 py-2 text-xs rounded transition-colors ${
                        recurringType === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Day Selection */}
              {recurringType === 'weekly' && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Days of Week</label>
                  <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDayOfWeekToggle(index)}
                        className={`px-2 py-2 text-xs rounded transition-colors ${
                          selectedDaysOfWeek.includes(index)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-slate-600">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Repeat
          </button>
        </div>
      </div>
    </>
  );
}