'use client'

import { useState } from 'react'
import { ChevronRightIcon, ChevronLeftIcon, ExclamationTriangleIcon, LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ProblemFirstSession {
  id: string
  title: string
  description: string
  icon: any
  questions: {
    id: string
    text: string
    placeholder?: string
    guidance?: string
    type: 'text' | 'textarea' | 'scale' | 'multiple-choice'
    options?: string[]
  }[]
}

const problemFirstSessions: ProblemFirstSession[] = [
  {
    id: 'problem-identification',
    title: 'Problem Identification',
    description: 'Let\'s identify the main challenges you want your Lightwalker to help you overcome.',
    icon: ExclamationTriangleIcon,
    questions: [
      {
        id: 'main-struggles',
        text: 'What are the top 3 problems or patterns in your life that you most want to change?',
        placeholder: 'e.g., I get angry too easily, I procrastinate on important things, I judge people harshly...',
        type: 'textarea',
        guidance: 'Be specific and honest. These struggles will become the foundation for your Lightwalker\'s strengths.'
      },
      {
        id: 'impact-assessment',
        text: 'How do these problems currently affect your daily life?',
        placeholder: 'Describe the real impact these issues have on your relationships, work, happiness...',
        type: 'textarea'
      },
      {
        id: 'priority-problem',
        text: 'Which of these problems would you most like to solve first?',
        type: 'text',
        guidance: 'We\'ll focus on this primary issue to build your Lightwalker\'s core characteristics.'
      }
    ]
  },
  {
    id: 'exception-finding',
    title: 'Exception Finding',
    description: 'Let\'s discover when you\'re already closer to your ideal self.',
    icon: LightBulbIcon,
    questions: [
      {
        id: 'better-moments',
        text: 'Think about times when this problem was less present or didn\'t happen at all. What was different?',
        placeholder: 'e.g., When I\'m well-rested I don\'t get angry as easily, When I have a clear plan I don\'t procrastinate...',
        type: 'textarea',
        guidance: 'These exceptions show you already have the capacity for change.'
      },
      {
        id: 'success-patterns',
        text: 'What were you thinking, feeling, or doing differently during those better moments?',
        placeholder: 'Describe your mindset, environment, or actions when the problem doesn\'t occur...',
        type: 'textarea'
      },
      {
        id: 'environmental-factors',
        text: 'What external factors (people, places, situations) seem to bring out your better responses?',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'miracle-question',
    title: 'Solution Visualization',
    description: 'Imagine your problem has been completely solved. What would be different?',
    icon: CheckCircleIcon,
    questions: [
      {
        id: 'miracle-scenario',
        text: 'If you woke up tomorrow and this problem was completely solved, what would you notice first?',
        placeholder: 'e.g., I would feel calm when someone disagreed with me, I would start my important tasks right away...',
        type: 'textarea',
        guidance: 'Paint a vivid picture of your problem-free life.'
      },
      {
        id: 'behavior-changes',
        text: 'How would you behave differently throughout a typical day?',
        placeholder: 'Describe specific actions, reactions, and choices your problem-free self would make...',
        type: 'textarea'
      },
      {
        id: 'others-notice',
        text: 'What would other people notice about the new you?',
        placeholder: 'How would friends, family, or colleagues see you differently?',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'character-extraction',
    title: 'Character Trait Extraction',
    description: 'Let\'s identify the characteristics of the person who would live this problem-free life.',
    icon: CheckCircleIcon,
    questions: [
      {
        id: 'core-qualities',
        text: 'What core qualities would someone need to handle your problem situations with ease?',
        placeholder: 'e.g., patience, confidence, compassion, focus, wisdom...',
        type: 'textarea',
        guidance: 'Think about the inner characteristics, not just behaviors.'
      },
      {
        id: 'decision-making',
        text: 'How would this ideal person make decisions in challenging moments?',
        placeholder: 'Describe their thought process, values, and priorities...',
        type: 'textarea'
      },
      {
        id: 'daily-mindset',
        text: 'What would be this person\'s typical mindset and energy throughout the day?',
        placeholder: 'How do they wake up feeling? How do they approach challenges?',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'lightwalker-development',
    title: 'Lightwalker Development',
    description: 'Now let\'s bring your solution-focused Lightwalker to life.',
    icon: CheckCircleIcon,
    questions: [
      {
        id: 'lightwalker-personality',
        text: 'If your Lightwalker embodies all these positive qualities, how would they introduce themselves to you?',
        placeholder: 'Write in first person: "I am someone who approaches conflict with curiosity rather than anger..."',
        type: 'textarea',
        guidance: 'Let your Lightwalker speak in their own voice about who they are.'
      },
      {
        id: 'problem-response',
        text: 'How would your Lightwalker handle the exact situations that currently trigger your problems?',
        placeholder: 'Specific scenarios: "When someone criticizes me, I pause and consider if there\'s truth I can learn from..."',
        type: 'textarea'
      },
      {
        id: 'daily-practices',
        text: 'What daily habits or practices would your Lightwalker have to maintain this positive state?',
        placeholder: 'Morning routines, thought patterns, self-care practices...',
        type: 'textarea'
      }
    ]
  },
  {
    id: 'integration-validation',
    title: 'Meet Your Lightwalker',
    description: 'Let\'s bring your solution-focused future self to life and start your first conversation.',
    icon: CheckCircleIcon,
    questions: [
      {
        id: 'character-summary',
        text: 'Summarize your Lightwalker in 2-3 sentences. Who are they at their core?',
        type: 'textarea',
        guidance: 'This will be the foundation for all your interactions starting today.'
      },
      {
        id: 'interaction-preference',
        text: 'How often would you like your Lightwalker to share insights with you?',
        type: 'multiple-choice',
        options: [
          'Once daily - gentle morning wisdom',
          '2-3 times daily - moderate guidance',
          'Throughout the day - active support',
          'Only when I initiate - on-demand only'
        ]
      },
      {
        id: 'first-conversation',
        text: 'What would you like to discuss with your Lightwalker right now?',
        placeholder: 'Ask them about handling your specific problem, or just say hello and see what wisdom they share...',
        type: 'textarea',
        guidance: 'You\'ll start chatting with your Lightwalker immediately after this.'
      }
    ]
  }
]

interface ProblemFirstMethodProps {
  onComplete: (lightwalkerData: any) => void
  onBack: () => void
}

export default function ProblemFirstMethod({ onComplete, onBack }: ProblemFirstMethodProps) {
  const [currentSession, setCurrentSession] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, Record<string, string>>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [sessionComplete, setSessionComplete] = useState(false)

  const session = problemFirstSessions[currentSession]
  const question = session.questions[currentQuestion]
  const totalSessions = problemFirstSessions.length
  const questionsInSession = session.questions.length

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
  }

  const handleNext = () => {
    // Save current answer
    const newSessionAnswers = { ...sessionAnswers }
    if (!newSessionAnswers[session.id]) {
      newSessionAnswers[session.id] = {}
    }
    newSessionAnswers[session.id][question.id] = currentAnswer
    setSessionAnswers(newSessionAnswers)

    if (currentQuestion < questionsInSession - 1) {
      // Next question in current session
      setCurrentQuestion(currentQuestion + 1)
      setCurrentAnswer('')
    } else {
      // Session complete
      setSessionComplete(true)
    }
  }

  const handleNextSession = () => {
    if (currentSession < totalSessions - 1) {
      setCurrentSession(currentSession + 1)
      setCurrentQuestion(0)
      setCurrentAnswer('')
      setSessionComplete(false)
    } else {
      // All sessions complete - create Lightwalker
      onComplete(sessionAnswers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      // Load previous answer
      const prevAnswer = sessionAnswers[session.id]?.[session.questions[currentQuestion - 1].id] || ''
      setCurrentAnswer(prevAnswer)
    } else if (currentSession > 0) {
      // Go to previous session
      setCurrentSession(currentSession - 1)
      const prevSession = problemFirstSessions[currentSession - 1]
      setCurrentQuestion(prevSession.questions.length - 1)
      setSessionComplete(false)
      const prevAnswer = sessionAnswers[prevSession.id]?.[prevSession.questions[prevSession.questions.length - 1].id] || ''
      setCurrentAnswer(prevAnswer)
    }
  }

  const canProceed = currentAnswer.trim().length > 0

  // Session completion screen
  if (sessionComplete) {
    const isLastSession = currentSession === totalSessions - 1

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLastSession ? 'Your Lightwalker is Ready!' : 'Great Progress!'}
          </h2>
          <p className="text-gray-600">
            {isLastSession 
              ? 'Your solution-focused future self is ready to start helping you with your challenges right now.'
              : `Excellent work! Ready to continue building your Lightwalker?`
            }
          </p>
        </div>

        {isLastSession ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">Start Getting Help Today</h3>
              <p className="text-blue-800">
                Your Lightwalker embodies the solution-focused version of yourself who has overcome your challenges. 
                They're ready to show you exactly how they handle the situations that trigger your problems.
              </p>
            </div>
            <button
              onClick={handleNextSession}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Start Your First Conversation
              <ChevronRightIcon className="ml-2 h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                Excellent progress! Ready to continue? Your motivated energy is perfect for completing your Lightwalker now.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleNextSession}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Continue Building Your Future Self
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Pause Here
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Question interface
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <session.icon className="w-5 h-5 mr-2" />
            <span>{session.title}</span>
          </div>
          <span>Session {currentSession + 1} of {totalSessions}</span>
        </div>
        
        {/* Session progress */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questionsInSession) * 100}%` }}
          />
        </div>
        
        <div className="text-center text-sm text-gray-500">
          Question {currentQuestion + 1} of {questionsInSession}
        </div>
      </div>

      {/* Session description */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">{session.description}</p>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{question.text}</h2>
        
        {question.guidance && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-yellow-800 text-sm">{question.guidance}</p>
          </div>
        )}

        {question.type === 'textarea' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={6}
          />
        ) : question.type === 'multiple-choice' ? (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerChange(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  currentAnswer === option
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={currentSession === 0 && currentQuestion === 0 ? onBack : handlePrevious}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
        >
          <ChevronLeftIcon className="mr-2 h-5 w-5" />
          {currentSession === 0 && currentQuestion === 0 ? 'Back to Assessment' : 'Previous'}
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={`px-8 py-3 rounded-lg font-medium flex items-center transition-all ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentQuestion === questionsInSession - 1 ? 'Complete Session' : 'Next Question'}
          <ChevronRightIcon className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  )
}