'use client'

import { useState } from 'react'
import GamifiedDashboard03 from '@/components/lightwalker/GamifiedDashboard03'

interface LightwalkerData {
  archetype: string
  attributes: string[]
  discoveryPoints: number
  level: number
}

export default function GamifiedSimplePage() {
  const [lightwalker, setLightwalker] = useState<LightwalkerData | null>(null)

  const handleLightwalkerCreated = (createdLightwalker: any) => {
    setLightwalker(createdLightwalker)
    console.log('Lightwalker™ Created:', createdLightwalker)
    
    // Show success message
    alert(`🎉 Lightwalker™ Activated!\n\nArchetype: ${createdLightwalker.archetype}\nTraits: ${createdLightwalker.attributes.length}\nLevel: ${createdLightwalker.level}\nPoints: ${createdLightwalker.discoveryPoints}`)
  }

  if (lightwalker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-8">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Lightwalker™ Activated!
          </h1>
          <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6 mb-6">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Consciousness Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <div className="text-sm text-gray-400">Archetype</div>
                <div className="text-lg font-semibold text-purple-400 capitalize">{lightwalker.archetype}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Complexity Level</div>
                <div className="text-lg font-semibold text-green-400">{lightwalker.level}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Discovery Points</div>
                <div className="text-lg font-semibold text-cyan-400">{lightwalker.discoveryPoints}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Active Traits</div>
                <div className="text-lg font-semibold text-yellow-400">{lightwalker.attributes.length}</div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setLightwalker(null)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Create Another Lightwalker™
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <GamifiedDashboard03 onLightwalkerCreated={handleLightwalkerCreated} />
    </div>
  )
}