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
    return `Hello! I'm your Lightwalker™ - your ideal future self. I've integrated Steve Jobs' strategic focus and decision-making methods that you've selected. I can help you apply his proven approaches to your current challenges. What situation would you like me to help you navigate using these methods?`
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
    // For testing, just use the test responses directly
    return generateTestResponse(question)
  }

  const generateTestResponse = (question: string) => {
    // Simple test responses based on Steve Jobs' profile
    if (question.toLowerCase().includes('decision') || question.toLowerCase().includes('choose')) {
      return `I use Steve Jobs' Strategic Focus method that you selected for your Lightwalker. When facing decisions, I apply his annual retreat process: "What are the 10 things we should be doing next?" Then I ruthlessly eliminate 7 items to focus on only 3 priorities. Steve believed that deciding what NOT to do is as important as deciding what to do. I ask myself his three key questions: Does this delight users? Can we control the entire experience? How can this be simpler? This method helps me cut through overwhelm and focus on what truly matters.`
    }
    
    if (question.toLowerCase().includes('product') || question.toLowerCase().includes('design')) {
      return `I apply Steve Jobs' Attention to Detail method that you chose. I approach this by obsessing over details others miss, asking "How could this be simpler?" at every step. Steve taught that design is not just what it looks like - design is how it works. I use his rapid prototyping approach: test ideas quickly rather than endless planning, then iterate until it feels magical. The goal is making solutions so intuitive that people think "Of course it works this way."`
    }
    
    if (question.toLowerCase().includes('team') || question.toLowerCase().includes('people')) {
      return `I use Steve Jobs' Vision-Driven Leadership approach that you selected, but I've adapted it to be more compassionate. I share a clear vision and maintain high standards while focusing on what's best for everyone involved. Steve created what people called a "reality distortion field" by inspiring teams to achieve beyond their perceived limits. I apply this by giving direct but supportive feedback and believing in people's potential.`
    }
    
    return `I approach "${question}" using Steve Jobs' strategic thinking methods that you chose for your Lightwalker. I start with reflection and ask myself: How can this be simpler? What would create the most elegant solution? I might take a walking meeting with myself to stimulate creative thinking. Steve taught that perfection is achieved not when there's nothing more to add, but when there's nothing left to take away. Stay hungry, stay foolish.`
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
    "How should I approach this tough decision using Steve's methods?",
    "Can you help me apply Steve's design thinking to my project?",
    "How can I lead my team using Steve's approach but more compassionately?",
    "What would Steve's stress management techniques look like in my situation?",
    "How can I apply Steve's innovation mindset to my creative challenges?"
  ]

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              Your Lightwalker™ - Wisdom Synthesis Test
            </h1>
            <p className="text-purple-100">
              Testing how your future self applies Steve Jobs' methods that you've selected
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
        {messages.length <= 1 && !isTyping && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-800 text-sm font-medium mb-3">Ask your Lightwalker™ about applying Steve Jobs' methods:</p>
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
            placeholder="Ask your Lightwalker™ how to apply Steve Jobs' methods..."
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
          Your Lightwalker™ shows you how to apply proven methods from role models - they demonstrate wisdom, not give orders
        </p>
      </div>
    </div>
  )
}