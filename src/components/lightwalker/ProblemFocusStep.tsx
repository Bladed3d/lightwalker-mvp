'use client'

import { useState } from 'react'

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

interface ProblemFocusStepProps {
  template: Template
  onCustomizationComplete: (data: CustomizationData) => void
  onBack: () => void
}

export default function ProblemFocusStep({ template, onCustomizationComplete, onBack }: ProblemFocusStepProps) {
  const [problemFocus, setProblemFocus] = useState('')
  const [customName, setCustomName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problemFocus.trim()) return

    setIsProcessing(true)
    
    // Small delay for better UX
    setTimeout(() => {
      onCustomizationComplete({
        problemFocus: problemFocus.trim(),
        customName: customName.trim() || undefined
      })
      setIsProcessing(false)
    }, 500)
  }

  const problemSuggestions = [
    "I want to be more confident in social situations",
    "I struggle with morning routines and energy",
    "I have trouble staying organized and focused", 
    "I want to be more creative and inspired daily",
    "I need help managing stress and staying calm",
    "I want to build healthier habits that stick"
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="text-4xl mr-3">{template.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customize Your {template.displayName}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Help us make them perfect for you
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Form */}
        <div className="lightwalker-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Problem Focus */}
            <div>
              <label htmlFor="problemFocus" className="block text-sm font-medium text-gray-700 mb-2">
                What's one thing you'd like to change about yourself? *
              </label>
              <textarea
                id="problemFocus"
                value={problemFocus}
                onChange={(e) => setProblemFocus(e.target.value)}
                placeholder="Be specific about what you want to work on..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps your {template.displayName} share more relevant activities
              </p>
            </div>

            {/* Custom Name */}
            <div>
              <label htmlFor="customName" className="block text-sm font-medium text-gray-700 mb-2">
                Give them a name (optional)
              </label>
              <input
                type="text"
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`e.g., "Alex" or "My ${template.displayName}"`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use "{template.displayName}"
              </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="lightwalker-button-secondary flex-1"
                disabled={isProcessing}
              >
                Back
              </button>
              <button
                type="submit"
                className="lightwalker-button-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!problemFocus.trim() || isProcessing}
              >
                {isProcessing ? 'Creating...' : 'Create My Lightwalker™'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side - Suggestions & Preview */}
        <div className="space-y-6">
          {/* Problem Suggestions */}
          <div className="lightwalker-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Need inspiration? Try these:
            </h3>
            <div className="space-y-2">
              {problemSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setProblemFocus(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="lightwalker-card" style={{ borderColor: template.colorScheme.primary, borderWidth: '2px' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview Your Lightwalker™
            </h3>
            <div className="text-center">
              <div className="text-4xl mb-3">{template.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {customName.trim() || template.displayName}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>
              {problemFocus.trim() && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Focus Area:</strong> {problemFocus}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="text-center mt-8 text-sm text-gray-500">
        Step 2 of 3 • About 5 minutes to go
      </div>
    </div>
  )
}