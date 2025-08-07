/**
 * React hook for Lightwalker Notification System
 * 
 * Provides easy integration with the notification system
 * including permission management and settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  notificationSystem,
  NotificationSettings, 
  ActivityAlert 
} from '@/lib/notification-system';
import { monitoredNotificationSystem } from '@/lib/debug/monitored-notification-system';
import { EventTracer } from '@/lib/debug/event-tracer';

export interface UseNotificationsReturn {
  // Permission state
  isSupported: boolean;
  permission: NotificationPermission;
  hasPermission: boolean;
  
  // Settings
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  
  // Actions
  requestPermission: () => Promise<boolean>;
  scheduleAlert: (alert: ActivityAlert) => boolean;
  cancelAlert: (alertId: string) => boolean;
  cancelAllAlerts: () => void;
  testNotification: () => Promise<void>;
  
  // Status
  isInitialized: boolean;
  initialize: () => Promise<boolean>;
}

export function useNotifications(): UseNotificationsReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(
    monitoredNotificationSystem.getSettings()
  );
  const [forceUpdate, setForceUpdate] = useState(0);

  // Trace hook initialization
  useEffect(() => {
    EventTracer.trace(
      'use-notifications-hook',
      'useNotifications',
      'HOOK_INITIALIZED',
      { initialSettings: settings }
    );
  }, []);

  const isSupported = notificationSystem.isSupported();
  const hasPermission = permission === 'granted';

  /**
   * Initialize the notification system
   */
  const initialize = useCallback(async (): Promise<boolean> => {
    if (isInitialized) return true;
    
    try {
      const success = await notificationSystem.initialize();
      setIsInitialized(success);
      return success;
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
      return false;
    }
  }, [isInitialized]);

  /**
   * Request notification permissions
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationSystem.requestPermission();
      setPermission(notificationSystem.getPermissionStatus());
      return granted;
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error);
      return false;
    }
  }, []);

  /**
   * Update notification settings
   */
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const caller = new Error().stack?.split('\n')[2]?.trim() || 'unknown';
    
    EventTracer.trace(
      'notification-hook-update',
      'useNotifications.updateSettings',
      'UPDATE_REQUESTED',
      { newSettings, caller }
    );

    monitoredNotificationSystem.updateSettings(newSettings, `useNotifications.updateSettings via ${caller}`);
    const updatedSettings = monitoredNotificationSystem.getSettings();
    
    EventTracer.trace(
      'notification-hook-state',
      'useNotifications.updateSettings',
      'SETTING_REACT_STATE',
      { updatedSettings }
    );
    
    setSettings(updatedSettings);
    setForceUpdate(prev => prev + 1); // Force component re-render
  }, []);

  /**
   * Schedule an activity alert
   */
  const scheduleAlert = useCallback((alert: ActivityAlert): boolean => {
    return notificationSystem.scheduleActivityAlert(alert);
  }, []);

  /**
   * Cancel a specific alert
   */
  const cancelAlert = useCallback((alertId: string): boolean => {
    return notificationSystem.cancelAlert(alertId);
  }, []);

  /**
   * Cancel all scheduled alerts
   */
  const cancelAllAlerts = useCallback(() => {
    notificationSystem.cancelAllAlerts();
  }, []);

  /**
   * Test the notification system
   */
  const testNotification = useCallback(async (): Promise<void> => {
    await notificationSystem.testNotification();
  }, []);

  // Sync settings when component mounts and system initializes
  useEffect(() => {
    const syncSettings = () => {
      const currentSettings = monitoredNotificationSystem.getSettings();
      console.log('🔄 useEffect syncSettings called, setting to:', currentSettings);
      setSettings(currentSettings);
      setForceUpdate(prev => prev + 1);
    };

    console.log('📍 Mount useEffect running');
    // Initial sync
    syncSettings();
    
    // Set up interval to periodically sync settings in case of updates from other sources
    const interval = setInterval(syncSettings, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for permission changes
  useEffect(() => {
    const checkPermission = () => {
      const currentPermission = notificationSystem.getPermissionStatus();
      if (currentPermission !== permission) {
        setPermission(currentPermission);
      }
    };

    // Check permission periodically (in case user changes it in browser settings)
    const interval = setInterval(checkPermission, 5000);
    
    return () => clearInterval(interval);
  }, [permission]);

  // Handle notification clicks (navigate to activity)
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { alert } = event.detail;
      console.log('🔔 Notification clicked:', alert);
      
      // You can dispatch a navigation event here or call a callback
      // For now, just log it - we'll integrate with your navigation system later
    };

    window.addEventListener('lightwalker-notification-click', handleNotificationClick as EventListener);
    
    return () => {
      window.removeEventListener('lightwalker-notification-click', handleNotificationClick as EventListener);
    };
  }, []);

  return {
    // Permission state
    isSupported,
    permission,
    hasPermission,
    
    // Settings
    settings,
    updateSettings,
    
    // Actions
    requestPermission,
    scheduleAlert,
    cancelAlert,
    cancelAllAlerts,
    testNotification,
    
    // Status
    isInitialized,
    initialize,
  };
}