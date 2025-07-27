'use client'

import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon, SparklesIcon, UserIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  role: 'user' | 'rolemodel'
  content: string
  timestamp: Date
}

interface RoleModel {
  id: string
  commonName: string
  primaryDomain: string
}

export default function RoleModelTestPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedRoleModel, setSelectedRoleModel] = useState<RoleModel | null>(null)
  const [roleModels, setRoleModels] = useState<RoleModel[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load available role models
  useEffect(() => {
    // For testing, we'll use the Steve Jobs we just seeded
    setRoleModels([
      { id: 'steve-jobs', commonName: 'Steve Jobs', primaryDomain: 'Innovation and technology leadership' }
    ])
    setSelectedRoleModel({ id: 'steve-jobs', commonName: 'Steve Jobs', primaryDomain: 'Innovation and technology leadership' })
  }, [])

  // Initial greeting when role model is selected
  useEffect(() => {
    if (selectedRoleModel && messages.length === 0) {
      setTimeout(() => {
        addRoleModelMessage(getInitialGreeting())
      }, 1000)
    }
  }, [selectedRoleModel])

  const getInitialGreeting = () => {
    if (!selectedRoleModel) return ''
    
    return `Hello! I'm ${selectedRoleModel.commonName}. I'm here to share how I approach challenges and decisions, drawing from my experience in ${selectedRoleModel.primaryDomain.toLowerCase()}. What situation would you like my perspective on?`
  }

  const addRoleModelMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'rolemodel',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const consultRoleModel = async (question: string) => {
    if (!selectedRoleModel) return

    try {
      const response = await fetch('/api/role-models/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-id', // Using demo user for testing
          roleModelId: selectedRoleModel.id,
          question: question,
          context: 'Test consultation'
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      } else {
        // Fallback response for testing
        return generateTestResponse(question)
      }
    } catch (error) {
      console.error('Error consulting role model:', error)
      return generateTestResponse(question)
    }
  }

  const generateTestResponse = (question: string) => {
    // Simple test responses based on Steve Jobs' profile
    if (question.toLowerCase().includes('decision') || question.toLowerCase().includes('choose')) {
      return `When facing decisions, I start with my annual retreat process: "What are the 10 things we should be doing next?" Then I ruthlessly eliminate 7 items to focus on only 3 priorities. Deciding what not to do is as important as deciding what to do. I ask myself: What would create the best user experience? How can this be simplified? Does this advance our core mission?`
    }
    
    if (question.toLowerCase().includes('product') || question.toLowerCase().includes('design')) {
      return `My approach to product development centers on user experience above all else. I believe that design is not just what it looks like - design is how it works. I obsess over details others miss, constantly asking: How can we make this simpler and more intuitive? I prefer rapid prototyping and iterative perfection, staying hands-on in every detail.`
    }
    
    if (question.toLowerCase().includes('team') || question.toLowerCase().includes('people')) {
      return `I lead through vision-sharing and demanding excellence. I create a reality distortion field by inspiring people to achieve beyond their perceived limits. My approach is direct and passionate - I give immediate feedback and challenge people to grow. I believe in having high expectations while developing people's potential.`
    }
    
    return `In my experience, when facing "${question}", I approach this by first taking time for strategic thinking - usually during my morning reflection or walking meetings. I remind myself that simplicity is the ultimate sophistication, and I focus on what would create the most elegant solution. As I always say: "Stay hungry, stay foolish" - continuous learning and calculated risk-taking are essential.`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedRoleModel) return

    addUserMessage(inputMessage)
    const userMsg = inputMessage
    setInputMessage('')
    setIsTyping(true)

    // Simulate thinking time
    setTimeout(async () => {
      const response = await consultRoleModel(userMsg)
      addRoleModelMessage(response)
      setIsTyping(false)
    }, 1500 + Math.random() * 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "How do you make tough decisions?",
    "What's your approach to product design?",
    "How do you lead a team?",
    "How do you handle setbacks?",
    "What drives your innovation process?"
  ]

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {selectedRoleModel ? `Consulting with ${selectedRoleModel.commonName}` : 'Role Model Consultation'}
            </h1>
            <p className="text-purple-100">
              {selectedRoleModel ? selectedRoleModel.primaryDomain : 'Choose a role model to consult with'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-purple-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-purple-100 text-purple-900 px-4 py-3 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {messages.length <= 1 && !isTyping && selectedRoleModel && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-800 text-sm font-medium mb-3">Ask {selectedRoleModel.commonName}:</p>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="block w-full text-left text-sm text-purple-700 hover:text-purple-900 hover:bg-purple-100 p-2 rounded transition-colors"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${selectedRoleModel?.commonName || 'a role model'} for their perspective...`}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={!selectedRoleModel}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || !selectedRoleModel}
            className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${
              inputMessage.trim() && !isTyping && selectedRoleModel
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Role models share their approach and perspective - they show you how they think, not what you should do
        </p>
      </div>
    </div>
  )
}