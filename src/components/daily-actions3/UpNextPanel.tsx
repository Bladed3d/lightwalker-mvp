import React from 'react';
import { Clock } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';

interface UpNextPanelProps {
  theme?: ThemeConfig;
  nextActivities?: any[];
  currentTime?: Date;
  timelineActivities?: any[];
}

const UpNextPanel = ({ theme, nextActivities = [], currentTime = new Date(), timelineActivities = [] }: UpNextPanelProps) => {
  // Filter and get upcoming activities from the timeline
  const getUpcomingActivities = () => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // Use actual timeline activities if available
    if (timelineActivities.length > 0) {
      return timelineActivities
        .map(activity => {
          // Parse the time from scheduledTime or time field
          const timeStr = activity.scheduledTime || activity.time;
          if (!timeStr) return null;
          
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
          
          return { ...activity, activityMinutes, timeStr };
        })
        .filter(activity => activity && activity.activityMinutes > currentMinutes)
        .sort((a, b) => a.activityMinutes - b.activityMinutes)
        .slice(0, 3);
    }
    
    // Fallback to sample activities if no timeline activities
    const sampleActivities = [
      { id: '1', title: 'Lunch', scheduledTime: '12:00p', roleModel: 'Healthy Living', roleModelColor: '#22c55e', points: 25, icon: '🍽️' },
      { id: '2', title: 'Walk', scheduledTime: '12:45p', roleModel: 'Fitness Focus', roleModelColor: '#3b82f6', points: 20, icon: '🚶‍♂️' },
      { id: '3', title: 'Create', scheduledTime: '1:15p', roleModel: 'Creative Mind', roleModelColor: '#8b5cf6', points: 60, icon: '🎨' },
      { id: '4', title: 'Connect', scheduledTime: '2:45p', roleModel: 'Social Growth', roleModelColor: '#f59e0b', points: 35, icon: '💬' },
    ];
    
    // Convert scheduled times to minutes and filter upcoming ones
    return sampleActivities
      .map(activity => {
        const timeStr = activity.scheduledTime;
        const [timePart, period] = timeStr.split(/([ap])/);
        const [hours, minutes] = timePart.split(':').map(Number);
        let activityMinutes = hours * 60 + (minutes || 0);
        
        if (period === 'p' && hours !== 12) activityMinutes += 12 * 60;
        if (period === 'a' && hours === 12) activityMinutes -= 12 * 60;
        
        return { ...activity, activityMinutes, timeStr };
      })
      .filter(activity => activity.activityMinutes > currentMinutes)
      .slice(0, 3);
  };

  const activities = nextActivities.length > 0 ? nextActivities.slice(0, 3) : getUpcomingActivities();

  if (activities.length === 0) return null;

  return (
    <div className={`${theme?.cardBackground || 'bg-slate-700'} rounded-xl shadow-sm border ${theme?.cardBorder || 'border-slate-600'} p-4 mt-4`}>
      <h4 className={`font-semibold ${theme?.cardText || 'text-white'} mb-4 flex items-center`}>
        <Clock className="w-4 h-4 mr-2 text-orange-500" />
        Up Next
      </h4>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id || activity.title} className={`flex items-center space-x-3 p-3 ${theme?.statsBackground || 'bg-slate-600'} rounded-lg ${theme?.cardHover || 'hover:bg-slate-500'} transition-colors`}>
            {/* Activity Icon - Rectangular like inventory */}
            <div className="w-10 h-10 bg-black border border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {activity.icon && activity.icon.startsWith('/') ? (
                <img 
                  src={activity.icon} 
                  alt={activity.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">{activity.icon || '⭐'}</span>
              )}
            </div>
            
            {/* Activity Info */}
            <div className="flex-1 min-w-0">
              <h5 className={`font-medium ${theme?.cardText || 'text-white'} text-sm truncate`}>{activity.title}</h5>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>
                  {activity.timeStr || activity.scheduledTime || 'No time'}
                </span>
                <span className="text-xs text-yellow-400 font-medium">{activity.points || 0}pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpNextPanel;