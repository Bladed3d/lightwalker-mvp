'use client'

import { useState, useCallback } from 'react'
import { Lightbulb, Clock, Bell, BookOpen, Users, Star, Save, Share2, AlertCircle, CheckCircle, Eye, Settings } from 'lucide-react'

interface Attribute {
  id: string
  name: string
  description: string
  method: string
  benefit: string
  oppositeOf: string
  roleModel: string
  subTraitCode: string // e.g., "GW.01.ACT"
}

interface UserPractice {
  id?: string
  title: string
  morningActivity: string
  contextualTrigger: string
  eveningReflection: string
  weeklyPractice: string
  safetyNotes: string
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  timeRequired: string
  lifeContext: string[]
  isPublic: boolean
}

interface PracticeBuilderProps {
  attribute: Attribute
  onSave: (practice: UserPractice) => void
  onCancel: () => void
  existingPractice?: UserPractice
}

export default function PracticeBuilder({ 
  attribute, 
  onSave, 
  onCancel, 
  existingPractice 
}: PracticeBuilderProps) {
  const [practice, setPractice] = useState<UserPractice>(existingPractice || {
    title: '',
    morningActivity: '',
    contextualTrigger: '',
    eveningReflection: '',
    weeklyPractice: '',
    safetyNotes: '',
    difficultyLevel: 'BEGINNER',
    timeRequired: '5-10 minutes',
    lifeContext: [],
    isPublic: false
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const steps = [
    { 
      id: 'morning', 
      title: 'New Action', 
      icon: Clock,
      description: 'What action can you perform to practice this attribute?'
    },
    { 
      id: 'contextual', 
      title: 'In-the-Moment', 
      icon: Bell,
      description: 'What would help you remember this when it matters?'
    },
    { 
      id: 'evening', 
      title: 'Evening Reflection', 
      icon: BookOpen,
      description: 'How would you review your day through this lens?'
    },
    { 
      id: 'weekly', 
      title: 'Weekly Practice', 
      icon: Star,
      description: 'What weekly activity would deepen this attribute?'
    }
  ]

  const contextOptions = [
    'Work', 'Family', 'Relationships', 'Personal Growth', 
    'Health', 'Finances', 'Creativity', 'Community'
  ]

  const updatePractice = useCallback((field: keyof UserPractice, value: any) => {
    setPractice(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleContext = useCallback((context: string) => {
    setPractice(prev => ({
      ...prev,
      lifeContext: prev.lifeContext.includes(context)
        ? prev.lifeContext.filter(c => c !== context)
        : [...prev.lifeContext, context]
    }))
  }, [])

  const generateTitle = useCallback(() => {
    if (!practice.morningActivity && !practice.contextualTrigger) return
    
    const firstActivity = practice.morningActivity || practice.contextualTrigger
    const shortDesc = firstActivity.slice(0, 30) + (firstActivity.length > 30 ? '...' : '')
    updatePractice('title', `${attribute.roleModel}'s ${attribute.name}: ${shortDesc}`)
  }, [practice.morningActivity, practice.contextualTrigger, attribute, updatePractice])

  const isComplete = practice.title && (
    practice.morningActivity || 
    practice.contextualTrigger || 
    practice.eveningReflection || 
    practice.weeklyPractice
  )

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <PracticePreview 
          attribute={attribute}
          practice={practice}
          onEdit={() => setShowPreview(false)}
          onSave={() => onSave(practice)}
          onCancel={onCancel}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Build Your Practice</h1>
            <p className="text-gray-600">Create your personal way to develop this attribute</p>
          </div>
        </div>

        {/* Attribute Context */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {attribute.roleModel}'s "{attribute.name}"
          </h2>
          <p className="text-gray-700 mb-3">{attribute.description}</p>
          <div className="bg-white p-3 rounded border-l-4 border-blue-400">
            <p className="text-sm font-medium text-gray-800">Original Method:</p>
            <p className="text-gray-700 italic">"{attribute.method}"</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={generateTitle}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Auto-generate title
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Practice Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Practice Title
        </label>
        <input
          type="text"
          value={practice.title}
          onChange={(e) => updatePractice('title', e.target.value)}
          placeholder={`My ${attribute.name} Practice`}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Current Step */}
      <div className="mb-8">
        <StepContent
          step={steps[currentStep]}
          practice={practice}
          updatePractice={updatePractice}
          attribute={attribute}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 disabled:text-gray-400"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-blue-500' 
                  : index < currentStep 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 text-blue-600 disabled:text-gray-400"
        >
          Next
        </button>
      </div>

      {/* Settings */}
      <div className="border-t pt-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Practice Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty Level
            </label>
            <select
              value={practice.difficultyLevel}
              onChange={(e) => updatePractice('difficultyLevel', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          {/* Time Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Required
            </label>
            <select
              value={practice.timeRequired}
              onChange={(e) => updatePractice('timeRequired', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="1-5 minutes">1-5 minutes</option>
              <option value="5-10 minutes">5-10 minutes</option>
              <option value="10-15 minutes">10-15 minutes</option>
              <option value="15-30 minutes">15-30 minutes</option>
              <option value="30+ minutes">30+ minutes</option>
            </select>
          </div>

          {/* Share Option */}
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={practice.isPublic}
                onChange={(e) => updatePractice('isPublic', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Share with community</span>
            </label>
          </div>
        </div>

        {/* Life Context Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Where does this apply? (select all that fit)
          </label>
          <div className="flex flex-wrap gap-2">
            {contextOptions.map(context => (
              <button
                key={context}
                onClick={() => toggleContext(context)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  practice.lifeContext.includes(context)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {context}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Safety Notes (optional)
          </label>
          <textarea
            value={practice.safetyNotes}
            onChange={(e) => updatePractice('safetyNotes', e.target.value)}
            placeholder="Any important warnings or guidelines for using this practice safely..."
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!isComplete}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>

          <button
            onClick={() => onSave(practice)}
            disabled={!isComplete}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Practice
          </button>
        </div>
      </div>
    </div>
  )
}

// Step Content Component
function StepContent({ 
  step, 
  practice, 
  updatePractice, 
  attribute 
}: {
  step: any
  practice: UserPractice
  updatePractice: (field: keyof UserPractice, value: any) => void
  attribute: Attribute
}) {
  const Icon = step.icon
  const fieldMap = {
    'morning': 'morningActivity',
    'contextual': 'contextualTrigger', 
    'evening': 'eveningReflection',
    'weekly': 'weeklyPractice'
  }
  
  const field = fieldMap[step.id as keyof typeof fieldMap] as keyof UserPractice
  const value = practice[field] as string

  const examplePrompts = {
    morning: [
      `When someone disagrees with me, pause and ask "${attribute.method}"`,
      `Practice ${attribute.name} by helping someone who needs guidance`,
      `Use ${attribute.roleModel}'s approach in one difficult conversation today`,
      `Apply this wisdom when facing any challenging situation`
    ],
    contextual: [
      `Before any challenging situation, ask "${attribute.method}"`,
      `Set phone reminders: "WWRD - What Would ${attribute.roleModel} Do?"`,
      `Use a trigger phrase: "How can I show ${attribute.name} right now?"`,
      `Take 3 breaths and remember ${attribute.roleModel}'s approach`
    ],
    evening: [
      `Review the day: "How did I practice ${attribute.name}?"`,
      `Journal about moments I could have used ${attribute.roleModel}'s approach`,
      `Rate my ${attribute.name} practice today (1-10) and plan tomorrow`,
      `Reflect: "What would ${attribute.roleModel} do differently?"`
    ],
    weekly: [
      `Study one ${attribute.roleModel} story related to ${attribute.name}`,
      `Plan weekly ${attribute.name} challenges to practice`,
      `Share my ${attribute.name} practice with someone who'd benefit`,
      `Review and refine my ${attribute.name} approach based on results`
    ]
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
          <p className="text-gray-600">{step.description}</p>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => updatePractice(field, e.target.value)}
        placeholder={step.id === 'morning' ? `What action can you perform to practice ${attribute.name}?` : `How would you practice ${attribute.name} through ${step.title.toLowerCase()}?`}
        rows={3}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
      />

      {/* Example Prompts */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">💡 Example ideas:</p>
        <div className="grid grid-cols-1 gap-2">
          {examplePrompts[step.id as keyof typeof examplePrompts]?.map((prompt, index) => (
            <button
              key={index}
              onClick={() => updatePractice(field, prompt)}
              className="text-left p-2 text-sm bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Practice Preview Component
function PracticePreview({ 
  attribute, 
  practice, 
  onEdit, 
  onSave, 
  onCancel 
}: {
  attribute: Attribute
  practice: UserPractice
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Preview</h1>
          <p className="text-gray-600">Review your custom practice before saving</p>
        </div>
      </div>

      {/* Practice Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{practice.title}</h2>
            <p className="text-gray-600">Based on {attribute.roleModel}'s "{attribute.name}"</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {practice.difficultyLevel} • {practice.timeRequired}
            </div>
            {practice.lifeContext.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 justify-end">
                {practice.lifeContext.map(context => (
                  <span key={context} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {context}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Practice Activities */}
        <div className="space-y-4">
          {practice.morningActivity && (
            <PracticeItem 
              icon={Clock} 
              title="New Action" 
              content={practice.morningActivity} 
            />
          )}
          {practice.contextualTrigger && (
            <PracticeItem 
              icon={Bell} 
              title="In-the-Moment" 
              content={practice.contextualTrigger} 
            />
          )}
          {practice.eveningReflection && (
            <PracticeItem 
              icon={BookOpen} 
              title="Evening Reflection" 
              content={practice.eveningReflection} 
            />
          )}
          {practice.weeklyPractice && (
            <PracticeItem 
              icon={Star} 
              title="Weekly Practice" 
              content={practice.weeklyPractice} 
            />
          )}
        </div>

        {practice.safetyNotes && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Safety Notes:</p>
                <p className="text-sm text-yellow-700">{practice.safetyNotes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sharing Status */}
      {practice.isPublic && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">
              This practice will be shared with the community
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Other users will be able to see and adapt your practice. You'll get recognition when people use it!
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Edit
          </button>

          <button
            onClick={onSave}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
          >
            {practice.isPublic ? <Share2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {practice.isPublic ? 'Save & Share' : 'Save Practice'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PracticeItem({ icon: Icon, title, content }: { 
  icon: any, 
  title: string, 
  content: string 
}) {
  return (
    <div className="bg-white p-4 rounded border-l-4 border-blue-400">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <p className="text-gray-700">{content}</p>
    </div>
  )
}