'use client'

import { useState } from 'react'
import TemplateSelection from '@/components/lightwalker/TemplateSelection'
import ProblemFocusStep from '@/components/lightwalker/ProblemFocusStep'
import LightwalkerIntroduction from '@/components/lightwalker/LightwalkerIntroduction'

type CreationStep = 'templates' | 'customization' | 'introduction' | 'complete'

interface SelectedTemplate {
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

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<CreationStep>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate | null>(null)
  const [customizationData, setCustomizationData] = useState<CustomizationData | null>(null)
  const [createdLightwalker, setCreatedLightwalker] = useState<any>(null)

  const handleTemplateSelected = (template: SelectedTemplate) => {
    setSelectedTemplate(template)
    setCurrentStep('customization')
  }

  const handleCustomizationComplete = (data: CustomizationData) => {
    setCustomizationData(data)
    setCurrentStep('introduction')
  }

  const handleLightwalkerCreated = (lightwalker: any) => {
    setCreatedLightwalker(lightwalker)
    setCurrentStep('complete')
  }

  const handleStartOver = () => {
    setCurrentStep('templates')
    setSelectedTemplate(null)
    setCustomizationData(null)
    setCreatedLightwalker(null)
  }

  return (
    <main className="min-h-screen">
      {/* Progress Indicator */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'templates' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <span className="text-sm font-medium text-gray-700">Choose Template</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div className={`h-1 bg-blue-600 rounded transition-all duration-300 ${
                currentStep === 'templates' ? 'w-0' : 
                currentStep === 'customization' ? 'w-1/2' : 'w-full'
              }`} />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'templates' 
                  ? 'bg-gray-200 text-gray-500'
                  : currentStep === 'customization'
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-500 text-white'
              }`}>
                2
              </div>
              <span className="text-sm font-medium text-gray-700">Customize</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 rounded">
              <div className={`h-1 bg-blue-600 rounded transition-all duration-300 ${
                currentStep === 'introduction' || currentStep === 'complete' ? 'w-full' : 'w-0'
              }`} />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'introduction' || currentStep === 'complete'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-sm font-medium text-gray-700">Meet Your Lightwalker™</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {currentStep === 'templates' && (
          <TemplateSelection onTemplateSelected={handleTemplateSelected} />
        )}

        {currentStep === 'customization' && selectedTemplate && (
          <ProblemFocusStep 
            template={selectedTemplate}
            onCustomizationComplete={handleCustomizationComplete}
            onBack={() => setCurrentStep('templates')}
          />
        )}

        {currentStep === 'introduction' && selectedTemplate && customizationData && (
          <LightwalkerIntroduction 
            template={selectedTemplate}
            customization={customizationData}
            onLightwalkerCreated={handleLightwalkerCreated}
            onBack={() => setCurrentStep('customization')}
          />
        )}

        {currentStep === 'complete' && createdLightwalker && (
          <div className="text-center">
            <div className="lightwalker-card max-w-2xl mx-auto">
              <div className="text-6xl mb-4">{createdLightwalker.template.icon}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Your {createdLightwalker.template.displayName} is Ready!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Start receiving daily updates and begin copying what resonates with you.
              </p>
              
              <div className="space-y-4">
                <button 
                  className="lightwalker-button-primary w-full"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Go to Dashboard
                </button>
                <button 
                  className="lightwalker-button-secondary w-full"
                  onClick={handleStartOver}
                >
                  Create Another Lightwalker™
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}