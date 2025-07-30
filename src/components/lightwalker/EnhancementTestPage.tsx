'use client'

// Enhancement Test Page
// Purpose: Test the Daily-Do enhancement system with sample data
// Use: Add to a test page to verify everything works

import { useState, useEffect } from 'react'
import DailyDoActivityDisplay, { MultiAttributeDisplay } from './DailyDoActivityDisplay'
import { AttributeEnhancement, DailyDoItem } from '@/types/daily-do-types'

// Sample test data to verify the system works
const sampleAttribute = {
  name: "Strategic Focus",
  description: "The ability to identify what matters most and eliminate everything else",
  benefit: "Achieve breakthrough results by concentrating energy on high-impact activities",
  oppositeOf: "Scattered attention and reactive decision-making", 
  method: "List 10 priorities, then cross out 7. Only work on the remaining 3."
}

const sampleDailyDoItems: DailyDoItem[] = [
  {
    id: "sj-sf-001",
    action: "I write down exactly 10 current tasks on a piece of paper using a pen",
    difficulty: 2,
    duration: "3-5 minutes",
    timeOfDay: "morning",
    category: "planning",
    successCriteria: "I have a physical list with exactly 10 written items",
    gamePoints: 2,
    materials: ["pen", "paper"],
    location: "anywhere",
    socialContext: "solo"
  },
  {
    id: "sj-sf-002", 
    action: "I set a 2-minute timer and ask myself 'Does this move my mission forward?' for each of the 3 highest priorities",
    difficulty: 4,
    duration: "2-3 minutes",
    timeOfDay: "morning",
    category: "decision-making",
    successCriteria: "Each priority has a clear yes/no mission alignment answer",
    gamePoints: 4,
    materials: ["timer"],
    location: "quiet-space",
    socialContext: "solo"
  },
  {
    id: "sj-sf-003",
    action: "I physically cross out the 7 lowest-priority items with a red pen while saying 'This is not my focus right now'",
    difficulty: 3,
    duration: "1-2 minutes", 
    timeOfDay: "morning",
    category: "decision-making",
    successCriteria: "7 items are clearly crossed out and I can state my 3 focus areas",
    gamePoints: 3,
    materials: ["red pen"],
    location: "anywhere",
    socialContext: "solo"
  }
]

const sampleEnhancement: AttributeEnhancement = {
  attributeId: "strategic-focus",
  originalMethod: "List 10 priorities, then cross out 7. Only work on the remaining 3.",
  dailyDoItems: sampleDailyDoItems,
  enhancedAt: new Date().toISOString(),
  enhancedVersion: "1.0",
  difficultyRange: {
    min: 2,
    max: 4,
    average: 3.0
  },
  totalGamePoints: 9
}

export default function EnhancementTestPage() {
  const [showEnhanced, setShowEnhanced] = useState(true)
  const [completedItems, setCompletedItems] = useState<string[]>([])
  const [testMode, setTestMode] = useState<'single' | 'multi'>('single')

  const handleItemComplete = (itemId: string, attributeName?: string) => {
    setCompletedItems(prev => [...prev, itemId])
    console.log(`✅ Completed item: ${itemId}`, attributeName ? `in ${attributeName}` : '')
  }

  // Sample multi-attribute data
  const multiAttributes = [
    sampleAttribute,
    {
      name: "Compassionate Wisdom",
      description: "The ability to respond to difficult situations with both understanding and clarity",
      benefit: "Transform conflicts into opportunities for deeper connection and growth",
      method: "When someone frustrates you, pause and ask 'What pain might be causing them to act this way?'"
    },
    {
      name: "Creative Innovation", 
      description: "The ability to see possibilities others miss and bring them to life",
      benefit: "Create breakthrough solutions that delight users and advance your field",
      method: "Ask 'What if we completely changed our approach to this?' and prototype the wildest idea"
    }
  ]

  const multiEnhancements = {
    "strategic-focus": sampleEnhancement,
    // Other attributes would have their enhancements here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            🧪 Daily-Do Enhancement Test Page
          </h1>
          <p className="text-gray-300">
            Testing the Claude-powered activity enhancement system
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showEnhanced}
                  onChange={(e) => setShowEnhanced(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-white">Show Enhanced Activities</span>
              </label>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">Test Mode:</span>
                <button
                  onClick={() => setTestMode('single')}
                  className={`px-3 py-1 rounded ${
                    testMode === 'single' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setTestMode('multi')}
                  className={`px-3 py-1 rounded ${
                    testMode === 'multi' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  Multi
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              Completed: {completedItems.length} items
            </div>
          </div>
        </div>

        {/* Test Display */}
        {testMode === 'single' ? (
          <DailyDoActivityDisplay
            attribute={sampleAttribute}
            roleModelName="Steve Jobs"
            dailyDoEnhancement={showEnhanced ? sampleEnhancement : null}
            showEnhanced={showEnhanced}
            userLevel="beginner"
            onItemComplete={handleItemComplete}
          />
        ) : (
          <MultiAttributeDisplay
            attributes={multiAttributes}
            roleModelName="Steve Jobs"
            dailyDoEnhancements={showEnhanced ? multiEnhancements : {}}
            showEnhanced={showEnhanced}
            userLevel="beginner"
            onItemComplete={handleItemComplete}
          />
        )}

        {/* Debug Info */}
        <div className="mt-8 bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">🔍 Debug Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Enhancement Mode:</span>
              <span className="text-white">{showEnhanced ? '✅ Enabled' : '❌ Disabled'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Test Mode:</span>
              <span className="text-white capitalize">{testMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Sample Daily-Do Items:</span>
              <span className="text-white">{sampleDailyDoItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Game Points:</span>
              <span className="text-white">{sampleEnhancement.totalGamePoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Difficulty:</span>
              <span className="text-white">{sampleEnhancement.difficultyRange.average}</span>
            </div>
          </div>
          
          {completedItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <h4 className="text-cyan-400 font-medium mb-2">Completed Items:</h4>
              <div className="flex flex-wrap gap-2">
                {completedItems.map((itemId, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30"
                  >
                    {itemId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">🧪 Test Instructions</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Toggle "Show Enhanced Activities" to test fallback behavior</li>
            <li>• Switch between Single and Multi modes to test different components</li>
            <li>• Click "More" to expand item details and see all metadata</li>
            <li>• Click "Mark Complete" to test completion tracking</li>
            <li>• Check browser console for interaction logs</li>
            <li>• Verify that original methods show when enhancements are disabled</li>
          </ul>
        </div>
      </div>
    </div>
  )
}