'use client'

import { useState } from 'react'
import AssessmentRouter from './AssessmentRouter'
import ProblemFirstMethod from './ProblemFirstMethod'
import LightwalkerChat from './LightwalkerChat'

type PathwayType = 'role-model' | 'problem-first' | 'day-in-life' | 'values-first'

interface LightwalkerCreatorProps {
  onBack?: () => void
}

export default function LightwalkerCreator({ onBack }: LightwalkerCreatorProps) {
  const [currentStep, setCurrentStep] = useState<'assessment' | 'pathway' | 'chat'>('assessment')
  const [selectedPathway, setSelectedPathway] = useState<PathwayType | null>(null)
  const [lightwalkerData, setLightwalkerData] = useState<any>(null)

  const handlePathwaySelected = (pathway: PathwayType) => {
    setSelectedPathway(pathway)
    setCurrentStep('pathway')
  }

  const handleLightwalkerComplete = (data: any) => {
    setLightwalkerData(data)
    setCurrentStep('chat')
  }

  const handleBackToAssessment = () => {
    setCurrentStep('assessment')
    setSelectedPathway(null)
  }

  // Render based on current step
  if (currentStep === 'chat' && lightwalkerData) {
    return (
      <LightwalkerChat 
        lightwalkerData={lightwalkerData}
        initialQuestion={lightwalkerData?.['integration-validation']?.['first-conversation']}
      />
    )
  }

  if (currentStep === 'pathway' && selectedPathway) {
    switch (selectedPathway) {
      case 'problem-first':
        return (
          <ProblemFirstMethod
            onComplete={handleLightwalkerComplete}
            onBack={handleBackToAssessment}
          />
        )
      case 'role-model':
        // TODO: Implement other pathways
        return (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Role Model Method</h2>
            <p className="text-gray-600 mb-6">Coming soon! This pathway will help you build your Lightwalker by extracting traits from people you admire.</p>
            <button
              onClick={handleBackToAssessment}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Problem-First Method Instead
            </button>
          </div>
        )
      case 'day-in-life':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Day-in-Life Visioning</h2>
            <p className="text-gray-600 mb-6">Coming soon! This pathway will help you extract your ideal character from your perfect daily routine.</p>
            <button
              onClick={handleBackToAssessment}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Problem-First Method Instead
            </button>
          </div>
        )
      case 'values-first':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Values-First Discovery</h2>
            <p className="text-gray-600 mb-6">Coming soon! This pathway will help you build your Lightwalker around your core principles and beliefs.</p>
            <button
              onClick={handleBackToAssessment}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Problem-First Method Instead
            </button>
          </div>
        )
      default:
        return null
    }
  }

  // Default: Assessment Router
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Lightwalker
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your personalized future self who has overcome your challenges
          </p>
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            ⏱️ Takes just 5 minutes → Start getting help today
          </div>
        </div>

        <AssessmentRouter onPathwaySelected={handlePathwaySelected} />
        
        {onBack && (
          <div className="text-center mt-8">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              ← Back to Templates
            </button>
          </div>
        )}
      </div>
    </div>
  )
}