'use client'

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Star, 
  Zap, 
  Target, 
  Trophy,
  Crown,
  Medal,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DailyUseStats, Achievement } from '@/types/daily-use';

interface ProgressBarsProps {
  stats: DailyUseStats | null;
  achievements: Achievement[];
  lightwalkerLevel: number;
}

export default function ProgressBars({
  stats,
  achievements,
  lightwalkerLevel
}: ProgressBarsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    points: 0,
    level: 0,
    consistency: 0
  });

  // Animate progress bars
  useEffect(() => {
    if (stats) {
      const timer = setTimeout(() => {
        setAnimatedValues({
          points: stats.todayPoints,
          level: ((stats.todayPoints / (stats.todayPoints + stats.pointsToNextLevel)) * 100),
          consistency: stats.consistencyScore
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [stats]);

  if (!stats) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
        <div className="text-center text-slate-400">
          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Loading progress...</p>
        </div>
      </div>
    );
  }

  // Calculate level progress
  const levelProgress = (stats.todayPoints / (stats.todayPoints + stats.pointsToNextLevel)) * 100;
  
  // Get level tier info
  const getLevelTier = (level: number) => {
    if (level >= 10) return { name: 'Master', color: 'from-purple-500 to-pink-500', icon: Crown };
    if (level >= 7) return { name: 'Expert', color: 'from-yellow-500 to-orange-500', icon: Trophy };
    if (level >= 5) return { name: 'Advanced', color: 'from-blue-500 to-cyan-500', icon: Medal };
    if (level >= 3) return { name: 'Intermediate', color: 'from-green-500 to-emerald-500', icon: Star };
    return { name: 'Beginner', color: 'from-slate-500 to-slate-400', icon: Target };
  };

  const levelTier = getLevelTier(lightwalkerLevel);

  // Get consistency rating
  const getConsistencyRating = (score: number) => {
    if (score >= 90) return { rating: 'Exceptional', color: 'text-purple-400' };
    if (score >= 80) return { rating: 'Excellent', color: 'text-green-400' };
    if (score >= 70) return { rating: 'Good', color: 'text-blue-400' };
    if (score >= 60) return { rating: 'Fair', color: 'text-yellow-400' };
    return { rating: 'Building', color: 'text-orange-400' };
  };

  const consistencyRating = getConsistencyRating(stats.consistencyScore);

  // Recent achievements (unlocked)
  const recentAchievements = achievements.filter(a => a.isUnlocked).slice(-3);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-white">Progress</h3>
        </div>

        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <TrendingUp className="w-3 h-3" />
          <span>Live</span>
        </div>
      </div>

      {/* Points Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Today's Points</span>
          </div>
          <span className="text-sm font-bold text-yellow-400">
            {stats.todayPoints.toLocaleString()}
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, (animatedValues.points / 200) * 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-400">
          <span>0</span>
          <span>Daily goal: 200</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <levelTier.icon className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">
              Level {lightwalkerLevel} ({levelTier.name})
            </span>
          </div>
          <span className="text-sm text-slate-400">
            {stats.pointsToNextLevel} to next
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`bg-gradient-to-r ${levelTier.color} h-2 rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${animatedValues.level}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-400">
          <span>Level {lightwalkerLevel}</span>
          <span>Level {lightwalkerLevel + 1}</span>
        </div>
      </div>

      {/* Consistency Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Consistency</span>
          </div>
          <span className={`text-sm font-medium ${consistencyRating.color}`}>
            {consistencyRating.rating}
          </span>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedValues.consistency}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-400">
          <span>{Math.round(stats.consistencyScore)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-600">
        {/* Perfect Days */}
        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
          <div className="text-lg font-bold text-purple-400">{stats.perfectDays}</div>
          <div className="text-xs text-slate-400">Perfect Days</div>
        </div>

        {/* Weekly Average */}
        <div className="text-center p-2 bg-slate-700/30 rounded-lg">
          <div className="text-lg font-bold text-blue-400">{stats.weeklyAverage}</div>
          <div className="text-xs text-slate-400">Weekly Avg</div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="pt-2 border-t border-slate-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Recent Achievements</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className="flex items-center space-x-3 p-2 bg-slate-700/20 rounded-lg border border-slate-600"
              >
                <div className="text-lg">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {achievement.description}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="pt-2 text-center">
        <div className="flex items-center justify-center space-x-1 text-xs text-slate-500">
          <Sparkles className="w-3 h-3" />
          <span>
            {stats.todayPoints > stats.weeklyAverage 
              ? "Exceeding your average today!" 
              : "Keep building your momentum!"}
          </span>
        </div>
      </div>
    </div>
  );
}