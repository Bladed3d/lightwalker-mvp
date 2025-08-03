import React from 'react';
import { ThemeConfig } from '@/lib/theme-config';

interface CurrentActivityPanelProps {
  theme?: ThemeConfig;
  currentActivity: any;
  displayTime: Date;
  liveTime: Date;
  timelineActivities?: any[];
}

const CurrentActivityPanel = ({ theme, currentActivity, displayTime, liveTime, timelineActivities = [] }: CurrentActivityPanelProps) => {
  // Find the activity that should be displayed at the current timeline position
  const getTimelineActivity = () => {
    if (timelineActivities.length === 0) {
      return currentActivity;
    }
    
    const currentMinutes = displayTime.getHours() * 60 + displayTime.getMinutes();
    
    // Find the activity that contains this time or is closest to it
    let closestActivity = null;
    let closestDistance = Infinity;
    
    for (const activity of timelineActivities) {
      // Try both scheduledTime and time fields for compatibility
      const timeStr = activity.scheduledTime || activity.time;
      if (!timeStr) {
        continue;
      }
      
      // Parse different time formats: "8:30a", "8:30", "08:30"
      let activityMinutes = 0;
      
      if (timeStr.includes('a') || timeStr.includes('p')) {
        // 12-hour format: "8:30a" or "8:30p"
        const [timePart, period] = timeStr.split(/([ap])/);
        const [hours, minutes] = timePart.split(':').map(Number);
        activityMinutes = hours * 60 + (minutes || 0);
        
        if (period === 'p' && hours !== 12) activityMinutes += 12 * 60;
        if (period === 'a' && hours === 12) activityMinutes -= 12 * 60;
      } else {
        // 24-hour format: "08:30" or "8:30"
        const [hours, minutes] = timeStr.split(':').map(Number);
        activityMinutes = hours * 60 + (minutes || 0);
      }
      
      // Calculate distance - prefer activities that are currently active (within 60 minutes for better matching)
      const distance = Math.abs(currentMinutes - activityMinutes);
      
      // Find the closest activity within a reasonable range
      if (distance < closestDistance) {
        closestActivity = activity;
        closestDistance = distance;
      }
    }
    
    return closestActivity || currentActivity;
  };
  
  const displayActivity = getTimelineActivity();
  return (
    <div className={`${theme?.timelineBackground || 'bg-slate-800'} rounded-xl p-4 border ${theme?.timelineBorder || 'border-slate-700'}`}>
      <h2 className={`text-lg font-semibold ${theme?.timelineText || 'text-white'} mb-3`}>Current Activity</h2>
      
      <div className={`${theme?.cardBackground || 'bg-slate-700'} rounded-lg p-4 text-center`}>
        {/* Large Activity Icon */}
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-3 mx-auto overflow-hidden">
          {displayActivity?.icon && displayActivity.icon.startsWith('/') ? (
            <img 
              src={displayActivity.icon} 
              alt={displayActivity?.title || 'Activity'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl">{displayActivity?.icon || '🌟'}</span>
          )}
        </div>
        
        {/* Activity Name */}
        <h3 className={`text-lg font-semibold ${theme?.timelineText || 'text-white'} mb-1`}>
          {displayActivity?.title || displayActivity?.name || 'Free Time'}
        </h3>
        
        {/* Current Time */}
        <div className="text-xl text-blue-400 font-mono mb-2">
          {displayTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }).replace(/\s?(AM|PM)/, (match, period) => period.toLowerCase())}
        </div>
        

        {/* Points */}
        <div className={`text-sm ${theme?.cardSubtext || 'text-gray-300'}`}>
          Points: {displayActivity?.points || 0}
        </div>

        {/* HIGH ENERGY Status Pill */}
        {displayActivity && (
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full">
              🔥 HIGH ENERGY
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentActivityPanel;