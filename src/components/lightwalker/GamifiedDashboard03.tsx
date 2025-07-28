'use client'

import { useEffect, useState } from 'react'

// Types for the gamified discovery system
interface RoleModel {
  id: string
  commonName: string
  primaryDomain: string
  imageUrl: string
  attributeCount: number
  selectedAttributes: number
  // Additional rich data from database
  fullName?: string
  lifeSpan?: string
  lifeMission?: string
  coreValues?: string[]
  famousQuotes?: string[]
  // Gamified properties
  archetype: 'innovator' | 'leader' | 'wisdom' | 'creator' | 'guardian' | 'mystic'
  primaryColor: string
  secondaryColor: string
  particleType: 'sparks' | 'flow' | 'pulse' | 'cascade' | 'spiral' | 'glow'
}

interface Attribute {
  id: string
  name: string
  category: string
  description: string
  benefit?: string
  oppositeOf?: string
  level: number
  maxLevel: number
  synergies?: string[]
  conflicts?: string[]
  roleModelImplementations: {
    roleModelId: string
    method: string
    description: string
  }[]
}

interface GamificationState {
  discoveryPoints: number
  level: number
  completionPercentage: number
  achievements: string[]
  currentPhase: 'welcome' | 'archetype-selection' | 'trait-customization' | 'synthesis' | 'activation'
}

type DiscoveryPathway = 'role-model' | 'problem-first' | 'day-in-life' | 'values-first'

interface GamifiedDiscoveryDashboardSimpleProps {
  onLightwalkerCreated: (lightwalker: any) => void
}

export default function GamifiedDiscoveryDashboardSimple({ onLightwalkerCreated }: GamifiedDiscoveryDashboardSimpleProps) {
  const [activePathway, setActivePathway] = useState<DiscoveryPathway>('role-model')
  const [selectedRoleModel, setSelectedRoleModel] = useState<string | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [gamification, setGamification] = useState<GamificationState>({
    discoveryPoints: 0,
    level: 1,
    completionPercentage: 0,
    achievements: [],
    currentPhase: 'welcome'
  })
  const [showWelcome, setShowWelcome] = useState(true)
  const [newAchievements, setNewAchievements] = useState<string[]>([])

  useEffect(() => {
    loadGamifiedRoleModels()
    loadGamifiedAttributes()
    if (showWelcome) {
      setTimeout(() => setShowWelcome(false), 3000) // Auto-advance after welcome animation
    }
  }, [])

  useEffect(() => {
    updateGamificationState()
  }, [selectedAttributes, selectedRoleModel])

  const loadGamifiedRoleModels = async () => {
    try {
      const response = await fetch('/api/role-models')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const { roleModels: dbRoleModels } = await response.json()
      
      const gamifiedRoleModels = dbRoleModels.map((roleModel: any, index: number) => ({
        id: roleModel.id,
        commonName: roleModel.commonName,
        primaryDomain: roleModel.primaryDomain,
        imageUrl: `/role-models/${roleModel.commonName.toLowerCase().replace(' ', '-')}`,
        attributeCount: Array.isArray(roleModel.coreValues) ? roleModel.coreValues.length : 0,
        selectedAttributes: 0,
        fullName: roleModel.fullName,
        lifeSpan: roleModel.lifeSpan,
        lifeMission: roleModel.lifeMission,
        coreValues: roleModel.coreValues || [],
        famousQuotes: roleModel.famousQuotes || [],
        // Gamified enhancements
        archetype: ['innovator', 'leader', 'wisdom', 'creator', 'guardian', 'mystic'][index % 6] as any,
        primaryColor: ['#00D4FF', '#FF00FF', '#FFD700', '#00FF88', '#FF6B35', '#8A2BE2'][index % 6],
        secondaryColor: ['#0099CC', '#CC00CC', '#CCB000', '#00CC66', '#CC5529', '#6A1B9A'][index % 6],
        particleType: ['sparks', 'flow', 'pulse', 'cascade', 'spiral', 'glow'][index % 6] as any
      }))
      
      setRoleModels(gamifiedRoleModels)
      console.log('✅ Loaded gamified role models:', gamifiedRoleModels.length)
      console.log('📷 Expected image filenames:')
      gamifiedRoleModels.forEach((rm: RoleModel) => 
        console.log(`  - ${rm.commonName} → ${rm.imageUrl}`)
      )
      
    } catch (error) {
      console.error('Failed to load role models:', error)
      
      // Enhanced fallback with gamified properties
      setRoleModels([
        {
          id: 'steve-jobs',
          commonName: 'Steve Jobs',
          primaryDomain: 'Innovation & Strategic Focus',
          imageUrl: '/role-models/steve-jobs.jpg',
          attributeCount: 6,
          selectedAttributes: 0,
          archetype: 'innovator',
          primaryColor: '#00D4FF',
          secondaryColor: '#0099CC',
          particleType: 'sparks'
        },
        {
          id: 'oprah-winfrey',
          commonName: 'Oprah Winfrey',
          primaryDomain: 'Empathy & Communication',
          imageUrl: '/role-models/oprah.jpg',
          attributeCount: 5,
          selectedAttributes: 0,
          archetype: 'leader',
          primaryColor: '#FF00FF',
          secondaryColor: '#CC00CC',
          particleType: 'flow'
        },
        {
          id: 'marcus-aurelius',
          commonName: 'Marcus Aurelius',
          primaryDomain: 'Wisdom & Self-Discipline',
          imageUrl: '/role-models/marcus-aurelius.jpg',
          attributeCount: 4,
          selectedAttributes: 0,
          archetype: 'wisdom',
          primaryColor: '#FFD700',
          secondaryColor: '#CCB000',
          particleType: 'pulse'
        },
        {
          id: 'maya-angelou',
          commonName: 'Maya Angelou',
          primaryDomain: 'Resilience & Grace',
          imageUrl: '/role-models/maya-angelou.jpg',
          attributeCount: 5,
          selectedAttributes: 0,
          archetype: 'creator',
          primaryColor: '#00FF88',
          secondaryColor: '#00CC66',
          particleType: 'cascade'
        }
      ])
    }
  }

  const loadGamifiedAttributes = () => {
    const gamifiedAttributes = [
      {
        id: 'strategic-focus',
        name: 'Strategic Focus',
        category: 'Decision-Making',
        description: 'Identify what matters most and eliminate distractions',
        level: 0,
        maxLevel: 5,
        synergies: ['intuitive-decision-making'],
        conflicts: ['scattered-attention'],
        roleModelImplementations: [
          {
            roleModelId: 'steve-jobs',
            method: 'Annual Retreat Process',
            description: 'List 10 priorities, ruthlessly cut to 3. Say no to everything else.'
          }
        ]
      },
      {
        id: 'empathetic-listening',
        name: 'Empathetic Listening',
        category: 'Communication',
        description: 'Deep, authentic listening that makes others feel heard',
        level: 0,
        maxLevel: 5,
        synergies: ['emotional-intelligence'],
        conflicts: ['reactive-communication'],
        roleModelImplementations: [
          {
            roleModelId: 'oprah-winfrey',
            method: 'Present-Moment Attention',
            description: 'Full presence with no agenda except understanding completely.'
          }
        ]
      }
    ]
    
    setAttributes(gamifiedAttributes)
  }

  const updateGamificationState = () => {
    const newPoints = selectedAttributes.length * 100 + (selectedRoleModel ? 50 : 0)
    const newLevel = Math.floor(newPoints / 250) + 1
    const completion = Math.min((selectedAttributes.length / 5) * 100, 100)
    
    const newAchievements: string[] = []
    if (selectedRoleModel && !gamification.achievements.includes('first-archetype')) {
      newAchievements.push('first-archetype')
    }
    if (selectedAttributes.length >= 1 && !gamification.achievements.includes('first-trait')) {
      newAchievements.push('first-trait')
    }
    if (selectedAttributes.length >= 3 && !gamification.achievements.includes('trait-explorer')) {
      newAchievements.push('trait-explorer')
    }
    
    setGamification(prev => ({
      ...prev,
      discoveryPoints: newPoints,
      level: newLevel,
      completionPercentage: completion,
      achievements: [...prev.achievements, ...newAchievements],
      currentPhase: completion >= 100 ? 'activation' : 
                   selectedAttributes.length > 0 ? 'trait-customization' :
                   selectedRoleModel ? 'archetype-selection' : 'welcome'
    }))

    // Show new achievements
    if (newAchievements.length > 0) {
      setNewAchievements(newAchievements)
      setTimeout(() => setNewAchievements([]), 3000)
    }
  }

  const handleRoleModelSelect = (roleModelId: string) => {
    setSelectedRoleModel(roleModelId)
    
    // Add discovery points and achievement
    setGamification(prev => ({
      ...prev,
      discoveryPoints: prev.discoveryPoints + 100
    }))
    
    loadAttributesForRoleModel(roleModelId)
  }

  const loadAttributesForRoleModel = (roleModelId: string) => {
    const roleModel = roleModels.find(rm => rm.id === roleModelId)
    
    if (roleModel && roleModel.commonName === 'Steve Jobs') {
      const jobsAttributes = [
        {
          id: 'strategic-focus',
          name: 'Strategic Focus',
          category: 'Decision-Making',
          description: 'You finish what matters most instead of being busy with everything',
          level: 0,
          maxLevel: 5,
          synergies: ['intuitive-decision-making'],
          conflicts: [],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Annual Retreat Process',
              description: 'Every year, list 10 things you want to do. Cross out 7 and only focus on the top 3.'
            }
          ]
        },
        {
          id: 'design-perfectionism',
          name: 'Design Perfectionism',
          category: 'Quality Standards',
          description: 'You make things beautiful and simple, not just functional',
          level: 0,
          maxLevel: 5,
          synergies: ['elegant-simplicity'],
          conflicts: [],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Three-Click Rule',
              description: 'Any task should take 3 clicks or less. If more, redesign until simple.'
            }
          ]
        },
        {
          id: 'visionary-innovation',
          name: 'Visionary Innovation', 
          category: 'Creative Thinking',
          description: 'You see what people need before they know they need it',
          level: 0,
          maxLevel: 5,
          synergies: ['strategic-focus'],
          conflicts: [],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Think Different Principle',
              description: 'Ask "What would delight users?" Focus on experience over features.'
            }
          ]
        },
        {
          id: 'inspiring-leadership',
          name: 'Inspiring Leadership',
          category: 'Influence',
          description: 'You get people excited to do their best work and achieve the impossible',
          level: 0,
          maxLevel: 5,
          synergies: ['visionary-innovation'],
          conflicts: [],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Reality Distortion Field',
              description: 'Paint a vision so compelling that people believe they can achieve more than they thought possible.'
            }
          ]
        },
        {
          id: 'intuitive-decision-making',
          name: 'Intuitive Decision Making',
          category: 'Decision-Making', 
          description: 'You trust your gut feeling when data isn\'t enough',
          level: 0,
          maxLevel: 5,
          synergies: ['strategic-focus'],
          conflicts: [],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Feel-Based Testing',
              description: 'After gathering basic facts, ask "How does this feel?" Trust your instincts.'
            }
          ]
        },
        {
          id: 'elegant-simplicity',
          name: 'Elegant Simplicity',
          category: 'Problem Solving',
          description: 'You remove the unnecessary to make the necessary clear',
          level: 0,
          maxLevel: 5,
          synergies: ['design-perfectionism'],
          conflicts: [],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Subtraction Method',
              description: 'Look at any solution and ask "What can we remove?" Keep subtracting until only the essential remains.'
            }
          ]
        }
      ]
      
      setAttributes(jobsAttributes)
    }
  }

  const handleAttributeToggle = (attributeId: string) => {
    setSelectedAttributes(prev => {
      const isSelected = prev.includes(attributeId)
      const newSelection = isSelected 
        ? prev.filter(id => id !== attributeId)
        : [...prev, attributeId]
      
      // Add discovery points for selection
      if (!isSelected) {
        setGamification(prevGam => ({
          ...prevGam,
          discoveryPoints: prevGam.discoveryPoints + 75
        }))
      }
      
      return newSelection
    })
  }

  const selectedRoleModelData = roleModels.find(rm => rm.id === selectedRoleModel)

  // Welcome Screen Animation
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Welcome Content */}
        <div className="text-center z-10 animate-fadeIn">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent animate-slideDown">
            INITIALIZE
          </h1>
          <h2 className="text-4xl font-light mb-8 text-cyan-300 animate-slideUp">
            Consciousness Design Protocol
          </h2>
          <div className="text-xl text-gray-300 mb-8">
            Preparing neural architecture for Lightwalker™ creation...
          </div>
          
          <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-progressBar" />
          </div>
          
          <div className="text-cyan-400 font-mono animate-blink">
            READY
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* HUD Header */}
      <div className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-cyan-500/30 animate-slideDown">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  LIGHTWALKER™ CONSCIOUSNESS DESIGN
                </h1>
                <p className="text-cyan-300 text-sm font-mono">
                  Neural Architecture Assembly Protocol
                </p>
              </div>
            </div>
            
            {/* Gamification HUD */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Discovery Points</div>
                <div className="text-xl font-bold text-cyan-400">{gamification.discoveryPoints}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Complexity Level</div>
                <div className="text-xl font-bold text-purple-400">{gamification.level}</div>
              </div>
              <div className="w-32">
                <div className="text-sm text-gray-400 mb-1">Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${gamification.completionPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-cyan-400 mt-1">{Math.round(gamification.completionPercentage)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archetype Selection - Horizontal Scroll */}
      <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 mb-6 animate-slideUp relative">
          {/* Vertical Title on Left Edge */}
          <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
            <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
              ROLE MODELS
            </h3>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar ml-8">
            {roleModels.map((roleModel, index) => (
              <div
                key={roleModel.id}
                className={`min-w-[280px] relative p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-102 ${
                  selectedRoleModel === roleModel.id
                    ? 'bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-400 shadow-lg'
                    : 'bg-gray-800/30 border-gray-600 hover:border-cyan-500/50'
                }`}
                onClick={() => handleRoleModelSelect(roleModel.id)}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  ...(selectedRoleModel === roleModel.id && {
                    background: `linear-gradient(45deg, ${roleModel.primaryColor}20, ${roleModel.secondaryColor}20)`,
                    boxShadow: `0 0 20px ${roleModel.primaryColor}30`
                  })
                }}
              >
                {/* Archetype pill in top-left corner */}
                <div className="absolute top-2 left-2 z-10">
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium capitalize text-black"
                    style={{ backgroundColor: roleModel.primaryColor }}
                  >
                    {roleModel.archetype}
                  </span>
                </div>
                
                <div className="relative flex flex-col items-center text-center space-y-3">
                  <div 
                    className="w-28 h-28 rounded-full flex items-center justify-center text-2xl border-2 overflow-hidden"
                    style={{ 
                      borderColor: roleModel.primaryColor,
                      backgroundColor: `${roleModel.primaryColor}20`
                    }}
                  >
                    <img 
                      src={`${roleModel.imageUrl}.jpg`}
                      alt={roleModel.commonName}
                      className="w-full h-full object-cover rounded-full"
                      onLoad={() => console.log(`✅ Image loaded: ${roleModel.imageUrl}.jpg`)}
                      onError={(e) => {
                        console.log(`❌ JPG failed, trying PNG: ${roleModel.imageUrl}.png`);
                        e.currentTarget.src = `${roleModel.imageUrl}.png`;
                        e.currentTarget.onerror = () => {
                          console.log(`❌ PNG also failed: ${roleModel.imageUrl}.png`);
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        };
                      }}
                    />
                    <div className="text-2xl" style={{ display: 'none' }}>👤</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{roleModel.commonName}</h4>
                    <p className="text-sm text-gray-400">{roleModel.primaryDomain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interface - Character Hub + Trait Constellation */}
      <div className="max-w-7xl mx-auto px-6 py-2 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Panel - Character Hub (2/5 width) */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6 animate-slideLeft relative">
            {/* Vertical Title on Left Edge */}
            <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
              <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                  style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
                PROFILE
              </h3>
            </div>
            
            {/* Holographic Character Preview */}
            <div className="relative h-64 mb-6 border border-cyan-500/50 rounded-lg bg-gradient-to-b from-cyan-900/20 to-purple-900/20 overflow-hidden ml-8">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              
              {selectedRoleModelData ? (
                <div className="absolute inset-4 flex items-center justify-center animate-scaleIn">
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl border-2 shadow-lg animate-pulse"
                    style={{ 
                      borderColor: selectedRoleModelData.primaryColor,
                      backgroundColor: `${selectedRoleModelData.primaryColor}20`,
                      boxShadow: `0 0 20px ${selectedRoleModelData.primaryColor}50`
                    }}
                  >
                    🧠
                  </div>
                  
                  {/* Particle Effects */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full animate-orbit"
                      style={{ 
                        backgroundColor: selectedRoleModelData.primaryColor,
                        transform: `rotate(${i * 30}deg) translateX(60px)`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-2 animate-bounce">⚡</div>
                    <div className="text-sm font-mono">Awaiting Archetype Selection</div>
                  </div>
                </div>
              )}
            </div>

            {/* Character Stats */}
            {selectedRoleModelData && (
              <div className="space-y-3 animate-fadeIn ml-8">
                <div className="bg-gray-800/50 rounded p-3 border border-cyan-500/30">
                  <div className="text-sm text-gray-400 mb-1">ARCHETYPE</div>
                  <div className="text-cyan-400 font-semibold capitalize">{selectedRoleModelData.archetype}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-3 border border-cyan-500/30">
                  <div className="text-sm text-gray-400 mb-1">PRIMARY DOMAIN</div>
                  <div className="text-purple-400">{selectedRoleModelData.primaryDomain}</div>
                </div>
                <div className="bg-gray-800/50 rounded p-3 border border-cyan-500/30">
                  <div className="text-sm text-gray-400 mb-1">TRAIT CAPACITY</div>
                  <div className="text-green-400">{selectedAttributes.length}/{selectedRoleModelData.attributeCount}</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Trait Constellation (3/5 width = 60%) */}
          <div className="lg:col-span-3 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6 animate-slideRight relative">
            {/* Vertical Title on Left Edge */}
            <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
              <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                  style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
                ATTRIBUTES
              </h3>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar ml-8">
              {attributes.map((attribute, index) => (
                <label 
                  key={attribute.id}
                  className={`block p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-102 ${
                    selectedAttributes.includes(attribute.id)
                      ? 'bg-gradient-to-r from-green-900/50 to-cyan-900/50 border-green-400 shadow-lg animate-glow'
                      : 'bg-gray-800/30 border-gray-600 hover:border-cyan-500/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.includes(attribute.id)}
                      onChange={() => handleAttributeToggle(attribute.id)}
                      className="mt-1 h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white mb-1">{attribute.name}</div>
                      <div className="text-sm text-gray-400 mb-2">{attribute.description}</div>
                      
                      {/* Trait Level Indicator */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-gray-500">Level:</span>
                        <div className="flex space-x-1">
                          {[...Array(attribute.maxLevel)].map((_, i) => (
                            <div 
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i < attribute.level ? 'bg-cyan-400' : 'bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Method Implementation */}
                      {attribute.roleModelImplementations.map((impl, implIndex) => (
                        <div key={implIndex} className="bg-blue-900/30 rounded p-2 text-xs border border-blue-500/30">
                          <div className="font-medium text-blue-300 mb-1">🔧 {impl.method}</div>
                          <div className="text-blue-200">{impl.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Activation Button */}
            {selectedAttributes.length >= 3 && (
              <div className="mt-6 pt-4 border-t border-cyan-500/30 animate-fadeIn ml-8">
                <button 
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
                  onClick={() => onLightwalkerCreated({ 
                    archetype: selectedRoleModelData?.archetype,
                    attributes: selectedAttributes,
                    discoveryPoints: gamification.discoveryPoints,
                    level: gamification.level
                  })}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>⚡</span>
                    <span>ACTIVATE LIGHTWALKER™</span>
                    <span>({selectedAttributes.length} traits)</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Achievement Notifications */}
        {newAchievements.map((achievement, index) => (
          <div
            key={achievement}
            className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-lg shadow-lg z-50 animate-slideInRight"
            style={{ 
              bottom: `${4 + index * 60}px`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            🏆 Achievement Unlocked: {achievement.replace('-', ' ').toUpperCase()}
          </div>
        ))}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00D4FF;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0099CC;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes slideInRight {
          from { transform: translateX(300px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }

        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px); }
          to { transform: rotate(360deg) translateX(60px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
        .animate-slideDown { animation: slideDown 0.8s ease-out; }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-slideLeft { animation: slideLeft 0.8s ease-out; }
        .animate-slideRight { animation: slideRight 0.8s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.5s ease-out; }
        .animate-scaleIn { animation: scaleIn 1s ease-out; }
        .animate-progressBar { animation: progressBar 0.8s ease-out; }
        .animate-orbit { animation: orbit 2s linear infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-blink { animation: blink 1s ease-in-out infinite; }
        
        .hover\\:scale-102:hover { transform: scale(1.02); }
        
      `}</style>
    </div>
  )
}