'use client'

import { useState } from 'react';
import { 
  Calendar,
  Clock,
  Plus,
  Save,
  Check,
  ChevronDown,
  Activity as ActivityIcon,
  User,
  Target,
  Zap,
  Bell,
  X
} from 'lucide-react';
import { Activity } from '@/types/daily-use';

interface ScheduleQuickAccessProps {
  nextActivities: Activity[];
}

type ScheduleItem = {
  time: string;
  activity?: Activity;
  isNew?: boolean;
};

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

export default function ScheduleQuickAccess({ nextActivities }: ScheduleQuickAccessProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Create schedule view combining existing and available slots
  const createScheduleView = (): ScheduleItem[] => {
    const scheduleItems: ScheduleItem[] = [];
    
    // Add existing activities
    nextActivities.forEach(activity => {
      if (activity.scheduledTime) {
        scheduleItems.push({
          time: activity.scheduledTime,
          activity
        });
      }
    });

    // Add some empty slots for demonstration
    TIME_SLOTS.slice(0, 12).forEach(time => {
      if (!scheduleItems.some(item => item.time === time)) {
        scheduleItems.push({ time });
      }
    });

    // Sort by time
    return scheduleItems.sort((a, b) => a.time.localeCompare(b.time));
  };

  const scheduleItems = createScheduleView();

  const handleScheduleActivity = async () => {
    if (!selectedActivity || !selectedTime) return;

    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Scheduling activity:', {
        activityId: selectedActivity.id,
        time: selectedTime,
        date: selectedDate,
        reminderMinutes
      });

      setSaved(true);
      setTimeout(() => {
        setSelectedActivity(null);
        setSelectedTime('');
        setSaved(false);
        setShowTimeSlots(false);
      }, 2000);

    } catch (error) {
      console.error('Failed to schedule activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickReschedule = async (activity: Activity, newTime: string) => {
    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Rescheduling activity:', {
        activityId: activity.id,
        oldTime: activity.scheduledTime,
        newTime,
        date: selectedDate
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 1500);

    } catch (error) {
      console.error('Failed to reschedule activity:', error);
    } finally {
      setSaving(false);
    }
  };

  const getTimeOfDayLabel = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const getTimeOfDayColor = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'text-yellow-600 bg-yellow-50';
    if (hour < 17) return 'text-blue-600 bg-blue-50';
    return 'text-purple-600 bg-purple-50';
  };

  if (saved) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {selectedActivity ? 'Activity Scheduled!' : 'Schedule Updated!'}
        </h3>
        <p className="text-gray-600">Your schedule has been updated successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      {/* Current Schedule Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Today's Schedule</h4>
          <span className="text-xs text-gray-500">
            {nextActivities.length} activities planned
          </span>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {scheduleItems.slice(0, 8).map((item, index) => (
            <div
              key={`${item.time}-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                item.activity 
                  ? 'border-indigo-200 bg-indigo-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeOfDayColor(item.time)}`}>
                  {item.time}
                </div>
                
                {item.activity ? (
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{item.activity.title}</h5>
                    <p className="text-xs text-gray-600">{item.activity.roleModel}</p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-sm text-gray-500">Available</span>
                  </div>
                )}
              </div>

              {item.activity ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-indigo-600">{item.activity.points}pts</span>
                  <button
                    onClick={() => {
                      setSelectedActivity(item.activity!);
                      setShowTimeSlots(true);
                    }}
                    className="p-1 hover:bg-indigo-100 rounded transition-colors"
                    title="Reschedule"
                  >
                    <Clock className="w-3 h-3 text-indigo-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedTime(item.time);
                    setShowTimeSlots(false);
                    // Could open activity selector here
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="Schedule activity"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Schedule Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setShowTimeSlots(!showTimeSlots)}
            className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Schedule New Activity</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-indigo-600 transition-transform ${
              showTimeSlots ? 'rotate-180' : ''
            }`} />
          </button>

          <button className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Set Daily Reminders</span>
            </div>
          </button>

          <button className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="flex items-center space-x-2">
              <ActivityIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Auto-Schedule Week</span>
            </div>
          </button>
        </div>
      </div>

      {/* Time Slot Selection */}
      {showTimeSlots && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Select Time</h4>
            <button
              onClick={() => setShowTimeSlots(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {TIME_SLOTS.map((time) => {
              const isOccupied = nextActivities.some(a => a.scheduledTime === time);
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  disabled={isOccupied}
                  className={`p-2 text-xs rounded border transition-colors ${
                    selectedTime === time
                      ? 'border-indigo-300 bg-indigo-100 text-indigo-700'
                      : isOccupied
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Selection (if time is selected) */}
      {selectedTime && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Choose Activity</h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {nextActivities.filter(a => !a.scheduledTime).slice(0, 5).map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedActivity?.id === activity.id
                    ? 'border-indigo-300 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{activity.title}</h5>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{activity.roleModel}</span>
                      <Target className="w-3 h-3 ml-2" />
                      <span>{activity.difficulty}/9</span>
                      <Zap className="w-3 h-3 ml-2" />
                      <span>{activity.points}pts</span>
                    </div>
                  </div>
                  {selectedActivity?.id === activity.id && (
                    <Check className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reminder Settings */}
      {selectedActivity && selectedTime && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Reminder</h4>
          
          <div className="flex items-center space-x-3">
            <Bell className="w-4 h-4 text-gray-500" />
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>
        </div>
      )}

      {/* Schedule Button */}
      {selectedActivity && selectedTime && (
        <button
          onClick={handleScheduleActivity}
          disabled={saving}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
            saving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Scheduling...' : `Schedule for ${selectedTime}`}</span>
        </button>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
        <Calendar className="w-3 h-3 inline mr-1" />
        All times shown in your local timezone
      </div>
    </div>
  );
}