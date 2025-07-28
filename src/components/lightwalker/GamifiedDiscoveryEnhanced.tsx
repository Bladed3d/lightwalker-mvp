'use client'

import { useEffect, useState } from 'react'

// Types for the enhanced gamified discovery system
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

interface GamifiedDiscoveryEnhancedProps {
  onLightwalkerCreated: (lightwalker: any) => void
}

export default function GamifiedDiscoveryEnhanced({ onLightwalkerCreated }: GamifiedDiscoveryEnhancedProps) {
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
  const [expandedAttributeTab, setExpandedAttributeTab] = useState<{attributeId: string, tab: string} | null>(null)

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
        imageUrl: `/role-models/${roleModel.commonName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.jpg`,
        attributeCount: Array.isArray(roleModel.coreValues) ? roleModel.coreValues.length : 0,
        selectedAttributes: 0,
        fullName: roleModel.fullName,
        lifeSpan: roleModel.lifeSpan,
        lifeMission: roleModel.lifeMission,
        coreValues: roleModel.coreValues || [],
        famousQuotes: roleModel.famousQuotes || [],
        enhancedAttributes: roleModel.enhancedAttributes || [], // ✅ CRITICAL: Include enhanced attributes
        // Gamified enhancements
        archetype: ['innovator', 'leader', 'wisdom', 'creator', 'guardian', 'mystic'][index % 6] as any,
        primaryColor: ['#00D4FF', '#FF00FF', '#FFD700', '#00FF88', '#FF6B35', '#8A2BE2'][index % 6],
        secondaryColor: ['#0099CC', '#CC00CC', '#CCB000', '#00CC66', '#CC5529', '#6A1B9A'][index % 6],
        particleType: ['sparks', 'flow', 'pulse', 'cascade', 'spiral', 'glow'][index % 6] as any
      }))
      
      setRoleModels(gamifiedRoleModels)
      console.log('✅ Loaded enhanced gamified role models:', gamifiedRoleModels.length)
      console.log('🔍 Sample role model structure:', gamifiedRoleModels[0])
      console.log('🔍 Enhanced attributes check:', gamifiedRoleModels.map((rm: any) => ({
        name: rm.commonName,
        hasEnhanced: !!(rm as any).enhancedAttributes,
        enhancedCount: (rm as any).enhancedAttributes?.length || 0
      })))
      
    } catch (error) {
      console.error('Failed to load role models:', error)
      
      // Enhanced fallback with gamified properties - expanded set for production
      const fallbackRoleModels = [
        {
          id: 'steve-jobs',
          commonName: 'Steve Jobs',
          primaryDomain: 'Innovation & Strategic Focus',
          attributeCount: 6,
          selectedAttributes: 0,
          archetype: 'innovator' as const,
          primaryColor: '#00D4FF',
          secondaryColor: '#0099CC',
          particleType: 'sparks' as const
        },
        {
          id: 'buddha',
          commonName: 'Buddha',
          primaryDomain: 'Spiritual wisdom and liberation from suffering',
          attributeCount: 5,
          selectedAttributes: 0,
          archetype: 'mystic' as const,
          primaryColor: '#8A2BE2',
          secondaryColor: '#6A1B9A',
          particleType: 'glow' as const
        },
        {
          id: 'marcus-aurelius',
          commonName: 'Marcus Aurelius',
          primaryDomain: 'Wisdom & Self-Discipline',
          attributeCount: 4,
          selectedAttributes: 0,
          archetype: 'wisdom' as const,
          primaryColor: '#FFD700',
          secondaryColor: '#CCB000',
          particleType: 'pulse' as const
        },
        {
          id: 'maya-angelou',
          commonName: 'Maya Angelou',
          primaryDomain: 'Resilience & Grace',
          attributeCount: 5,
          selectedAttributes: 0,
          archetype: 'creator' as const,
          primaryColor: '#00FF88',
          secondaryColor: '#00CC66',
          particleType: 'cascade' as const
        },
        {
          id: 'martin-luther-king-jr',
          commonName: 'Martin Luther King Jr.',
          primaryDomain: 'Civil rights leadership and nonviolent resistance',
          attributeCount: 5,
          selectedAttributes: 0,
          archetype: 'leader' as const,
          primaryColor: '#FF00FF',
          secondaryColor: '#CC00CC',
          particleType: 'flow' as const
        },
        {
          id: 'joan-of-arc',
          commonName: 'Joan of Arc',
          primaryDomain: 'Courage and unwavering faith',
          attributeCount: 4,
          selectedAttributes: 0,
          archetype: 'guardian' as const,
          primaryColor: '#FF6B35',
          secondaryColor: '#CC5529',
          particleType: 'spiral' as const
        }
      ].map(roleModel => ({
        ...roleModel,
        imageUrl: `/role-models/${roleModel.commonName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.jpg`
      }))
      
      setRoleModels(fallbackRoleModels)
      
      console.log('⚠️ Using fallback role models:')
      fallbackRoleModels.forEach(rm => 
        console.log(`  - ${rm.commonName} → ${rm.imageUrl}`)
      )
      
      // Debug specific problematic ones
      const buddha = fallbackRoleModels.find(rm => rm.commonName === 'Buddha')
      const mlk = fallbackRoleModels.find(rm => rm.commonName === 'Martin Luther King Jr.')
      if (buddha) console.log('🧘 Fallback Buddha URL:', buddha.imageUrl)
      if (mlk) console.log('✊ Fallback MLK URL:', mlk.imageUrl)
    }
  }

  const loadAttributesForRoleModel = async (roleModelId: string) => {
    const roleModel = roleModels.find(rm => rm.id === roleModelId)
    
    if (!roleModel) {
      console.warn('Role model not found:', roleModelId)
      loadGamifiedAttributes()
      return
    }

    // Check if the role model already has enhancedAttributes from the main API call
    console.log(`🔍 Checking enhancedAttributes for ${roleModel.commonName}:`, (roleModel as any).enhancedAttributes?.length || 0)
    if ((roleModel as any).enhancedAttributes && (roleModel as any).enhancedAttributes.length > 0) {
      console.log(`✅ Using enhanced attributes from main API for ${roleModel.commonName}`)
      const enhancedAttrs = (roleModel as any).enhancedAttributes
      
      const dbAttributes = enhancedAttrs.map((attr: any, index: number) => ({
        id: attr.name.toLowerCase().replace(/\s+/g, '-'),
        name: attr.name,
        category: 'Personal Development',
        description: attr.description,
        benefit: attr.benefit,
        oppositeOf: attr.oppositeOf,
        level: 0,
        maxLevel: 5,
        synergies: [],
        conflicts: [],
        roleModelImplementations: [{
          roleModelId: roleModel.id,
          method: attr.method || `${roleModel.commonName}'s Approach`,
          description: attr.description
        }]
      }))
      
      setAttributes(dbAttributes)
      console.log(`✅ Loaded ${dbAttributes.length} enhanced attributes for ${roleModel.commonName} from cached data`)
      console.log('🔍 Sample attribute oppositeOf:', dbAttributes[0]?.oppositeOf)
      return
    }

    // DISABLED: Skip individual API call since it's returning 404
    if (false) {
    try {
      // Fallback: Try to load enhanced attributes from individual API (known to be failing)
      console.log(`🔍 Trying individual API for ${roleModel?.commonName} (${roleModelId})`)
      const response = await fetch(`/api/role-models/${roleModelId}`)
      console.log('📡 API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 API response data:', data)
        const roleModelData = data.roleModel || data
        
        if (roleModelData.enhancedAttributes && roleModelData.enhancedAttributes.length > 0) {
          console.log(`✅ Found ${roleModelData.enhancedAttributes.length} enhanced attributes in database`)
          const dbAttributes = roleModelData.enhancedAttributes.map((attr: any, index: number) => ({
            id: attr.name.toLowerCase().replace(/\s+/g, '-'),
            name: attr.name,
            category: 'Personal Development',
            description: attr.description,
            benefit: attr.benefit,
            oppositeOf: attr.oppositeOf,  
            level: 0,
            maxLevel: 5,
            synergies: [],
            conflicts: [],
            roleModelImplementations: [{
              roleModelId: roleModel?.id || '',
              method: attr.method || `${roleModel?.commonName}'s Approach`,
              description: attr.description
            }]
          }))
          
          setAttributes(dbAttributes)
          console.log(`✅ Loaded ${dbAttributes.length} enhanced attributes for ${roleModel?.commonName} from individual API`)
          console.log('🔍 Sample attribute oppositeOf:', dbAttributes[0]?.oppositeOf)
          return
        } else {
          console.warn('❌ No enhanced attributes found in individual API response')
        }
      } else {
        console.warn('❌ Individual API response not OK:', response.status, response.statusText)
      }
    } catch (error) {
      console.warn('❌ Failed to load enhanced attributes from individual API:', error)
    }
    } // End of disabled block
    
    // Fallback to hardcoded Steve Jobs attributes if database fails
    if (roleModel.commonName === 'Steve Jobs') {
      const jobsAttributes = [
        {
          id: 'strategic-focus',
          name: 'Strategic Focus',
          category: 'Decision-Making',
          description: 'You finish what matters most instead of being busy with everything',
          benefit: 'Stop feeling overwhelmed and actually complete important projects',
          oppositeOf: 'Scattered attention that leaves everything half-done',
          level: 0,
          maxLevel: 5,
          synergies: ['intuitive-decision-making'],
          conflicts: ['scattered-attention'],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Annual Retreat Process',
              description: 'Every year, list 10 things you want to do. Then cross out 7 and only focus on the top 3. Say no to everything else.'
            }
          ]
        },
        {
          id: 'design-perfectionism',
          name: 'Design Perfectionism',
          category: 'Quality Standards',
          description: 'You make things beautiful and simple, not just functional',
          benefit: 'Create work that people love using and talking about',
          oppositeOf: 'Good enough mentality that creates forgettable results',
          level: 0,
          maxLevel: 5,
          synergies: ['elegant-simplicity'],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Three-Click Rule',
              description: 'Any task should take 3 clicks or less. If it takes more, redesign it until it\'s simple.'
            }
          ]
        },
        {
          id: 'visionary-innovation',
          name: 'Visionary Innovation', 
          category: 'Creative Thinking',
          description: 'You see what people need before they know they need it',
          benefit: 'Stay ahead of trends and create breakthrough solutions',
          oppositeOf: 'Following what everyone else is already doing',
          level: 0,
          maxLevel: 5,
          synergies: ['strategic-focus'],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Think Different Principle',
              description: 'Ask "What would delight users?" instead of "What do competitors do?" Focus on user experience over features.'
            }
          ]
        },
        {
          id: 'inspiring-leadership',
          name: 'Inspiring Leadership',
          category: 'Influence',
          description: 'You get people excited to do their best work and achieve the impossible',
          benefit: 'Build teams that go above and beyond and love working with you',
          oppositeOf: 'Accepting limitations and settling for mediocre results',
          level: 0,
          maxLevel: 5,
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Reality Distortion Field',
              description: 'Paint a vision so compelling that people believe they can achieve more than they thought possible. Set high standards and inspire rather than demand.'
            }
          ]
        },
        {
          id: 'intuitive-decision-making',
          name: 'Intuitive Decision Making',
          category: 'Decision-Making', 
          description: 'You trust your gut feeling when data isn\'t enough',
          benefit: 'Make confident decisions quickly and avoid analysis paralysis',
          oppositeOf: 'Getting stuck overthinking every choice until opportunities pass',
          level: 0,
          maxLevel: 5,
          synergies: ['strategic-focus'],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Feel-Based Testing',
              description: 'After gathering basic facts, ask "How does this feel?" Trust your instincts about what feels right or wrong.'
            }
          ]
        },
        {
          id: 'elegant-simplicity',
          name: 'Elegant Simplicity',
          category: 'Problem Solving',
          description: 'You remove the unnecessary to make the necessary clear',
          benefit: 'Create solutions that are powerful yet easy to understand and use',
          oppositeOf: 'Making things complicated and hard to understand',
          level: 0,
          maxLevel: 5,
          synergies: ['design-perfectionism'],
          roleModelImplementations: [
            {
              roleModelId: roleModel.id,
              method: 'Subtraction Method',
              description: 'Look at any solution and ask "What can we remove?" Keep subtracting until only the essential remains. Simplicity is the ultimate sophistication.'
            }
          ]
        }
      ]
      
      setAttributes(jobsAttributes)
      console.log(`✅ Generated ${jobsAttributes.length} enhanced attributes for Steve Jobs`)
      return
    }
    
    // For other role models, generate attributes from their core values
    if (roleModel && roleModel.coreValues && roleModel.coreValues.length > 0) {
      const attributesFromValues = roleModel.coreValues.map((value, index) => ({
        id: `${roleModelId}-value-${index}`,
        name: value,
        category: 'Core Values',
        description: `${roleModel.commonName}'s approach to ${value.toLowerCase()}`,
        level: 0,
        maxLevel: 5,
        roleModelImplementations: [
          {
            roleModelId: roleModel.id,
            method: `${roleModel.commonName}'s Method`,
            description: `Embody ${value.toLowerCase()} in daily decisions and actions, following ${roleModel.commonName}'s example.`
          }
        ]
      }))
      
      setAttributes(attributesFromValues)
      console.log(`✅ Generated ${attributesFromValues.length} attributes for ${roleModel.commonName}`)
    } else {
      // Fallback to default attributes
      loadGamifiedAttributes()
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
            description: 'Full presence with no agenda except understanding the other person completely.'
          }
        ]
      }
    ]
    
    setAttributes(gamifiedAttributes)
    console.log('✅ Loaded gamified attributes (using fallback data)')
  }

  const handleRoleModelSelect = (roleModelId: string) => {
    setSelectedRoleModel(roleModelId)
    loadAttributesForRoleModel(roleModelId)
  }

  const handleAttributeToggle = (attributeId: string) => {
    const wasAlreadySelected = selectedAttributes.includes(attributeId)
    
    setSelectedAttributes(prev => 
      wasAlreadySelected 
        ? prev.filter(id => id !== attributeId)
        : [...prev, attributeId]
    )

    // Trigger achievement popup for first attribute selection or any new attribute
    if (!wasAlreadySelected) {
      triggerAchievement('first-attribute-selected')
    }
  }

  const handleTabClick = (attributeId: string, tab: string) => {
    setExpandedAttributeTab(prev => 
      prev?.attributeId === attributeId && prev?.tab === tab 
        ? null // Close if same tab clicked
        : { attributeId, tab } // Open new tab
    )
  }

  const triggerAchievement = (achievementId: string) => {
    if (!gamification.achievements.includes(achievementId)) {
      setGamification(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementId],
        discoveryPoints: prev.discoveryPoints + 50
      }))
      setNewAchievements(prev => [...prev, achievementId])
      
      // Remove achievement notification after 3 seconds
      setTimeout(() => {
        setNewAchievements(prev => prev.filter(id => id !== achievementId))
      }, 3000)
    }
  }

  const updateGamificationState = () => {
    const basePoints = selectedAttributes.length * 25
    const roleModelBonus = selectedRoleModel ? 100 : 0
    const achievementPoints = gamification.achievements.length * 50
    
    const totalPoints = basePoints + roleModelBonus + achievementPoints
    const completionPercentage = Math.min((selectedAttributes.length / 5) * 100, 100)
    const level = Math.floor(totalPoints / 200) + 1

    setGamification(prev => ({
      ...prev,
      discoveryPoints: totalPoints,
      completionPercentage,
      level,
      currentPhase: selectedAttributes.length >= 5 ? 'synthesis' : 
                   selectedAttributes.length > 0 ? 'trait-customization' : 
                   selectedRoleModel ? 'archetype-selection' : 'welcome'
    }))
  }

  const getPathwayInstructions = () => {
    switch (activePathway) {
      case 'role-model':
        return 'Choose someone you admire, then select their attributes'
      case 'problem-first':
        return 'Discuss your challenge, then select solution attributes'
      case 'day-in-life':
        return 'Design your perfect day, then select enabling attributes'
      case 'values-first':
        return 'Identify your core values, then select aligned attributes'
    }
  }

  const selectedRoleModelData = roleModels.find(rm => rm.id === selectedRoleModel)

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
                  {getPathwayInstructions()}
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

      {/* Pathway Selector */}
      <div className="max-w-7xl mx-auto px-6 py-3 relative z-10">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-3">
          <div className="flex space-x-1">
            {[
              { id: 'role-model', label: '👥 Role Model', description: 'Start with people you admire' },
              { id: 'problem-first', label: '🎯 Problem-First', description: 'Start with challenges to solve' },
              { id: 'day-in-life', label: '📅 Perfect Day', description: 'Start with ideal lifestyle' },
              { id: 'values-first', label: '💎 Values-First', description: 'Start with core principles' }
            ].map((pathway) => (
              <button
                key={pathway.id}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePathway === pathway.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/30'
                }`}
                onClick={() => setActivePathway(pathway.id as DiscoveryPathway)}
                title={pathway.description}
              >
                {pathway.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Model Gallery - Horizontal Scroll (Original Layout) */}
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
                      src={roleModel.imageUrl} 
                      alt={roleModel.commonName}
                      className="w-full h-full object-cover rounded-full"
                      onLoad={() => console.log(`✅ Image loaded: ${roleModel.imageUrl}`)}
                      onError={(e) => {
                        console.log(`❌ Image failed to load: ${roleModel.imageUrl}`);
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
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

      {/* Main Content - Character Hub + Trait Constellation */}
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
            
            <div className="ml-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {selectedRoleModelData 
                    ? `${selectedRoleModelData.commonName} Attributes`
                    : 'Select Role Model First'
                  }
                </h4>
                <div className="text-sm text-gray-400">
                  {selectedAttributes.length}/5 selected
                </div>
              </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {attributes.map((attribute) => (
                <div key={attribute.id} className="border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/30 transition-all duration-300">
                  {/* Checkbox and Main Info */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.includes(attribute.id)}
                      onChange={() => handleAttributeToggle(attribute.id)}
                      className="mt-1 h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-white mb-1">{attribute.name}</div>
                      <div className="text-sm text-gray-300 mb-3">
                        {activePathway === 'problem-first' && attribute.oppositeOf 
                          ? attribute.oppositeOf 
                          : attribute.description
                        }
                      </div>
                    </div>
                  </label>

                  {/* Enhanced Compact Tab System */}
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => handleTabClick(attribute.id, 'attribute')}
                      className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                        expandedAttributeTab?.attributeId === attribute.id && expandedAttributeTab?.tab === 'attribute'
                          ? 'bg-gradient-to-r from-green-500/20 to-green-400/20 border-green-400 text-green-400 shadow-lg shadow-green-400/20'
                          : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400'
                      }`}
                    >
                      🎯 Attribute
                    </button>
                    
                    {attribute.oppositeOf && (
                      <button
                        onClick={() => handleTabClick(attribute.id, 'problem')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                          expandedAttributeTab?.attributeId === attribute.id && expandedAttributeTab?.tab === 'problem'
                            ? 'bg-gradient-to-r from-red-500/20 to-red-400/20 border-red-400 text-red-400 shadow-lg shadow-red-400/20'
                            : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400'
                        }`}
                      >
                        ❌ Problem
                      </button>
                    )}
                    
                    {attribute.roleModelImplementations.length > 0 && (
                      <button
                        onClick={() => handleTabClick(attribute.id, 'action')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                          expandedAttributeTab?.attributeId === attribute.id && expandedAttributeTab?.tab === 'action'
                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20'
                            : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-blue-500/10 hover:border-cyan-500/50 hover:text-cyan-400'
                        }`}
                      >
                        🔧 Action
                      </button>
                    )}
                  </div>

                  {/* Expanded Tab Content with Gaming Theme */}
                  {expandedAttributeTab?.attributeId === attribute.id && (
                    <div className="mt-3 p-3 rounded-lg border-l-4 bg-gray-900/50 backdrop-blur-sm">
                      {expandedAttributeTab.tab === 'attribute' && attribute.benefit && (
                        <div className="text-sm text-green-300">
                          <div className="font-medium text-green-400 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            ✅ Benefit:
                          </div>
                          <div className="pl-4 border-l-2 border-green-400/30">{attribute.benefit}</div>
                        </div>
                      )}
                      
                      {expandedAttributeTab.tab === 'problem' && attribute.oppositeOf && (
                        <div className="text-sm text-red-300">
                          <div className="font-medium text-red-400 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                            ❌ Instead of:
                          </div>
                          <div className="pl-4 border-l-2 border-red-400/30">{attribute.oppositeOf}</div>
                        </div>
                      )}
                      
                      {expandedAttributeTab.tab === 'action' && attribute.roleModelImplementations.length > 0 && (
                        <div className="text-sm text-cyan-300">
                          {attribute.roleModelImplementations.map((impl, index) => (
                            <div key={index}>
                              <div className="font-medium text-cyan-400 mb-2 flex items-center">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                                🔧 {impl.method}:
                              </div>
                              <div className="pl-4 border-l-2 border-cyan-400/30">{impl.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Activation Button */}
            {selectedAttributes.length >= 3 && (
              <div className="mt-6 pt-4 border-t border-cyan-500/30 animate-fadeIn ml-8">
                <button 
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
                  onClick={() => onLightwalkerCreated({ 
                    roleModelId: selectedRoleModel,
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
        </div>
      </div>

      {/* Achievement Popups */}
      <div className="fixed bottom-4 right-4 z-50">
        {newAchievements.map((achievement, index) => (
          <div
            key={achievement}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg shadow-lg font-bold mb-2 animate-slideInRight"
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px); }
          to { transform: rotate(360deg) translateX(60px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
          50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-scaleIn { animation: scaleIn 1s ease-out; }
        .animate-orbit { animation: orbit 2s linear infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-slideLeft { animation: slideLeft 0.8s ease-out; }
        .hover\\:scale-102:hover { transform: scale(1.02); }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}