'use client'

import { useEffect, useState } from 'react'
import { Brain, Star, Zap, Clock, Target, Quote } from 'lucide-react'

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
  selectedAttributes: Attribute[]
  synthesizedPersonality: string
  dailyBehaviors: string[]
  situationalResponses: {
    situation: string
    response: string
    method: string
  }[]
}

interface LightwalkerCharacterDisplayProps {
  roleModelId: string
  selectedAttributeIds: string[]
  onBeginDailyPractice: () => void
}

export default function LightwalkerCharacterDisplay({ 
  roleModelId, 
  selectedAttributeIds, 
  onBeginDailyPractice 
}: LightwalkerCharacterDisplayProps) {
  const [character, setCharacter] = useState<LightwalkerCharacter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [showSynthesis, setShowSynthesis] = useState(false)

  useEffect(() => {
    synthesizeCharacter()
  }, [roleModelId, selectedAttributeIds])

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
    setIsLoading(true)
    
    try {
      // Load role model data
      const roleModelResponse = await fetch('/api/role-models')
      const { roleModels } = await roleModelResponse.json()
      const roleModel = roleModels.find((rm: any) => rm.id === roleModelId)
      
      if (!roleModel) {
        throw new Error('Role model not found')
      }

      // Get attribute details - for now using static data, would fetch from API
      const attributeDetails = selectedAttributeIds.map(id => ({
        id,
        name: formatAttributeName(id),
        description: getAttributeDescription(id),
        category: getAttributeCategory(id),
        roleModelImplementations: [{
          roleModelId: roleModel.id,
          method: getAttributeMethod(id, roleModel.commonName),
          description: getAttributeMethodDescription(id, roleModel.commonName)
        }]
      }))

      // Synthesize the unified character
      const synthesizedPersonality = `I embody the essence of ${roleModel.commonName}, channeling their approach to ${roleModel.primaryDomain.toLowerCase()}. Through their wisdom, I've developed ${attributeDetails.map(attr => attr.name.toLowerCase()).join(', ')}, creating a unique blend of their legendary traits with practical methods for daily life.`

      const dailyBehaviors = attributeDetails.map(attr => 
        `I practice ${attr.name.toLowerCase()} by ${attr.roleModelImplementations[0].description.toLowerCase()}`
      )

      const situationalResponses = [
        {
          situation: "Facing a difficult decision",
          response: `I pause and consider what ${roleModel.commonName} would do in this moment.`,
          method: attributeDetails[0]?.roleModelImplementations[0]?.method || "Thoughtful Analysis"
        },
        {
          situation: "Dealing with setbacks",
          response: `I remember ${roleModel.commonName}'s approach to challenges and apply their resilience.`,
          method: "Historical Perspective"
        },
        {
          situation: "Planning important work",
          response: `I channel ${roleModel.commonName}'s strategic mindset to focus on what truly matters.`,
          method: attributeDetails.find(a => a.category === 'Decision-Making')?.roleModelImplementations[0]?.method || "Strategic Planning"
        }
      ]

      const synthesizedCharacter: LightwalkerCharacter = {
        roleModel: {
          ...roleModel,
          archetype: getArchetype(roleModel.commonName),
          primaryColor: getPrimaryColor(roleModel.commonName),
          secondaryColor: getSecondaryColor(roleModel.commonName),
          particleType: getParticleType(roleModel.commonName)
        },
        selectedAttributes: attributeDetails,
        synthesizedPersonality,
        dailyBehaviors,
        situationalResponses
      }

      setCharacter(synthesizedCharacter)
      
      // Show synthesis animation after data loads
      setTimeout(() => setShowSynthesis(true), 500)
      
    } catch (error) {
      console.error('Failed to synthesize character:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper functions for character synthesis
  const formatAttributeName = (id: string): string => {
    return id.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getAttributeDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
      'strategic-focus': 'You finish what matters most instead of being busy with everything',
      'design-perfectionism': 'You make things beautiful and simple, not just functional',
      'visionary-innovation': 'You see what people need before they know they need it',
      'inspiring-leadership': 'You get people excited to do their best work and achieve the impossible',
      'intuitive-decision-making': 'You trust your gut feeling when data isn\'t enough',
      'elegant-simplicity': 'You remove the unnecessary to make the necessary clear'
    }
    return descriptions[id] || 'A powerful trait for personal development'
  }

  const getAttributeCategory = (id: string): string => {
    const categories: Record<string, string> = {
      'strategic-focus': 'Decision-Making',
      'design-perfectionism': 'Quality Standards',
      'visionary-innovation': 'Creative Thinking',
      'inspiring-leadership': 'Influence',
      'intuitive-decision-making': 'Decision-Making',
      'elegant-simplicity': 'Problem Solving'
    }
    return categories[id] || 'Personal Development'
  }

  const getAttributeMethod = (id: string, roleModelName: string): string => {
    const methods: Record<string, string> = {
      'strategic-focus': 'Annual Retreat Process',
      'design-perfectionism': 'Three-Click Rule',
      'visionary-innovation': 'Think Different Principle',
      'inspiring-leadership': 'Reality Distortion Field',
      'intuitive-decision-making': 'Feel-Based Testing',
      'elegant-simplicity': 'Subtraction Method'
    }
    return methods[id] || `${roleModelName}'s Approach`
  }

  const getAttributeMethodDescription = (id: string, roleModelName: string): string => {
    const descriptions: Record<string, string> = {
      'strategic-focus': 'I list my priorities annually and ruthlessly focus on only the top 3',
      'design-perfectionism': 'I ensure any process takes 3 steps or less, redesigning until simple',
      'visionary-innovation': 'I ask "What would delight people?" and focus on experience over features',
      'inspiring-leadership': 'I paint visions so compelling that people believe they can achieve more',
      'intuitive-decision-making': 'I gather basic facts, then ask "How does this feel?" and trust my instincts',
      'elegant-simplicity': 'I look at any solution and ask "What can we remove?" until only the essential remains'
    }
    return descriptions[id] || `I apply ${roleModelName}'s proven methods to this area`
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
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
            {/* Character Avatar */}
            <div className="relative">
              <div 
                className="w-48 h-48 rounded-full border-4 flex items-center justify-center overflow-hidden"
                style={{ 
                  borderColor: character.roleModel.primaryColor,
                  backgroundColor: `${character.roleModel.primaryColor}20`
                }}
              >
                <img 
                  src={`/role-models/${character.roleModel.commonName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.jpg`}
                  alt={character.roleModel.commonName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <div 
                  className="w-full h-full items-center justify-center text-6xl"
                  style={{ display: 'none' }}
                >
                  🧠
                </div>
              </div>
              
              {/* Particle effects around avatar */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full animate-orbit"
                  style={{ 
                    backgroundColor: character.roleModel.primaryColor,
                    transform: `rotate(${i * 45}deg) translateX(100px)`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>

            {/* Character Details */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2" style={{ color: character.roleModel.primaryColor }}>
                Lightwalker™ · {character.roleModel.commonName}
              </h2>
              <p className="text-xl text-gray-300 mb-4 capitalize">
                {character.roleModel.archetype} Archetype
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