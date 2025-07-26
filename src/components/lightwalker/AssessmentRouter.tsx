'use client'

import { useState } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface AssessmentQuestion {
  id: string
  question: string
  options: {
    key: 'A' | 'B' | 'C' | 'D'
    text: string
    pathway: 'role-model' | 'problem-first' | 'day-in-life' | 'values-first'
  }[]
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'future-self',
    question: 'When describing your future self, is it easiest to:',
    options: [
      {
        key: 'A',
        text: 'Refer to people you like who have the attributes you admire',
        pathway: 'role-model'
      },
      {
        key: 'B', 
        text: 'Identify the problems and traits you want to erase in yourself',
        pathway: 'problem-first'
      },
      {
        key: 'C',
        text: 'Imagine your ideal daily routine',
        pathway: 'day-in-life'
      },
      {
        key: 'D',
        text: 'Share your passion, beliefs, and feelings',
        pathway: 'values-first'
      }
    ]
  },
  {
    id: 'learning-style',
    question: 'Which describes how you learn best?',
    options: [
      {
        key: 'A',
        text: 'I learn by following examples of successful people',
        pathway: 'role-model'
      },
      {
        key: 'B',
        text: "I'm motivated by fixing what's wrong in my life", 
        pathway: 'problem-first'
      },
      {
        key: 'C',
        text: 'I think in terms of specific activities and routines',
        pathway: 'day-in-life'
      },
      {
        key: 'D',
        text: 'I make decisions based on what feels right to me',
        pathway: 'values-first'
      }
    ]
  },
  {
    id: 'biggest-challenge',
    question: "What's your biggest challenge with personal development?",
    options: [
      {
        key: 'A',
        text: "I don't know who to model myself after",
        pathway: 'role-model'
      },
      {
        key: 'B',
        text: "I know what's wrong but not how to fix it",
        pathway: 'problem-first'
      },
      {
        key: 'C',
        text: "Abstract advice doesn't help me",
        pathway: 'day-in-life'
      },
      {
        key: 'D',
        text: "I'm not sure what really matters to me",
        pathway: 'values-first'
      }
    ]
  }
]

type PathwayType = 'role-model' | 'problem-first' | 'day-in-life' | 'values-first'

interface PathwayInfo {
  name: string
  description: string
  bestFor: string
  duration: string
}

const pathwayDetails: Record<PathwayType, PathwayInfo> = {
  'role-model': {
    name: 'Role Model Method',
    description: 'Build your Lightwalker by extracting traits from people you admire',
    bestFor: 'People who learn through inspiration and examples',
    duration: '3-5 sessions over 1-2 weeks'
  },
  'problem-first': {
    name: 'Problem-First Method', 
    description: 'Transform your struggles into a solution-focused Lightwalker',
    bestFor: 'People motivated by overcoming challenges',
    duration: '4-6 sessions over 2-3 weeks'
  },
  'day-in-life': {
    name: 'Day-in-Life Visioning',
    description: 'Extract your ideal character from your perfect daily routine',
    bestFor: 'People who think in concrete, specific terms',
    duration: '3-4 sessions over 1-2 weeks'
  },
  'values-first': {
    name: 'Values-First Discovery',
    description: 'Build your Lightwalker around your core principles and beliefs',
    bestFor: 'People who make decisions based on what feels authentic',
    duration: '4-5 sessions over 2-3 weeks'
  }
}

interface AssessmentRouterProps {
  onPathwaySelected: (pathway: PathwayType) => void
}

export default function AssessmentRouter({ onPathwaySelected }: AssessmentRouterProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<PathwayType[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [recommendedPathway, setRecommendedPathway] = useState<PathwayType | null>(null)
  const [alternativePathway, setAlternativePathway] = useState<PathwayType | null>(null)

  const handleAnswerSelect = (pathway: PathwayType) => {
    setSelectedAnswer(pathway)
  }

  const handleNext = () => {
    if (!selectedAnswer) return

    const newAnswers = [...answers, selectedAnswer as PathwayType]
    setAnswers(newAnswers)
    setSelectedAnswer(null)

    if (currentQuestion < assessmentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate recommended pathway
      const pathwayCounts = newAnswers.reduce((acc, pathway) => {
        acc[pathway] = (acc[pathway] || 0) + 1
        return acc
      }, {} as Record<PathwayType, number>)

      // Find the pathway with most votes
      const sortedPathways = Object.entries(pathwayCounts)
        .sort(([,a], [,b]) => b - a) as [PathwayType, number][]

      const primary = sortedPathways[0]
      const secondary = sortedPathways[1]

      setRecommendedPathway(primary[0])
      
      // If there's a tie or close second, offer alternative
      if (secondary && secondary[1] >= primary[1] - 1) {
        setAlternativePathway(secondary[0])
      }

      setShowResults(true)
    }
  }

  const startPathway = (pathway: PathwayType) => {
    onPathwaySelected(pathway)
  }

  if (showResults && recommendedPathway) {
    const primaryPathway = pathwayDetails[recommendedPathway]
    const secondaryPathway = alternativePathway ? pathwayDetails[alternativePathway] : null

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Recommended Pathway</h2>
          <p className="text-gray-600">Based on your responses, here's the best discovery method for you:</p>
        </div>

        {/* Primary Recommendation */}
        <div className="border-2 border-blue-200 rounded-lg p-6 mb-6 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-blue-900">{primaryPathway.name}</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Recommended
            </span>
          </div>
          <p className="text-gray-700 mb-3">{primaryPathway.description}</p>
          <p className="text-gray-600 mb-2"><strong>Best for:</strong> {primaryPathway.bestFor}</p>
          <p className="text-gray-600 mb-4"><strong>Duration:</strong> {primaryPathway.duration}</p>
          <button
            onClick={() => recommendedPathway && startPathway(recommendedPathway)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Start {primaryPathway.name}
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Alternative Option */}
        {secondaryPathway && (
          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{secondaryPathway.name}</h3>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                Alternative
              </span>
            </div>
            <p className="text-gray-700 mb-3">{secondaryPathway.description}</p>
            <p className="text-gray-600 mb-2"><strong>Best for:</strong> {secondaryPathway.bestFor}</p>
            <p className="text-gray-600 mb-4"><strong>Duration:</strong> {secondaryPathway.duration}</p>
            <button
              onClick={() => alternativePathway && startPathway(alternativePathway)}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              Try {secondaryPathway.name} Instead
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {/* Fallback Option */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Not sure about these options? You can always explore our starter templates for inspiration.
          </p>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Browse Starter Templates
          </button>
        </div>
      </div>
    )
  }

  // Assessment Questions
  const question = assessmentQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestion + 1} of {assessmentQuestions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
        
        <div className="space-y-4">
          {question.options.map((option) => (
            <button
              key={option.key}
              onClick={() => handleAnswerSelect(option.pathway)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === option.pathway
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-start">
                <span className="font-bold text-lg mr-3 mt-1">{option.key})</span>
                <span className="flex-1">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className={`px-8 py-3 rounded-lg font-medium flex items-center transition-all ${
            selectedAnswer
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentQuestion < assessmentQuestions.length - 1 ? 'Next Question' : 'Get My Pathway'}
          <ChevronRightIcon className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  )
}