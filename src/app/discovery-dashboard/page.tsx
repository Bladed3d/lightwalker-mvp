'use client'

import { useState } from 'react'
import DiscoveryDashboard from '@/components/lightwalker/DiscoveryDashboard'

export default function DiscoveryDashboardPage() {
  const [lightwalkerCreated, setLightwalkerCreated] = useState<any>(null)

  const handleLightwalkerCreated = (lightwalker: any) => {
    setLightwalkerCreated(lightwalker)
    console.log('Lightwalker created:', lightwalker)
  }

  if (lightwalkerCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="lightwalker-card">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Lightwalker™ is Ready!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              You've selected {lightwalkerCreated.attributes.length} attributes for your ideal future self.
            </p>
            <div className="space-y-3">
              <button 
                className="lightwalker-button-primary w-full"
                onClick={() => window.location.href = '/dashboard'}
              >
                Meet Your Lightwalker™
              </button>
              <button 
                className="lightwalker-button-secondary w-full"
                onClick={() => setLightwalkerCreated(null)}
              >
                Refine Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Test Navigation Banner */}
      <div className="bg-yellow-100 border-b border-yellow-200 p-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <a 
              href="/" 
              className="text-sm text-yellow-800 hover:text-yellow-900 underline"
            >
              ← Back to Main Flow
            </a>
            <span className="text-sm text-yellow-800 font-medium">
              🧪 Testing: New Bidirectional Discovery System
            </span>
            <a 
              href="/role-model-test" 
              className="text-sm text-yellow-800 hover:text-yellow-900 underline"
            >
              Role Model Test →
            </a>
          </div>
        </div>
      </div>

      <DiscoveryDashboard onLightwalkerCreated={handleLightwalkerCreated} />
    </div>
  )
}