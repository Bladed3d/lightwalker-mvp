/**
 * Lightwalker Notification System
 * 
 * Provides cross-browser desktop notifications with audio alerts
 * for timeline activity reminders. Handles permission management,
 * fallbacks, and user preferences.
 */

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  soundType: 'gentle-bell' | 'digital-chime' | 'soft-ping';
  volume: number; // 0-1
  showOnTime: boolean;
  showMinutesBefore: number; // 0, 5, 15, 30
  doNotDisturbStart?: string; // "22:00"
  doNotDisturbEnd?: string;   // "07:00"
}

export interface ActivityAlert {
  id: string;
  timelineActivityId: string;
  activityTitle: string;
  activityDescription?: string;
  activityIcon?: string;
  scheduledTime: Date;
  alertType: 'pre_activity' | 'start' | 'completion_reminder';
  minutesBefore?: number;
  isEnabled: boolean;
}

export class LightwalkerNotificationSystem {
  private settings: NotificationSettings;
  private scheduledAlerts: Map<string, NodeJS.Timeout> = new Map();
  private soundGenerator?: any; // Will import dynamically
  
  constructor() {
    this.settings = this.loadSettings();
    this.initializeAudio();
  }

  /**
   * Initialize the notification system
   * Must be called after user interaction
   */
  async initialize(): Promise<boolean> {
    console.log('🔔 Initializing Lightwalker Notification System...');
    
    // Check browser support
    if (!this.isSupported()) {
      console.warn('⚠️ Notifications not supported in this browser');
      return false;
    }

    // Initialize sound generator
    await this.initializeSound();
    
    console.log('✅ Notification system initialized');
    return true;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.isSupported() ? Notification.permission : 'denied';
  }

  /**
   * Request notification permissions with user-friendly approach
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('❌ Notifications not supported');
      return false;
    }

    if (this.getPermissionStatus() === 'granted') {
      return true;
    }

    try {
      // Handle different browser implementations
      let permission: NotificationPermission;
      
      if (Notification.requestPermission.length === 0) {
        // New promise-based API (Chrome 46+, Firefox 47+)
        permission = await Notification.requestPermission();
      } else {
        // Legacy callback API (Safari, older browsers)
        permission = await new Promise<NotificationPermission>(resolve => {
          Notification.requestPermission(resolve);
        });
      }

      console.log(`🔔 Permission result: ${permission}`);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Schedule an alert for a timeline activity
   */
  scheduleActivityAlert(alert: ActivityAlert): boolean {
    if (!this.settings.enabled || !alert.isEnabled) {
      console.log(`⏸️ Alert skipped (disabled): ${alert.activityTitle}`);
      return false;
    }

    // Calculate when to show the alert
    let alertTime = new Date(alert.scheduledTime);
    if (alert.minutesBefore && alert.minutesBefore > 0) {
      alertTime = new Date(alertTime.getTime() - (alert.minutesBefore * 60 * 1000));
    }

    const now = new Date();
    const msUntilAlert = alertTime.getTime() - now.getTime();

    if (msUntilAlert <= 0) {
      console.log(`⏰ Alert time passed: ${alert.activityTitle}`);
      return false;
    }

    // Cancel existing alert for this activity if any
    this.cancelAlert(alert.id);

    // Schedule new alert
    const timeoutId = setTimeout(() => {
      this.showActivityAlert(alert);
    }, msUntilAlert);

    this.scheduledAlerts.set(alert.id, timeoutId);
    
    const alertTimeStr = alertTime.toLocaleTimeString();
    console.log(`⏰ Alert scheduled for ${alert.activityTitle} at ${alertTimeStr}`);
    return true;
  }

  /**
   * Cancel a scheduled alert
   */
  cancelAlert(alertId: string): boolean {
    const timeoutId = this.scheduledAlerts.get(alertId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledAlerts.delete(alertId);
      console.log(`❌ Alert cancelled: ${alertId}`);
      return true;
    }
    return false;
  }

  /**
   * Cancel all scheduled alerts
   */
  cancelAllAlerts(): void {
    this.scheduledAlerts.forEach((timeoutId, alertId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledAlerts.clear();
    console.log('🧹 All alerts cancelled');
  }

  /**
   * Show an activity alert notification
   */
  private async showActivityAlert(alert: ActivityAlert): Promise<void> {
    console.log(`🔔 Showing alert for: ${alert.activityTitle}`);

    // Check do-not-disturb hours
    if (this.isDoNotDisturbTime()) {
      console.log('🌙 Alert suppressed (do not disturb hours)');
      return;
    }

    // Play notification sound first (more immediate)
    if (this.settings.soundEnabled) {
      await this.playNotificationSound(this.settings.soundType);
    }

    // Show system notification
    if (this.getPermissionStatus() === 'granted') {
      this.showSystemNotification(alert);
    } else {
      // Fallback to in-browser notification
      this.showInBrowserNotification(alert);
    }

    // Remove from scheduled alerts
    this.scheduledAlerts.delete(alert.id);
  }

  /**
   * Show system-level desktop notification
   */
  private showSystemNotification(alert: ActivityAlert): void {
    const notification = new Notification(this.getNotificationTitle(alert), {
      body: this.getNotificationBody(alert),
      icon: alert.activityIcon, // Only use icon if activity has one
      tag: `lightwalker-activity-${alert.timelineActivityId}`,
      requireInteraction: alert.alertType === 'start', // Keep start alerts visible
      silent: !this.settings.soundEnabled, // Prevent double sound
    });

    // Handle notification clicks
    notification.onclick = () => {
      window.focus();
      this.handleNotificationClick(alert);
      notification.close();
    };

    // Auto-close after 10 seconds for non-critical alerts
    if (alert.alertType !== 'start') {
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }

  /**
   * Fallback in-browser notification (when permission denied)
   */
  private showInBrowserNotification(alert: ActivityAlert): void {
    // This will be implemented in the UI component
    // For now, dispatch a custom event that the UI can listen to
    window.dispatchEvent(new CustomEvent('lightwalker-notification', {
      detail: {
        title: this.getNotificationTitle(alert),
        body: this.getNotificationBody(alert),
        icon: alert.activityIcon || null,
        alert: alert
      }
    }));
  }

  /**
   * Generate notification title based on alert type
   */
  private getNotificationTitle(alert: ActivityAlert): string {
    switch (alert.alertType) {
      case 'pre_activity':
        const minutes = alert.minutesBefore || 5;
        return `⏰ ${alert.activityTitle} in ${minutes} minutes`;
      case 'start':
        return `🎯 Time for ${alert.activityTitle}`;
      case 'completion_reminder':
        return `✅ Complete ${alert.activityTitle}?`;
      default:
        return alert.activityTitle;
    }
  }

  /**
   * Generate notification body text
   */
  private getNotificationBody(alert: ActivityAlert): string {
    const time = alert.scheduledTime.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    const description = alert.activityDescription || 'Scheduled activity';
    return `${time} • ${description}`;
  }

  /**
   * Handle notification click - focus window and navigate to activity
   */
  private handleNotificationClick(alert: ActivityAlert): void {
    // Dispatch event for the main app to handle navigation
    window.dispatchEvent(new CustomEvent('lightwalker-notification-click', {
      detail: { alert }
    }));
  }

  /**
   * Check if current time is within do-not-disturb hours
   */
  private isDoNotDisturbTime(): boolean {
    if (!this.settings.doNotDisturbStart || !this.settings.doNotDisturbEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.settings.doNotDisturbStart.split(':').map(Number);
    const [endHour, endMin] = this.settings.doNotDisturbEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Handle overnight DND (e.g., 22:00 - 07:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  /**
   * Initialize sound generator (dynamic import for better performance)
   */
  private async initializeAudio(): Promise<void> {
    // This will be called during initialization
  }

  /**
   * Initialize sound system
   */
  private async initializeSound(): Promise<void> {
    try {
      // Dynamic import to avoid loading audio code unless needed
      const { soundGenerator } = await import('@/lib/notification-sounds');
      this.soundGenerator = soundGenerator;
      console.log('🔊 Notification sound generator ready');
    } catch (error) {
      console.warn('⚠️ Could not initialize sound generator:', error);
    }
  }

  /**
   * Play a notification sound
   */
  private async playNotificationSound(soundType: string): Promise<void> {
    if (!this.soundGenerator || !this.settings.soundEnabled) return;

    try {
      await this.soundGenerator.playSound(soundType, this.settings.volume);
    } catch (error) {
      console.warn('⚠️ Could not play notification sound:', error);
    }
  }

  /**
   * Test notification and sound system
   */
  async testNotification(): Promise<void> {
    if (this.getPermissionStatus() !== 'granted') {
      console.log('❌ Cannot test - permission not granted');
      return;
    }

    const testAlert: ActivityAlert = {
      id: 'test-alert',
      timelineActivityId: 'test',
      activityTitle: 'Test Notification',
      activityDescription: 'This is a test of the notification system',
      scheduledTime: new Date(),
      alertType: 'start',
      isEnabled: true
    };

    await this.showActivityAlert(testAlert);
  }

  /**
   * Update notification settings
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): NotificationSettings {
    // SSR safety check
    if (typeof window === 'undefined') {
      return this.getDefaultSettings();
    }
    
    try {
      const saved = localStorage.getItem('lightwalker-notification-settings');
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('⚠️ Could not load notification settings:', error);
    }
    return this.getDefaultSettings();
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    // SSR safety check
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem('lightwalker-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('⚠️ Could not save notification settings:', error);
    }
  }

  /**
   * Get default notification settings
   */
  private getDefaultSettings(): NotificationSettings {
    return {
      enabled: false, // User must opt-in
      soundEnabled: true,
      soundType: 'gentle-bell',
      volume: 0.7,
      showOnTime: true,
      showMinutesBefore: 5, // 5 minutes before by default
      doNotDisturbStart: '22:00',
      doNotDisturbEnd: '07:00'
    };
  }
}

// Export singleton instance
export const notificationSystem = new LightwalkerNotificationSystem();