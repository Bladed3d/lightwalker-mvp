'use client'

import { useState, useEffect } from 'react'
import { Search, Sparkles, User, MessageCircle, CheckSquare, Square } from 'lucide-react'

interface RoleModel {
  id: string
  commonName: string
  primaryDomain: string
  enhancedAttributes: any[]
  dailyDoEnhanced: any
}

interface SearchResult {
  roleModel: string
  attribute: string
  originalMethod: string
  dailyDoItems?: any[]
  relevanceScore: number
  selected?: boolean
}

interface SelectedAttribute {
  roleModel: string
  attribute: string
  originalMethod: string
  dailyDoItems?: any[]
}

export default function AICharacterCreationPage() {
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([])
  const [isAIMode, setIsAIMode] = useState(true)
  const [aiConversation, setAiConversation] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
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
      performSearch(searchQuery)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, roleModels])

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

  const performSearch = (query: string) => {
    const results: SearchResult[] = []
    
    // Filter out common stop words and extract meaningful terms
    const stopWords = ['how', 'can', 'i', 'to', 'be', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'by', 'the', 'of', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should', 'do', 'does', 'did', 'have', 'has', 'had', 'get', 'got', 'make', 'made', 'take', 'took', 'help', 'want', 'need']
    
    // Extract base terms
    let searchTerms = query.toLowerCase()
      .split(' ')
      .filter(term => term.length > 2 && !stopWords.includes(term))
    
    // Add synonyms for common user intents
    const synonymMap: Record<string, string[]> = {
      'focus': ['focus', 'concentration', 'attention', 'strategic', 'priorities', 'distraction'],
      'overwhelmed': ['overwhelmed', 'stress', 'chaos', 'busy', 'pressure'],
      'priorities': ['priorities', 'focus', 'strategic', 'important', 'essential'],
      'procrastination': ['procrastination', 'delay', 'avoidance', 'motivation'],
      'decisions': ['decisions', 'choice', 'judgment', 'strategy'],
      'stress': ['stress', 'overwhelmed', 'pressure', 'anxiety', 'calm'],
      'gratitude': ['gratitude', 'appreciation', 'thankful', 'positive'],
      'anger': ['anger', 'frustration', 'irritation', 'patience', 'calm'],
      'empathy': ['empathy', 'compassion', 'understanding', 'kindness']
    }
    
    // Expand search terms with synonyms
    const expandedTerms = new Set(searchTerms)
    searchTerms.forEach(term => {
      if (synonymMap[term]) {
        synonymMap[term].forEach(synonym => expandedTerms.add(synonym))
      }
    })
    
    searchTerms = Array.from(expandedTerms)
    
    // If no meaningful terms, return empty
    if (searchTerms.length === 0) {
      setSearchResults([])
      return
    }

    roleModels.forEach(roleModel => {
      roleModel.enhancedAttributes?.forEach(attribute => {
        let relevanceScore = 0
        
        // Primary searchable content (higher weight)
        const primaryText = `${attribute.name} ${attribute.description}`.toLowerCase()
        const methodText = `${attribute.method}`.toLowerCase() 
        const benefitText = `${attribute.benefit || ''}`.toLowerCase()
        
        // Daily-Do content (if available)
        const dailyDoItems = roleModel.dailyDoEnhanced?.attributes?.find(
          (attr: any) => attr.attributeId === attribute.name.toLowerCase().replace(/\s+/g, '-')
        )?.dailyDoItems
        
        const dailyDoText = dailyDoItems ? 
          dailyDoItems.map((item: any) => `${item.action} ${item.category} ${item.successCriteria}`).join(' ').toLowerCase() : ''
        
        // Calculate relevance with weighted scoring
        searchTerms.forEach(term => {
          // High weight for attribute name matches
          if (primaryText.includes(term)) {
            relevanceScore += (primaryText.split(term).length - 1) * 10
          }
          
          // Medium weight for method/benefit matches  
          if (methodText.includes(term)) {
            relevanceScore += (methodText.split(term).length - 1) * 5
          }
          
          if (benefitText.includes(term)) {
            relevanceScore += (benefitText.split(term).length - 1) * 5
          }
          
          // High weight for Daily-Do content matches (most relevant to user)
          if (dailyDoText.includes(term)) {
            relevanceScore += (dailyDoText.split(term).length - 1) * 8
          }
        })

        if (relevanceScore > 0) {
          results.push({
            roleModel: roleModel.commonName,
            attribute: attribute.name,
            originalMethod: attribute.method,
            dailyDoItems: dailyDoItems || null,
            relevanceScore,
            selected: selectedAttributes.some(sel => 
              sel.roleModel === roleModel.commonName && sel.attribute === attribute.name
            )
          })
        }
      })
    })

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    setSearchResults(results.slice(0, 8)) // Top 8 results for better UI
  }

  const toggleAttributeSelection = (result: SearchResult) => {
    const isSelected = selectedAttributes.some(attr => 
      attr.roleModel === result.roleModel && attr.attribute === result.attribute
    )

    if (isSelected) {
      // Remove from selection
      setSelectedAttributes(prev => 
        prev.filter(attr => !(attr.roleModel === result.roleModel && attr.attribute === result.attribute))
      )
    } else {
      // Add to selection
      setSelectedAttributes(prev => [
        ...prev,
        {
          roleModel: result.roleModel,
          attribute: result.attribute,
          originalMethod: result.originalMethod,
          dailyDoItems: result.dailyDoItems
        }
      ])
    }

    // Update search results to reflect selection state
    setSearchResults(prev => 
      prev.map(item => ({
        ...item,
        selected: item.roleModel === result.roleModel && item.attribute === result.attribute 
          ? !item.selected 
          : item.selected
      }))
    )
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
            foundMatches: searchResults.length,
            selectedAttributes: selectedAttributes.length
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Set AI message for user feedback
        setAiMessage(data.aiMessage)
        
        // Use extracted keywords for search
        if (data.keywords.length > 0) {
          setSearchQuery(data.keywords.join(' '))
          setIsAIMode(false) // Switch to show search results
        }
        
        // Auto-highlight first result but don't auto-select
        // User must still checkbox confirm
        
      } else {
        // Handle fallback
        setAiMessage(data.fallback?.aiMessage || "I'm having trouble understanding. Try simpler terms like 'focus' or 'stress'.")
        if (data.fallback?.keywords) {
          setSearchQuery(data.fallback.keywords.join(' '))
        }
      }
      
    } catch (error) {
      console.error('AI conversation failed:', error)
      setAiMessage("I'm having trouble processing that right now. Try using simple terms like 'focus', 'stress', or 'confidence'.")
    } finally {
      setAiProcessing(false)
    }
  }

  const getUniqueRoleModels = () => {
    const uniqueRoleModels = new Set(selectedAttributes.map(attr => attr.roleModel))
    return Array.from(uniqueRoleModels)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your Lightwalker™ creation studio...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-600">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            🤖 AI-Powered Lightwalker™ Creation
          </h1>
          <p className="text-gray-300">
            Talk naturally or search manually - watch your ideal self come together
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Side: Discovery Interface */}
          <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-6">
            <div className="h-full flex flex-col">
              
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
                      Tell me what you're struggling with
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Describe your challenges naturally - I'll build your perfect Lightwalker™ automatically
                    </p>
                    <textarea
                      value={aiConversation}
                      onChange={(e) => setAiConversation(e.target.value)}
                      placeholder="I'm having trouble staying focused at work and get distracted by everything..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none h-32"
                    />
                    <button
                      onClick={handleAIConversation}
                      disabled={!aiConversation.trim() || aiProcessing}
                      className="mt-3 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Sparkles className={`h-4 w-4 ${aiProcessing ? 'animate-spin' : ''}`} />
                      {aiProcessing ? 'Analyzing...' : 'Build My Lightwalker™'}
                    </button>
                    
                    {/* AI Response Message */}
                    {aiMessage && (
                      <div className="mt-4 p-4 bg-purple-900/30 border border-purple-500/40 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="text-purple-100 text-sm">{aiMessage}</div>
                        </div>
                      </div>
                    )}
                  </div>
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
                    💡 Only type 1-2 words of your area of interest (example: focus, distraction, empathy, anger)
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
                            key={index}
                            onClick={() => toggleAttributeSelection(result)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              result.selected 
                                ? 'border-cyan-500 bg-cyan-500/10' 
                                : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {result.selected ? (
                                    <CheckSquare className="h-5 w-5 text-cyan-400" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                  <div className="font-medium text-white">{result.attribute}</div>
                                </div>
                                <div className="text-sm text-gray-400 mb-1">{result.roleModel}</div>
                                <div className="text-xs text-gray-500 line-clamp-2">
                                  {result.originalMethod}
                                </div>
                              </div>
                              <div className="text-xs text-cyan-400 ml-2">
                                {result.relevanceScore}
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

          {/* Right Side: Live Lightwalker Builder */}
          <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-6">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Your Lightwalker™</h2>
                <div className="ml-auto bg-cyan-500/20 px-3 py-1 rounded-full text-cyan-400 text-sm">
                  {selectedAttributes.length}/6 attributes
                </div>
              </div>

              {selectedAttributes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Your Lightwalker™ is waiting
                    </h3>
                    <p className="text-gray-400">
                      Search for attributes or talk to AI to start building your ideal future self
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  {/* Role Model Team */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">
                      🎭 Your Wisdom Team
                    </h3>
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
                  </div>

                  {/* Selected Attributes */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">
                      ⚡ Your Superpowers
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedAttributes.map((attr, index) => (
                        <div
                          key={index}
                          className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-white">{attr.attribute}</div>
                            <button
                              onClick={() => {
                                setSelectedAttributes(prev => 
                                  prev.filter((_, i) => i !== index)
                                )
                              }}
                              className="text-gray-400 hover:text-red-400 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="text-sm text-cyan-300">{attr.roleModel}</div>
                          <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                            {attr.originalMethod}
                          </div>
                          {attr.dailyDoItems && (
                            <div className="mt-2 text-xs text-green-400">
                              ✨ {attr.dailyDoItems.length} Daily Actions Ready
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create Button */}
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <button
                      disabled={selectedAttributes.length === 0}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create My Lightwalker™ ({selectedAttributes.length} attributes)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}