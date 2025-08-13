import React from 'react';
import { X, Volume2, Video, ExternalLink } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';

interface InstructionsWindowProps {
  theme?: ThemeConfig;
  isVisible: boolean;
  onClose: () => void;
  activity: any;
  timelineActivities?: any[];
  displayTime?: Date;
}

const InstructionsWindow = ({ theme, isVisible, onClose, activity, timelineActivities = [], displayTime }: InstructionsWindowProps) => {
  if (!isVisible) return null;

  // Use the same logic as CurrentActivityPanel to find the timeline activity
  const getTimelineActivity = () => {
    if (timelineActivities.length === 0 || !displayTime) {
      return activity;
    }
    
    const currentMinutes = displayTime.getHours() * 60 + displayTime.getMinutes();
    
    // Find the activity that contains this time or is closest to it
    let closestActivity = null;
    let closestDistance = Infinity;
    
    for (const timelineActivity of timelineActivities) {
      // Try both scheduledTime and time fields for compatibility
      const timeStr = timelineActivity.scheduledTime || timelineActivity.time;
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
        closestActivity = timelineActivity;
        closestDistance = distance;
      }
    }
    
    return closestActivity || activity;
  };
  
  const displayActivity = getTimelineActivity();
  
  // Debug: Log the activity object to understand its structure
  console.log('🔍 InstructionsWindow displayActivity:', displayActivity);

  // Get both description (philosophical context) and instructions (practical steps)
  const description = displayActivity?.description || null;
  const instructions = displayActivity?.instructions || displayActivity?.activity || "Instructions will be available for this activity soon.";
  
  // Get the activity title - check multiple possible properties
  const activityTitle = displayActivity?.title || displayActivity?.name || 'Current Activity';
  console.log('📋 Activity title resolved to:', activityTitle);
  console.log('📝 Description:', description);
  console.log('📋 Instructions:', instructions);

  return (
    <div className="mb-4">
      <div className={`${theme?.cardBackground || 'bg-slate-800'} rounded-xl border ${theme?.cardBorder || 'border-slate-700'} shadow-lg overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600">
          <div className="flex items-center space-x-3">
            <div className="text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className={`text-lg font-semibold ${theme?.timelineText || 'text-white'}`}>
              Instructions: {activityTitle}
            </h3>
          </div>
          
          {/* Close and Future Media Controls */}
          <div className="flex items-center space-x-2">
            {/* Future Audio Button - Coming Soon */}
            <button 
              className="p-2 rounded-lg bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
              disabled
              title="Audio instructions - Coming Soon"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            {/* Future Video Button - Coming Soon */}
            <button 
              className="p-2 rounded-lg bg-slate-600 text-slate-400 cursor-not-allowed opacity-50"
              disabled
              title="Video instructions - Coming Soon"
            >
              <Video className="w-4 h-4" />
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-600 text-slate-300 hover:bg-slate-500 hover:text-white transition-colors"
              title="Close Instructions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area - 3/4 width with reserved space for future controls */}
        <div className="flex">
          {/* Instructions Content */}
          <div className="flex-1 p-6 pr-4">
            <div className="prose prose-invert max-w-none">
              
              {/* Description Section - Philosophical Context */}
              {description && (
                <div className="mb-6">
                  <h4 className={`text-sm font-semibold ${theme?.cardText || 'text-blue-400'} uppercase tracking-wide mb-3`}>
                    Philosophy
                  </h4>
                  <div className={`text-base ${theme?.cardText || 'text-gray-200'} leading-relaxed italic bg-slate-700/30 p-4 rounded-lg border-l-4 border-blue-400`}>
                    {description}
                  </div>
                </div>
              )}

              {/* Instructions Section - Practical Steps */}
              <div className="mb-4">
                <h4 className={`text-sm font-semibold ${theme?.cardText || 'text-green-400'} uppercase tracking-wide mb-3`}>
                  Practice
                </h4>
                <div className={`text-base ${theme?.cardText || 'text-gray-200'} leading-relaxed whitespace-pre-line`}>
                  {instructions.split('\n').map((line: string, index: number) => {
                  // Handle clickable links in the future
                  if (line.includes('http')) {
                    const linkMatch = line.match(/(https?:\/\/[^\s]+)/);
                    if (linkMatch) {
                      const [beforeLink, afterLink] = line.split(linkMatch[0]);
                      return (
                        <p key={index} className="mb-2">
                          {beforeLink}
                          <a 
                            href={linkMatch[0]} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline inline-flex items-center"
                          >
                            {linkMatch[0]}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                          {afterLink}
                        </p>
                      );
                    }
                  }
                  
                  // Regular text line
                  return line.trim() ? (
                    <p key={index} className="mb-2">{line}</p>
                  ) : (
                    <div key={index} className="mb-2"></div>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Reserved space for future media controls - 1/4 width */}
          <div className="w-24 p-4 border-l border-slate-600 bg-slate-700/30">
            <div className="text-center text-slate-500 text-xs">
              <div className="mb-3">
                <Volume2 className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <p>Audio</p>
                <p className="text-xs opacity-50">Soon</p>
              </div>
              <div>
                <Video className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <p>Video</p>
                <p className="text-xs opacity-50">Soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsWindow;