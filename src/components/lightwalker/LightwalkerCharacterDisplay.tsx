'use client'

import { useEffect, useState, useMemo } from 'react'
import { Brain, Star, Zap, Clock, Target, Quote, Settings } from 'lucide-react'

interface RoleModel {
  id: string
  commonName: string
  primaryDomain: string
  fullName?: string
  lifeSpan?: string
  lifeMission?: string
  coreValues?: string[]
  famousQuotes?: string[]
  archetype: 'innovator' | 'leader' | 'wisdom' | 'creator' | 'guardian' | 'mystic'
  primaryColor: string
  secondaryColor: string
  particleType: 'sparks' | 'flow' | 'pulse' | 'cascade' | 'spiral' | 'glow'
}

interface Attribute {
  id: string
  name: string
  description: string
  category: string
  benefit?: string
  oppositeOf?: string
  roleModelImplementations: {
    roleModelId: string
    method: string
    description: string
  }[]
}

interface LightwalkerCharacter {
  roleModel: RoleModel
  involvedRoleModels?: RoleModel[] // All role models that contributed traits
  selectedAttributes: Attribute[]
  synthesizedPersonality: string
  dailyBehaviors: string[]
  situationalResponses: {
    situation: string
    response: string
    method: string
  }[]
}

interface UserTrait {
  subTraitCode: string
  subTrait: {
    title: string
    description: string
    method: string
    benefit: string
    trait: {
      name: string
      slug: string
      roleModel: {
        id: string
        code: string
        commonName: string
        primaryDomain: string
        famousQuotes: string
        primaryColor?: string
        secondaryColor?: string
        particleType?: string
      }
    }
  }
}

interface LightwalkerCharacterDisplayProps {
  selectedTraits?: {traitId: string, roleModelId: string, traitName: string}[] // Legacy format
  userTraits?: UserTrait[] // New relational format
  onBeginDailyPractice: () => void
  characterId?: string
}

export default function LightwalkerCharacterDisplay({ 
  selectedTraits, 
  userTraits,
  onBeginDailyPractice,
  characterId 
}: LightwalkerCharacterDisplayProps) {
  // Track component renders
  console.log('=== COMPONENT RENDER at', new Date().toISOString(), '===')
  console.log('selectedTraits (legacy):', selectedTraits?.length)
  console.log('userTraits (new):', userTraits?.length)
  console.log('characterId:', characterId)
  
  const [character, setCharacter] = useState<LightwalkerCharacter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [showSynthesis, setShowSynthesis] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [synthesisAttempted, setSynthesisAttempted] = useState(false)

  // Create stable references for trait data to prevent re-renders
  const stableUserTraitsLength = useMemo(() => userTraits?.length || 0, [userTraits?.length])
  const stableSelectedTraitsLength = useMemo(() => selectedTraits?.length || 0, [selectedTraits?.length])

  useEffect(() => {
    const hasData = stableUserTraitsLength > 0 || stableSelectedTraitsLength > 0
    if (!synthesisAttempted && hasData) {
      console.log('=== useEffect Triggered ===')
      console.log('About to call synthesizeCharacter...')
      setSynthesisAttempted(true)
      synthesizeCharacter()
    }
  }, [stableUserTraitsLength, stableSelectedTraitsLength]) // Don't include synthesisAttempted to avoid loops

  useEffect(() => {
    // Rotate through quotes every 5 seconds
    if (character?.roleModel.famousQuotes?.length) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => 
          (prev + 1) % (character.roleModel.famousQuotes?.length || 1)
        )
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [character])

  const synthesizeCharacter = async () => {
    const synthesisId = Math.random().toString(36).substring(7)
    console.log(`=== NEW SYNTHESIS START [${synthesisId}] ===`)
    setIsLoading(true)
    
    try {
      console.log(`=== SYNTHESIS [${synthesisId}]: Starting character synthesis ===`)
      
      // Prioritize new relational data, fall back to legacy if needed
      if (userTraits && userTraits.length > 0) {
        console.log('Using NEW relational data structure')
        console.log('User traits:', userTraits.length)
        
        // Extract data from relational structure - much simpler!
        const attributeDetails: Attribute[] = userTraits.map(ut => ({
          id: ut.subTrait.trait.slug,
          name: ut.subTrait.trait.name,
          description: ut.subTrait.description,
          category: 'Personal Development',
          benefit: ut.subTrait.benefit,
          roleModelImplementations: [{
            roleModelId: ut.subTrait.trait.roleModel.id,
            method: ut.subTrait.method,
            description: ut.subTrait.description
          }]
        }))
        
        // Get unique role models - direct from relational data
        const involvedRoleModels = Array.from(
          new Map(userTraits.map(ut => [
            ut.subTrait.trait.roleModel.id, 
            ut.subTrait.trait.roleModel
          ])).values()
        )
        
        // Store involved role models for display
        const allInvolvedRoleModels = involvedRoleModels
        
        console.log('Involved role models:', involvedRoleModels.map(rm => rm.commonName))
        
        // Primary role model (most traits)
        const roleModelCounts = userTraits.reduce((acc, ut) => {
          const rmId = ut.subTrait.trait.roleModel.id
          acc[rmId] = (acc[rmId] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const primaryRoleModelId = Object.entries(roleModelCounts)
          .sort(([,a], [,b]) => b - a)[0][0]
        const primaryRoleModel = involvedRoleModels.find(rm => rm.id === primaryRoleModelId)!
        
        // Create synthesis
        const roleModelNames = involvedRoleModels.map(rm => rm.commonName)
        const synthesizedPersonality = `I am a unique synthesis drawing wisdom from ${roleModelNames.join(', ')}. Through their combined teachings, I've developed ${attributeDetails.map(attr => attr.name.toLowerCase()).join(', ')}, creating a personalized approach to life that blends the best of these legendary figures.`

        const dailyBehaviors = attributeDetails.map(attr => 
          `I practice ${attr.name.toLowerCase()} using ${attr.roleModelImplementations[0].method}`
        )

        const situationalResponses = attributeDetails.slice(0, 3).map((attr, index) => {
          const situations = [
            "Facing a difficult decision",
            "Dealing with setbacks", 
            "Planning important work"
          ]
          return {
            situation: situations[index] || "Challenging moment",
            response: `I apply ${attr.name.toLowerCase()} using ${attr.roleModelImplementations[0].method}`,
            method: attr.roleModelImplementations[0].method || attr.name
          }
        })

        const synthesizedCharacter: LightwalkerCharacter = {
          roleModel: {
            ...primaryRoleModel,
            archetype: getArchetype(primaryRoleModel.commonName),
            primaryColor: getPrimaryColor(primaryRoleModel.commonName),
            secondaryColor: getSecondaryColor(primaryRoleModel.commonName),
            particleType: getParticleType(primaryRoleModel.commonName),
            famousQuotes: JSON.parse(primaryRoleModel.famousQuotes || '[]')
          },
          involvedRoleModels: allInvolvedRoleModels.map(rm => ({
            ...rm,
            archetype: getArchetype(rm.commonName),
            primaryColor: getPrimaryColor(rm.commonName),
            secondaryColor: getSecondaryColor(rm.commonName),
            particleType: getParticleType(rm.commonName),
            famousQuotes: JSON.parse(rm.famousQuotes || '[]')
          })),
          selectedAttributes: attributeDetails,
          synthesizedPersonality,
          dailyBehaviors,
          situationalResponses
        }

        setCharacter(synthesizedCharacter)
        console.log(`=== SYNTHESIS [${synthesisId}]: SUCCESS - Character created ===`)
        setTimeout(() => setShowSynthesis(true), 500)
        
      } else if (selectedTraits && selectedTraits.length > 0) {
        console.log(`=== SYNTHESIS [${synthesisId}]: Using LEGACY format ===`)
        // TODO: Keep legacy synthesis for backwards compatibility
        throw new Error('Legacy synthesis not implemented yet - please create a new character')
      } else {
        throw new Error('No trait data available')
      }
      
    } catch (error) {
      console.error(`=== SYNTHESIS ERROR [${synthesisId}] ===`)
      console.error('Error details:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      console.log(`=== SYNTHESIS END [${synthesisId}] ===`)
      setIsLoading(false)
    }
  }

  // Helper functions for character synthesis

  const getArchetype = (name: string): any => {
    const archetypes: Record<string, string> = {
      'Steve Jobs': 'innovator',
      'Buddha': 'mystic',
      'Martin Luther King Jr.': 'leader',
      'Einstein': 'creator'
    }
    return archetypes[name] || 'wisdom'
  }

  const getPrimaryColor = (name: string): string => {
    const colors: Record<string, string> = {
      'Steve Jobs': '#00D4FF',
      'Buddha': '#FFD700',
      'Martin Luther King Jr.': '#FF00FF',
      'Einstein': '#00FF88'
    }
    return colors[name] || '#8A2BE2'
  }

  const getSecondaryColor = (name: string): string => {
    const colors: Record<string, string> = {
      'Steve Jobs': '#0099CC',
      'Buddha': '#CCB000',
      'Martin Luther King Jr.': '#CC00CC',
      'Einstein': '#00CC66'
    }
    return colors[name] || '#6A1B9A'
  }

  const getParticleType = (name: string): any => {
    const types: Record<string, string> = {
      'Steve Jobs': 'sparks',
      'Buddha': 'glow',
      'Martin Luther King Jr.': 'flow',
      'Einstein': 'cascade'
    }
    return types[name] || 'pulse'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-2 border-2 border-purple-500 rounded-full animate-spin border-b-transparent" style={{ animationDirection: 'reverse' }}></div>
            <Brain className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Synthesizing Your Lightwalker™</h2>
          <p className="text-gray-400">Combining role model essence with selected traits...</p>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center">
        <div className="text-center text-red-400">
          <h2 className="text-2xl font-bold mb-2">Character Synthesis Failed</h2>
          <p>Unable to create your Lightwalker™. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white relative">
      {/* Global Settings Button */}
      {characterId && (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed top-6 right-6 z-50 p-3 bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-full text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/50 transition-all"
          title="Character Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

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

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Your Lightwalker™ is Ready
            </h1>
            <p className="text-cyan-300 text-lg">
              Consciousness synthesis complete - Ready for daily practice
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Character Profile Card */}
        <div className={`bg-black/30 backdrop-blur-sm rounded-xl border p-8 mb-8 transition-all duration-1000 ${
          showSynthesis ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
        }`} style={{ 
          borderColor: character.roleModel.primaryColor,
          background: `linear-gradient(135deg, ${character.roleModel.primaryColor}10, ${character.roleModel.secondaryColor}10)`
        }}>
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Multiple Role Model Avatars */}
            <div className="relative">
              <div className="flex items-center justify-center space-x-4">
                {character.involvedRoleModels?.map((roleModel, index) => (
                  <div key={roleModel.id} className="relative group">
                    <div 
                      className="w-24 h-24 rounded-full border-3 flex items-center justify-center overflow-hidden transition-all hover:scale-110"
                      style={{ 
                        borderColor: roleModel.primaryColor,
                        backgroundColor: `${roleModel.primaryColor}20`
                      }}
                    >
                      <img 
                        src={`/role-models/${roleModel.commonName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.jpg`}
                        alt={roleModel.commonName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div 
                        className="w-full h-full items-center justify-center text-3xl"
                        style={{ display: 'none' }}
                      >
                        🧠
                      </div>
                    </div>
                    
                    {/* Role Model Name Tooltip */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {roleModel.commonName}
                      </div>
                    </div>
                    
                    {/* Small particle effects for each */}
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-orbit"
                        style={{ 
                          backgroundColor: roleModel.primaryColor,
                          transform: `rotate(${i * 120}deg) translateX(40px)`,
                          animationDelay: `${index * 0.1 + i * 0.2}s`,
                          animationDuration: '2s'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Character Details */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2" style={{ color: character.roleModel.primaryColor }}>
                Your Lightwalker™
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                {character.selectedAttributes.length} Selected Traits from Multiple Masters
              </p>
              
              {/* Synthesis Description */}
              <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-cyan-500/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Character Synthesis
                </h3>
                <p className="text-gray-200 leading-relaxed">
                  {character.synthesizedPersonality}
                </p>
              </div>

              {/* Selected Traits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Integrated Traits ({character.selectedAttributes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {character.selectedAttributes.map((attr, index) => (
                    <div 
                      key={attr.id}
                      className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="font-medium text-purple-300 mb-1">{attr.name}</div>
                      <div className="text-sm text-gray-400">{attr.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Famous Quote Rotation */}
        {character.roleModel.famousQuotes && character.roleModel.famousQuotes.length > 0 && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-6 mb-8 text-center">
            <Quote className="w-8 h-8 mx-auto mb-4 text-yellow-400" />
            <blockquote className="text-xl italic text-yellow-200 mb-4">
              "{character.roleModel.famousQuotes[currentQuoteIndex]}"
            </blockquote>
            <p className="text-yellow-400 font-medium">
              — {character.roleModel.commonName}
            </p>
          </div>
        )}

        {/* Daily Behaviors Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* How I Behave Daily */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              How I Practice Daily
            </h3>
            <div className="space-y-3">
              {character.dailyBehaviors.map((behavior, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-200">{behavior}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Situational Responses */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              How I Handle Situations
            </h3>
            <div className="space-y-4">
              {character.situationalResponses.map((response, index) => (
                <div key={index} className="bg-blue-900/30 rounded-lg p-3">
                  <div className="font-medium text-blue-300 mb-1">{response.situation}</div>
                  <p className="text-gray-200 text-sm mb-2">{response.response}</p>
                  <div className="text-xs text-blue-400">Method: {response.method}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Begin Daily Practice Button */}
        <div className="text-center">
          <button 
            onClick={onBeginDailyPractice}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Zap className="w-6 h-6" />
            <span>Begin Daily Practice</span>
            <Zap className="w-6 h-6" />
          </button>
          <p className="text-gray-400 mt-4">
            Start copying behaviors and developing your ideal self
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(100px); }
          to { transform: rotate(360deg) translateX(100px); }
        }

        .animate-orbit { 
          animation: orbit 3s linear infinite; 
        }
      `}</style>
    </div>
  )
}