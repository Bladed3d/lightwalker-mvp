'use client'

import { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  Target,
  Brain,
  Heart,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Flame,
  Activity
} from 'lucide-react';
import { Activity as ActivityType } from '@/types/daily-use';

interface AttributeContainerProps {
  activeAttributes: string[];
  attributeGlow: string[];
  currentActivity?: ActivityType | null;
}

// Mock attribute data - in real app this would come from the database
const ATTRIBUTE_DETAILS = {
  'Mindful Awareness': {
    icon: '🧘',
    color: '#8B5A2B',
    description: 'Present-moment consciousness and non-judgmental observation',
    benefit: 'Reduces stress and increases emotional regulation',
    practices: ['Breathing meditation', 'Mindful walking', 'Body scanning'],
    level: 'Advanced',
    masteryPoints: 420
  },
  'Strategic Focus': {
    icon: '🎯',
    color: '#1C1C1E',
    description: 'Ability to concentrate on what matters most while eliminating distractions',
    benefit: 'Increases productivity and goal achievement',
    practices: ['Priority setting', 'Deep work sessions', 'Distraction elimination'],
    level: 'Intermediate',
    masteryPoints: 285
  },
  'Empathetic Leadership': {
    icon: '💝',
    color: '#4A90E2',
    description: 'Leading with understanding and compassion for others',
    benefit: 'Builds stronger teams and lasting relationships',
    practices: ['Active listening', 'Perspective taking', 'Collaborative decision-making'],
    level: 'Beginner',
    masteryPoints: 156
  },
  'Intellectual Curiosity': {
    icon: '🤔',
    color: '#6B73FF',
    description: 'Constant desire to learn and understand the world deeply',
    benefit: 'Expands knowledge and develops creative problem-solving',
    practices: ['Question everything', 'Read widely', 'Experiment boldly'],
    level: 'Intermediate',
    masteryPoints: 320
  },
  'Courageous Action': {
    icon: '⚔️',
    color: '#D4AF37',
    description: 'Taking bold action despite fear or uncertainty',
    benefit: 'Builds confidence and creates breakthrough moments',
    practices: ['Face fears daily', 'Take calculated risks', 'Stand for principles'],
    level: 'Advanced',
    masteryPoints: 478
  },
  'Philosophical Reflection': {
    icon: '🏛️',
    color: '#9C27B0',
    description: 'Deep contemplation about life, meaning, and wisdom',
    benefit: 'Develops wisdom and emotional resilience',
    practices: ['Daily journaling', 'Contemplative reading', 'Life examination'],
    level: 'Advanced',
    masteryPoints: 512
  }
};

export default function AttributeContainer({
  activeAttributes,
  attributeGlow,
  currentActivity
}: AttributeContainerProps) {
  const [expandedAttribute, setExpandedAttribute] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detailed'>('grid');

  const getAttributeDetails = (attributeName: string) => {
    return ATTRIBUTE_DETAILS[attributeName as keyof typeof ATTRIBUTE_DETAILS] || {
      icon: '⭐',
      color: '#6B73FF',
      description: 'A valuable character trait',
      benefit: 'Contributes to personal growth',
      practices: ['Practice regularly'],
      level: 'Beginner',
      masteryPoints: 0
    };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Beginner': return <Lightbulb className="w-4 h-4" />;
      case 'Intermediate': return <Zap className="w-4 h-4" />;
      case 'Advanced': return <Flame className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-500" />
            Active Attributes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {activeAttributes.length} traits shaping your character
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grid
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

      {/* Current Activity Highlight */}
      {currentActivity && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm">
              <span className="text-xl">{getAttributeDetails(currentActivity.attribute).icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">Currently Practicing</h4>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span className="text-sm text-indigo-600">Active</span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{currentActivity.attribute}</p>
              <p className="text-xs text-gray-600 mt-1">{getAttributeDetails(currentActivity.attribute).description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attributes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAttributes.map((attribute) => {
            const details = getAttributeDetails(attribute);
            const isGlowing = attributeGlow.includes(attribute);
            const isCurrent = currentActivity?.attribute === attribute;
            
            return (
              <div
                key={attribute}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  isCurrent
                    ? 'border-indigo-300 bg-indigo-50 shadow-lg'
                    : isGlowing
                      ? 'border-yellow-300 bg-yellow-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
                style={{
                  boxShadow: isGlowing ? `0 0 20px ${details.color}30` : undefined
                }}
                onClick={() => setExpandedAttribute(expandedAttribute === attribute ? null : attribute)}
              >
                {/* Glow Effect */}
                {isGlowing && (
                  <div 
                    className="absolute inset-0 rounded-lg animate-pulse"
                    style={{ 
                      background: `radial-gradient(circle, ${details.color}15 0%, transparent 70%)`
                    }}
                  />
                )}
                
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm"
                        style={{ backgroundColor: `${details.color}20` }}
                      >
                        {details.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{attribute}</h4>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(details.level)}`}>
                          {getLevelIcon(details.level)}
                          <span>{details.level}</span>
                        </div>
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <div className="flex items-center space-x-1 text-indigo-600">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span className="text-xs font-medium">Active</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Mastery Progress</span>
                      <span>{details.masteryPoints}/500</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, (details.masteryPoints / 500) * 100)}%`,
                          backgroundColor: details.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Info */}
                  <p className="text-xs text-gray-600 line-clamp-2">{details.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {activeAttributes.map((attribute) => {
            const details = getAttributeDetails(attribute);
            const isExpanded = expandedAttribute === attribute;
            const isGlowing = attributeGlow.includes(attribute);
            const isCurrent = currentActivity?.attribute === attribute;
            
            return (
              <div
                key={attribute}
                className={`border-2 rounded-lg transition-all duration-300 ${
                  isCurrent
                    ? 'border-indigo-300 bg-indigo-50'
                    : isGlowing
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-gray-200 bg-white'
                }`}
                style={{
                  boxShadow: isGlowing ? `0 0 20px ${details.color}30` : undefined
                }}
              >
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedAttribute(isExpanded ? null : attribute)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-sm"
                        style={{ backgroundColor: `${details.color}20` }}
                      >
                        {details.icon}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-semibold text-gray-900">{attribute}</h4>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(details.level)}`}>
                            {getLevelIcon(details.level)}
                            <span>{details.level}</span>
                          </div>
                          {isCurrent && (
                            <div className="flex items-center space-x-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              <Activity className="w-3 h-3 animate-pulse" />
                              <span>Active</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{details.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${Math.min(100, (details.masteryPoints / 500) * 100)}%`,
                                  backgroundColor: details.color
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            {details.masteryPoints}/500
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
                      {/* Benefit */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <Heart className="w-4 h-4 mr-2 text-red-500" />
                          Why This Matters
                        </h5>
                        <p className="text-sm text-gray-700">{details.benefit}</p>
                      </div>

                      {/* Practices */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-green-500" />
                          Key Practices
                        </h5>
                        <div className="space-y-1">
                          {details.practices.map((practice, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                              <span>{practice}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: details.color }}>
                            {Math.floor(details.masteryPoints / 10)}
                          </div>
                          <div className="text-xs text-gray-600">Days Practiced</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: details.color }}>
                            {Math.floor(details.masteryPoints / 500 * 100)}%
                          </div>
                          <div className="text-xs text-gray-600">Mastery</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{ color: details.color }}>
                            {500 - details.masteryPoints}
                          </div>
                          <div className="text-xs text-gray-600">To Master</div>
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

      {activeAttributes.length === 0 && (
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Attributes</h4>
          <p className="text-gray-600">Complete your Lightwalker setup to see your active traits here.</p>
        </div>
      )}
    </div>
  );
}