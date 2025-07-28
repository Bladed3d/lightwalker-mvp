'use client'

import { useState, useEffect } from 'react'

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

interface GamifiedDiscoveryDashboardProps {
  onLightwalkerCreated: (lightwalker: any) => void
}

export default function GamifiedDiscoveryDashboard({ onLightwalkerCreated }: GamifiedDiscoveryDashboardProps) {
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
        imageUrl: `/role-models/${roleModel.id || roleModel.commonName.toLowerCase().replace(' ', '-')}.jpg`,
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
      },
      // Add more attributes...
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
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        {/* Welcome Content */}
        <motion.div 
          className="text-center z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <motion.h1 
            className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            INITIALIZE
          </motion.h1>
          <motion.h2 
            className="text-4xl font-light mb-8 text-cyan-300"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Consciousness Design Protocol
          </motion.h2>
          <motion.div 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            Preparing neural architecture for Lightwalker™ creation...
          </motion.div>
          
          <motion.div 
            className="w-64 h-2 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: 256 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 2.2, duration: 0.8 }}
            />
          </motion.div>
          
          <motion.div 
            className="text-cyan-400 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 0.2 }}
          >
            READY
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              delay: Math.random() * 3,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* HUD Header */}
      <motion.div 
        className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-cyan-500/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
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
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${gamification.completionPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-xs text-cyan-400 mt-1">{Math.round(gamification.completionPercentage)}%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Interface */}
      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Character Hub */}
          <motion.div 
            className="lg:col-span-1 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 font-mono">
              CONSCIOUSNESS CORE
            </h3>
            
            {/* Holographic Character Preview */}
            <div className="relative h-64 mb-6 border border-cyan-500/50 rounded-lg bg-gradient-to-b from-cyan-900/20 to-purple-900/20 overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              
              {selectedRoleModelData ? (
                <motion.div 
                  className="absolute inset-4 flex items-center justify-center"
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ duration: 1 }}
                >
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center text-4xl border-2 shadow-lg"
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
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedRoleModelData.primaryColor }}
                      animate={{
                        x: [0, Math.cos(i * 30 * Math.PI / 180) * 60],
                        y: [0, Math.sin(i * 30 * Math.PI / 180) * 60],
                        opacity: [1, 0],
                        scale: [1, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-2">⚡</div>
                    <div className="text-sm font-mono">Awaiting Archetype Selection</div>
                  </div>
                </div>
              )}
            </div>

            {/* Character Stats */}
            {selectedRoleModelData && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
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
              </motion.div>
            )}
          </motion.div>

          {/* Center Panel - Archetype Selection */}
          <motion.div 
            className="lg:col-span-1 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 font-mono">
              ARCHETYPE SELECTION
            </h3>
            
            <div className="space-y-4">
              {roleModels.map((roleModel, index) => (
                <motion.div
                  key={roleModel.id}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedRoleModel === roleModel.id
                      ? 'bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-400 shadow-lg'
                      : 'bg-gray-800/30 border-gray-600 hover:border-cyan-500/50'
                  }`}
                  onClick={() => handleRoleModelSelect(roleModel.id)}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Selection Glow Effect */}
                  {selectedRoleModel === roleModel.id && (
                    <motion.div 
                      className="absolute inset-0 rounded-lg"
                      style={{ 
                        background: `linear-gradient(45deg, ${roleModel.primaryColor}20, ${roleModel.secondaryColor}20)`,
                        boxShadow: `0 0 20px ${roleModel.primaryColor}30`
                      }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  <div className="relative flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
                      style={{ 
                        borderColor: roleModel.primaryColor,
                        backgroundColor: `${roleModel.primaryColor}20`
                      }}
                    >
                      👤
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{roleModel.commonName}</h4>
                      <p className="text-sm text-gray-400">{roleModel.primaryDomain}</p>
                      <div className="text-xs mt-1">
                        <span 
                          className="px-2 py-1 rounded text-black font-medium capitalize"
                          style={{ backgroundColor: roleModel.primaryColor }}
                        >
                          {roleModel.archetype}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Panel - Trait Constellation */}
          <motion.div 
            className="lg:col-span-1 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 font-mono">
              TRAIT CONSTELLATION
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {attributes.map((attribute, index) => (
                <motion.label 
                  key={attribute.id}
                  className={`block p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedAttributes.includes(attribute.id)
                      ? 'bg-gradient-to-r from-green-900/50 to-cyan-900/50 border-green-400 shadow-lg'
                      : 'bg-gray-800/30 border-gray-600 hover:border-cyan-500/50'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
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
                </motion.label>
              ))}
            </div>

            {/* Activation Button */}
            {selectedAttributes.length >= 3 && (
              <motion.div 
                className="mt-6 pt-4 border-t border-cyan-500/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button 
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => onLightwalkerCreated({ 
                    archetype: selectedRoleModelData?.archetype,
                    attributes: selectedAttributes,
                    discoveryPoints: gamification.discoveryPoints,
                    level: gamification.level
                  })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>⚡</span>
                    <span>ACTIVATE LIGHTWALKER™</span>
                    <span>({selectedAttributes.length} traits)</span>
                  </span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Achievement Notifications */}
        <AnimatePresence>
          {gamification.achievements.map((achievement, index) => (
            <motion.div
              key={achievement}
              className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-lg shadow-lg z-50"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ delay: index * 0.5 }}
            >
              🏆 Achievement Unlocked: {achievement.replace('-', ' ').toUpperCase()}
            </motion.div>
          ))}
        </AnimatePresence>
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
      `}</style>
    </div>
  )
}