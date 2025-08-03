'use client'

import { useState } from 'react';
import { 
  Crown, 
  Users, 
  TrendingUp,
  Star,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Target,
  Award,
  Eye,
  Sparkles
} from 'lucide-react';
import { LightwalkerState, Activity as ActivityType } from '@/types/daily-use';

interface RoleModelInfluencesProps {
  dominantRoleModels: LightwalkerState['dominantRoleModels'];
  currentActivity?: ActivityType | null;
}

// Extended role model information
const ROLE_MODEL_INFO = {
  'Buddha': {
    archetype: 'Wisdom Keeper',
    era: '563-483 BCE',
    domain: 'Mindfulness & Compassion',
    quote: 'The mind is everything. What you think you become.',
    keyTeachings: ['Mindful awareness', 'Compassionate action', 'Inner peace'],
    modernRelevance: 'Stress management and emotional intelligence',
    influence: 'Eastern Philosophy & Meditation',
    practices: ['Meditation', 'Mindful breathing', 'Loving-kindness']
  },
  'Steve Jobs': {
    archetype: 'Visionary',
    era: '1955-2011',
    domain: 'Innovation & Design',
    quote: 'Stay hungry. Stay foolish.',
    keyTeachings: ['Strategic focus', 'Perfectionist mindset', 'Think different'],
    modernRelevance: 'Product development and leadership',
    influence: 'Technology & Design',
    practices: ['Deep focus', 'Iteration', 'Simplification']
  },
  'Martin Luther King Jr.': {
    archetype: 'Servant Leader',
    era: '1929-1968',
    domain: 'Social Justice & Leadership',
    quote: 'Darkness cannot drive out darkness; only light can do that.',
    keyTeachings: ['Empathetic leadership', 'Moral courage', 'Nonviolent resistance'],
    modernRelevance: 'Leadership and social change',
    influence: 'Civil Rights & Leadership',
    practices: ['Active listening', 'Moral courage', 'Community building']
  },
  'Joan of Arc': {
    archetype: 'Warrior Saint',
    era: '1412-1431',
    domain: 'Courage & Faith',
    quote: 'I am not afraid... I was born to do this.',
    keyTeachings: ['Courageous action', 'Unwavering faith', 'Divine purpose'],
    modernRelevance: 'Overcoming fear and taking bold action',
    influence: 'French History & Courage',
    practices: ['Face fears', 'Take action', 'Trust intuition']
  },
  'Albert Einstein': {
    archetype: 'Truth Seeker',
    era: '1879-1955',
    domain: 'Science & Philosophy',
    quote: 'Imagination is more important than knowledge.',
    keyTeachings: ['Intellectual curiosity', 'Creative thinking', 'Questioning assumptions'],
    modernRelevance: 'Innovation and problem-solving',
    influence: 'Science & Philosophy',
    practices: ['Question everything', 'Thought experiments', 'Creative play']
  },
  'Marcus Aurelius': {
    archetype: 'Philosopher King',
    era: '121-180 CE',
    domain: 'Stoic Philosophy & Leadership',
    quote: 'You have power over your mind - not outside events.',
    keyTeachings: ['Philosophical reflection', 'Self-discipline', 'Rational thinking'],
    modernRelevance: 'Emotional resilience and leadership',
    influence: 'Stoic Philosophy & Leadership',
    practices: ['Daily reflection', 'Self-examination', 'Acceptance']
  }
};

export default function RoleModelInfluences({
  dominantRoleModels,
  currentActivity
}: RoleModelInfluencesProps) {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'influence' | 'detailed'>('influence');

  const getRoleModelInfo = (name: string) => {
    return ROLE_MODEL_INFO[name as keyof typeof ROLE_MODEL_INFO] || {
      archetype: 'Guide',
      era: 'Unknown',
      domain: 'Wisdom',
      quote: 'Wisdom comes from experience.',
      keyTeachings: ['Personal growth'],
      modernRelevance: 'Character development',
      influence: 'Personal Development',
      practices: ['Practice regularly']
    };
  };

  const getInfluenceWidth = (influence: number) => {
    return Math.max(10, influence * 100); // Minimum 10% width
  };

  const getInfluenceColor = (influence: number) => {
    if (influence >= 0.7) return 'from-purple-500 to-pink-500';
    if (influence >= 0.5) return 'from-blue-500 to-indigo-500';
    if (influence >= 0.3) return 'from-green-500 to-teal-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-purple-500" />
            Role Model Influences
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            The wisdom guiding your character development
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('influence')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'influence'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Influence
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Current Activity Context */}
      {currentActivity && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-xl"
              style={{ backgroundColor: currentActivity.roleModelColor + '20' }}
            >
              <Users className="w-5 h-5" style={{ color: currentActivity.roleModelColor }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">Currently Channeling</h4>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-sm text-amber-600">Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{currentActivity.roleModel}</p>
              <p className="text-xs text-gray-600 mt-1">
                {getRoleModelInfo(currentActivity.roleModel).domain}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Models Display */}
      {viewMode === 'influence' ? (
        <div className="space-y-4">
          {dominantRoleModels.map((roleModel, index) => {
            const info = getRoleModelInfo(roleModel.name);
            const isCurrent = currentActivity?.roleModel === roleModel.name;
            
            return (
              <div
                key={roleModel.name}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  isCurrent
                    ? 'border-amber-300 bg-amber-50 shadow-lg'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => setExpandedModel(expandedModel === roleModel.name ? null : roleModel.name)}
              >
                {/* Influence Rank Badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {index + 1}
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm text-xl font-bold text-white"
                    style={{ backgroundColor: roleModel.color }}
                  >
                    {roleModel.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{roleModel.name}</h4>
                      {isCurrent && (
                        <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{info.archetype} • {info.domain}</p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: roleModel.color }}>
                      {Math.round(roleModel.influence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Influence</div>
                  </div>
                </div>

                {/* Influence Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r transition-all duration-1000 ${getInfluenceColor(roleModel.influence)}`}
                      style={{ width: `${getInfluenceWidth(roleModel.influence)}%` }}
                    />
                  </div>
                </div>

                {/* Quote Preview */}
                <div className="text-sm text-gray-600 italic">
                  "{info.quote}"
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {dominantRoleModels.map((roleModel, index) => {
            const info = getRoleModelInfo(roleModel.name);
            const isExpanded = expandedModel === roleModel.name;
            const isCurrent = currentActivity?.roleModel === roleModel.name;
            
            return (
              <div
                key={roleModel.name}
                className={`border-2 rounded-lg transition-all duration-300 ${
                  isCurrent
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedModel(isExpanded ? null : roleModel.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center shadow-sm text-2xl font-bold text-white"
                          style={{ backgroundColor: roleModel.color }}
                        >
                          {roleModel.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{roleModel.name}</h4>
                          {isCurrent && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              <Activity className="w-3 h-3 animate-pulse" />
                              <span>Active</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">{info.archetype}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{info.era}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{info.domain}</p>
                        
                        {/* Influence Bar */}
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r transition-all duration-1000 ${getInfluenceColor(roleModel.influence)}`}
                                style={{ width: `${getInfluenceWidth(roleModel.influence)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: roleModel.color }}>
                            {Math.round(roleModel.influence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200">
                    <div className="pt-4 space-y-4">
                      {/* Quote */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                        <blockquote className="text-gray-700 italic text-center">
                          "{info.quote}"
                        </blockquote>
                      </div>

                      {/* Key Teachings */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-2 text-yellow-500" />
                          Key Teachings
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {info.keyTeachings.map((teaching, idx) => (
                            <div key={idx} className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 text-center">
                              {teaching}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Modern Relevance */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                          Modern Relevance
                        </h5>
                        <p className="text-sm text-gray-700">{info.modernRelevance}</p>
                      </div>

                      {/* Practices */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-500" />
                          Daily Practices
                        </h5>
                        <div className="space-y-1">
                          {info.practices.map((practice, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: roleModel.color }} />
                              <span>{practice}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Influence Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: roleModel.color }}>
                            #{index + 1}
                          </div>
                          <div className="text-xs text-gray-600">Influence Rank</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: roleModel.color }}>
                            {Math.round(roleModel.influence * 100)}%
                          </div>
                          <div className="text-xs text-gray-600">Influence Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: roleModel.color }}>
                            {info.influence.split(' ')[0]}
                          </div>
                          <div className="text-xs text-gray-600">Domain</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {dominantRoleModels.length === 0 && (
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Role Model Influences</h4>
          <p className="text-gray-600">Complete your Lightwalker setup to see your guiding influences here.</p>
        </div>
      )}
    </div>
  );
}