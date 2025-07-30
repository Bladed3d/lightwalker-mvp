'use client'

import { useState } from 'react'
import GamifiedDiscoveryEnhanced from '@/components/lightwalker/GamifiedDiscoveryEnhanced'
import LightwalkerCharacterDisplay from '@/components/lightwalker/LightwalkerCharacterDisplay'
import LiquidGridAnimation from '@/components/liquid-grid-component'

interface CreatedLightwalker {
  selectedTraits?: {traitId: string, roleModelId: string, traitName: string}[]
  discoveryPoints?: number
  level?: number
}

export default function CharacterCreation() {
  const [currentPhase, setCurrentPhase] = useState<'discovery' | 'synthesis' | 'character' | 'daily-practice'>('discovery')
  const [createdLightwalker, setCreatedLightwalker] = useState<CreatedLightwalker | null>(null)

  const handleLightwalkerCreated = async (lightwalkerData: any) => {
    console.log('Lightwalker created:', lightwalkerData)
    
    const characterData = {
      selectedTraits: lightwalkerData.selectedTraits || [],
      discoveryPoints: lightwalkerData.discoveryPoints,
      level: lightwalkerData.level
    }
    
    setCreatedLightwalker(characterData)
    
    // Show synthesis animation first
    setCurrentPhase('synthesis')
    
    // Auto-save character to database after a delay
    setTimeout(async () => {
      try {
        const sessionId = getOrCreateSessionId()
        const response = await fetch('/api/characters', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            selectedTraits: characterData.selectedTraits,
            discoveryPoints: characterData.discoveryPoints,
            level: characterData.level
          })
        })

        if (response.ok) {
          const { character } = await response.json()
          // Redirect to permanent character URL after synthesis animation
          window.location.href = `/character/${character.id}`
        } else {
          console.error('Failed to save character')
          // Fall back to local state
          setCurrentPhase('character')
        }
      } catch (error) {
        console.error('Failed to save character:', error)
        // Fall back to local state
        setCurrentPhase('character')
      }
    }, 3000) // Show synthesis animation for 3 seconds
  }

  const getOrCreateSessionId = (): string => {
    let sessionId = localStorage.getItem('lightwalker_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('lightwalker_session_id', sessionId)
    }
    return sessionId
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

  if (currentPhase === 'synthesis') {
    return (
      <div className="relative min-h-screen">
        <LiquidGridAnimation />
        <div className="absolute inset-0 flex items-center justify-center z-150">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
              Synthesizing Your Lightwalker™...
            </h1>
            <p className="text-xl text-gray-300 mb-8 opacity-80">
              Creating your personalized guide from selected traits
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentPhase === 'character' && createdLightwalker) {
    return (
      <LightwalkerCharacterDisplay
        selectedTraits={createdLightwalker.selectedTraits || []}
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