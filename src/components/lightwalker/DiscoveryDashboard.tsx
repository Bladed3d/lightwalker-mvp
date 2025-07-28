'use client'

import { useState, useEffect } from 'react'

// Types for the bidirectional discovery system
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
}

interface Attribute {
  id: string
  name: string
  category: string
  description: string
  benefit?: string
  oppositeOf?: string
  roleModelImplementations: {
    roleModelId: string
    method: string
    description: string
  }[]
}

type DiscoveryPathway = 'role-model' | 'problem-first' | 'day-in-life' | 'values-first'

interface DiscoveryDashboardProps {
  onLightwalkerCreated: (lightwalker: any) => void
}

export default function DiscoveryDashboard({ onLightwalkerCreated }: DiscoveryDashboardProps) {
  const [activePathway, setActivePathway] = useState<DiscoveryPathway>('role-model')
  const [selectedRoleModel, setSelectedRoleModel] = useState<string | null>(null)
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [expandedAttributeTab, setExpandedAttributeTab] = useState<{attributeId: string, tab: string} | null>(null)

  useEffect(() => {
    // Load initial data
    loadRoleModels()
    loadAttributes()
  }, [])

  const loadRoleModels = async () => {
    try {
      // Fetch real data from database API
      const response = await fetch('/api/role-models')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const { roleModels: dbRoleModels } = await response.json()
      
      // Transform database format to UI format
      const formattedRoleModels = dbRoleModels.map((roleModel: any) => ({
        id: roleModel.id,
        commonName: roleModel.commonName,
        primaryDomain: roleModel.primaryDomain,
        imageUrl: `/role-models/${roleModel.id || roleModel.commonName.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')}.jpg`,
        attributeCount: Array.isArray(roleModel.coreValues) ? roleModel.coreValues.length : 0,
        selectedAttributes: 0,
        // Additional rich data from database
        fullName: roleModel.fullName,
        lifeSpan: roleModel.lifeSpan,
        lifeMission: roleModel.lifeMission,
        coreValues: roleModel.coreValues || [],
        famousQuotes: roleModel.famousQuotes || []
      }))
      
      setRoleModels(formattedRoleModels)
      console.log('✅ Loaded role models from database:', formattedRoleModels.length)
      
    } catch (error) {
      console.error('Failed to load role models from database:', error)
      
      // Fallback to mock data if API fails
      setRoleModels([
        {
          id: 'steve-jobs',
          commonName: 'Steve Jobs',
          primaryDomain: 'Innovation & Strategic Focus',
          imageUrl: '/role-models/steve-jobs.jpg',
          attributeCount: 6,
          selectedAttributes: 0
        },
        {
          id: 'oprah-winfrey',
          commonName: 'Oprah Winfrey',
          primaryDomain: 'Empathy & Communication',
          imageUrl: '/role-models/oprah.jpg',
          attributeCount: 5,
          selectedAttributes: 0
        },
        {
          id: 'marcus-aurelius',
          commonName: 'Marcus Aurelius',
          primaryDomain: 'Wisdom & Self-Discipline',
          imageUrl: '/role-models/marcus-aurelius.jpg',
          attributeCount: 4,
          selectedAttributes: 0
        },
        {
          id: 'maya-angelou',
          commonName: 'Maya Angelou',
          primaryDomain: 'Resilience & Grace',
          imageUrl: '/role-models/maya-angelou.jpg',
          attributeCount: 5,
          selectedAttributes: 0
        }
      ])
      console.log('⚠️ Using fallback mock data')
    }
  }

  const loadAttributes = async () => {
    // For now, we'll generate attributes from the selected role model's core values
    // TODO: Create proper attributes API endpoint later
    
    // Use fallback mock data if no role model selected
    const fallbackAttributes = [
      {
        id: 'strategic-focus',
        name: 'Strategic Focus',
        category: 'Decision-Making',
        description: 'The ability to identify what matters most and say no to everything else',
        roleModelImplementations: [
          {
            roleModelId: 'steve-jobs',
            method: 'Annual Retreat Process',
            description: 'List 10 priorities, slash to 3. Deciding what NOT to do is as important as deciding what to do.'
          }
        ]
      },
      {
        id: 'empathetic-listening',
        name: 'Empathetic Listening',
        category: 'Communication',
        description: 'Deep, authentic listening that makes others feel truly heard and understood',
        roleModelImplementations: [
          {
            roleModelId: 'oprah-winfrey',
            method: 'Present-Moment Attention',
            description: 'Full presence with no agenda except understanding the other person completely.'
          }
        ]
      }
    ]
    
    setAttributes(fallbackAttributes)
    console.log('📝 Loaded attributes (using fallback data for now)')
  }

  const handleRoleModelSelect = (roleModelId: string) => {
    setSelectedRoleModel(roleModelId)
    loadAttributesForRoleModel(roleModelId)
  }

  const loadAttributesForRoleModel = (roleModelId: string) => {
    const roleModel = roleModels.find(rm => rm.id === roleModelId)
    
    // Add Steve Jobs specific attributes with 6th-grade explanations and benefits
    if (roleModel && roleModel.commonName === 'Steve Jobs') {
        const jobsAttributes = [
          {
            id: 'strategic-focus',
            name: 'Strategic Focus',
            category: 'Decision-Making',
            description: 'You finish what matters most instead of being busy with everything',
            benefit: 'Stop feeling overwhelmed and actually complete important projects',
            oppositeOf: 'Scattered attention that leaves everything half-done',
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
            roleModelImplementations: [
              {
                roleModelId: roleModel.id,
                method: 'Think Different Principle',
                description: 'Ask "What would delight users?" instead of "What do competitors do?" Focus on user experience over features.'
              }
            ]
          },
          {
            id: 'reality-distortion-field',
            name: 'Inspiring Leadership',
            category: 'Influence',
            description: 'You get people excited to do their best work and achieve the impossible',
            benefit: 'Build teams that go above and beyond and love working with you',
            oppositeOf: 'Accepting limitations and settling for mediocre results',
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
            roleModelImplementations: [
              {
                roleModelId: roleModel.id,
                method: 'Subtraction Method',
                description: 'Look at any solution and ask "What can we remove?" Keep subtracting until only the essential remains. Simplicity is the ultimate sophistication.'
              }
            ]
          }
        ]
        
        // Replace the core values with these enhanced attributes
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
      loadAttributes()
    }
  }

  const handleAttributeToggle = (attributeId: string) => {
    setSelectedAttributes(prev => 
      prev.includes(attributeId) 
        ? prev.filter(id => id !== attributeId)
        : [...prev, attributeId]
    )
  }

  const handleTabClick = (attributeId: string, tab: string) => {
    setExpandedAttributeTab(prev => 
      prev?.attributeId === attributeId && prev?.tab === tab 
        ? null // Close if same tab clicked
        : { attributeId, tab } // Open new tab
    )
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

  const getActiveAreaHighlight = () => {
    switch (activePathway) {
      case 'role-model':
        return 'highlight-top'
      case 'problem-first':
        return 'highlight-right'
      case 'day-in-life':
        return 'highlight-left'
      case 'values-first':
        return 'highlight-left'
      default:
        return ''
    }
  }

  const selectedRoleModelData = roleModels.find(rm => rm.id === selectedRoleModel)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Your Lightwalker™</h1>
              <p className="text-gray-600">{getPathwayInstructions()}</p>
            </div>
            <div className="text-sm text-gray-500">
              Progress: {selectedAttributes.length}/5 attributes selected
            </div>
          </div>
        </div>
      </div>

      {/* Pathway Selector */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
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
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Role Model Gallery */}
        <div className={`mb-6 ${getActiveAreaHighlight() === 'highlight-top' ? 'ring-2 ring-green-400 rounded-lg p-2' : ''}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Model Gallery</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {roleModels.map((roleModel) => (
              <div
                key={roleModel.id}
                className={`min-w-[200px] lightwalker-card cursor-pointer transition-all duration-200 ${
                  selectedRoleModel === roleModel.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleRoleModelSelect(roleModel.id)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{roleModel.commonName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{roleModel.primaryDomain}</p>
                  <div className="text-xs text-blue-600 font-medium">
                    {roleModel.selectedAttributes}/{roleModel.attributeCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Conversation/Process Area */}
          <div className={`lightwalker-card ${getActiveAreaHighlight() === 'highlight-left' ? 'ring-2 ring-green-400' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activePathway === 'role-model' && 'Role Model Exploration'}
              {activePathway === 'problem-first' && 'Problem & Solution Discovery'}
              {activePathway === 'day-in-life' && 'Perfect Day Design'}
              {activePathway === 'values-first' && 'Values Exploration'}
            </h3>
            
            <div className="space-y-4">
              {activePathway === 'role-model' && selectedRoleModelData && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">About {selectedRoleModelData.commonName}</h4>
                  
                  {selectedRoleModelData.fullName && selectedRoleModelData.lifeSpan && (
                    <p className="text-sm text-gray-500 mb-2">
                      {selectedRoleModelData.fullName} ({selectedRoleModelData.lifeSpan})
                    </p>
                  )}
                  
                  {selectedRoleModelData.lifeMission && (
                    <p className="text-gray-600 text-sm mb-4">
                      <strong>Mission:</strong> {selectedRoleModelData.lifeMission}
                    </p>
                  )}
                  
                  {selectedRoleModelData.coreValues && selectedRoleModelData.coreValues.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Core Values:</h5>
                      <div className="flex flex-wrap gap-1">
                        {selectedRoleModelData.coreValues.slice(0, 3).map((value, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedRoleModelData.famousQuotes && selectedRoleModelData.famousQuotes.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800 italic">
                        "{selectedRoleModelData.famousQuotes[0]}"
                      </p>
                    </div>
                  )}
                  
                  {/* Fallback for Steve Jobs if no database data */}
                  {selectedRoleModelData.id === 'steve-jobs' && !selectedRoleModelData.famousQuotes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800 italic">
                        "When facing decisions, I start with my annual retreat process: 'What are the 10 things we should be doing next?' Then I ruthlessly eliminate 7 items to focus on only 3 priorities."
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activePathway === 'problem-first' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What's your biggest challenge?</h4>
                  <textarea 
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                    rows={4}
                    placeholder="Describe the challenge you're facing..."
                  />
                  <button className="lightwalker-button-primary mt-2">
                    Find Solution Attributes
                  </button>
                </div>
              )}

              {(activePathway === 'day-in-life' || activePathway === 'values-first') && (
                <div className="text-center py-8 text-gray-500">
                  <p>Coming soon - {activePathway} discovery interface</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Attribute Selection */}
          <div className={`lightwalker-card ${getActiveAreaHighlight() === 'highlight-right' ? 'ring-2 ring-green-400' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {activePathway === 'role-model' && selectedRoleModelData 
                ? `${selectedRoleModelData.commonName}'s Attributes`
                : 'Solution Attributes'
              }
            </h3>
            
            <div className="space-y-4">
              {attributes.map((attribute) => (
                <div key={attribute.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  {/* Checkbox and Main Info */}
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.includes(attribute.id)}
                      onChange={() => handleAttributeToggle(attribute.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{attribute.name}</div>
                      <div className="text-sm text-gray-600 mb-3">
                        {activePathway === 'problem-first' && attribute.oppositeOf 
                          ? attribute.oppositeOf 
                          : attribute.description
                        }
                      </div>
                    </div>
                  </label>

                  {/* Compact Tab System */}
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => handleTabClick(attribute.id, 'attribute')}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        expandedAttributeTab?.attributeId === attribute.id && expandedAttributeTab?.tab === 'attribute'
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-green-50'
                      }`}
                    >
                      🎯 Attribute
                    </button>
                    
                    {attribute.oppositeOf && (
                      <button
                        onClick={() => handleTabClick(attribute.id, 'problem')}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          expandedAttributeTab?.attributeId === attribute.id && expandedAttributeTab?.tab === 'problem'
                            ? 'bg-red-100 border-red-300 text-red-800'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-red-50'
                        }`}
                      >
                        ❌ Problem
                      </button>
                    )}
                    
                    {attribute.roleModelImplementations.length > 0 && (
                      <button
                        onClick={() => handleTabClick(attribute.id, 'action')}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          expandedAttributeTab?.attributeId === attribute.id && expandedAttributeTab?.tab === 'action'
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-blue-50'
                        }`}
                      >
                        🔧 Action
                      </button>
                    )}
                  </div>

                  {/* Expanded Tab Content */}
                  {expandedAttributeTab?.attributeId === attribute.id && (
                    <div className="mt-3 p-3 rounded-lg border-l-4 bg-gray-50">
                      {expandedAttributeTab.tab === 'attribute' && attribute.benefit && (
                        <div className="text-sm text-green-700">
                          <div className="font-medium text-green-800 mb-1">✅ Benefit:</div>
                          {attribute.benefit}
                        </div>
                      )}
                      
                      {expandedAttributeTab.tab === 'problem' && attribute.oppositeOf && (
                        <div className="text-sm text-red-700">
                          <div className="font-medium text-red-800 mb-1">❌ Instead of:</div>
                          {attribute.oppositeOf}
                        </div>
                      )}
                      
                      {expandedAttributeTab.tab === 'action' && attribute.roleModelImplementations.length > 0 && (
                        <div className="text-sm text-blue-700">
                          {attribute.roleModelImplementations.map((impl, index) => (
                            <div key={index}>
                              <div className="font-medium text-blue-800 mb-1">🔧 {impl.method}:</div>
                              {impl.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedAttributes.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  className="lightwalker-button-primary w-full"
                  onClick={() => onLightwalkerCreated({ attributes: selectedAttributes })}
                >
                  Create My Lightwalker™ ({selectedAttributes.length} attributes)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}