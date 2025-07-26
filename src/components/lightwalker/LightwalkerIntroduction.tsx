'use client'

import { useState, useEffect } from 'react'

interface Template {
  id: string
  name: string
  displayName: string
  description: string
  icon: string
  colorScheme: {
    primary: string
    secondary: string
  }
}

interface CustomizationData {
  problemFocus: string
  customName?: string
}

interface LightwalkerIntroductionProps {
  template: Template
  customization: CustomizationData
  onLightwalkerCreated: (lightwalker: any) => void
  onBack: () => void
}

export default function LightwalkerIntroduction({ 
  template, 
  customization, 
  onLightwalkerCreated, 
  onBack 
}: LightwalkerIntroductionProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [introMessage, setIntroMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [createdLightwalker, setCreatedLightwalker] = useState<any>(null)

  useEffect(() => {
    createLightwalker()
  }, [])

  const createLightwalker = async () => {
    setIsCreating(true)
    setError(null)

    try {
      // In a real app, you'd get the userId from authentication context
      const userId = 'demo-user-id' // Temporary for demo
      
      const response = await fetch('/api/templates/create-lightwalker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          userId: userId,
          customName: customization.customName,
          problemFocus: customization.problemFocus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCreatedLightwalker(data.data)
        await generateIntroMessage(data.data)
      } else {
        setError(data.error || 'Failed to create your Lightwalker™')
      }
    } catch (error) {
      console.error('Error creating Lightwalker:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const generateIntroMessage = async (lightwalker: any) => {
    try {
      const response = await fetch('/api/lightwalker/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user-id',
          userLightwalkerId: lightwalker.id,
          message: `Hi! I'm excited to meet you. Could you introduce yourself and share what you're looking forward to helping me with, especially regarding: ${customization.problemFocus}`,
          messageType: 'conversation'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIntroMessage(data.data.response)
      } else {
        // Fallback message if API fails
        setIntroMessage(`Hi! I'm ${lightwalker.customName || template.displayName}, and I'm excited to be your companion on this journey. I'll be sharing my daily activities and insights, especially around ${customization.problemFocus}. Just copy what resonates with you - no pressure, just natural growth together!`)
      }
    } catch (error) {
      console.error('Error generating intro message:', error)
      // Fallback message
      setIntroMessage(`Hi! I'm ${lightwalker?.customName || template.displayName}, and I'm excited to start this journey with you!`)
    }
  }

  const handleContinue = () => {
    if (createdLightwalker) {
      onLightwalkerCreated(createdLightwalker)
    }
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="lightwalker-card">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4">
            <button onClick={onBack} className="lightwalker-button-secondary flex-1">
              Go Back
            </button>
            <button onClick={createLightwalker} className="lightwalker-button-primary flex-1">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="lightwalker-card">
          <div className="text-6xl mb-6 animate-pulse-slow">{template.icon}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Creating Your {template.displayName}...
          </h2>
          <div className="space-y-4 text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p>Setting up personality traits...</p>
            </div>
            <p className="text-sm">This might take a moment as we customize everything for you</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Meet Your Lightwalker™
        </h1>
        <p className="text-lg text-gray-600">
          They're ready to start sharing their life with you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Lightwalker Info */}
        <div className="lightwalker-card" style={{ borderColor: template.colorScheme.primary, borderWidth: '2px' }}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{template.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {customization.customName || template.displayName}
            </h2>
            <p className="text-gray-600 mb-4">{template.description}</p>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Focus Area</h3>
              <p className="text-blue-800 text-sm">{customization.problemFocus}</p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Daily friendly updates about their activities
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Natural copying opportunities (no pressure!)
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Progress tracking that celebrates every step
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Personalized insights for your focus area
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Introduction Message */}
        <div className="lightwalker-card">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">{template.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {customization.customName || template.displayName}
                </h3>
                <p className="text-xs text-gray-500">Just now</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              {introMessage ? (
                <p className="text-gray-800 leading-relaxed">{introMessage}</p>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <p className="text-sm">Preparing their introduction...</p>
                </div>
              )}
            </div>
          </div>

          {/* Example of copying */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 mb-2">Example: How copying works</p>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Tomorrow:</strong> "Starting my day with 10 minutes of planning - it makes such a difference in how organized I feel!"
              </p>
              <p className="text-xs text-gray-500">
                👆 You might think "That sounds nice" and try 5 minutes of planning. That's copying in action!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-8 max-w-md mx-auto">
        <button
          onClick={onBack}
          className="lightwalker-button-secondary flex-1"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="lightwalker-button-primary flex-1"
          disabled={!createdLightwalker || !introMessage}
        >
          {!createdLightwalker || !introMessage ? 'Setting up...' : 'Start Copying!'}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Step 3 of 3 • Almost there!
      </div>
    </div>
  )
}