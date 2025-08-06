/**
 * Recurring Activities System
 * 
 * Handles generation of recurring activity instances based on patterns
 */

import { Activity, RecurringPattern } from '@/types/daily-use';

/**
 * Generate recurring activity instances for a date range
 */
export function generateRecurringInstances(
  baseActivity: Activity,
  startDate: Date,
  endDate: Date
): Activity[] {
  if (!baseActivity.isRecurring || !baseActivity.recurringPattern) {
    return [baseActivity];
  }

  const instances: Activity[] = [];
  const pattern = baseActivity.recurringPattern;
  const currentDate = new Date(startDate);
  let instanceCount = 0;

  while (currentDate <= endDate) {
    // Check if we've reached max occurrences
    if (pattern.maxOccurrences && instanceCount >= pattern.maxOccurrences) {
      break;
    }

    // Check if we've reached end date
    if (pattern.endDate && currentDate > new Date(pattern.endDate)) {
      break;
    }

    // Check if this date matches the pattern
    if (shouldGenerateInstanceForDate(currentDate, pattern)) {
      const instance: Activity = {
        ...baseActivity,
        id: `${baseActivity.id}-${currentDate.toISOString().split('T')[0]}-${instanceCount}`,
        // Keep the scheduled time but update for this specific date
        scheduledTime: baseActivity.scheduledTime,
        isRecurring: false, // Individual instances are not recurring
        recurringPattern: undefined, // Remove pattern from instances
      };

      instances.push(instance);
      instanceCount++;
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
}

/**
 * Check if an instance should be generated for a specific date
 */
function shouldGenerateInstanceForDate(date: Date, pattern: RecurringPattern): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayOfMonth = date.getDate();

  switch (pattern.type) {
    case 'daily':
      // For daily patterns, check interval
      if (pattern.interval && pattern.interval > 1) {
        // This is a simplified check - in a real implementation you'd want to track
        // the actual start date and calculate based on days since start
        return date.getDate() % pattern.interval === 0;
      }
      return true;

    case 'weekly':
      // Check if current day of week is in the selected days
      return pattern.daysOfWeek?.includes(dayOfWeek) ?? false;

    case 'monthly':
      // Check if current day of month is in the selected days
      return pattern.daysOfMonth?.includes(dayOfMonth) ?? false;

    case 'custom':
      // Check if current date is in the custom dates list
      const dateString = date.toISOString().split('T')[0];
      return pattern.customDates?.includes(dateString) ?? false;

    default:
      return false;
  }
}

/**
 * Get a human-readable description of the recurring pattern
 */
export function getRecurringDescription(pattern: RecurringPattern): string {
  switch (pattern.type) {
    case 'daily':
      if (pattern.interval && pattern.interval > 1) {
        return `Every ${pattern.interval} days`;
      }
      return 'Daily';

    case 'weekly':
      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDays = pattern.daysOfWeek.map(d => dayNames[d]);
        return `Weekly on ${selectedDays.join(', ')}`;
      }
      return 'Weekly';

    case 'monthly':
      if (pattern.daysOfMonth && pattern.daysOfMonth.length > 0) {
        return `Monthly on day${pattern.daysOfMonth.length > 1 ? 's' : ''} ${pattern.daysOfMonth.join(', ')}`;
      }
      return 'Monthly';

    case 'custom':
      if (pattern.customDates && pattern.customDates.length > 0) {
        return `Custom dates (${pattern.customDates.length} dates)`;
      }
      return 'Custom schedule';

    default:
      return 'Unknown pattern';
  }
}

/**
 * Get next occurrence date for a recurring activity
 */
export function getNextOccurrence(pattern: RecurringPattern, fromDate: Date = new Date()): Date | null {
  const testDate = new Date(fromDate);
  const maxDaysToCheck = 365; // Prevent infinite loops
  let daysChecked = 0;

  while (daysChecked < maxDaysToCheck) {
    testDate.setDate(testDate.getDate() + 1);
    daysChecked++;

    // Check end date
    if (pattern.endDate && testDate > new Date(pattern.endDate)) {
      return null;
    }

    if (shouldGenerateInstanceForDate(testDate, pattern)) {
      return new Date(testDate);
    }
  }

  return null;
}

/**
 * Check if a date conflicts with existing activities
 */
export function hasTimeConflict(
  newActivity: Activity,
  existingActivities: Activity[],
  date: Date
): boolean {
  if (!newActivity.scheduledTime) return false;

  const dateString = date.toISOString().split('T')[0];
  
  return existingActivities.some(activity => {
    // Check if it's the same date and overlapping time
    if (activity.scheduledTime === newActivity.scheduledTime) {
      // This is a simplified check - you might want more sophisticated time overlap detection
      return true;
    }
    return false;
  });
}