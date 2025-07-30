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
  oppositeOf?: string
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

interface GamificationState {
  discoveryPoints: number
  level: number
  completionPercentage: number
  achievements: string[]
  currentPhase: 'welcome' | 'discovery' | 'selection' | 'synthesis' | 'activation'
}

type DiscoveryPathway = 'role-model' | 'ai-guide' | 'perfect-day' | 'values-first'

export default function AICharacterCreationHybridPage() {
  // Core state
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const [selectedRoleModel, setSelectedRoleModel] = useState<string>('')
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedAttribute[]>([])
  const [loading, setLoading] = useState(true)
  
  // Discovery pathway state
  const [activePathway, setActivePathway] = useState<DiscoveryPathway>('ai-guide')
  const [gamification, setGamification] = useState<GamificationState>({
    discoveryPoints: 0,
    level: 1,
    completionPercentage: 0,
    achievements: [],
    currentPhase: 'welcome'
  })
  
  // AI and search state  
  const [isAIMode, setIsAIMode] = useState(true)
  const [aiConversation, setAiConversation] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  const [searchProcessing, setSearchProcessing] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [highlightedRoleModel, setHighlightedRoleModel] = useState<string>('')
  const [highlightedAttribute, setHighlightedAttribute] = useState<string>('')
  const [webResearchResponse, setWebResearchResponse] = useState<string>('')
  
  // UI state
  const [expandedAttributeTab, setExpandedAttributeTab] = useState<{attributeId: string, tab: string} | null>(null)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  
  // Perfect Day conversation state
  const [perfectDayStage, setPerfectDayStage] = useState<'morning' | 'work' | 'evening' | 'extraction' | 'complete'>('morning')
  const [perfectDayData, setPerfectDayData] = useState<{
    morning: string
    work: string  
    evening: string
    extractedTraits: string[]
  }>({
    morning: '',
    work: '',
    evening: '',
    extractedTraits: []
  })

  useEffect(() => {
    loadRoleModels()
    // Set opening AI message based on active pathway
    updateAIMessageForPathway()
  }, [])

  useEffect(() => {
    updateGamificationState()
  }, [selectedAttributes, selectedRoleModel])

  const updateAIMessageForPathway = () => {
    switch (activePathway) {
      case 'ai-guide':
        setAiMessage(`I'm excited to help build your ideal future self! 

What feels most natural for you to think about:

🎯 **Challenges you face** (distraction, overwhelm, anger, stress)
✨ **Strengths you want** (focus, patience, confidence, wisdom)  
🎭 **People you admire** (Steve Jobs, Buddha, Einstein)
📋 **Daily habits you wish you had** (meditation, planning, exercise)

Just describe what you're working on, and I'll find the perfect attributes for your Lightwalker™!`)
        break
      case 'perfect-day':
        setPerfectDayStage('morning')
        setPerfectDayData({ morning: '', work: '', evening: '', extractedTraits: [] })
        setAiMessage(`🌅 **PERFECT DAY DISCOVERY** - Stage 1 of 3

Let's design your perfect day to discover your ideal character! I'll walk you through three parts of your day and extract the personality traits needed to live that way naturally.

**MORNING ROUTINE (6am-12pm)**: Describe your perfect morning - how do you wake up, what's your energy like, what activities set you up for success?

*Example: "I wake naturally at 6am feeling refreshed, meditate for 20 minutes, make a healthy breakfast while listening to podcasts, then review my priorities for the day..."*`)
        break
      case 'role-model':
        setAiMessage(`Who do you most admire and want to learn from?

Tell me about someone (famous, historical, or personal) whose approach to life inspires you. I'll find our most similar role model and help you extract their key attributes for your Lightwalker™.

*Note: Even if you mention someone not in our database (like Bill Gates), I'll find our closest match (like Steve Jobs) and show you their attributes.*`)
        break
      case 'values-first':
        setAiMessage(`What matters most to you in life?

Describe your core values and principles - what you stand for, what drives your decisions, what you want to be remembered for. I'll help translate these into daily character traits.`)
        break
    }
  }

  const updateGamificationState = () => {
    const basePoints = selectedAttributes.length * 25
    const roleModelBonus = selectedRoleModel ? 100 : 0
    const achievementPoints = gamification.achievements.length * 50
    
    const totalPoints = basePoints + roleModelBonus + achievementPoints
    const completionPercentage = Math.min((selectedAttributes.length / 10) * 100, 100)
    const level = Math.floor(totalPoints / 300) + 1 // Adjusted for 10 attributes (10*25 + 100 + achievements)

    setGamification(prev => ({
      ...prev,
      discoveryPoints: totalPoints,
      completionPercentage,
      level,
      currentPhase: selectedAttributes.length >= 8 ? 'synthesis' : 
                   selectedAttributes.length > 0 ? 'selection' : 
                   selectedRoleModel ? 'discovery' : 'welcome'
    }))
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
      case 'ai-guide':
        return 'Talk naturally about challenges or goals - I\'ll find perfect matches'
      case 'perfect-day':
        return 'Design your perfect day, then select enabling attributes'
      case 'values-first':
        return 'Identify your core values, then select aligned attributes'
    }
  }

  const getActiveAreaHighlight = () => {
    switch (activePathway) {
      case 'role-model':
        return 'highlight-top'
      case 'ai-guide':
        return 'highlight-left'
      case 'perfect-day':
        return perfectDayStage === 'complete' ? 'highlight-right' : 'highlight-instructions'
      case 'values-first':
        return 'highlight-left'
      default:
        return ''
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered - searchQuery:', searchQuery, 'length:', searchQuery.length)
    if (searchQuery.length > 2) {
      console.log('✅ Triggering performSearch with:', searchQuery)
      performSearch(searchQuery) // Now async but no need to await in useEffect
    } else {
      console.log('❌ searchQuery too short, clearing results')
      setSearchResults([])
      setHighlightedRoleModel('')
      setHighlightedAttribute('')
      setWebResearchResponse('')
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
      setWebResearchResponse('')
      setSearchProcessing(false)
      return
    }

    setSearchProcessing(true)

    // Direct keyword-based search - no data preparation needed
    console.log('🔍 Using lightweight keyword search (no phone book processing)')
    performBasicSearch(query)
    setSearchProcessing(false)
  }

  const performBasicSearch = async (query: string) => {
    console.log('🔍 Semantic search with query:', query)
    
    try {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
      
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: searchTerms,
          searchQuery: query
        })
      })

      const data = await response.json()
      
      if (data.success && data.results) {
        // Convert semantic search results to UI format
        const formattedResults = data.results.map((result: any) => ({
          ...result,
          selected: selectedAttributes.some(sel => 
            sel.roleModelId === result.roleModelId && sel.attributeId === result.attributeId
          )
        }))
        
        console.log('🎭 Found', formattedResults.length, 'semantic results via', data.searchStrategy, ':', 
          formattedResults.map((r: any) => `${r.roleModel}-${r.attribute}`))
        setSearchResults(formattedResults)
        
        // Update AI message based on results
        updateUIBasedOnResults(formattedResults, query)
      } else {
        console.log('❌ Semantic search failed:', data.error)
        setSearchResults([])
        setWebResearchResponse('')
        setAiMessage(`I didn't find matches for "${query}". Try simpler terms like "focus", "stress", or "confidence".`)
      }
    } catch (error) {
      console.error('❌ Semantic search error:', error)
      setSearchResults([])
      setWebResearchResponse('')
      setAiMessage(`I'm having trouble searching right now. Try simpler terms like "focus", "stress", or "confidence".`)
    }
  }

  const updateUIBasedOnResults = (results: SearchResult[], query: string) => {
    // Update AI message based on results
    if (results.length === 0) {
      setAiMessage(`I didn't find matches for "${query}". Try simpler terms like "focus", "stress", or "confidence".`)
    } else if (results.length === 1) {
      setAiMessage(`Perfect! I found exactly what you're looking for. Check the box if it resonates with you.`)
    } else {
      setAiMessage(`Great! I found ${results.length} approaches that could help. I've highlighted the strongest match, but explore all the options below and select what resonates most.`)
    }
    
    // Auto-highlight top result
    if (results.length > 0) {
      const topResult = results[0]
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
      // Handle Perfect Day multi-stage conversation
      if (activePathway === 'perfect-day') {
        handlePerfectDayConversation()
        return
      }
      
      // Check if user is asking about a specific person for web research
      // More flexible pattern to catch various ways people mention names
      const personMentionPatterns = [
        /(?:attributes?|traits|qualities|characteristics)[\s\w]*?(?:of|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+should|\s+that|\s+who|\s+which|$|\s*[?.!,])/i,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)'s?\s+(?:traits|attributes?|qualities|characteristics)/i,
        /(?:about|from|like)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*?)(?:\s+should|\s+that|\s+who|\s+which|$|\s*[?.!,])/i
      ]
      
      let mentionedPerson = null
      let personMatch = null
      
      for (const pattern of personMentionPatterns) {
        personMatch = aiConversation.match(pattern)
        if (personMatch) {
          mentionedPerson = personMatch[1]
          break
        }
      }
      
      
      // Our database role models to avoid researching
      const databasePeople = ['steve jobs', 'einstein', 'albert einstein', 'buddha', 'newton', 'isaac newton', 'leonardo da vinci', 'marcus aurelius', 'joan of arc', 'marie curie', 'maya angelou', 'martin luther king jr', 'patanjali']
      
      if (mentionedPerson && !databasePeople.some(dbPerson => dbPerson.toLowerCase() === mentionedPerson.toLowerCase())) {
        console.log('🔍 Web research needed for:', mentionedPerson)
        await handlePersonResearch(mentionedPerson)
        return
      }
      
      // Handle other pathways with standard AI processing
      const response = await fetch('/api/ai-character-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: aiConversation
        })
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.keywords.length > 0) {
          const keywords = data.keywords.join(' ')
          console.log('🎯 AI extracted keywords:', keywords)
          setSearchQuery(keywords)
          
          // Check if any role models were mapped
          const roleModelNames = ['steve jobs', 'einstein', 'buddha', 'newton', 'leonardo da vinci', 'marcus aurelius', 'joan of arc', 'marie curie', 'maya angelou', 'martin luther king jr', 'patanjali']
          const mappedRoleModels = data.keywords.filter(keyword => 
            roleModelNames.some(name => name.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(name.replace(' ', '')))
          )
          
          if (mappedRoleModels.length > 0) {
            setAiMessage(`Perfect! I found conceptual matches in our database: **${mappedRoleModels.join(', ')}** and traits: **${data.keywords.filter(k => !mappedRoleModels.includes(k)).join(', ')}**. 

Let me search for their most relevant attributes...`)
          } else {
            setAiMessage("Perfect! I extracted keywords: " + data.keywords.join(', ') + ". Let me search for relevant attributes...")
          }
          
          // Trigger search automatically
          setTimeout(() => {
            performSearch(keywords)
          }, 100)
        } else {
          setAiMessage("I didn't find clear keywords. Try terms like 'focus', 'forgiveness', 'confidence', or describe what you want to work on.")
        }
      } else {
        setAiMessage("I'm having trouble processing that right now. Try using simple terms like 'focus', 'stress', or 'confidence'.")
      }
      
    } catch (error) {
      console.error('❌ AI API REQUEST FAILED:', error)
      setAiMessage("I'm having trouble processing that right now. Try using simple terms like 'focus', 'stress', or 'confidence'.")
    } finally {
      setAiProcessing(false)
    }
  }

  const handlePerfectDayConversation = () => {
    const userResponse = aiConversation.trim()
    
    switch (perfectDayStage) {
      case 'morning':
        setPerfectDayData(prev => ({ ...prev, morning: userResponse }))
        setPerfectDayStage('work')
        setAiMessage(`💼 **PERFECT DAY DISCOVERY** - Stage 2 of 3

Great morning routine! Now let's explore your ideal work/contribution period.

**WORK & CONTRIBUTION (12pm-6pm)**: How do you handle your most important work? What's your energy like? How do you interact with others? How do you make decisions?

*Example: "I focus deeply on creative projects for 3-hour blocks, take walking breaks every 2 hours, have confident conversations with my team, and say no to non-essential meetings..."*`)
        setAiConversation('')
        setAiProcessing(false)
        break
        
      case 'work':
        setPerfectDayData(prev => ({ ...prev, work: userResponse }))
        setPerfectDayStage('evening')
        setAiMessage(`🌙 **PERFECT DAY DISCOVERY** - Stage 3 of 3

Excellent! Now let's complete your perfect day.

**EVENING & PERSONAL TIME (6pm-10pm)**: How do you wind down? What activities energize vs. drain you? How do you handle relationships and personal time?

*Example: "I cook mindfully, spend quality time with loved ones without distractions, read for 30 minutes, and reflect on the day's wins before sleeping peacefully at 10pm..."*`)
        setAiConversation('')
        setAiProcessing(false)
        break
        
      case 'evening':
        setPerfectDayData(prev => ({ ...prev, evening: userResponse }))
        setPerfectDayStage('extraction')
        extractPerfectDayTraits()
        break
    }
  }

  const extractPerfectDayTraits = async () => {
    const fullDayDescription = `Morning: ${perfectDayData.morning}\nWork: ${perfectDayData.work}\nEvening: ${aiConversation}`
    
    try {
      const response = await fetch('/api/ai-character-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: `Extract personality traits AND find conceptually similar role models from this perfect day description: ${fullDayDescription}. 

Our database contains these role models: Steve Jobs, Einstein, Buddha, Newton, Leonardo da Vinci, Marcus Aurelius, Joan of Arc, Marie Curie, Maya Angelou, Martin Luther King Jr., Patanjali, and others.

Look for:
1. Character traits like focus, patience, confidence, mindfulness, organization, etc.
2. Any people mentioned - but find our SIMILAR role models instead of exact names
   - If they mention Bill Gates → suggest "Steve Jobs" (tech innovator)
   - If they mention Oprah → suggest "Maya Angelou" (inspiring communicator)
   - If they mention Gandhi → suggest "Martin Luther King Jr." (peaceful leader)
   - If they mention any scientist → suggest "Einstein" or "Newton" or "Marie Curie"
   - If they mention any philosopher → suggest "Marcus Aurelius" or "Buddha"
3. Activities that suggest specific traits (meditation = mindful, planning = organized, etc.)

Return keywords that will find the most relevant attributes in our role model database.`
        })
      })

      const data = await response.json()
      
      if (data.success && data.keywords.length > 0) {
        const keywords = data.keywords.join(' ')
        setSearchQuery(keywords)
        setAiMessage(`🎯 **PERFECT DAY ANALYSIS COMPLETE!**

From your perfect day, I identified these key traits: **${data.keywords.join(', ')}**

The attributes below show the personality characteristics someone would need to naturally live your ideal lifestyle. Select the ones that resonate most with you!`)
        
        // Trigger search with extracted traits
        setTimeout(() => {
          performSearch(keywords)
        }, 100)
        
        setPerfectDayStage('complete')
      } else {
        setAiMessage("Let me search for some common traits that enable ideal daily routines...")
        setSearchQuery("organized focused mindful balanced")
        setTimeout(() => {
          performSearch("organized focused mindful balanced")
        }, 100)
      }
    } catch (error) {
      console.error('Perfect day trait extraction failed:', error)
      setAiMessage("Let me search for some common traits that enable ideal daily routines...")
      setSearchQuery("organized focused mindful balanced")
      setTimeout(() => {
        performSearch("organized focused mindful balanced")
      }, 100)
    }
    
    setAiConversation('')
    setAiProcessing(false)
  }

  const handlePersonResearch = async (personName: string) => {
    try {
      setAiMessage(`🔍 **Researching ${personName}...**

I'm looking up ${personName}'s key characteristics and leadership qualities to find matching attributes in our database. This may take a moment...`)
      
      // Step 1: Web research the person
      const webResponse = await fetch('/api/web-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personName: personName,
          query: `${personName} leadership qualities personality traits characteristics what made them successful`
        })
      })

      if (!webResponse.ok) {
        throw new Error('Web research failed')
      }

      const webData = await webResponse.json()
      
      if (webData.success && webData.attributes) {
        console.log('🌐 Web research found attributes:', webData.attributes)
        
        // Step 2: Search our database for matching attributes
        const searchKeywords = webData.attributes.join(' ')
        setSearchQuery(searchKeywords)
        
        setAiMessage(`✅ **${personName} Research Complete!**

Based on my research, ${personName} is known for: **${webData.attributes.join(', ')}**

I found matching attributes across our role models below. These are the specific traits that made ${personName} successful, now available for your Lightwalker™!`)
        
        // Set the web research response for the right panel
        const responseText = `I searched online and found the best attributes inspired by ${personName}. Based on my research, ${personName} is particularly known for: ${webData.attributes.join(', ')}. Below are the matching attributes from our database that align with ${personName}'s successful character traits.`
        setWebResearchResponse(responseText)
        
        // Trigger search with researched attributes
        setTimeout(() => {
          performSearch(searchKeywords)
        }, 100)
      } else {
        // Fallback to basic keyword extraction if web research fails
        throw new Error('No attributes found in research')
      }
      
    } catch (error) {
      console.error('❌ Person research failed:', error)
      
      // Fallback: Use basic AI extraction
      setAiMessage(`I had trouble researching ${personName} online. Let me try extracting relevant concepts from your question instead...`)
      
      const response = await fetch('/api/ai-character-creation', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: aiConversation
        })
      })

      const data = await response.json()
      
      if (data.success && data.keywords.length > 0) {
        const keywords = data.keywords.join(' ')
        setSearchQuery(keywords)
        setAiMessage(`I extracted these relevant concepts: **${data.keywords.join(', ')}**. Let me search for matching attributes...`)
        
        setTimeout(() => {
          performSearch(keywords)
        }, 100)
      } else {
        setAiMessage(`I'm having trouble with that request. Try asking about specific traits like "focus", "leadership", or "innovation" instead.`)
      }
    }
  }

  const toggleAttributeSelection = (result: SearchResult) => {
    console.log('🔲 toggleAttributeSelection called for:', result.roleModel, '-', result.attribute)
    console.log('🔲 Result details:', { roleModelId: result.roleModelId, attributeId: result.attributeId })
    
    const isSelected = selectedAttributes.some(attr => 
      attr.roleModelId === result.roleModelId && attr.attributeId === result.attributeId
    )
    console.log('🔲 Is currently selected:', isSelected)

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
      
      // Trigger achievements
      if (selectedAttributes.length === 0) {
        triggerAchievement('first-attribute-selected')
      }
      if (selectedAttributes.length === 2) {
        triggerAchievement('three-attributes-selected')
      }
      if (selectedAttributes.length === 4) {
        triggerAchievement('five-attributes-selected')
      }
      if (selectedAttributes.length === 7) {
        triggerAchievement('eight-attributes-selected')
      }
      if (selectedAttributes.length === 9) {
        triggerAchievement('ten-attributes-mastery')
      }
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
    console.log('🔘 handleAttributeToggle called with attributeId:', attributeId)
    
    // Extract attribute name from generated ID: "rolemodel-id-attribute-name" -> get the attribute name part
    const attributeNameSlug = attributeId.split(`${selectedRoleModel}-`)[1]
    const attribute = attributes.find(attr => 
      attr.name.toLowerCase().replace(/\s+/g, '-') === attributeNameSlug
    )
    const currentRoleModel = roleModels.find(rm => rm.id === selectedRoleModel)
    
    console.log('🔘 Found attribute:', attribute?.name, 'ID:', attributeId)
    console.log('🔘 Current role model:', currentRoleModel?.commonName, 'ID:', currentRoleModel?.id)
    console.log('🔘 Current selectedAttributes:', selectedAttributes.map(a => `${a.roleModel}-${a.attribute} (${a.attributeId})`))
    
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
          attributeId: attributeId, // Use the generated attributeId instead of attribute.id
          originalMethod: attribute.method,
          dailyDoItems: dailyDoItems || null
        }
      ])
      
      // Trigger achievements for right panel selections too
      if (selectedAttributes.length === 0) {
        triggerAchievement('first-attribute-selected')
      }
      if (selectedAttributes.length === 2) {
        triggerAchievement('three-attributes-selected')
      }
      if (selectedAttributes.length === 4) {
        triggerAchievement('five-attributes-selected')
      }
      if (selectedAttributes.length === 7) {
        triggerAchievement('eight-attributes-selected')
      }
      if (selectedAttributes.length === 9) {
        triggerAchievement('ten-attributes-mastery')
      }
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
              { id: 'ai-guide', label: '🤖 AI Guide', description: 'Talk naturally about challenges/goals' },
              { id: 'perfect-day', label: '📅 Perfect Day', description: 'Design your ideal lifestyle' },
              { id: 'values-first', label: '💎 Values-First', description: 'Start with core principles' }
            ].map((pathway) => (
              <button
                key={pathway.id}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activePathway === pathway.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-gray-800/30'
                }`}
                onClick={() => {
                  const newPathway = pathway.id as DiscoveryPathway
                  setActivePathway(newPathway)
                  
                  // Update AI message based on new pathway
                  switch (newPathway) {
                    case 'ai-guide':
                      setAiMessage(`I'm excited to help build your ideal future self! 

What feels most natural for you to think about:

🎯 **Challenges you face** (distraction, overwhelm, anger, stress)
✨ **Strengths you want** (focus, patience, confidence, wisdom)  
🎭 **People you admire** (Steve Jobs, Buddha, Einstein)
📋 **Daily habits you wish you had** (meditation, planning, exercise)

Just describe what you're working on, and I'll find the perfect attributes for your Lightwalker™!`)
                      break
                    case 'perfect-day':
                      setPerfectDayStage('morning')
                      setPerfectDayData({ morning: '', work: '', evening: '', extractedTraits: [] })
                      setAiMessage(`🌅 **PERFECT DAY DISCOVERY** - Stage 1 of 3

Let's design your perfect day to discover your ideal character! I'll walk you through three parts of your day and extract the personality traits needed to live that way naturally.

**MORNING ROUTINE (6am-12pm)**: Describe your perfect morning - how do you wake up, what's your energy like, what activities set you up for success?

*Example: "I wake naturally at 6am feeling refreshed, meditate for 20 minutes, make a healthy breakfast while listening to podcasts, then review my priorities for the day..."*`)
                      break
                    case 'role-model':
                      setAiMessage(`Who do you most admire and want to learn from?

Tell me about someone (famous, historical, or personal) whose approach to life inspires you. I'll find our most similar role model and help you extract their key attributes for your Lightwalker™.

*Note: Even if you mention someone not in our database (like Bill Gates), I'll find our closest match (like Steve Jobs) and show you their attributes.*`)
                      break
                    case 'values-first':
                      setAiMessage(`What matters most to you in life?

Describe your core values and principles - what you stand for, what drives your decisions, what you want to be remembered for. I'll help translate these into daily character traits.`)
                      break
                  }
                  
                  setSearchResults([])
                  setSearchQuery('')
                  setAiConversation('')
                  setWebResearchResponse('')
                  
                  // Reset Perfect Day state when switching pathways
                  setPerfectDayStage('morning')
                  setPerfectDayData({ morning: '', work: '', evening: '', extractedTraits: [] })
                }}
                title={pathway.description}
              >
                {pathway.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role Model Gallery */}
      <div className="max-w-7xl mx-auto px-6 py-2 relative z-10">
        <div className={`bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4 mb-3 animate-slideUp relative ${
          getActiveAreaHighlight() === 'highlight-top' ? 'ring-2 ring-green-400' : ''
        }`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* Left Panel - AI Interface */}
          <div className={`lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6 animate-slideLeft relative min-h-[500px] lg:min-h-[70vh] lg:max-h-[70vh] ${
            getActiveAreaHighlight() === 'highlight-left' ? 'ring-2 ring-green-400' : ''
          }`}>
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
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Compact mode when search results available, full mode otherwise */}
                  {searchResults.length > 0 ? (
                    // Compact Chat Mode - Just search query + button
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 text-sm text-purple-200 bg-gray-700/50 px-3 py-2 rounded">
                          "{searchQuery}"
                        </div>
                        <button
                          onClick={() => {
                            setSearchResults([])
                            setSearchQuery('')
                            setAiConversation('')
                            setHighlightedRoleModel('')
                            setHighlightedAttribute('')
                            setWebResearchResponse('')
                            
                            // Reset Perfect Day state if in that mode
                            if (activePathway === 'perfect-day') {
                              setPerfectDayStage('morning')
                              setPerfectDayData({ morning: '', work: '', evening: '', extractedTraits: [] })
                              setAiMessage(`🌅 **PERFECT DAY DISCOVERY** - Stage 1 of 3

Let's design your perfect day to discover your ideal character! I'll walk you through three parts of your day and extract the personality traits needed to live that way naturally.

**MORNING ROUTINE (6am-12pm)**: Describe your perfect morning - how do you wake up, what's your energy like, what activities set you up for success?

*Example: "I wake naturally at 6am feeling refreshed, meditate for 20 minutes, make a healthy breakfast while listening to podcasts, then review my priorities for the day..."*`)
                            } else {
                              // Standard AI guide message
                              setAiMessage(`I'm excited to help build your ideal future self! 

What feels most natural for you to think about:

🎯 **Challenges you face** (distraction, overwhelm, anger, stress)
✨ **Strengths you want** (focus, patience, confidence, wisdom)  
🎭 **People you admire** (Steve Jobs, Buddha, Einstein)
📋 **Daily habits you wish you had** (meditation, planning, exercise)

Just describe what you're working on, and I'll find the perfect attributes for your Lightwalker™!`)
                            }
                          }}
                          className="text-xs px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          New Search
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Full Chat Mode - Textarea + button
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
                        {aiProcessing ? 'Analyzing...' : searchProcessing ? 'Finding Matches...' : 'Find Superpowers for my Lightwalker™'}
                      </button>
                    </div>
                  )}
                  
                  {/* AI Response Message & Search Results */}
                  {aiMessage && (
                    <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
                      <div className={`p-4 bg-purple-900/30 border border-purple-500/40 rounded-lg mb-4 transition-all duration-300 ${
                        getActiveAreaHighlight() === 'highlight-instructions' 
                          ? 'ring-2 ring-green-400 bg-green-900/20 border-green-400/50' 
                          : ''
                      }`}>
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="text-purple-100 text-sm whitespace-pre-line">{aiMessage}</div>
                          {getActiveAreaHighlight() === 'highlight-instructions' && (
                            <div className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                              Follow Guide!
                            </div>
                          )}
                        </div>
                        
                        {/* Perfect Day Progress Indicator */}
                        {activePathway === 'perfect-day' && perfectDayStage !== 'complete' && (
                          <div className="mt-3 flex items-center gap-2">
                            <div className="text-xs text-purple-300">Progress:</div>
                            <div className="flex gap-1">
                              <div className={`w-6 h-2 rounded-full ${perfectDayStage === 'morning' ? 'bg-green-400 animate-pulse' : perfectDayData.morning ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                              <div className={`w-6 h-2 rounded-full ${perfectDayStage === 'work' ? 'bg-green-400 animate-pulse' : perfectDayData.work ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                              <div className={`w-6 h-2 rounded-full ${perfectDayStage === 'evening' ? 'bg-green-400 animate-pulse' : perfectDayData.evening ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                            </div>
                            <div className="text-xs text-purple-300">
                              {perfectDayStage === 'morning' && 'Morning Routine'}
                              {perfectDayStage === 'work' && 'Work & Contribution'}  
                              {perfectDayStage === 'evening' && 'Evening & Personal Time'}
                              {perfectDayStage === 'extraction' && 'Analyzing...'}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* AI Search Results - Now with proper scrolling */}
                      {searchResults.length > 0 && (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
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
                <div className="flex-1 flex flex-col min-h-0">
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
                  <div className="flex-1 overflow-y-auto min-h-0">
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
          <div className={`lg:col-span-3 bg-black/30 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6 animate-slideRight relative min-h-[500px] lg:min-h-[70vh] lg:max-h-[70vh] ${
            getActiveAreaHighlight() === 'highlight-right' ? 'ring-2 ring-green-400' : ''
          }`}>
            <div className="absolute left-0 top-0 h-full flex items-start pt-4 z-10">
              <h3 className="text-xl font-semibold text-cyan-400 font-mono whitespace-nowrap m-0 p-0 origin-left" 
                  style={{ transform: 'rotate(-90deg) translate(-100%, 0)', transformOrigin: 'left top' }}>
                ATTRIBUTES
              </h3>
            </div>
            
            <div className="ml-8 h-full flex flex-col">
              {/* Web Research Response */}
              {webResearchResponse && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg">
                  <div className="text-green-400 text-sm font-medium mb-2">🔍 AI Research Results</div>
                  <div className="text-gray-200 text-sm leading-relaxed">{webResearchResponse}</div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                  {searchResults.length > 0 && webResearchResponse
                    ? 'Matching Attributes Found'
                    : selectedRoleModel 
                    ? `${roleModels.find(rm => rm.id === selectedRoleModel)?.commonName} Attributes`
                    : 'Select Role Model First'
                  }
                </h4>
                <div className="text-sm text-gray-400">
                  {selectedAttributes.length}/10 selected
                  {selectedAttributes.length >= 8 && (
                    <span className="ml-2 text-green-400 font-semibold">Nearly Complete!</span>
                  )}
                  {selectedAttributes.length === 10 && (
                    <span className="ml-2 text-yellow-400 font-bold animate-pulse">MAX REACHED!</span>
                  )}
                </div>
              </div>
            
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                {searchResults.length > 0 && webResearchResponse ? (
                  // Show search results when we have web research results
                  searchResults.map((result, index) => (
                    <div
                      key={`web-search-${result.roleModelId}-${result.attributeId}`}
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
                            <div className="font-medium text-white">{result.attribute}</div>
                            {highlightedAttribute === result.attributeId && (
                              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
                                AI Match!
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mb-2">
                            via {result.roleModel}
                          </div>
                          <div className="text-sm text-gray-300">
                            {result.originalMethod}
                          </div>
                        </div>
                        <div className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                          {Math.round(result.relevanceScore)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show role model attributes when no search results
                  attributes.map((attribute, index) => {
                  // Generate unique attribute ID since attributes don't have IDs in database
                  const attributeId = `${selectedRoleModel}-${attribute.name.toLowerCase().replace(/\s+/g, '-')}`
                  
                  return (
                  <div key={attributeId} className="border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/30 transition-all duration-300">
                    {/* Checkbox and Main Info */}
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAttributes.some(attr => attr.roleModelId === selectedRoleModel && attr.attributeId === attributeId)}
                        onChange={() => handleAttributeToggle(attributeId)}
                        className="mt-1 h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-white mb-1">{attribute.name}</div>
                          {highlightedAttribute === attributeId && (
                            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
                              AI Recommended!
                            </span>
                          )}
                        </div>
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
                        onClick={() => handleTabClick(attributeId, 'attribute')}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                          expandedAttributeTab?.attributeId === attributeId && expandedAttributeTab?.tab === 'attribute'
                            ? 'bg-gradient-to-r from-green-500/20 to-green-400/20 border-green-400 text-green-400 shadow-lg shadow-green-400/20'
                            : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-400'
                        }`}
                      >
                        🎯 Attribute
                      </button>
                      
                      {attribute.oppositeOf && (
                        <button
                          onClick={() => handleTabClick(attributeId, 'problem')}
                          className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                            expandedAttributeTab?.attributeId === attributeId && expandedAttributeTab?.tab === 'problem'
                              ? 'bg-gradient-to-r from-red-500/20 to-red-400/20 border-red-400 text-red-400 shadow-lg shadow-red-400/20'
                              : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400'
                          }`}
                        >
                          ❌ Problem
                        </button>
                      )}
                      
                      {attribute.method && (
                        <button
                          onClick={() => handleTabClick(attributeId, 'action')}
                          className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${
                            expandedAttributeTab?.attributeId === attributeId && expandedAttributeTab?.tab === 'action'
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20'
                              : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:bg-blue-500/10 hover:border-cyan-500/50 hover:text-cyan-400'
                          }`}
                        >
                          🔧 Action
                        </button>
                      )}
                    </div>

                    {/* Expanded Tab Content with Gaming Theme */}
                    {expandedAttributeTab?.attributeId === attributeId && (
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
                        
                        {expandedAttributeTab.tab === 'action' && attribute.method && (
                          <div className="text-sm text-cyan-300">
                            <div className="font-medium text-cyan-400 mb-2 flex items-center">
                              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                              🔧 Method:
                            </div>
                            <div className="pl-4 border-l-2 border-cyan-400/30">{attribute.method}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )
                })
                )}
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
                    ⚡ ACTIVATE LIGHTWALKER™ ({selectedAttributes.length} superpowers)
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
        .animate-slideLeft {
          animation: slideLeft 0.8s ease-out;
        }
        .animate-slideRight {
          animation: slideRight 0.8s ease-out;
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
        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
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