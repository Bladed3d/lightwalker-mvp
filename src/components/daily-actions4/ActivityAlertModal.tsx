'use client'

import React, { useState, useEffect } from 'react';
import { X, Bell, Clock, Volume2, VolumeX, TestTube2 } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { useNotifications } from '@/hooks/useNotifications';

interface ActivityAlertModalProps {
  theme?: ThemeConfig;
  isVisible: boolean;
  activity: any;
  position: { x: number; y: number };
  onSave: (activity: any, alertConfig: any) => void;
  onCancel: () => void;
}

export default function ActivityAlertModal({
  theme,
  isVisible,
  activity,
  position,
  onSave,
  onCancel
}: ActivityAlertModalProps) {
  const {
    isSupported,
    hasPermission,
    settings,
    requestPermission,
    testNotification
  } = useNotifications();

  // Alert configuration state
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [showOnTime, setShowOnTime] = useState(true);
  const [showMinutesBefore, setShowMinutesBefore] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState<'gentle-bell' | 'digital-chime' | 'soft-ping'>('gentle-bell');
  
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isTestingSound, setIsTestingSound] = useState(false);

  // Apply styles based on theme
  const modalBg = theme?.components?.modal?.backgroundColor || 'bg-gray-900';
  const modalBorder = theme?.components?.modal?.borderColor || 'border-gray-700';
  const textPrimary = theme?.colors?.text?.primary || 'text-white';
  const textSecondary = theme?.colors?.text?.secondary || 'text-gray-300';
  const accent = theme?.colors?.accent || 'text-blue-400';

  // Initialize from activity data
  useEffect(() => {
    if (activity && isVisible) {
      // Load existing alert settings if any
      setAlertsEnabled(activity.alertsEnabled || false);
      setShowOnTime(activity.alertOnTime !== false);
      setShowMinutesBefore(activity.alertMinutesBefore || 5);
      setSoundEnabled(activity.alertSoundEnabled !== false);
      setSoundType(activity.alertSoundType || 'gentle-bell');
    }
  }, [activity, isVisible]);

  if (!isVisible) return null;

  const handleSave = () => {
    const alertConfig = {
      alertsEnabled,
      showOnTime,
      showMinutesBefore: alertsEnabled ? showMinutesBefore : 0,
      soundEnabled: alertsEnabled ? soundEnabled : false,
      soundType: alertsEnabled ? soundType : 'gentle-bell'
    };
    
    onSave(activity, alertConfig);
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleTestSound = async () => {
    setIsTestingSound(true);
    try {
      // Use the sound generator directly for testing
      const { soundGenerator } = await import('@/lib/notification-sounds');
      await soundGenerator.playSound(soundType, 0.7);
    } finally {
      setTimeout(() => setIsTestingSound(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${modalBg} ${modalBorder} border rounded-lg shadow-xl w-full max-w-md mx-4`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className={`w-5 h-5 ${accent}`} />
            <h3 className={`text-lg font-medium ${textPrimary}`}>
              Activity Alerts
            </h3>
          </div>
          <button
            onClick={onCancel}
            className={`${textSecondary} hover:${textPrimary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            {activity?.icon && (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={activity.icon}
                  alt={activity.title || activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h4 className={`font-medium ${textPrimary}`}>
                {activity?.title || activity?.name || 'Activity'}
              </h4>
              <p className={`text-sm ${textSecondary}`}>
                Scheduled at {activity?.scheduledTime || activity?.time || 'unknown time'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Browser Support Check */}
          {!isSupported && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <p className="text-red-300 text-sm">
                Your browser doesn't support desktop notifications. Alerts will only work as in-browser notifications.
              </p>
            </div>
          )}

          {/* Permission Check */}
          {isSupported && !hasPermission && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-yellow-300 text-sm">
                  Enable desktop notifications for alerts
                </p>
                <button
                  onClick={handleRequestPermission}
                  disabled={isRequestingPermission}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white text-sm rounded transition-colors"
                >
                  {isRequestingPermission ? 'Requesting...' : 'Enable'}
                </button>
              </div>
            </div>
          )}

          {/* Main Alert Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className={`${textPrimary} font-medium`}>Enable Alerts</label>
              <p className={`${textSecondary} text-sm`}>
                Get notified when this activity is scheduled
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Alert Settings (only show if enabled) */}
          {alertsEnabled && (
            <>
              {/* Timing Options */}
              <div className="space-y-4">
                <label className={`${textPrimary} font-medium`}>When to Alert</label>
                
                {/* On-time alert */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="alertOnTime"
                    checked={showOnTime}
                    onChange={(e) => setShowOnTime(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="alertOnTime" className={textSecondary}>
                    When activity starts
                  </label>
                </div>

                {/* Minutes before */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="alertBefore"
                      checked={showMinutesBefore > 0}
                      onChange={(e) => setShowMinutesBefore(e.target.checked ? 5 : 0)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="alertBefore" className={textSecondary}>
                      {showMinutesBefore} minutes before
                    </label>
                  </div>
                  
                  {showMinutesBefore > 0 && (
                    <div className="ml-7">
                      <input
                        type="range"
                        min="1"
                        max="60"
                        step="1"
                        value={showMinutesBefore}
                        onChange={(e) => setShowMinutesBefore(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1 min</span>
                        <span>60 min</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sound Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={`${textPrimary} font-medium`}>Alert Sound</label>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      soundEnabled 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>

                {soundEnabled && (
                  <div className="space-y-3">
                    {/* Sound Selection */}
                    <div className="space-y-2">
                      <label className={`${textSecondary} text-sm`}>Sound Type</label>
                      <select
                        value={soundType}
                        onChange={(e) => setSoundType(e.target.value as any)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="gentle-bell">Gentle Bell</option>
                        <option value="digital-chime">Digital Chime</option>
                        <option value="soft-ping">Soft Ping</option>
                      </select>
                    </div>

                    {/* Test Sound */}
                    <button
                      onClick={handleTestSound}
                      disabled={isTestingSound}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-sm rounded-lg transition-colors"
                    >
                      <TestTube2 className="w-4 h-4" />
                      <span>{isTestingSound ? 'Testing...' : 'Test Sound'}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Alerts
          </button>
        </div>
      </div>
    </div>
  );
}