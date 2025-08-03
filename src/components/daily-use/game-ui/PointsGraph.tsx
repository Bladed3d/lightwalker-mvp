'use client'

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Star,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { DailyUseStats } from '@/types/daily-use';

interface PointsGraphProps {
  stats: DailyUseStats | null;
  recentDays: number;
}

export default function PointsGraph({
  stats,
  recentDays = 6
}: PointsGraphProps) {
  const [animatedBars, setAnimatedBars] = useState<number[]>([]);

  // Generate mock data for the last 6 days (in real app this would come from API)
  const generateMockData = () => {
    const today = new Date();
    const data = [];
    
    for (let i = recentDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isToday = i === 0;
      
      // Generate realistic-looking data
      const scheduledPoints = Math.floor(Math.random() * 150) + 50;
      const extraCreditPoints = Math.floor(Math.random() * 80) + 20;
      const totalPoints = isToday && stats ? stats.todayPoints : scheduledPoints + extraCreditPoints;
      
      data.push({
        day: dayName,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scheduledPoints,
        extraCreditPoints,
        totalPoints,
        isToday,
        completionRate: Math.floor(Math.random() * 40) + 60 // 60-100%
      });
    }
    
    return data;
  };

  const chartData = generateMockData();

  // Find max points for scaling
  const maxPoints = Math.max(...chartData.map(d => d.totalPoints));
  const averagePoints = chartData.reduce((sum, d) => sum + d.totalPoints, 0) / chartData.length;

  // Animate bars on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedBars(chartData.map(d => d.totalPoints));
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Calculate trend
  const todayPoints = chartData[chartData.length - 1]?.totalPoints || 0;
  const yesterdayPoints = chartData[chartData.length - 2]?.totalPoints || 0;
  const trendPercentage = yesterdayPoints > 0 
    ? ((todayPoints - yesterdayPoints) / yesterdayPoints) * 100 
    : 0;

  const isPositiveTrend = trendPercentage > 0;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">6-Day Points</h3>
            <p className="text-xs text-slate-400">Scheduled vs Extra Credit</p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center space-x-1 text-sm ${
          isPositiveTrend ? 'text-green-400' : 'text-red-400'
        }`}>
          {isPositiveTrend ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="font-medium">
            {Math.abs(trendPercentage).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-end justify-between space-x-1 mb-4">
        {chartData.map((dayData, index) => {
          const barHeight = (animatedBars[index] || 0) / maxPoints * 100;
          const scheduledHeight = (dayData.scheduledPoints / maxPoints) * 100;
          const extraHeight = (dayData.extraCreditPoints / maxPoints) * 100;

          return (
            <div key={dayData.day} className="flex-1 flex flex-col items-center space-y-2">
              {/* Bar Container */}
              <div className="relative w-full h-32 flex flex-col justify-end">
                {/* Extra Credit Bar (top) */}
                <div 
                  className={`w-full bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-md transition-all duration-1000 ease-out ${
                    dayData.isToday ? 'shadow-lg shadow-yellow-500/30' : ''
                  }`}
                  style={{ 
                    height: `${extraHeight}%`,
                    transitionDelay: `${index * 100}ms`
                  }}
                />
                
                {/* Scheduled Bar (bottom) */}
                <div 
                  className={`w-full bg-gradient-to-t from-blue-500 to-purple-500 ${
                    dayData.extraCreditPoints > 0 ? '' : 'rounded-t-md'
                  } rounded-b-md transition-all duration-1000 ease-out ${
                    dayData.isToday ? 'shadow-lg shadow-blue-500/30' : ''
                  }`}
                  style={{ 
                    height: `${scheduledHeight}%`,
                    transitionDelay: `${index * 100 + 200}ms`
                  }}
                />

                {/* Today Indicator */}
                {dayData.isToday && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                )}

                {/* Points Label */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white bg-slate-800/80 rounded px-1">
                  {dayData.totalPoints}
                </div>
              </div>

              {/* Day Label */}
              <div className="text-center">
                <div className={`text-xs font-medium ${
                  dayData.isToday ? 'text-white' : 'text-slate-400'
                }`}>
                  {dayData.day}
                </div>
                <div className="text-xs text-slate-500">
                  {dayData.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mb-4 text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
            <span className="text-slate-400">Scheduled</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded" />
            <span className="text-slate-400">Extra Credit</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>6 days</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-600">
        {/* Average */}
        <div className="text-center">
          <div className="text-sm font-bold text-blue-400">
            {Math.round(averagePoints)}
          </div>
          <div className="text-xs text-slate-400">Avg/Day</div>
        </div>

        {/* Best Day */}
        <div className="text-center">
          <div className="text-sm font-bold text-green-400">
            {maxPoints}
          </div>
          <div className="text-xs text-slate-400">Best Day</div>
        </div>

        {/* Total */}
        <div className="text-center">
          <div className="text-sm font-bold text-purple-400">
            {chartData.reduce((sum, d) => sum + d.totalPoints, 0)}
          </div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
      </div>

      {/* Achievement Milestone */}
      {todayPoints > averagePoints * 1.2 && (
        <div className="mt-3 p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300 font-medium">
              20% above average today!
            </span>
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-2 text-center">
        <p className="text-xs text-slate-500">
          {isPositiveTrend 
            ? "Building momentum! Keep it up! 🚀" 
            : "Every day is a new opportunity 💪"}
        </p>
      </div>
    </div>
  );
}