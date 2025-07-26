'use client'

import { useState } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface FeedbackWidgetProps {
  context?: string // What page/feature user is giving feedback on
}

export default function FeedbackWidget({ context }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'love' | 'question'>('suggestion')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackTypes = [
    { key: 'suggestion', label: '💡 Suggestion', color: 'blue' },
    { key: 'bug', label: '🐛 Bug Report', color: 'red' },
    { key: 'love', label: '❤️ Love This!', color: 'green' },
    { key: 'question', label: '❓ Question', color: 'purple' }
  ]

  const handleSubmit = async () => {
    if (!feedback.trim()) return

    setIsSubmitting(true)
    
    // Here you would send to your feedback API
    try {
      // Mock API call - replace with actual endpoint
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message: feedback,
          context: context || window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      })
      
      setIsSubmitted(true)
      setTimeout(() => {
        setIsOpen(false)
        setIsSubmitted(false)
        setFeedback('')
      }, 2000)
    } catch (error) {
      console.error('Feedback submission failed:', error)
    }
    
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mr-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <span className="font-medium">Thanks for your feedback!</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-40"
        title="Send Feedback"
      >
        <ChatBubbleLeftRightIcon className="w-6 h-6" />
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Help us improve your Lightwalker experience! What's on your mind?
              </p>

              {/* Feedback Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of feedback is this?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setFeedbackType(type.key as any)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        feedbackType === type.key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us more
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What would you like us to know? Ideas, bugs, questions - anything helps!"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Context Info */}
              {context && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    📍 Feedback about: <span className="font-medium">{context}</span>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={!feedback.trim() || isSubmitting}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all ${
                    feedback.trim() && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setFeedbackType('love')
                      setFeedback('This feature is amazing! ')
                    }}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    ❤️ Love this!
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackType('suggestion')
                      setFeedback('It would be great if... ')
                    }}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    💡 Suggest improvement
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackType('bug')
                      setFeedback('Something is not working: ')
                    }}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    🐛 Report bug
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}