'use client'

import { useState } from 'react';
import { 
  Clock, 
  User, 
  Calendar,
  Play,
  Check,
  MoreHorizontal,
  Star,
  Target,
  Zap,
  CheckCircle2,
  PlayCircle,
  Circle,
  Timer
} from 'lucide-react';
import { Activity } from '@/types/daily-use';
import { useActivityTimer } from '@/hooks/useDailyActivities';

interface TimelineActivityProps {
  activity: Activity;
  onSelect: (activity: Activity) => void;
  onComplete: (activityId: string) => Promise<void>;
  onReschedule: (activityId: string, newTime: string) => Promise<void>;
  isUpcoming: boolean;
  currentTime: string;
}

export default function TimelineActivity({
  activity,
  onSelect,
  onComplete,
  onReschedule,
  isUpcoming,
  currentTime
}: TimelineActivityProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [newTime, setNewTime] = useState(activity.scheduledTime || '');
  const [completing, setCompleting] = useState(false);

  // Get timer information if this is an upcoming activity
  const { timeRemaining, isActiveTime } = useActivityTimer(isUpcoming ? activity : null);

  // Calculate if activity is overdue
  const isOverdue = () => {
    if (!activity.scheduledTime || activity.isCompleted) return false;
    
    const [hours, minutes] = activity.scheduledTime.split(':').map(Number);
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
    
    const scheduledMinutes = hours * 60 + minutes;
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    return currentTotalMinutes > scheduledMinutes + 30; // 30 minutes grace period
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onComplete(activity.id);
    } finally {
      setCompleting(false);
    }
  };

  const handleReschedule = async () => {
    if (newTime !== activity.scheduledTime) {
      await onReschedule(activity.id, newTime);
    }
    setShowReschedule(false);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 bg-green-100';
    if (difficulty <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness': return '🧘';
      case 'decision-making': return '🎯';
      case 'communication': return '💬';
      case 'reflection': return '🤔';
      case 'physical': return '💪';
      case 'creative': return '🎨';
      default: return '⭐';
    }
  };

  const getStatusColor = () => {
    if (activity.isCompleted) return 'border-green-200 bg-green-50';
    if (isActiveTime) return 'border-indigo-200 bg-indigo-50';
    if (isOverdue()) return 'border-red-200 bg-red-50';
    if (isUpcoming) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  const getStatusIcon = () => {
    if (activity.isCompleted) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (isActiveTime) return <PlayCircle className="w-5 h-5 text-indigo-600" />;
    if (isOverdue()) return <Timer className="w-5 h-5 text-red-600" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{activity.title}</h3>
              {activity.scheduledTime && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isActiveTime 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : isOverdue()
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {activity.scheduledTime}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2">{activity.description}</p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          {!activity.isCompleted && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
              title="Mark as complete"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowReschedule(!showReschedule)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reschedule"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{activity.duration}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="truncate">{activity.roleModel}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Target className="w-4 h-4 text-gray-400" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
            {activity.difficulty}/9
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Zap className="w-4 h-4" />
          <span>{activity.points} pts</span>
        </div>
      </div>

      {/* Category and Attribute */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(activity.category)}</span>
          <span className="text-sm font-medium text-gray-700 capitalize">{activity.category}</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">{activity.attribute}</span>
        </div>
        
        {timeRemaining && isUpcoming && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            isActiveTime 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {timeRemaining}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onSelect(activity)}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            activity.isCompleted
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : isActiveTime
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
          disabled={activity.isCompleted}
        >
          {activity.isCompleted ? 'Completed' : isActiveTime ? 'Start Now' : 'View Details'}
        </button>
        
        {!activity.isCompleted && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium disabled:opacity-50"
          >
            {completing ? 'Marking...' : 'Complete'}
          </button>
        )}
      </div>

      {/* Reschedule Panel */}
      {showReschedule && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">Reschedule to:</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleReschedule}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
            >
              Update
            </button>
            <button
              onClick={() => setShowReschedule(false)}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {isOverdue() && !activity.isCompleted && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            This activity is overdue. Consider rescheduling or completing it now.
          </p>
        </div>
      )}

      {activity.isCompleted && activity.completedAt && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            Completed at {new Date(activity.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}
    </div>
  );
}