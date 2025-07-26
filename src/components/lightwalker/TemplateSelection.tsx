'use client'

import { useState, useEffect } from 'react'

interface Template {
  id: string
  name: string
  displayName: string
  tagline: string
  description: string
  category: string
  monthlyPrice: number
  icon: string
  colorScheme: {
    primary: string
    secondary: string
  }
  sampleActivities: string[]
  coreTraits: string[]
}

interface TemplateSelectionProps {
  onTemplateSelected: (template: Template) => void
}

export default function TemplateSelection({ onTemplateSelected }: TemplateSelectionProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'situational' | 'general' | 'business'>('situational')

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      
      if (data.success) {
        setTemplates(data.data)
      } else {
        console.error('Failed to fetch templates:', data.error)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template.id)
    // Small delay for visual feedback
    setTimeout(() => {
      onTemplateSelected(template)
    }, 150)
  }

  const situationalTemplates = templates.filter(t => t.category === 'situational')
  const generalTemplates = templates.filter(t => t.category === 'general')
  const businessTemplates = templates.filter(t => t.category === 'business')
  
  const currentTemplates = activeTab === 'situational' ? situationalTemplates : 
                          activeTab === 'general' ? generalTemplates : businessTemplates

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your personality options...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Lightwalker™
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Human development as easy as copying from the smartest kid in class
        </p>
        <p className="text-lg text-gray-500">
          Pick the friend you'd most want to copy from • Takes 7 minutes to create
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200">
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'situational'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('situational')}
          >
            Current Life Challenge
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('general')}
          >
            Personal Growth
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'business'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('business')}
          >
            Business
          </button>
        </div>
      </div>

      {/* Tab Description */}
      <div className="text-center mb-8">
        {activeTab === 'situational' ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🚨 Facing a specific challenge right now?
            </h2>
            <p className="text-gray-600">
              Get targeted guidance from your future self who already overcame this situation
            </p>
          </div>
        ) : activeTab === 'general' ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🌱 Ready for ongoing personal development?
            </h2>
            <p className="text-gray-600">
              Build long-term habits and traits with your ideal future self
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              🏢 Growing your business or launching a startup?
            </h2>
            <p className="text-gray-600">
              Learn from your future entrepreneurial self who built a successful company
            </p>
          </div>
        )}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentTemplates.map((template) => (
          <div
            key={template.id}
            className={`lightwalker-card cursor-pointer transform transition-all duration-200 hover:scale-105 ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' 
                : ''
            }`}
            onClick={() => handleTemplateClick(template)}
            style={{
              borderColor: selectedTemplate === template.id ? template.colorScheme.primary : undefined
            }}
          >
            {/* Icon and Name */}
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{template.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {template.displayName}
              </h3>
              <p className="text-sm text-gray-600 italic mb-2">
                {template.tagline}
              </p>
              <div className="text-lg font-semibold" style={{ color: template.colorScheme.primary }}>
                ${template.monthlyPrice}/month
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm mb-4 text-center">
              {template.description}
            </p>

            {/* Core Traits */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {template.coreTraits.slice(0, 4).map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: template.colorScheme.secondary,
                      color: template.colorScheme.primary
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Sample Activity */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 italic text-center">
                "{template.sampleActivities[0]}"
              </p>
            </div>

            {/* Selection Indicator */}
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedTemplate === template.id ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Selected
                  </>
                ) : (
                  'Choose This One'
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Help Text */}
      <div className="text-center text-gray-500 text-sm">
        {activeTab === 'situational' ? (
          <div>
            <p>💡 Need immediate help? Situational Lightwalkers provide crisis-specific guidance</p>
            <p className="mt-1">✨ Once you're through this challenge, explore Personal Growth templates</p>
          </div>
        ) : (
          <div>
            <p>💡 Building long-term transformation? These templates guide ongoing development</p>
            <p className="mt-1">🚨 Need immediate crisis help? Check out Current Life Challenge templates</p>
          </div>
        )}
      </div>
    </div>
  )
}