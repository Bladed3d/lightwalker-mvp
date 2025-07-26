'use client'

import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  role: 'user' | 'lightwalker'
  content: string
  timestamp: Date
}

interface LightwalkerChatProps {
  lightwalkerData: any
  initialQuestion?: string
}

export default function LightwalkerChat({ lightwalkerData, initialQuestion }: LightwalkerChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isFirstInteraction, setIsFirstInteraction] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Start the conversation with a greeting from the Lightwalker
    if (isFirstInteraction) {
      setTimeout(() => {
        addLightwalkerMessage(getInitialGreeting())
        setIsFirstInteraction(false)
      }, 1000)
    }
  }, [])

  const getInitialGreeting = () => {
    const userProblem = lightwalkerData?.['problem-identification']?.['priority-problem'] || 'challenges'
    const characterSummary = lightwalkerData?.['integration-validation']?.['character-summary'] || ''
    
    const greetings = [
      `Hello! I'm your future self - the version of you who has learned to handle ${userProblem} with grace and wisdom. I'm here to show you how I navigate the situations that used to trigger your struggles.`,
      
      `I'm so glad to meet you! I represent who you're becoming - someone who has transformed their relationship with ${userProblem}. I've learned some powerful approaches that I'm excited to share with you.`,
      
      `Welcome! I'm the part of you that has already figured out how to handle ${userProblem} in a way that feels good and works well. I'm here to model the mindset and responses that have worked for me.`
    ]
    
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  const addLightwalkerMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'lightwalker',
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

  const generateLightwalkerResponse = (userMessage: string) => {
    // This would typically call your AI API
    // For now, return contextual responses based on the lightwalker data
    
    const userProblem = lightwalkerData?.['problem-identification']?.['priority-problem'] || 'challenges'
    const betterMoments = lightwalkerData?.['exception-finding']?.['better-moments'] || ''
    const miracleScenario = lightwalkerData?.['miracle-question']?.['miracle-scenario'] || ''
    const coreQualities = lightwalkerData?.['character-extraction']?.['core-qualities'] || ''
    
    // Simple response patterns based on user input
    if (userMessage.toLowerCase().includes('angry') || userMessage.toLowerCase().includes('frustrated')) {
      return `When I feel that surge of anger or frustration, I've learned to pause and take three deep breaths. I remind myself that this feeling is information - it's telling me something I care about is at stake. Instead of reacting immediately, I ask myself: "What would a response from my best self look like here?" This approach has helped me turn those intense moments into opportunities for clarity rather than conflict.`
    }
    
    if (userMessage.toLowerCase().includes('overwhelm') || userMessage.toLowerCase().includes('stress')) {
      return `I understand that overwhelm feeling completely. When I'm in that state, I've found that trying to solve everything at once just makes it worse. Instead, I focus on just the next single thing I can do. I ask myself: "What's one small step I can take right now?" Then I do that one thing, breathe, and ask the question again. It's amazing how this breaks the spiral and helps me feel capable again.`
    }
    
    if (userMessage.toLowerCase().includes('difficult') || userMessage.toLowerCase().includes('hard')) {
      return `Yes, these situations can be really challenging. What I've learned is that the difficulty often comes from fighting against what's happening rather than flowing with it. I remind myself that I've handled difficult things before - I have that strength within me. I focus on what I can control and let go of what I can't. This doesn't make the situation easy, but it makes me feel more centered and capable of responding wisely.`
    }
    
    if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('how')) {
      return `I approach this by remembering that I've already shown myself I can handle these moments - like when ${betterMoments}. I tap into that same energy and mindset. The key insight I've gained is that ${coreQualities.toLowerCase()} isn't just something I sometimes have - it's who I am at my core. When I operate from that place, everything feels more manageable.`
    }
    
    // Default response
    return `I hear you, and I want you to know that the struggles you're facing are exactly what helped me develop the wisdom I have now. Every challenge with ${userProblem} taught me something valuable about myself and showed me what was possible. What I've learned is that the solution isn't about perfection - it's about responding from a place of ${coreQualities.toLowerCase()} rather than from fear or reaction. What specific situation would you like to explore together?`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    addUserMessage(inputMessage)
    const userMsg = inputMessage
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateLightwalkerResponse(userMsg)
      addLightwalkerMessage(response)
      setIsTyping(false)
    }, 1500 + Math.random() * 1500) // 1.5-3 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "How do you stay calm when things get difficult?",
    "What do you do when you feel overwhelmed?",
    "How do you handle conflict differently now?",
    "What changed in your mindset?",
    "Can you help me with a specific situation?"
  ]

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Your Lightwalker</h1>
            <p className="text-blue-100">Your future self who has overcome your challenges</p>
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
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Suggested questions - only show if no messages yet or after initial greeting */}
        {messages.length <= 1 && !isTyping && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm font-medium mb-3">Try asking your Lightwalker:</p>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded transition-colors"
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
            placeholder="Ask your Lightwalker anything..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${
              inputMessage.trim() && !isTyping
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your Lightwalker shows you how they handle situations - they never tell you what to do
        </p>
      </div>
    </div>
  )
}