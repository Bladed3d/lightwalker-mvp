'use client'

import { useState, useEffect } from 'react';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Flame, 
  Star,
  Crown,
  Sparkles,
  Activity,
  Shield
} from 'lucide-react';
import { LightwalkerState } from '@/types/daily-use';

interface StatusCircleProps {
  lightwalkerState: LightwalkerState;
  completionPercentage: number;
  syncLevel: number; // 0-100
  streakDays: number;
  animated: boolean;
}

export default function StatusCircle({
  lightwalkerState,
  completionPercentage,
  syncLevel,
  streakDays,
  animated
}: StatusCircleProps) {
  const [animatedCompletion, setAnimatedCompletion] = useState(0);
  const [animatedSync, setAnimatedSync] = useState(0);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Animate progress bars
  useEffect(() => {
    if (animated) {
      const completionTimer = setTimeout(() => {
        setAnimatedCompletion(completionPercentage);
      }, 300);
      
      const syncTimer = setTimeout(() => {
        setAnimatedSync(syncLevel);
      }, 600);

      return () => {
        clearTimeout(completionTimer);
        clearTimeout(syncTimer);
      };
    } else {
      setAnimatedCompletion(completionPercentage);
      setAnimatedSync(syncLevel);
    }
  }, [completionPercentage, syncLevel, animated]);

  // Pulse effect for achievements
  useEffect(() => {
    if (completionPercentage === 100 || syncLevel >= 90) {
      setPulseEffect(true);
      const timer = setTimeout(() => setPulseEffect(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [completionPercentage, syncLevel]);

  // Calculate circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const completionStrokeOffset = circumference - (animatedCompletion / 100) * circumference;
  const syncStrokeOffset = circumference - (animatedSync / 100) * circumference;

  // Get status color based on sync level
  const getStatusColor = (level: number) => {
    if (level >= 90) return { color: '#10b981', glow: '#10b98140' }; // Emerald
    if (level >= 70) return { color: '#3b82f6', glow: '#3b82f640' }; // Blue
    if (level >= 50) return { color: '#f59e0b', glow: '#f59e0b40' }; // Amber
    if (level >= 30) return { color: '#ef4444', glow: '#ef444440' }; // Red
    return { color: '#6b7280', glow: '#6b728040' }; // Gray
  };

  const statusColor = getStatusColor(syncLevel);

  // Get sync level description
  const getSyncDescription = (level: number) => {
    if (level >= 90) return 'Perfect Sync';
    if (level >= 70) return 'High Sync';
    if (level >= 50) return 'Good Sync';
    if (level >= 30) return 'Building Sync';
    return 'Starting Out';
  };

  // Get streak tier
  const getStreakTier = (days: number) => {
    if (days >= 30) return { tier: 'Legendary', icon: Crown, color: 'text-purple-400' };
    if (days >= 14) return { tier: 'Epic', icon: Star, color: 'text-yellow-400' };
    if (days >= 7) return { tier: 'Great', icon: Flame, color: 'text-orange-400' };
    if (days >= 3) return { tier: 'Good', icon: TrendingUp, color: 'text-green-400' };
    return { tier: 'Building', icon: Target, color: 'text-blue-400' };
  };

  const streakTier = getStreakTier(streakDays);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div 
        className={`absolute inset-0 rounded-xl transition-opacity duration-1000 ${
          pulseEffect ? 'opacity-30 animate-pulse' : 'opacity-10'
        }`}
        style={{ backgroundColor: statusColor.glow }}
      />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-white mb-1">Sync Status</h3>
        <p className="text-sm text-slate-400">
          {getSyncDescription(syncLevel)} • Level {lightwalkerState.level}
        </p>
      </div>

      {/* Main Circle Container */}
      <div className="relative flex items-center justify-center mb-6">
        {/* SVG Circles */}
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            opacity="0.3"
          />
          
          {/* Completion Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#6366f1"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={completionStrokeOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            opacity="0.7"
          />
          
          {/* Sync Level Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={statusColor.color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={syncStrokeOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${statusColor.glow})`
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Sync Level */}
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(syncLevel)}%
            </div>
            <div className="text-xs text-slate-400">
              Sync Level
            </div>
          </div>

          {/* Lightwalker Avatar */}
          <div className={`mt-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${
            animated ? 'animate-pulse' : ''
          }`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Floating Status Indicators */}
        {syncLevel >= 90 && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <Crown className="w-3 h-3 text-white" />
          </div>
        )}

        {streakDays >= 7 && (
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Flame className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {/* Daily Progress */}
        <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-4 h-4 text-blue-400 mr-1" />
            <span className="text-sm font-medium text-white">
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <div className="text-xs text-slate-400">Daily Progress</div>
        </div>

        {/* Streak */}
        <div className="text-center p-3 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="flex items-center justify-center mb-2">
            <streakTier.icon className={`w-4 h-4 mr-1 ${streakTier.color}`} />
            <span className="text-sm font-medium text-white">
              {streakDays}
            </span>
          </div>
          <div className="text-xs text-slate-400">Day Streak</div>
        </div>
      </div>

      {/* Achievements Preview */}
      <div className="mt-4 pt-4 border-t border-slate-600 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Active Attributes</span>
          <span className="text-sm text-white font-medium">
            {lightwalkerState.activeAttributes.length}
          </span>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {lightwalkerState.activeAttributes.slice(0, 3).map((attribute, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-slate-600/50 rounded-full text-xs text-slate-300 truncate"
            >
              {attribute.split(' ').map(word => word[0]).join('')}
            </span>
          ))}
          {lightwalkerState.activeAttributes.length > 3 && (
            <span className="px-2 py-1 bg-slate-600/50 rounded-full text-xs text-slate-400">
              +{lightwalkerState.activeAttributes.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Sync Level Indicator */}
      <div className="mt-4 relative z-10">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Sync Level</span>
          <span>{getSyncDescription(syncLevel)}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${animatedSync}%`,
              backgroundColor: statusColor.color,
              boxShadow: `0 0 8px ${statusColor.glow}`
            }}
          />
        </div>
      </div>

      {/* Pulse Animation for Perfect Days */}
      {completionPercentage === 100 && (
        <div className="absolute inset-0 rounded-xl border-2 border-emerald-400 animate-ping opacity-75" />
      )}
    </div>
  );
}