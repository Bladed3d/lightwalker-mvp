'use client'

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Volume2, 
  VolumeX, 
  Clock, 
  Moon,
  TestTube2,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationSettings } from '@/lib/notification-system';

interface NotificationSettingsModalProps {
  theme?: ThemeConfig;
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({
  theme,
  isVisible,
  onClose
}: NotificationSettingsModalProps) {
  const {
    isSupported,
    permission,
    hasPermission,
    settings,
    updateSettings,
    requestPermission,
    testNotification,
    initialize,
    isInitialized
  } = useNotifications();

  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  // Sync settings when modal opens (but not on settings updates)
  useEffect(() => {
    if (isVisible) {
      setLocalSettings(settings);
      
      // Initialize if not already done
      if (!isInitialized) {
        initialize();
      }
    }
  }, [isVisible, isInitialized, initialize]); // Removed 'settings' dependency to prevent override

  // Apply styles based on theme (following your pattern)
  const modalBg = theme?.components?.modal?.backgroundColor || 'bg-gray-900';
  const modalBorder = theme?.components?.modal?.borderColor || 'border-gray-700';
  const textPrimary = theme?.colors?.text?.primary || 'text-white';
  const textSecondary = theme?.colors?.text?.secondary || 'text-gray-300';
  const accent = theme?.colors?.accent || 'text-blue-400';

  if (!isVisible) return null;

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings({ [key]: value });
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await testNotification();
    } finally {
      setTimeout(() => setIsTestingNotification(false), 2000);
    }
  };

  const getPermissionStatusIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'denied':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Notifications enabled';
      case 'denied':
        return 'Notifications blocked';
      default:
        return 'Notifications not requested';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${modalBg} ${modalBorder} border rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Bell className={`w-5 h-5 ${accent}`} />
            <h3 className={`text-lg font-medium ${textPrimary}`}>
              Notification Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textPrimary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Browser Support Check */}
          {!isSupported && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-red-300 font-medium">Notifications Not Supported</h4>
                  <p className="text-red-400 text-sm mt-1">
                    Your browser doesn't support desktop notifications. Please try using Chrome, Firefox, Safari, or Edge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permission Status */}
          {isSupported && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPermissionStatusIcon()}
                  <span className={textPrimary}>{getPermissionStatusText()}</span>
                </div>
                {!hasPermission && (
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequestingPermission}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                  >
                    {isRequestingPermission ? 'Requesting...' : 'Enable'}
                  </button>
                )}
              </div>

              {permission === 'denied' && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-300 font-medium">Permission Blocked</h4>
                      <p className="text-yellow-400 text-sm mt-1">
                        To enable notifications, click the 🔒 icon in your address bar and allow notifications for this site.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Settings (only show if supported) */}
          {isSupported && (
            <>
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className={`${textPrimary} font-medium`}>Activity Notifications</label>
                  <p className={`${textSecondary} text-sm`}>
                    Get notified when activities are scheduled
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enabled}
                    onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                    className="sr-only peer"
                    disabled={!hasPermission}
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-disabled:bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Note about individual activity configuration */}
              {localSettings.enabled && hasPermission && (
                <>
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                      <strong>Timing configuration:</strong> Set specific alert timing (minutes before, on-time) when configuring alerts for individual activities in your timeline.
                    </p>
                  </div>

                  {/* Sound Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={`${textPrimary} font-medium`}>Notification Sounds</label>
                      <button
                        onClick={() => handleSettingChange('soundEnabled', !localSettings.soundEnabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          localSettings.soundEnabled 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {localSettings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                    </div>

                    {localSettings.soundEnabled && (
                      <>
                        {/* Sound Selection */}
                        <div className="space-y-2">
                          <label className={`${textSecondary} text-sm`}>Sound Type</label>
                          <select
                            value={localSettings.soundType}
                            onChange={(e) => handleSettingChange('soundType', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="gentle-bell">Gentle Bell</option>
                            <option value="digital-chime">Digital Chime</option>
                            <option value="soft-ping">Soft Ping</option>
                          </select>
                        </div>

                        {/* Volume Control */}
                        <div className="space-y-2">
                          <label className={`${textSecondary} text-sm`}>
                            Volume: {Math.round(localSettings.volume * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={localSettings.volume}
                            onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Do Not Disturb */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Moon className={`w-4 h-4 ${accent}`} />
                      <label className={`${textPrimary} font-medium`}>Do Not Disturb Hours</label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`${textSecondary} text-sm`}>From</label>
                        <input
                          type="time"
                          value={localSettings.doNotDisturbStart || '22:00'}
                          onChange={(e) => handleSettingChange('doNotDisturbStart', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className={`${textSecondary} text-sm`}>To</label>
                        <input
                          type="time"
                          value={localSettings.doNotDisturbEnd || '07:00'}
                          onChange={(e) => handleSettingChange('doNotDisturbEnd', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Notification */}
                  <div className="pt-4 border-t border-gray-700">
                    <button
                      onClick={handleTestNotification}
                      disabled={isTestingNotification || !hasPermission}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      <TestTube2 className="w-4 h-4" />
                      <span>
                        {isTestingNotification ? 'Testing...' : 'Test Notification'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}