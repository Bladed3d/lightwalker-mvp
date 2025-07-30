'use client'

// Admin Enhancement Review Page
// Purpose: Easy way to review Daily-Do enhancements as they appear to users
// URL: /admin/review-enhancements

import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Edit, Sparkles, ArrowRight } from 'lucide-react'
import DailyDoActivityDisplay from '@/components/lightwalker/DailyDoActivityDisplay'

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
}

export default function ReviewEnhancementsPage() {
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'hardcoded' | 'ai-future'>('hardcoded')

  useEffect(() => {
    loadRoleModels()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch(searchQuery)
    } else {
      setSearchResults([])
      setSelectedResult(null)
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
    const searchTerms = query.toLowerCase().split(' ')

    roleModels.forEach(roleModel => {
      roleModel.enhancedAttributes?.forEach(attribute => {
        let relevanceScore = 0
        const searchableText = `${attribute.name} ${attribute.description} ${attribute.method} ${attribute.benefit}`.toLowerCase()
        
        // Calculate relevance based on search terms
        searchTerms.forEach(term => {
          if (searchableText.includes(term)) {
            relevanceScore += searchableText.split(term).length - 1
          }
        })

        if (relevanceScore > 0) {
          // Get Daily-Do items if available
          const dailyDoItems = roleModel.dailyDoEnhanced?.attributes?.find(
            (attr: any) => attr.attributeId === attribute.name.toLowerCase().replace(/\s+/g, '-')
          )?.dailyDoItems

          results.push({
            roleModel: roleModel.commonName,
            attribute: attribute.name,
            originalMethod: attribute.method,
            dailyDoItems: dailyDoItems || null,
            relevanceScore
          })
        }
      })
    })

    // Sort by relevance
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)
    setSearchResults(results.slice(0, 10)) // Top 10 results
    
    if (results.length > 0) {
      setSelectedResult(results[0])
    }
  }

  const mockAIPersonalization = (result: SearchResult) => {
    return {
      analysisPrompt: `User searched for: "${searchQuery}"
Found: ${result.attribute} from ${result.roleModel}
Original wisdom: "${result.originalMethod}"

AI Context: User seems to be struggling with ${searchQuery.toLowerCase()}. This suggests they need concrete, immediate actions rather than abstract advice.`,
      
      suggestedPersonalization: [
        `Given your specific situation with ${searchQuery}, I'd recommend starting with this approach from ${result.roleModel}...`,
        `Based on what you're dealing with, let's break this down into something you can do right now...`,
        `I notice you're looking for help with ${searchQuery}. ${result.roleModel}'s method can be adapted specifically for your situation...`
      ],
      
      dynamicActions: [
        `Tell me more about your specific ${searchQuery} situation and I'll help you apply ${result.roleModel}'s approach`,
        `What have you already tried with ${searchQuery}? Let's build from there using ${result.roleModel}'s wisdom`,
        `Let's create a personalized plan for ${searchQuery} based on how ${result.roleModel} would approach your exact circumstances`
      ]
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading enhancements...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            🔍 Enhancement Review Dashboard
          </h1>
          <p className="text-gray-300">
            Search like a customer would - see exactly what they'll experience
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800/50 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('hardcoded')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'hardcoded' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📋 Current (Hardcoded Actions)
            </button>
            <button
              onClick={() => setViewMode('ai-future')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'ai-future' 
                  ? 'bg-purple-500 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              🤖 Future (AI Personalization)
            </button>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-gray-800/30 rounded-lg p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search like a customer: 'I can't focus', 'feeling overwhelmed', 'bad at priorities'..."
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          
          {searchQuery && searchResults.length > 0 && (
            <div className="mt-4 text-sm text-gray-400">
              Found {searchResults.length} relevant solutions
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 rounded-lg border border-gray-600">
              <div className="p-4 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-cyan-400 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Search Results
                </h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center">
                    {searchQuery.length <= 2 
                      ? "Enter 3+ characters to search" 
                      : "No results found"}
                  </div>
                ) : (
                  searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedResult(result)}
                      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                        selectedResult === result 
                          ? 'bg-cyan-500/20 border-cyan-500/50' 
                          : 'hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="font-medium text-white">{result.attribute}</div>
                      <div className="text-sm text-gray-400">{result.roleModel}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {result.originalMethod}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-cyan-400">
                          Relevance: {result.relevanceScore}
                        </span>
                        {result.dailyDoItems && (
                          <span className="text-xs text-green-400">
                            ✨ Enhanced
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Panel */}
          <div className="lg:col-span-2">
            {selectedResult ? (
              <div className="space-y-6">
                {/* Result Header */}
                <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedResult.attribute}</h2>
                      <p className="text-cyan-400">from {selectedResult.roleModel}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-400">Customer View</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-medium mb-2">📜 Original Wisdom:</h4>
                    <p className="text-gray-300 italic">"{selectedResult.originalMethod}"</p>
                  </div>
                </div>

                {/* Current Implementation */}
                {viewMode === 'hardcoded' && selectedResult.dailyDoItems ? (
                  <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-cyan-500/20 rounded-full p-2 mr-3">
                        <Edit className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Current Solution (Hardcoded)</h3>
                        <p className="text-gray-400">What customers see right now</p>
                      </div>
                    </div>
                    
                    <DailyDoActivityDisplay
                      attribute={{
                        name: selectedResult.attribute,
                        description: `${selectedResult.roleModel}'s approach to this challenge`,
                        method: selectedResult.originalMethod
                      }}
                      roleModelName={selectedResult.roleModel}
                      dailyDoEnhancement={{
                        attributeId: selectedResult.attribute.toLowerCase().replace(/\s+/g, '-'),
                        originalMethod: selectedResult.originalMethod,
                        dailyDoItems: selectedResult.dailyDoItems,
                        enhancedAt: new Date().toISOString(),
                        enhancedVersion: "1.0",
                        difficultyRange: { min: 2, max: 6, average: 4 },
                        totalGamePoints: selectedResult.dailyDoItems.reduce((sum: number, item: any) => sum + item.gamePoints, 0)
                      }}
                      showEnhanced={true}
                      onItemComplete={(itemId) => console.log('Completed:', itemId)}
                    />
                  </div>
                ) : viewMode === 'ai-future' ? (
                  <div className="bg-gray-800/30 rounded-lg border border-purple-600 p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">Future Vision (AI Personalization)</h3>
                        <p className="text-gray-400">How AI could customize this for each user</p>
                      </div>
                    </div>
                    
                    {(() => {
                      const aiMock = mockAIPersonalization(selectedResult)
                      return (
                        <div className="space-y-4">
                          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                            <h4 className="text-purple-400 font-medium mb-2">🧠 AI Analysis:</h4>
                            <p className="text-gray-300 text-sm">{aiMock.analysisPrompt}</p>
                          </div>
                          
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                            <h4 className="text-blue-400 font-medium mb-2">💬 AI Conversation Starters:</h4>
                            <ul className="space-y-2">
                              {aiMock.dynamicActions.map((action, index) => (
                                <li key={index} className="flex items-start">
                                  <ArrowRight className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                            <h4 className="text-green-400 font-medium mb-2">✨ Learning & Improvement:</h4>
                            <p className="text-gray-300 text-sm">
                              Each personalized interaction teaches the system what works for different user types and situations, 
                              gradually improving the hardcoded actions for future users with similar challenges.
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-6">
                    <div className="text-center text-gray-400">
                      <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Enhanced Version Yet</h3>
                      <p>This activity hasn't been enhanced with Daily-Do items.</p>
                      <p className="text-sm mt-2">Users would see the original method only.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Search for Customer Problems</h3>
                <p className="text-gray-400 mb-4">
                  Try searches like: "can't focus", "feeling overwhelmed", "bad at priorities", "procrastination"
                </p>
                <p className="text-sm text-gray-500">
                  See exactly what solutions your customers would find
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}