'use client'

import { useState } from 'react'
import GamifiedDiscoveryEnhanced from '@/components/lightwalker/GamifiedDiscoveryEnhanced'
import LightwalkerCharacterDisplay from '@/components/lightwalker/LightwalkerCharacterDisplay'

interface CreatedLightwalker {
  roleModelId?: string
  selectedAttributeIds?: string[]
  archetype?: string
  attributes?: string[]
  discoveryPoints?: number
  level?: number
}

export default function CharacterCreation() {
  const [currentPhase, setCurrentPhase] = useState<'discovery' | 'character' | 'daily-practice'>('discovery')
  const [createdLightwalker, setCreatedLightwalker] = useState<CreatedLightwalker | null>(null)

  const handleLightwalkerCreated = (lightwalkerData: any) => {
    console.log('Lightwalker created:', lightwalkerData)
    
    setCreatedLightwalker({
      roleModelId: lightwalkerData.roleModelId,
      selectedAttributeIds: lightwalkerData.attributes || [],
      archetype: lightwalkerData.archetype,
      discoveryPoints: lightwalkerData.discoveryPoints,
      level: lightwalkerData.level
    })
    
    setCurrentPhase('character')
  }

  const handleBeginDailyPractice = () => {
    setCurrentPhase('daily-practice')
  }

  if (currentPhase === 'discovery') {
    return (
      <GamifiedDiscoveryEnhanced 
        onLightwalkerCreated={handleLightwalkerCreated}
      />
    )
  }

  if (currentPhase === 'character' && createdLightwalker) {
    return (
      <LightwalkerCharacterDisplay
        roleModelId={createdLightwalker.roleModelId || ''}
        selectedAttributeIds={createdLightwalker.selectedAttributeIds || []}
        onBeginDailyPractice={handleBeginDailyPractice}
      />
    )
  }

  if (currentPhase === 'daily-practice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Daily Practice System
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Coming Soon - Behavior copying interface
          </p>
          <button 
            onClick={() => setCurrentPhase('character')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Back to Character
          </button>
        </div>
      </div>
    )
  }

  return null
}