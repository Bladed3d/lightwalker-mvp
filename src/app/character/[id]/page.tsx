'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import LightwalkerCharacterDisplay from '@/components/lightwalker/LightwalkerCharacterDisplay'
import { Settings } from 'lucide-react'

interface SavedCharacter {
  id: string
  roleModelId: string
  selectedAttributeIds: string[]
  characterName?: string
  discoveryPoints?: number
  level?: number
  createdAt: string
  lastViewedAt: string
}

export default function CharacterPage() {
  const params = useParams()
  const characterId = params.id as string
  
  const [character, setCharacter] = useState<SavedCharacter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (characterId) {
      loadCharacter()
    }
  }, [characterId])

  const loadCharacter = async () => {
    try {
      setIsLoading(true)
      
      // Try the dynamic route first
      let response = await fetch(`/api/characters/${characterId}`)
      
      // If dynamic route fails, try query parameter approach
      if (!response.ok) {
        console.log('Dynamic route failed, trying query parameter approach')
        response = await fetch(`/api/characters?id=${characterId}`)
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Character not found')
        } else {
          setError('Failed to load character')
        }
        return
      }

      const data = await response.json()
      setCharacter(data.character)
    } catch (error) {
      console.error('Failed to load character:', error)
      setError('Failed to load character')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBeginDailyPractice = () => {
    // Navigate to daily practice with character data
    window.location.href = `/character/${characterId}/practice`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <h2 className="text-xl font-bold text-cyan-400 mb-2">Loading Your Lightwalker™</h2>
          <p className="text-gray-400">Retrieving character data...</p>
        </div>
      </div>
    )
  }

  if (error || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            {error || 'Character Not Found'}
          </h2>
          <p className="text-gray-300 mb-6">
            Unable to load this Lightwalker™ character.
          </p>
          <button 
            onClick={() => window.location.href = '/character-creation'}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Create New Character
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Global Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-6 right-6 z-50 p-3 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-full text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 transition-all"
        title="Character Settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Character Settings</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.location.href = `/character-creation?editing=${characterId}`}
                className="w-full p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors"
              >
                Edit Traits & Attributes
              </button>
              
              <button 
                onClick={() => window.location.href = '/character-creation'}
                className="w-full p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-600/30 transition-colors"
              >
                Create New Character
              </button>
              
              <button 
                onClick={() => window.location.href = `/character/${characterId}/practice`}
                className="w-full p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-600/30 transition-colors"
              >
                Daily Practice
              </button>
              
              <div className="border-t border-gray-600 pt-4">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full p-3 bg-gray-600/20 border border-gray-500/30 rounded-lg text-gray-300 hover:bg-gray-600/30 transition-colors"
                >
                  Close Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character Display */}
      <LightwalkerCharacterDisplay
        roleModelId={character.roleModelId}
        selectedAttributeIds={character.selectedAttributeIds}
        onBeginDailyPractice={handleBeginDailyPractice}
        characterId={characterId}
      />
    </div>
  )
}