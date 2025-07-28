'use client'

import LightwalkerUserFlowchart from '@/components/lightwalker/lightwalker-mindmap'

export default function ProjectOverview() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Lightwalker™ Project Overview
          </h1>
          <p className="text-gray-300 text-sm">
            Interactive user journey visualization - Updated July 28, 2025
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <LightwalkerUserFlowchart />
      </div>
      
      <div className="bg-gray-800 border-t border-gray-700 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div>
              <strong className="text-green-400">✅ Discovery System Completed</strong> - 
              22 role models with enhanced attributes
            </div>
            <div>
              <strong className="text-blue-400">🚀 Next Phase</strong> - 
              Post-creation behavior copying system
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}