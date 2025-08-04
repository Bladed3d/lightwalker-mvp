'use client'

import { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Check, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { DailySchedule, Activity } from '@/types/daily-use';
import TimelineActivity from './TimelineActivity';

interface ActivityTimelineProps {
  schedule: DailySchedule;
  onActivitySelect: (activity: Activity) => void;
  onActivityComplete: (activityId: string, rating?: number, notes?: string) => Promise<void>;
  onActivityReschedule: (activityId: string, newTime: string) => Promise<void>;
  onMarkInProgress: (activityId: string) => void;
  currentTime: Date;
}

export default function ActivityTimeline({
  schedule,
  onActivitySelect,
  onActivityComplete,
  onActivityReschedule,
  onMarkInProgress,
  currentTime
}: ActivityTimelineProps) {
  const [selectedDate, setSelectedDate] = useState(schedule.date);
  const [currentTimeString, setCurrentTimeString] = useState('');
  const [timelineMode, setTimelineMode] = useState<'list' | 'timeline'>('list');

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeString(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate timeline segments for visual timeline view
  const generateTimelineSegments = () => {
    const segments = [];
    const startHour = 6; // Start timeline at 6 AM
    const endHour = 23; // End at 11 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const activity = schedule.activities.find(a => 
        a.scheduledTime && a.scheduledTime.startsWith(hour.toString().padStart(2, '0'))
      );
      
      const currentHour = currentTime.getHours();
      const isPast = hour < currentHour;
      const isCurrent = hour === currentHour;
      
      segments.push({
        timeSlot,
        activity,
        isPast,
        isCurrent,
        hour
      });
    }
    
    return segments;
  };

  const timelineSegments = generateTimelineSegments();

  // Get current activity
  const getCurrentActivity = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return schedule.activities.find(activity => {
      if (!activity.scheduledTime || activity.isCompleted) return false;
      
      const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
      const activityMinutes = hours * 60 + minutes;
      const timeDiff = Math.abs(activityMinutes - currentMinutes);
      
      return timeDiff <= 30; // Within 30 minutes
    });
  };

  const currentActivity = getCurrentActivity();

  // Get upcoming activities (next 3)
  const getUpcomingActivities = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    return schedule.activities
      .filter(activity => {
        if (!activity.scheduledTime || activity.isCompleted) return false;
        const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
        const activityMinutes = hours * 60 + minutes;
        return activityMinutes > currentMinutes;
      })
      .slice(0, 3);
  };

  const upcomingActivities = getUpcomingActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Today's Activities</h2>
            <p className="text-gray-600 mt-1">
              {schedule.completedCount} of {schedule.activities.length} completed • {Math.round(schedule.completionPercentage)}% done
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTimelineMode('list')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timelineMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setTimelineMode('timeline')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timelineMode === 'timeline'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Timeline
              </button>
            </div>
            
            {/* Date Display */}
            <div className="flex items-center space-x-2 bg-indigo-50 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Daily Progress</span>
            <span>{schedule.totalPoints} points earned</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${schedule.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current Activity Highlight */}
      {currentActivity && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <PlayCircle className="w-6 h-6 text-green-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-green-900">Active Now</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {currentActivity.scheduledTime}
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-gray-900 mb-2">{currentActivity.title}</h4>
              <p className="text-gray-700 mb-4">{currentActivity.description}</p>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/50 text-gray-700">
                  <Clock className="w-4 h-4 mr-1" />
                  {currentActivity.duration}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/50 text-gray-700">
                  Difficulty: {currentActivity.difficulty}/9
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/50 text-gray-700">
                  {currentActivity.points} points
                </span>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => onActivitySelect(currentActivity)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Start Activity
                </button>
                <button
                  onClick={() => onMarkInProgress(currentActivity.id)}
                  className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  Mark In Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Timeline Content */}
      {timelineMode === 'list' ? (
        <div className="space-y-4">
          {/* Upcoming Activities */}
          {upcomingActivities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                Coming Up
              </h3>
              <div className="space-y-3">
                {upcomingActivities.map((activity) => (
                  <TimelineActivity
                    key={activity.id}
                    activity={activity}
                    onSelect={onActivitySelect}
                    onComplete={onActivityComplete}
                    onReschedule={onActivityReschedule}
                    isUpcoming={true}
                    currentTime={currentTimeString}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Activities</h3>
            <div className="space-y-3">
              {schedule.activities.map((activity) => (
                <TimelineActivity
                  key={activity.id}
                  activity={activity}
                  onSelect={onActivitySelect}
                  onComplete={onActivityComplete}
                  onReschedule={onActivityReschedule}
                  isUpcoming={false}
                  currentTime={currentTimeString}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline View</h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            {/* Timeline Segments */}
            <div className="space-y-6">
              {timelineSegments.map(({ timeSlot, activity, isPast, isCurrent, hour }) => (
                <div key={timeSlot} className="relative flex items-start space-x-4">
                  {/* Time Marker */}
                  <div className={`w-16 text-right ${
                    isCurrent 
                      ? 'text-indigo-600 font-bold' 
                      : isPast 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                  }`}>
                    <div className="text-sm">{timeSlot}</div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex items-center justify-center w-4 h-4 rounded-full border-2 ${
                    isCurrent
                      ? 'bg-indigo-600 border-indigo-600'
                      : activity?.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : activity
                          ? 'bg-white border-indigo-300'
                          : 'bg-white border-gray-200'
                  }`}>
                    {activity?.isCompleted && (
                      <Check className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    {activity ? (
                      <div 
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          activity.isCompleted
                            ? 'bg-green-50 border-green-200'
                            : isCurrent
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => onActivitySelect(activity)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-white/70 rounded-full">
                              {activity.duration}
                            </span>
                            {activity.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : isCurrent ? (
                              <PlayCircle className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{activity.roleModel}</span>
                          <span>•</span>
                          <span>{activity.category}</span>
                          <span>•</span>
                          <span>{activity.points} points</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                        No activity scheduled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}