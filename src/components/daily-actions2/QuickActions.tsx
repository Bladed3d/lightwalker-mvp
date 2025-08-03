'use client'

import { useState } from 'react';
import { 
  BookOpen, 
  Calendar,
  CheckSquare,
  MessageSquare,
  Plus,
  Clock,
  Award,
  Zap,
  Target,
  ChevronRight,
  Star,
  TrendingUp,
  Activity,
  Bell,
  Settings,
  X
} from 'lucide-react';
import { Activity as ActivityType, Achievement, DailyUseUIState } from '@/types/daily-use';
import { ThemeConfig } from '@/lib/theme-config';
import JournalQuickAccess from './JournalQuickAccess';
import ScheduleQuickAccess from './ScheduleQuickAccess';

interface QuickActionsProps {
  onAction: (panel: DailyUseUIState['quickActionPanel']) => void;
  activePanel: DailyUseUIState['quickActionPanel'];
  currentActivity?: ActivityType | null;
  nextActivities: ActivityType[];
  achievements: Achievement[];
  theme: ThemeConfig;
}

export default function QuickActions({
  onAction,
  activePanel,
  currentActivity,
  nextActivities,
  achievements,
  theme
}: QuickActionsProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Quick action items
  const quickActionItems = [
    {
      id: 'journal',
      title: 'Quick Journal',
      description: 'Capture thoughts and insights',
      icon: BookOpen,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => onAction('journal')
    },
    {
      id: 'schedule',
      title: 'Schedule Activity',
      description: 'Plan your next session',
      icon: Calendar,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => onAction('schedule')
    },
    {
      id: 'todo',
      title: 'Quick Todo',
      description: 'Add action items',
      icon: CheckSquare,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => onAction('todo')
    }
  ];

  // Recent achievements (last 3)
  const recentAchievements = achievements
    .filter(a => a.isUnlocked)
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.cardText} flex items-center`}>
            <Zap className="w-5 h-5 mr-2 text-indigo-500" />
            Quick Actions
          </h3>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 ${theme.cardHover} rounded-lg transition-colors relative`}
          >
            <Bell className={`w-5 h-5 ${theme.cardSubtext}`} />
            {recentAchievements.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          {quickActionItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                activePanel === item.id
                  ? `border-${item.textColor.split('-')[1]}-300 ${item.bgColor}`
                  : `${theme.cardBorder} ${theme.cardBackground} ${theme.cardHover}`
              }`}
            >
              <div className="flex items-center space-x-3 p-4">
                <div className={`w-10 h-10 ${item.color} ${item.hoverColor} rounded-lg flex items-center justify-center transition-colors`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all ${
                  activePanel === item.id ? 'rotate-90' : ''
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Panel Content */}
      {activePanel !== 'hidden' && (
        <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${theme.cardText} capitalize`}>{activePanel}</h4>
            <button
              onClick={() => onAction('hidden')}
              className={`p-1 ${theme.cardHover} rounded-lg transition-colors`}
            >
              <X className={`w-4 h-4 ${theme.cardSubtext}`} />
            </button>
          </div>

          {activePanel === 'journal' && (
            <JournalQuickAccess currentActivity={currentActivity} />
          )}

          {activePanel === 'schedule' && (
            <ScheduleQuickAccess nextActivities={nextActivities} />
          )}

          {activePanel === 'todo' && (
            <div className="space-y-3">
              <div className={`text-sm ${theme.cardSubtext} mb-3`}>
                Quick todo functionality coming soon...
              </div>
              <div className="space-y-2">
                <div className={`flex items-center space-x-2 p-2 ${theme.statsBackground} rounded-lg`}>
                  <CheckSquare className={`w-4 h-4 ${theme.cardSubtext}`} />
                  <span className={`text-sm ${theme.cardSubtext}`}>Plan tomorrow's activities</span>
                </div>
                <div className={`flex items-center space-x-2 p-2 ${theme.statsBackground} rounded-lg`}>
                  <CheckSquare className={`w-4 h-4 ${theme.cardSubtext}`} />
                  <span className={`text-sm ${theme.cardSubtext}`}>Review weekly progress</span>
                </div>
                <div className={`flex items-center space-x-2 p-2 ${theme.statsBackground} rounded-lg`}>
                  <CheckSquare className={`w-4 h-4 ${theme.cardSubtext}`} />
                  <span className={`text-sm ${theme.cardSubtext}`}>Update Lightwalker attributes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Activity Quick Info */}
      {currentActivity && (
        <div className={`${theme.statsBackground} border ${theme.statsBorder} rounded-xl p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
              style={{ backgroundColor: currentActivity.roleModelColor + '20' }}
            >
              <Activity className="w-5 h-5 animate-pulse" style={{ color: currentActivity.roleModelColor }} />
            </div>
            <div>
              <h4 className={`font-semibold ${theme.statsText}`}>Active Now</h4>
              <p className={`text-sm ${theme.cardSubtext}`}>{currentActivity.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className={`p-3 ${theme.cardBackground} opacity-70 rounded-lg`}>
              <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className={`text-sm font-semibold ${theme.statsText}`}>{currentActivity.duration}</div>
              <div className={`text-xs ${theme.cardSubtext}`}>Duration</div>
            </div>
            <div className={`p-3 ${theme.cardBackground} opacity-70 rounded-lg`}>
              <Target className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <div className={`text-sm font-semibold ${theme.statsText}`}>{currentActivity.points}</div>
              <div className={`text-xs ${theme.cardSubtext}`}>Points</div>
            </div>
          </div>
        </div>
      )}

      {/* Next Activities Preview */}
      {nextActivities.length > 0 && (
        <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6`}>
          <h4 className={`font-semibold ${theme.cardText} mb-4 flex items-center`}>
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Up Next
          </h4>

          <div className="space-y-3">
            {nextActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className={`flex items-center space-x-3 p-3 ${theme.statsBackground} rounded-lg ${theme.cardHover} transition-colors`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: activity.roleModelColor + '20' }}>
                  <span style={{ color: activity.roleModelColor }}>
                    {activity.scheduledTime || '•'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className={`font-medium ${theme.cardText} text-sm truncate`}>{activity.title}</h5>
                  <p className={`text-xs ${theme.cardSubtext}`}>{activity.roleModel}</p>
                </div>
                <div className="text-xs text-gray-500">{activity.points}pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {recentAchievements.length > 0 && (
        <div className={`${theme.cardBackground} rounded-xl shadow-sm border ${theme.cardBorder} p-6`}>
          <h4 className={`font-semibold ${theme.cardText} mb-4 flex items-center`}>
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Recent Achievements
          </h4>

          <div className="space-y-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className={`flex items-center space-x-3 p-3 ${theme.statsBackground} border ${theme.statsBorder} rounded-lg`}>
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h5 className={`font-semibold ${theme.cardText} text-sm`}>{achievement.title}</h5>
                  <p className={`text-xs ${theme.cardSubtext}`}>{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className={`text-xs ${theme.statsAccent} mt-1`}>
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className={`${theme.statsBackground} border ${theme.statsBorder} rounded-xl p-6 ${theme.statsText}`}>
        <h4 className="font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Today's Progress
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {currentActivity ? '1' : '0'}
            </div>
            <div className={`text-sm ${theme.cardSubtext}`}>Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">{nextActivities.length}</div>
            <div className={`text-sm ${theme.cardSubtext}`}>Upcoming</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className={`text-sm ${theme.cardSubtext}`}>
            Keep building your ideal character, one activity at a time
          </p>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:hidden">
          <div className={`${theme.cardBackground} rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto`}>
            <div className={`p-4 border-b ${theme.cardBorder}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${theme.cardText}`}>Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="text-xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{achievement.title}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No recent notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}