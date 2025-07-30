'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, User, MessageCircle, CheckSquare, Square } from 'lucide-react'

interface RoleModel {
  id: string
  commonName: string
  primaryDomain: string
  imageUrl: string
  primaryColor: string
  secondaryColor: string
  archetype: string
  enhancedAttributes: any[]
  dailyDoEnhanced: any
}

interface Attribute {
  id: string
  name: string
  description: string
  method: string
  benefit?: string
}

interface SearchResult {
  roleModel: string
  roleModelId: string
  attribute: string
  attributeId: string
  originalMethod: string
  dailyDoItems?: any[]
  relevanceScore: number
  selected?: boolean
}

interface SelectedAttribute {
  roleModel: string
  roleModelId: string
  attribute: string
  attributeId: string
  originalMethod: string
  dailyDoItems?: any[]
}

export default function AICharacterCreationHybridPage() {
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const [selectedRoleModel, setSelectedRoleModel] = useState<string>('')
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([])
  const [isAIMode, setIsAIMode] = useState(true)
  const [aiConversation, setAiConversation] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  const [searchProcessing, setSearchProcessing] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [highlightedRoleModel, setHighlightedRoleModel] = useState<string>('')
  const [highlightedAttribute, setHighlightedAttribute] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoleModels()
    // Set opening AI message
    setAiMessage(`I'm excited to help build your ideal future self! 

What feels most natural for you to think about:

🎯 **Challenges you face** (distraction, overwhelm, anger, stress)
✨ **Strengths you want** (focus, patience, confidence, wisdom)  
🎭 **People you admire** (Steve Jobs, Buddha, Einstein)
📋 **Daily habits you wish you had** (meditation, planning, exercise)

Just describe what you're working on, and I'll find the perfect attributes for your Lightwalker™!`)
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch(searchQuery) // Now async but no need to await in useEffect
    } else {
      setSearchResults([])
      setHighlightedRoleModel('')
      setHighlightedAttribute('')
    }
  }, [searchQuery, roleModels])

  useEffect(() => {
    console.log('🔄 selectedRoleModel changed to:', selectedRoleModel)
    if (selectedRoleModel) {
      const roleModel = roleModels.find(rm => rm.id === selectedRoleModel)
      console.log('🔍 Found role model:', roleModel?.commonName)
      if (roleModel?.enhancedAttributes) {
        console.log('📋 Loading', roleModel.enhancedAttributes.length, 'attributes for', roleModel.commonName)
        // Force re-render by clearing first, then setting
        setAttributes([])
        setTimeout(() => {
          setAttributes(roleModel.enhancedAttributes)
          console.log('✅ Attributes updated for', roleModel.commonName)
        }, 50)
      } else {
        console.log('❌ No enhancedAttributes found for', roleModel?.commonName)
        setAttributes([])
      }
    }
  }, [selectedRoleModel, roleModels])

  const loadRoleModels = async () => {
    try {
      const response = await fetch('/api/role-models')
      const data = await response.json()
      setRoleModels(data.roleModels)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load role models:', error)
      setLoading(false)
    }
  }

  const performSearch = async (query: string) => {
    console.log('🔍 performSearch called with query:', query)
    
    if (query.length <= 2) {
      console.log('❌ Query too short, clearing results')
      setSearchResults([])
      setHighlightedRoleModel('')
      setHighlightedAttribute('')
      setSearchProcessing(false)
      return
    }

    setSearchProcessing(true)

    // Direct keyword-based search - no data preparation needed
    console.log('🔍 Using lightweight keyword search (no phone book processing)')
    performBasicSearch(query)
    setSearchProcessing(false)
  }

  const performBasicSearch = (query: string) => {
    console.log('🔍 Basic search with query:', query)
    const results: SearchResult[] = []
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
    
    // Add common synonyms for better matching
    const expandedTerms = new Set(searchTerms)
    searchTerms.forEach(term => {
      const synonyms: Record<string, string[]> = {
        'focus': ['focus', 'focused', 'concentration', 'attention', 'strategic'],
        'calm': ['calm', 'peace', 'peaceful', 'tranquil', 'serene'],
        'creative': ['creative', 'creativity', 'innovative', 'imagination'],
        'leadership': ['leadership', 'leader', 'leading', 'inspire', 'influence'],
        'patience': ['patience', 'patient', 'calm', 'perseverance']
      }
      
      if (synonyms[term]) {
        synonyms[term].forEach(synonym => expandedTerms.add(synonym))
      }
    })
    
    const finalTerms = Array.from(expandedTerms)
    console.log('🎯 Expanded search terms:', finalTerms)
    
    if (finalTerms.length === 0) {
      setSearchResults([])
      return
    }

    roleModels.forEach(roleModel => {
      roleModel.enhancedAttributes?.forEach(attribute => {
        let relevanceScore = 0
        
        const attributeText = `${attribute.name} ${attribute.description} ${attribute.method}`.toLowerCase()
        
        const dailyDoItems = roleModel.dailyDoEnhanced?.attributes?.find(
          (attr: any) => attr.attributeId === attribute.name.toLowerCase().replace(/\s+/g, '-')
        )?.dailyDoItems
        
        const dailyDoText = dailyDoItems ? 
          dailyDoItems.map((item: any) => `${item.action} ${item.category}`).join(' ').toLowerCase() : ''
        
        finalTerms.forEach(term => {
          // Higher score for attribute name matches
          if (attribute.name.toLowerCase().includes(term)) {
            relevanceScore += 20
          }
          // Medium score for description matches  
          if (attribute.description?.toLowerCase().includes(term)) {
            relevanceScore += 15
          }
          // Lower score for method matches
          if (attribute.method?.toLowerCase().includes(term)) {
            relevanceScore += 10
          }
          // Daily-do matches
          if (dailyDoText.includes(term)) {
            relevanceScore += 8
          }
        })

        if (relevanceScore > 0) {
          results.push({
            roleModel: roleModel.commonName,
            roleModelId: roleModel.id,
            attribute: attribute.name,
            attributeId: attribute.id,
            originalMethod: attribute.method,
            dailyDoItems: dailyDoItems || null,
            relevanceScore,
            selected: selectedAttributes.some(sel => 
              sel.roleModelId === roleModel.id && sel.attributeId === attribute.id
            )
          })
        }
      })
    })

    results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    const topResults = results.slice(0, 8)
    console.log('🎭 Found', topResults.length, 'search results:', topResults.map(r => `${r.roleModel}-${r.attribute}`))
    setSearchResults(topResults)
    
    // Update AI message based on results
    if (topResults.length === 0) {
      setAiMessage(`I didn't find matches for "${query}". Try simpler terms like "focus", "stress", or "confidence".`)
    } else if (topResults.length === 1) {
      setAiMessage(`Perfect! I found exactly what you're looking for. Check the box if it resonates with you.`)
    } else {
      setAiMessage(`Great! I found ${topResults.length} approaches that could help. I've highlighted the strongest match, but explore the options below. Pick up to 2 that resonate most.`)
    }
    
    // Auto-highlight top result
    if (topResults.length > 0) {
      const topResult = topResults[0]
      console.log('🎯 Highlighting top result:', topResult.roleModel, '-', topResult.attribute)
      console.log('🎯 Role model ID to highlight:', topResult.roleModelId)
      console.log('🎯 Available role models:', roleModels.map(rm => `${rm.commonName}:${rm.id}`))
      
      // Clear previous highlights first, then set new ones
      setHighlightedRoleModel('')
      setHighlightedAttribute('')
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setHighlightedRoleModel(topResult.roleModelId)
        setHighlightedAttribute(topResult.attributeId)
        setSelectedRoleModel(topResult.roleModelId)
        console.log('✅ Set highlightedRoleModel to:', topResult.roleModelId)
        
        // Auto-scroll to highlighted role model with custom easing
        setTimeout(() => {
          const roleModelElement = document.querySelector(`[data-role-model-id="${topResult.roleModelId}"]`) as HTMLElement
          const scrollContainer = roleModelElement?.parentElement as HTMLElement
          
          if (roleModelElement && scrollContainer) {
            // Custom smooth scroll with deceleration easing
            const targetLeft = roleModelElement.offsetLeft - (scrollContainer.clientWidth / 2) + (roleModelElement.clientWidth / 2)
            const startLeft = scrollContainer.scrollLeft
            const distance = targetLeft - startLeft
            const duration = 800 // 800ms for smooth deceleration
            const startTime = performance.now()
            
            const easeOutCubic = (t: number): number => {
              return 1 - Math.pow(1 - t, 3) // Cubic easing out for smooth deceleration
            }
            
            const animateScroll = (currentTime: number) => {
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)
              const easedProgress = easeOutCubic(progress)
              
              scrollContainer.scrollLeft = startLeft + (distance * easedProgress)
              
              if (progress < 1) {
                requestAnimationFrame(animateScroll)
              }
            }
            
            requestAnimationFrame(animateScroll)
            console.log('📍 Custom scrolled to role model:', topResult.roleModel)
          }
        }, 100)
      }, 10)
    }
  }

  const handleAIConversation = async () => {
    if (!aiConversation.trim()) return
    
    setAiProcessing(true)
    
    try {
      const response = await fetch('/api/ai-character-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: aiConversation,
          context: {
            foundMatches: 0, // Will be updated after search completes
            selectedAttributes: selectedAttributes.length
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAiMessage(data.aiMessage)
        
        if (data.keywords.length > 0) {
          const keywords = data.keywords.join(' ')
          console.log('🎯 AI extracted keywords:', keywords)
          setSearchQuery(keywords)
          
          // Message will be updated after search completes in performBasicSearch
        }
        
      } else {
        setAiMessage(data.fallback?.aiMessage || "I'm having trouble understanding. Try simpler terms like 'focus' or 'stress'.")
        if (data.fallback?.keywords) {
          setSearchQuery(data.fallback.keywords.join(' '))
          // Keep AI mode active
        }
      }
      
    } catch (error) {
      console.error('AI conversation failed:', error)
      setAiMessage("I'm having trouble processing that right now. Try using simple terms like 'focus', 'stress', or 'confidence'.")
    } finally {
      setAiProcessing(false)
    }
  }

  const toggleAttributeSelection = (result: SearchResult) => {
    const isSelected = selectedAttributes.some(attr => 
      attr.roleModelId === result.roleModelId && attr.attributeId === result.attributeId
    )

    if (isSelected) {
      setSelectedAttributes(prev => 
        prev.filter(attr => !(attr.roleModelId === result.roleModelId && attr.attributeId === result.attributeId))
      )
    } else {
      if (selectedAttributes.length >= 10) {
        // Max 10 attributes - show user feedback
        console.log('⚠️ Maximum 10 attributes reached')
        return
      }
      
      setSelectedAttributes(prev => [
        ...prev,
        {
          roleModel: result.roleModel,
          roleModelId: result.roleModelId,
          attribute: result.attribute,
          attributeId: result.attributeId,
          originalMethod: result.originalMethod,
          dailyDoItems: result.dailyDoItems
        }
      ])
    }

    // Update highlighted role model when clicking different search results
    setHighlightedRoleModel(result.roleModelId)
    setSelectedRoleModel(result.roleModelId) // Show all attributes for this role model
    
    // Auto-scroll to the highlighted role model
    setTimeout(() => {
      const roleModelElement = document.querySelector(`[data-role-model-id="${result.roleModelId}"]`) as HTMLElement
      const scrollContainer = roleModelElement?.parentElement as HTMLElement
      
      if (roleModelElement && scrollContainer) {
        // Custom smooth scroll with deceleration easing
        const targetLeft = roleModelElement.offsetLeft - (scrollContainer.clientWidth / 2) + (roleModelElement.clientWidth / 2)
        const startLeft = scrollContainer.scrollLeft
        const distance = targetLeft - startLeft
        const duration = 800 // 800ms for smooth deceleration
        const startTime = performance.now()
        
        const easeOutCubic = (t: number): number => {
          return 1 - Math.pow(1 - t, 3) // Cubic easing out for smooth deceleration
        }
        
        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)
          const easedProgress = easeOutCubic(progress)
          
          scrollContainer.scrollLeft = startLeft + (distance * easedProgress)
          
          if (progress < 1) {
            requestAnimationFrame(animateScroll)
          }
        }
        
        requestAnimationFrame(animateScroll)
        console.log('📍 Custom scrolled to role model from search result click:', result.roleModel)
      }
    }, 100)
    
    // Update only the specific search result item
    setSearchResults(prev => 
      prev.map(item => 
        item.roleModelId === result.roleModelId && item.attributeId === result.attributeId
          ? { ...item, selected: !item.selected }
          : item
      )
    )
  }

  const handleAttributeToggle = (attributeId: string) => {
    console.log('🔘 handleAttributeToggle called with:', attributeId)
    const attribute = attributes.find(attr => attr.id === attributeId)
    const currentRoleModel = roleModels.find(rm => rm.id === selectedRoleModel)
    
    if (!attribute || !currentRoleModel) {
      console.log('❌ Missing attribute or role model')
      return
    }

    const isSelected = selectedAttributes.some(attr => 
      attr.roleModelId === selectedRoleModel && attr.attributeId === attributeId
    )
    console.log('🔘 isSelected:', isSelected, 'for attribute:', attributeId)

    if (isSelected) {
      setSelectedAttributes(prev => 
        prev.filter(attr => !(attr.roleModelId === selectedRoleModel && attr.attributeId === attributeId))
      )
    } else {
      if (selectedAttributes.length >= 10) return
      
      const dailyDoItems = currentRoleModel.dailyDoEnhanced?.attributes?.find(
        (attr: any) => attr.attributeId === attribute.name.toLowerCase().replace(/\s+/g, '-')
      )?.dailyDoItems

      setSelectedAttributes(prev => [
        ...prev,
        {
          roleModel: currentRoleModel.commonName,
          roleModelId: currentRoleModel.id,
          attribute: attribute.name,
          attributeId: attribute.id,
          originalMethod: attribute.method,
          dailyDoItems: dailyDoItems || null
        }
      ])
    }

    // Don't auto-highlight or scroll when user is just browsing attributes
    // Highlighting should only happen from AI recommendations or search result clicks
    console.log('🔘 Attribute toggled without highlighting:', currentRoleModel.commonName, '-', attribute.name)
  }

  const getUniqueRoleModels = () => {
    const uniqueRoleModels = new Set(selectedAttributes.map(attr => attr.roleModel))
    return Array.from(uniqueRoleModels)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your Lightwalker™ creation studio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white overflow-hidden">
      {/* Animated Background */}
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

      {/* Header */}
      <div className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            🤖 AI-Powered Lightwalker™ Creation
          </h1>
          <p className="text-gray-300">
            Talk naturally or search manually - watch your character build with visual magic
          </p>
        </div>
      </div>

      {/* Role Model Gallery */}
      <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 mb-6">
          <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
            <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
              ROLE MODELS
            </h3>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 pt-3 custom-scrollbar ml-8">
            {roleModels.map((roleModel) => (
              <div
                key={roleModel.id}
                data-role-model-id={roleModel.id}
                className={`min-w-[280px] relative p-4 rounded-lg border cursor-pointer transition-all duration-500 hover:scale-102 ${
                  selectedRoleModel === roleModel.id
                    ? 'bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-400 shadow-lg'
                    : highlightedRoleModel === roleModel.id
                    ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-400 shadow-lg ring-2 ring-green-400 animate-pulse'
                    : 'bg-gray-800/30 border-gray-600 hover:border-cyan-500/50'
                }`}
                onClick={() => {
                  console.log('🎯 Clicked role model:', roleModel.commonName, 'ID:', roleModel.id)
                  setSelectedRoleModel(roleModel.id)
                }}
                style={{ 
                  ...(selectedRoleModel === roleModel.id && {
                    background: `linear-gradient(45deg, ${roleModel.primaryColor}20, ${roleModel.secondaryColor}20)`,
                    boxShadow: `0 0 20px ${roleModel.primaryColor}30`
                  })
                }}
              >
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
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'block'
                      }}
                    />
                    <div className="text-2xl" style={{ display: 'none' }}>👤</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">{roleModel.commonName}</h4>
                    <p className="text-sm text-gray-400">{roleModel.primaryDomain}</p>
                  </div>
                </div>

                {/* AI Highlight Badge */}
                {highlightedRoleModel === roleModel.id && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce z-50 shadow-lg">
                    AI Pick!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-2 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Panel - AI Interface */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6">
            <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
              <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                  style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
                AI ASSISTANT
              </h3>
            </div>
            
            <div className="ml-8 h-full flex flex-col">
              {/* Mode Toggle */}
              <div className="flex mb-6">
                <div className="bg-gray-700/50 rounded-lg p-1 flex">
                  <button
                    onClick={() => setIsAIMode(true)}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      isAIMode 
                        ? 'bg-purple-500 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    AI-Guided
                  </button>
                  <button
                    onClick={() => setIsAIMode(false)}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      !isAIMode 
                        ? 'bg-cyan-500 text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    Manual Search
                  </button>
                </div>
              </div>

              {/* AI Conversation Mode */}
              {isAIMode && (
                <div className="flex-1 flex flex-col">
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4">
                    <h3 className="text-purple-400 font-medium mb-2 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Tell me what you're working on
                    </h3>
                    <textarea
                      value={aiConversation}
                      onChange={(e) => setAiConversation(e.target.value)}
                      placeholder="I'm having trouble staying focused at work and get distracted by everything..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none h-32"
                    />
                    <button
                      onClick={handleAIConversation}
                      disabled={!aiConversation.trim() || aiProcessing || searchProcessing}
                      className="mt-3 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Sparkles className={`h-4 w-4 ${(aiProcessing || searchProcessing) ? 'animate-spin' : ''}`} />
                      {aiProcessing ? 'Analyzing...' : searchProcessing ? 'Finding Matches...' : 'Add Superpowers to my Lightwalker™'}
                    </button>
                  </div>
                  
                  {/* AI Response Message & Search Results */}
                  {aiMessage && (
                    <div className="flex-1 flex flex-col overflow-y-auto">
                      <div className="p-4 bg-purple-900/30 border border-purple-500/40 rounded-lg mb-4">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="text-purple-100 text-sm whitespace-pre-line">{aiMessage}</div>
                        </div>
                      </div>
                      
                      {/* AI Search Results */}
                      {searchResults.length > 0 && (
                        <div className="space-y-3">
                          {searchResults.map((result, index) => (
                            <div
                              key={`ai-search-${result.roleModelId}-${result.attributeId}`}
                              onClick={() => toggleAttributeSelection(result)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                result.selected 
                                  ? 'border-cyan-500 bg-cyan-500/10' 
                                  : highlightedAttribute === result.attributeId
                                  ? 'border-green-500 bg-green-500/10 ring-2 ring-green-400 animate-pulse'
                                  : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {result.selected ? (
                                      <CheckSquare className="h-4 w-4 text-cyan-400" />
                                    ) : (
                                      <Square className="h-4 w-4 text-gray-400" />
                                    )}
                                    <div className="font-medium text-white text-sm">{result.attribute}</div>
                                    {highlightedAttribute === result.attributeId && (
                                      <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                                        AI Pick!
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400 mb-1">{result.roleModel}</div>
                                  <div className="text-xs text-gray-500 line-clamp-2">
                                    {result.originalMethod}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Search Mode */}
              {!isAIMode && (
                <div className="flex-1 flex flex-col">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type 1-2 words: focus, stress, empathy, anger..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="text-sm text-cyan-400 mb-4">
                    💡 Only type 1-2 words of your area of interest
                  </div>

                  {/* Search Results */}
                  <div className="flex-1 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        {searchQuery.length <= 2 
                          ? "Enter 3+ characters to search" 
                          : "No results found"}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {searchResults.map((result, index) => (
                          <div
                            key={`search-${result.roleModelId}-${result.attributeId}`}
                            onClick={() => toggleAttributeSelection(result)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              result.selected 
                                ? 'border-cyan-500 bg-cyan-500/10' 
                                : highlightedAttribute === result.attributeId
                                ? 'border-green-500 bg-green-500/10 ring-2 ring-green-400 animate-pulse'
                                : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {result.selected ? (
                                    <CheckSquare className="h-4 w-4 text-cyan-400" />
                                  ) : (
                                    <Square className="h-4 w-4 text-gray-400" />
                                  )}
                                  <div className="font-medium text-white text-sm">{result.attribute}</div>
                                  {highlightedAttribute === result.attributeId && (
                                    <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                                      AI Pick!
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mb-1">{result.roleModel}</div>
                                <div className="text-xs text-gray-500 line-clamp-2">
                                  {result.originalMethod}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Attributes */}
          <div className="lg:col-span-3 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6">
            <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
              <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                  style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
                ATTRIBUTES
              </h3>
            </div>
            
            <div className="ml-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {selectedRoleModel 
                    ? `${roleModels.find(rm => rm.id === selectedRoleModel)?.commonName} Attributes`
                    : 'Select Role Model First'
                  }
                </h4>
                <div className="text-sm text-gray-400">
                  {selectedAttributes.length}/10 selected
                </div>
              </div>
            
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {attributes.map((attribute) => (
                  <div 
                    key={`${selectedRoleModel}-${attribute.id}-${attribute.name}`} 
                    className={`border rounded-lg p-4 transition-all duration-300 ${
                      highlightedAttribute === attribute.id
                        ? 'border-green-500 bg-green-500/10 ring-2 ring-green-400 animate-pulse'
                        : 'border-gray-700/50 hover:bg-gray-800/30'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAttributes.some(attr => attr.roleModelId === selectedRoleModel && attr.attributeId === attribute.id)}
                        onChange={() => handleAttributeToggle(attribute.id)}
                        className="mt-1 h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold text-white">{attribute.name}</h5>
                          {highlightedAttribute === attribute.id && (
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
                              AI Recommended!
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{attribute.description}</p>
                        <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-400">
                          <strong>Method:</strong> {attribute.method}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Selected Attributes Summary */}
              {selectedAttributes.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-3">
                    🎭 Your Wisdom Team ({selectedAttributes.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueRoleModels().map((roleModel, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
                      >
                        {roleModel}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    disabled={selectedAttributes.length === 0}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create My Lightwalker™ ({selectedAttributes.length} superpowers)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}