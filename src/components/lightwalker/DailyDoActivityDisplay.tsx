'use client'

// Daily-Do Activity Display Component
// Purpose: Show enhanced Daily-Do items with fallback to original methods
// Safety: Works perfectly with or without enhancements

import { useState } from 'react'
import { DailyDoItem, AttributeEnhancement } from '@/types/daily-do-types'

interface AttributeData {
  name: string
  description: string
  benefit?: string
  oppositeOf?: string
  method: string
}

interface ActivityDisplayProps {
  attribute: AttributeData
  roleModelName: string
  dailyDoEnhancement?: AttributeEnhancement | null
  showEnhanced?: boolean
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  onItemComplete?: (itemId: string) => void
  className?: string
}

export default function DailyDoActivityDisplay({
  attribute,
  roleModelName,
  dailyDoEnhancement,
  showEnhanced = true,
  userLevel = 'beginner',
  onItemComplete,
  className = ''
}: ActivityDisplayProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())

  // Determine what to show: enhanced items or fallback to original method
  const hasEnhancements = showEnhanced && dailyDoEnhancement?.dailyDoItems && dailyDoEnhancement.dailyDoItems.length > 0
  const dailyDoItems = dailyDoEnhancement?.dailyDoItems || []

  const handleItemComplete = (itemId: string) => {
    setCompletedItems(prev => new Set([...Array.from(prev), itemId]))
    onItemComplete?.(itemId)
  }

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty <= 3) return 'text-green-400 bg-green-400/20'
    if (difficulty <= 6) return 'text-yellow-400 bg-yellow-400/20'
    return 'text-red-400 bg-red-400/20'
  }

  const getTimeOfDayIcon = (timeOfDay: string): string => {
    switch (timeOfDay) {
      case 'morning': return '🌅'
      case 'evening': return '🌆'
      case 'work-hours': return '💼'
      case 'anytime': return '⏰'
      default: return '📅'
    }
  }

  return (
    <div className={`bg-gray-800/30 border border-gray-600 rounded-lg p-4 ${className}`}>
      {/* Attribute Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-semibold text-cyan-400">{attribute.name}</h4>
          {hasEnhancements && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">
                ✨ Enhanced
              </span>
              <span className="text-xs text-gray-400">
                {dailyDoItems.length} Daily-Do{dailyDoItems.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        {attribute.description && (
          <p className="text-sm text-gray-300 mb-2">{attribute.description}</p>
        )}
        
        {attribute.benefit && (
          <p className="text-sm text-green-400 italic">✨ {attribute.benefit}</p>
        )}
      </div>

      {/* Enhanced Daily-Do Items */}
      {hasEnhancements ? (
        <div className="space-y-3">
          <div className="text-xs text-cyan-300 font-medium mb-2">
            🚀 Concrete Daily Actions ({roleModelName}'s Method):
          </div>
          
          {dailyDoItems.map((item) => (
            <div 
              key={item.id}
              className={`border rounded-lg p-3 transition-all duration-200 ${
                completedItems.has(item.id)
                  ? 'bg-green-900/20 border-green-500/50'
                  : 'bg-gray-700/30 border-gray-600 hover:border-cyan-500/50'
              }`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    completedItems.has(item.id) ? 'text-green-300' : 'text-white'
                  }`}>
                    {item.action}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-3">
                  {/* Difficulty Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span>
                  
                  {/* Game Points */}
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                    {item.gamePoints}pts
                  </span>
                </div>
              </div>

              {/* Item Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    {getTimeOfDayIcon(item.timeOfDay)} {item.timeOfDay}
                  </span>
                  <span>⏱️ {item.duration}</span>
                  <span className="capitalize">📂 {item.category}</span>
                </div>
                
                <button
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {expandedItem === item.id ? '🔼 Less' : '🔽 More'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-600 space-y-2">
                  <div>
                    <span className="text-xs font-medium text-green-400">✅ Success Criteria:</span>
                    <p className="text-sm text-gray-300 mt-1">{item.successCriteria}</p>
                  </div>
                  
                  {item.materials && item.materials.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-blue-400">🛠️ Materials Needed:</span>
                      <p className="text-sm text-gray-300 mt-1">{item.materials.join(', ')}</p>
                    </div>
                  )}
                  
                  {item.location && (
                    <div>
                      <span className="text-xs font-medium text-yellow-400">📍 Location:</span>
                      <p className="text-sm text-gray-300 mt-1 capitalize">{item.location}</p>
                    </div>
                  )}
                  
                  {item.socialContext && (
                    <div>
                      <span className="text-xs font-medium text-purple-400">👥 Social Context:</span>
                      <p className="text-sm text-gray-300 mt-1 capitalize">{item.socialContext}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  ID: {item.id}
                </div>
                
                {!completedItems.has(item.id) ? (
                  <button
                    onClick={() => handleItemComplete(item.id)}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded-full transition-colors duration-200"
                  >
                    Mark Complete
                  </button>
                ) : (
                  <div className="flex items-center text-green-400 text-xs">
                    ✅ Completed
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Enhancement Metadata */}
          {dailyDoEnhancement && (
            <div className="mt-4 pt-3 border-t border-gray-700 text-xs text-gray-500">
              <div className="flex justify-between items-center">
                <span>Enhanced: {new Date(dailyDoEnhancement.enhancedAt).toLocaleDateString()}</span>
                <span>Version: {dailyDoEnhancement.enhancedVersion}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback: Original Method Display */
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <span className="text-yellow-400 text-sm font-medium">🔧 {roleModelName}'s Method:</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{attribute.method}</p>
          
          {!showEnhanced && (
            <div className="mt-2 text-xs text-gray-500">
              💡 Enhanced Daily-Do actions coming soon!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Utility component for showing multiple attributes
interface MultiAttributeDisplayProps {
  attributes: AttributeData[]
  roleModelName: string
  dailyDoEnhancements?: { [attributeId: string]: AttributeEnhancement }
  showEnhanced?: boolean
  userLevel?: 'beginner' | 'intermediate' | 'advanced'
  onItemComplete?: (itemId: string, attributeName: string) => void
}

export function MultiAttributeDisplay({
  attributes,
  roleModelName,
  dailyDoEnhancements,
  showEnhanced = true,
  userLevel = 'beginner',
  onItemComplete
}: MultiAttributeDisplayProps) {
  const handleItemComplete = (itemId: string, attributeName: string) => {
    onItemComplete?.(itemId, attributeName)
  }

  return (
    <div className="space-y-4">
      {attributes.map((attribute, index) => {
        const attributeId = attribute.name.toLowerCase().replace(/\s+/g, '-')
        const enhancement = dailyDoEnhancements?.[attributeId]
        
        return (
          <DailyDoActivityDisplay
            key={index}
            attribute={attribute}
            roleModelName={roleModelName}
            dailyDoEnhancement={enhancement}
            showEnhanced={showEnhanced}
            userLevel={userLevel}
            onItemComplete={(itemId) => handleItemComplete(itemId, attribute.name)}
          />
        )
      })}
    </div>
  )
}

// Feature flag hook for A/B testing
export function useEnhancedActivities(userId?: string): boolean {
  // For now, return true for all users
  // Later: implement feature flag logic based on user ID
  return true
}

// Analytics helper for tracking enhancement usage
export function trackEnhancementInteraction(
  action: 'view' | 'expand' | 'complete',
  itemId: string,
  attributeName: string,
  userId?: string
) {
  // Log enhancement interaction for analytics
  console.log('Enhancement interaction:', {
    action,
    itemId,
    attributeName,
    userId,
    timestamp: new Date().toISOString()
  })
  
  // TODO: Send to analytics service
}