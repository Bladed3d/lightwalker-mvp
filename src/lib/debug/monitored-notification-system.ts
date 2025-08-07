/**
 * Monitored Notification System for Lightwalker
 * 
 * Wraps the notification system with complete observability
 * to track exactly what's changing notification settings and when.
 */

import { EventTracer } from './event-tracer';
import { NotificationSettings, ActivityAlert } from '../notification-system';

export interface StateChange {
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
  source: string;
  stack: string;
}

class MonitoredNotificationSystem {
  private settings: NotificationSettings = {
    enabled: false,
    soundEnabled: true,
    soundType: 'gentle-bell',
    volume: 0.7,
    showOnTime: true,
    showMinutesBefore: 5,
    doNotDisturbStart: '22:00',
    doNotDisturbEnd: '07:00'
  };

  private stateHistory: StateChange[] = [];
  private rapidChangeThreshold = 500; // ms
  
  constructor() {
    this.loadSettings();
    EventTracer.trace('notification-system', 'MonitoredNotificationSystem', 'INITIALIZED', {
      initialSettings: this.settings
    });
  }

  updateSettings(newSettings: Partial<NotificationSettings>, source: string = 'unknown'): void {
    const traceId = EventTracer.trace(
      'notification-settings',
      'MonitoredNotificationSystem.updateSettings',
      'UPDATE_REQUESTED',
      { newSettings, source }
    );

    EventTracer.setContext(traceId);

    // Check for rapid changes
    this.checkRapidChanges(source);

    // Track each property change
    Object.entries(newSettings).forEach(([key, newValue]) => {
      const oldValue = (this.settings as any)[key];
      
      if (oldValue !== newValue) {
        const change: StateChange = {
          property: key,
          oldValue,
          newValue,
          timestamp: Date.now(),
          source,
          stack: new Error().stack || ''
        };

        this.stateHistory.push(change);

        EventTracer.trace(
          `notification-${key}`,
          'MonitoredNotificationSystem.updateSettings',
          'PROPERTY_CHANGED',
          change
        );

        // Special alerting for the problematic 'enabled' property
        if (key === 'enabled') {
          this.trackEnabledStateChange(change);
        }
      }
    });

    // Apply the changes
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    EventTracer.trace(
      'notification-settings',
      'MonitoredNotificationSystem.updateSettings',
      'UPDATE_COMPLETED',
      { finalSettings: this.settings }
    );

    EventTracer.clearContext();
  }

  getSettings(): NotificationSettings {
    EventTracer.trace(
      'notification-settings',
      'MonitoredNotificationSystem.getSettings',
      'GET_SETTINGS',
      { currentSettings: this.settings }
    );

    return { ...this.settings };
  }

  private trackEnabledStateChange(change: StateChange) {
    const recentEnabledChanges = this.stateHistory
      .filter(s => s.property === 'enabled')
      .filter(s => Date.now() - s.timestamp < 2000); // Last 2 seconds

    if (recentEnabledChanges.length > 1) {
      console.group('🚨 RAPID ENABLED STATE CHANGES DETECTED!');
      console.warn('This is likely the source of your bell icon bug!');
      console.table(recentEnabledChanges.map(c => ({
        value: c.newValue,
        source: c.source,
        timeAgo: `${Date.now() - c.timestamp}ms ago`,
        stack: c.stack?.split('\n')[2]?.trim() || 'unknown'
      })));
      console.groupEnd();

      EventTracer.trace(
        'notification-enabled-rapid-change',
        'MonitoredNotificationSystem',
        'RAPID_CHANGE_DETECTED',
        { recentChanges: recentEnabledChanges }
      );
    }
  }

  private checkRapidChanges(source: string) {
    const recentChanges = this.stateHistory.filter(
      s => Date.now() - s.timestamp < this.rapidChangeThreshold
    );

    if (recentChanges.length > 3) {
      console.warn('⚠️ Multiple rapid state changes detected from:', source);
      console.table(recentChanges);
    }
  }

  getStateHistory(): StateChange[] {
    return [...this.stateHistory];
  }

  getEnabledStateHistory(): StateChange[] {
    return this.stateHistory.filter(s => s.property === 'enabled');
  }

  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lightwalker-notification-settings', JSON.stringify(this.settings));
      
      EventTracer.trace(
        'notification-settings',
        'MonitoredNotificationSystem.saveSettings',
        'SAVED_TO_LOCALSTORAGE',
        { settings: this.settings }
      );
    }
  }

  private loadSettings(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lightwalker-notification-settings');
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          this.settings = { ...this.settings, ...parsedSettings };
          
          EventTracer.trace(
            'notification-settings',
            'MonitoredNotificationSystem.loadSettings',
            'LOADED_FROM_LOCALSTORAGE',
            { loadedSettings: parsedSettings }
          );
        }
      } catch (error) {
        console.warn('Failed to load notification settings from localStorage:', error);
        
        EventTracer.trace(
          'notification-settings',
          'MonitoredNotificationSystem.loadSettings',
          'LOAD_ERROR',
          { error: error instanceof Error ? error.message : error }
        );
      }
    }
  }

  // Debug methods for console access
  debug = {
    getHistory: () => this.getStateHistory(),
    getEnabledHistory: () => this.getEnabledStateHistory(),
    getCurrentSettings: () => this.settings,
    clearHistory: () => { this.stateHistory = []; },
    getRapidChanges: () => this.stateHistory.filter(
      s => Date.now() - s.timestamp < 1000
    )
  };
}

export const monitoredNotificationSystem = new MonitoredNotificationSystem();

// Make debug methods available in console during development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__LIGHTWALKER_NOTIFICATIONS_DEBUG__ = monitoredNotificationSystem.debug;
}