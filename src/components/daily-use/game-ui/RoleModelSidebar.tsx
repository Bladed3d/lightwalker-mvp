'use client'

import { useState } from 'react';
import { 
  User, 
  Star, 
  Sparkles, 
  ChevronRight, 
  Info,
  TrendingUp,
  Target,
  Heart
} from 'lucide-react';

interface RoleModel {
  name: string;
  influence: number; // 0-1
  color: string;
  archetype: string;
}

interface RoleModelSidebarProps {
  dominantRoleModels: RoleModel[];
  onRoleModelSelect: (roleModel: string) => void;
  selectedRoleModel: string | null;
}

export default function RoleModelSidebar({
  dominantRoleModels,
  onRoleModelSelect,
  selectedRoleModel
}: RoleModelSidebarProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  // Get role model emoji based on archetype
  const getRoleModelEmoji = (archetype: string) => {
    const emojiMap: Record<string, string> = {
      'wisdom-keeper': '🧘',
      'visionary': '🚀',
      'servant-leader': '✊',
      'warrior-saint': '⚔️',
      'truth-seeker': '🔬',
      'philosopher-king': '👑',
      'healer': '💚',
      'creator': '🎨',
      'explorer': '🧭',
      'builder': '🏗️'
    };
    return emojiMap[archetype] || '⭐';
  };

  // Get influence level description
  const getInfluenceLevel = (influence: number) => {
    if (influence >= 0.8) return { level: 'Dominant', color: 'text-red-400' };
    if (influence >= 0.6) return { level: 'Strong', color: 'text-orange-400' };
    if (influence >= 0.4) return { level: 'Moderate', color: 'text-yellow-400' };
    if (influence >= 0.2) return { level: 'Growing', color: 'text-green-400' };
    return { level: 'Emerging', color: 'text-blue-400' };
  };

  // Get sample attributes for each role model
  const getRoleModelAttributes = (name: string) => {
    const attributeMap: Record<string, string[]> = {
      'Buddha': ['Mindful Awareness', 'Compassionate Action', 'Inner Peace'],
      'Steve Jobs': ['Strategic Focus', 'Innovation Drive', 'Perfectionist Standards'],
      'Martin Luther King Jr.': ['Empathetic Leadership', 'Moral Courage', 'Visionary Communication'],
      'Joan of Arc': ['Courageous Action', 'Unwavering Faith', 'Leadership Under Pressure'],
      'Albert Einstein': ['Intellectual Curiosity', 'Creative Problem-Solving', 'Persistent Inquiry'],
      'Marcus Aurelius': ['Philosophical Reflection', 'Stoic Discipline', 'Ethical Leadership']
    };
    return attributeMap[name] || ['Wisdom', 'Courage', 'Compassion'];
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Role Models</h3>
          <p className="text-xs text-slate-400">Your guiding influences</p>
        </div>
      </div>

      {/* Role Model Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {dominantRoleModels.map((roleModel, index) => {
          const influenceLevel = getInfluenceLevel(roleModel.influence);
          const attributes = getRoleModelAttributes(roleModel.name);
          const isSelected = selectedRoleModel === roleModel.name;
          const isHovered = hoveredModel === roleModel.name;

          return (
            <div
              key={roleModel.name}
              className={`relative cursor-pointer transition-all duration-300 transform ${
                isSelected || isHovered ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => onRoleModelSelect(roleModel.name)}
              onMouseEnter={() => setHoveredModel(roleModel.name)}
              onMouseLeave={() => setHoveredModel(null)}
            >
              {/* Card Background */}
              <div 
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-white bg-slate-700/80 shadow-xl'
                    : isHovered
                      ? 'border-slate-500 bg-slate-700/60 shadow-lg'
                      : 'border-slate-600 bg-slate-700/40 hover:bg-slate-700/60'
                }`}
                style={{
                  background: isSelected || isHovered 
                    ? `linear-gradient(135deg, ${roleModel.color}20, ${roleModel.color}10)`
                    : undefined
                }}
              >
                {/* Influence Rank Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  {index + 1}
                </div>

                {/* Role Model Info */}
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-2xl shadow-lg"
                    style={{ backgroundColor: `${roleModel.color}40` }}
                  >
                    {getRoleModelEmoji(roleModel.archetype)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-white text-sm truncate">
                        {roleModel.name}
                      </h4>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${
                        isSelected ? 'rotate-90' : ''
                      }`} />
                    </div>

                    <p className="text-xs text-slate-400 capitalize mb-2">
                      {roleModel.archetype.replace('-', ' ')}
                    </p>

                    {/* Influence Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Influence</span>
                        <span className={`font-medium ${influenceLevel.color}`}>
                          {influenceLevel.level}
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${roleModel.influence * 100}%`,
                            background: `linear-gradient(90deg, ${roleModel.color}, ${roleModel.color}80)`
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Attributes */}
                    <div className="space-y-1">
                      {attributes.slice(0, 2).map((attribute, attrIndex) => (
                        <div key={attrIndex} className="flex items-center space-x-1 text-xs">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span className="text-slate-300 truncate">{attribute}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Influence Glow Effect */}
                {roleModel.influence > 0.7 && (
                  <div 
                    className="absolute inset-0 rounded-xl opacity-20 animate-pulse"
                    style={{ 
                      background: `radial-gradient(circle at center, ${roleModel.color}40, transparent 70%)`
                    }}
                  />
                )}
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <div className="mt-2 p-3 bg-slate-700/60 rounded-lg border border-slate-600">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-white">Active Attributes</h5>
                    <div className="space-y-1">
                      {attributes.map((attribute, attrIndex) => (
                        <div key={attrIndex} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{attribute}</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-8 h-1 bg-slate-600 rounded-full">
                              <div 
                                className="h-1 rounded-full"
                                style={{ 
                                  width: `${60 + Math.random() * 40}%`,
                                  backgroundColor: roleModel.color
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add More Models Button */}
        <div className="pt-4 border-t border-slate-600">
          <button className="w-full p-3 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-colors group">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="text-sm">Discover More</span>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Influence</span>
          <span className="text-white font-medium">
            {Math.round(dominantRoleModels.reduce((sum, model) => sum + model.influence, 0) * 100)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Active Models</span>
          <span className="text-blue-400 font-medium">{dominantRoleModels.length}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Top Archetype</span>
          <span className="text-purple-400 font-medium capitalize">
            {dominantRoleModels[0]?.archetype.replace('-', ' ') || 'None'}
          </span>
        </div>
      </div>
    </div>
  );
}