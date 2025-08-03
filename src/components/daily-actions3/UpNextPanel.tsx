import React from 'react';
import { Clock } from 'lucide-react';
import { ThemeConfig } from '@/lib/theme-config';

interface UpNextPanelProps {
  theme?: ThemeConfig;
  nextActivities?: any[];
  currentTime?: Date;
}

const UpNextPanel = ({ theme, nextActivities = [], currentTime = new Date() }: UpNextPanelProps) => {
  // Filter and get upcoming activities from the timeline
  const getUpcomingActivities = () => {
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    // Sample timeline activities (this should come from the actual timeline data)
    const timelineActivities = [
      { id: '1', title: 'Lunch', scheduledTime: '12:00p', roleModel: 'Healthy Living', roleModelColor: '#22c55e', points: 25 },
      { id: '2', title: 'Walk', scheduledTime: '12:45p', roleModel: 'Fitness Focus', roleModelColor: '#3b82f6', points: 20 },
      { id: '3', title: 'Create', scheduledTime: '1:15p', roleModel: 'Creative Mind', roleModelColor: '#8b5cf6', points: 60 },
      { id: '4', title: 'Connect', scheduledTime: '2:45p', roleModel: 'Social Growth', roleModelColor: '#f59e0b', points: 35 },
    ];
    
    // Convert scheduled times to minutes and filter upcoming ones
    return timelineActivities
      .map(activity => {
        const timeStr = activity.scheduledTime;
        const [timePart, period] = timeStr.split(/([ap])/);
        const [hours, minutes] = timePart.split(':').map(Number);
        let activityMinutes = hours * 60 + (minutes || 0);
        
        if (period === 'p' && hours !== 12) activityMinutes += 12 * 60;
        if (period === 'a' && hours === 12) activityMinutes -= 12 * 60;
        
        return { ...activity, activityMinutes };
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: (activity.roleModelColor || '#6b7280') + '20' }}>
              <span style={{ color: activity.roleModelColor || '#6b7280' }}>
                {activity.scheduledTime || '•'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className={`font-medium ${theme?.cardText || 'text-white'} text-sm truncate`}>{activity.title}</h5>
              <p className={`text-xs ${theme?.cardSubtext || 'text-slate-400'}`}>{activity.roleModel || 'Personal Activity'}</p>
            </div>
            <div className="text-xs text-gray-400">{activity.points}pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpNextPanel;