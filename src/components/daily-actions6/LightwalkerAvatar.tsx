'use client'

import { useState, useEffect } from 'react';
import { 
  User, 
  Activity as ActivityIcon, 
  Sparkles, 
  Heart,
  Brain,
  Zap,
  Target,
  Eye,
  Smile,
  Frown,
  Meh,
  Laugh,
  Focus
} from 'lucide-react';
import { LightwalkerState, Activity } from '@/types/daily-use';

interface LightwalkerAvatarProps {
  lightwalkerState: LightwalkerState;
  currentActivity?: Activity | null;
  onActivityFocus?: (activity: Activity) => void;
}

export default function LightwalkerAvatar({
  lightwalkerState,
  currentActivity,
  onActivityFocus
}: LightwalkerAvatarProps) {
  const [animationClass, setAnimationClass] = useState('');
  const [thoughtBubble, setThoughtBubble] = useState('');
  const [showThought, setShowThought] = useState(false);

  // Update animations based on Lightwalker state
  useEffect(() => {
    switch (lightwalkerState.avatarAnimation) {
      case 'active':
        setAnimationClass('animate-pulse');
        break;
      case 'celebrating':
        setAnimationClass('animate-bounce');
        break;
      case 'thinking':
        setAnimationClass('animate-pulse');
        break;
      default:
        setAnimationClass('');
    }
  }, [lightwalkerState.avatarAnimation]);

  // Generate contextual thoughts
  useEffect(() => {
    const generateThought = () => {
      if (currentActivity) {
        const thoughts = [
          `Ready to practice ${currentActivity.attribute}`,
          `${currentActivity.roleModel} would be proud`,
          `This ${currentActivity.category} activity builds character`,
          `Let's embody ${currentActivity.roleModel}'s wisdom`,
          `Time to grow through ${currentActivity.attribute}`
        ];
        setThoughtBubble(thoughts[Math.floor(Math.random() * thoughts.length)]);
      } else {
        const generalThoughts = [
          `Level ${lightwalkerState.level} and growing`,
          `${lightwalkerState.currentStreakDays} days of consistent growth`,
          'Ready for the next challenge',
          'Embodying wisdom from great minds',
          'Every small action builds character'
        ];
        setThoughtBubble(generalThoughts[Math.floor(Math.random() * generalThoughts.length)]);
      }
      setShowThought(true);
      setTimeout(() => setShowThought(false), 4000);
    };

    const interval = setInterval(generateThought, 8000);
    generateThought(); // Initial thought

    return () => clearInterval(interval);
  }, [currentActivity, lightwalkerState.level, lightwalkerState.currentStreakDays]);

  const getMoodIcon = (mood: LightwalkerState['currentMood']) => {
    switch (mood) {
      case 'energetic':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'focused':
        return <Target className="w-6 h-6 text-blue-500" />;
      case 'calm':
        return <Heart className="w-6 h-6 text-green-500" />;
      case 'reflective':
        return <Brain className="w-6 h-6 text-purple-500" />;
      case 'determined':
        return <Focus className="w-6 h-6 text-red-500" />;
      default:
        return <Smile className="w-6 h-6 text-gray-500" />;
    }
  };

  const getMoodEmoji = (mood: LightwalkerState['currentMood']) => {
    switch (mood) {
      case 'energetic': return '⚡';
      case 'focused': return '🎯';
      case 'calm': return '😌';
      case 'reflective': return '🤔';
      case 'determined': return '💪';
      default: return '😊';
    }
  };

  const getAvatarGradient = () => {
    if (currentActivity) {
      return `linear-gradient(135deg, ${currentActivity.roleModelColor}40, ${currentActivity.roleModelColor}20)`;
    }
    
    const dominantColor = lightwalkerState.dominantRoleModels[0]?.color || '#6366f1';
    return `linear-gradient(135deg, ${dominantColor}40, ${dominantColor}20)`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      {/* Thought Bubble */}
      {showThought && thoughtBubble && (
        <div className="absolute top-4 left-4 max-w-48 z-10">
          <div className="relative bg-white rounded-lg shadow-lg p-3 border-2 border-indigo-100">
            <p className="text-sm text-gray-700 font-medium">{thoughtBubble}</p>
            <div className="absolute bottom-0 left-6 transform translate-y-full">
              <div className="w-3 h-3 bg-white border-r-2 border-b-2 border-indigo-100 transform rotate-45" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">{lightwalkerState.name}</h2>
          <div className="flex items-center space-x-2">
            {getMoodIcon(lightwalkerState.currentMood)}
            <span className="text-sm font-medium text-gray-600 capitalize">
              {lightwalkerState.currentMood}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Level {lightwalkerState.level}</span>
          <span>•</span>
          <span>{lightwalkerState.totalPoints.toLocaleString()} total points</span>
          <span>•</span>
          <span>{lightwalkerState.currentStreakDays} day streak</span>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Main Avatar */}
        <div className={`relative mb-6 ${animationClass}`}>
          <div 
            className="w-32 h-32 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-6xl relative overflow-hidden"
            style={{ background: getAvatarGradient() }}
          >
            {/* Avatar Emoji/Character */}
            <div className="text-6xl">
              {getMoodEmoji(lightwalkerState.currentMood)}
            </div>
            
            {/* Attribute Glow Effects */}
            {lightwalkerState.attributeGlow.map((attribute, index) => (
              <div
                key={attribute}
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: `radial-gradient(circle, ${currentActivity?.roleModelColor}30 0%, transparent 70%)`,
                  animationDelay: `${index * 200}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
            
            {/* Status Indicators */}
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            
            {/* Streak Fire Effect */}
            {lightwalkerState.currentStreakDays >= 3 && (
              <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs">🔥</span>
              </div>
            )}
          </div>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            L{lightwalkerState.level}
          </div>
        </div>

        {/* Current Activity Status */}
        {currentActivity ? (
          <div className="w-full max-w-md">
            <div 
              className="bg-gradient-to-r p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg transform hover:scale-105"
              style={{ 
                backgroundColor: `${currentActivity.roleModelColor}10`,
                borderColor: `${currentActivity.roleModelColor}30`
              }}
              onClick={() => onActivityFocus?.(currentActivity)}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-1">Currently Practicing</div>
                <div className="font-bold text-gray-900 mb-1">{currentActivity.title}</div>
                <div className="text-sm text-gray-600 mb-3">{currentActivity.roleModel} • {currentActivity.attribute}</div>
                
                <div className="flex items-center justify-center space-x-4 text-xs">
                  <span className="flex items-center space-x-1">
                    <ActivityIcon className="w-3 h-3" />
                    <span>{currentActivity.duration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{currentActivity.difficulty}/9</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>{currentActivity.points} pts</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md text-center">
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6">
              <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                No active activity
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ready for the next challenge
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="text-xl font-bold text-blue-600">{lightwalkerState.activeAttributes.length}</div>
          <div className="text-xs text-blue-600">Active Traits</div>
        </div>
        
        <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
          <div className="text-xl font-bold text-purple-600">{lightwalkerState.dominantRoleModels.length}</div>
          <div className="text-xs text-purple-600">Role Models</div>
        </div>
        
        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
          <div className="text-xl font-bold text-green-600">{lightwalkerState.currentStreakDays}</div>
          <div className="text-xs text-green-600">Day Streak</div>
        </div>
      </div>

      {/* Animation Effects */}
      {lightwalkerState.avatarAnimation === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '1.5s'
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}