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
    <div className={`${theme?.timelineBackground || 'bg-slate-800'} rounded-xl p-6 border ${theme?.timelineBorder || 'border-slate-700'}`}>
      <h2 className={`text-xl font-semibold ${theme?.timelineText || 'text-white'} mb-4`}>Current Activity</h2>
      
      <div className={`${theme?.cardBackground || 'bg-slate-700'} rounded-lg p-4 h-64 flex flex-col items-center`}>
        {/* Large container for game-like graphics - properly centered */}
        <div className="relative w-36 h-36 flex items-center justify-center overflow-hidden mt-2">
          {/* Black background box that maintains consistent size */}
          <div className="absolute inset-0 bg-black border border-slate-600"></div>
          
          {/* Image with minimal padding for maximum size */}
          {displayActivity?.icon && (displayActivity.icon.startsWith('/') || displayActivity.icon.startsWith('data:')) ? (
            <img 
              src={displayActivity.icon} 
              alt={displayActivity?.title || 'Activity'} 
              className="relative z-10 max-w-[96%] max-h-[96%] object-contain"
            />
          ) : (
            <span className="relative z-10 text-5xl">{displayActivity?.icon || '🌟'}</span>
          )}
        </div>
        
        {/* Text section - compact and higher */}
        <div className="text-center mt-3">
          {/* Activity Name */}
          <h3 className={`text-base font-semibold ${theme?.timelineText || 'text-white'} leading-tight mb-1`}>
            {displayActivity?.title || displayActivity?.name || 'Free Time'}
          </h3>
          
          {/* Current Time */}
          <div className="text-lg text-blue-400 font-mono mb-1">
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
        </div>
      </div>
    </div>
  );
};

export default CurrentActivityPanel;