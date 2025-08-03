'use client'

import { Brain, Sparkles, Clock, Bell, BookOpen, Star, Plus, Edit, Trash2, Share2 } from 'lucide-react'

interface Practice {
  id: string
  title: string
  morningActivity?: string
  contextualTrigger?: string
  eveningReflection?: string
  weeklyPractice?: string
  difficultyLevel: string
  timeRequired: string
  lifeContext: string[]
  isPublic: boolean
  subTraitCode?: string
  createdAt: string
}

interface UserCharacter {
  id: string
  name: string
  attributes: any[]
}

interface MyPracticesGalleryProps {
  practices: Practice[]
  userCharacter: UserCharacter
  onCreatePractice: () => void
}

export default function MyPracticesGallery({ 
  practices, 
  userCharacter, 
  onCreatePractice 
}: MyPracticesGalleryProps) {
  const getAttributeForPractice = (practice: Practice) => {
    return userCharacter.attributes.find(attr => attr.subTraitCode === practice.subTraitCode)
  }

  if (practices.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">My Practices Gallery</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your personalized practices will appear here as you create them
          </p>
          <div className="bg-blue-50 rounded-lg p-8 max-w-md mx-auto mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">How to get started:</h3>
            <ol className="text-left text-gray-700 space-y-2">
              <li>1. Go to "My Character" tab</li>
              <li>2. Select an attribute to practice</li>
              <li>3. Click "Create My Practice"</li>
              <li>4. Build your custom practice</li>
              <li>5. Save it to see it here!</li>
            </ol>
          </div>
          <button
            onClick={onCreatePractice}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 text-lg font-medium"
          >
            ✨ Create Your First Practice
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Practices Gallery</h1>
        <p className="text-gray-600 mb-4">
          {practices.length} practice{practices.length !== 1 ? 's' : ''} created
        </p>
        <button
          onClick={onCreatePractice}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600"
        >
          ✨ Create New Practice
        </button>
      </div>

      {/* Practices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practices.map((practice) => {
          const attribute = getAttributeForPractice(practice)
          return (
            <PracticeCard
              key={practice.id}
              practice={practice}
              attribute={attribute}
            />
          )
        })}
      </div>

      {/* Stats */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Practice Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Practices"
            value={practices.length}
            icon="🎯"
          />
          <StatCard
            title="Shared Publicly"
            value={practices.filter(p => p.isPublic).length}
            icon="🤝"
          />
          <StatCard
            title="Attributes Covered"
            value={new Set(practices.map(p => p.subTraitCode)).size}
            icon="⭐"
          />
          <StatCard
            title="This Week"
            value={practices.filter(p => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(p.createdAt) > weekAgo
            }).length}
            icon="📅"
          />
        </div>
      </div>
    </div>
  )
}

function PracticeCard({ practice, attribute }: { 
  practice: Practice, 
  attribute?: any 
}) {
  const activityCount = [
    practice.morningActivity,
    practice.contextualTrigger,
    practice.eveningReflection,
    practice.weeklyPractice
  ].filter(Boolean).length

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
            {practice.title}
          </h3>
          {attribute && (
            <div className="text-sm text-gray-600 mb-2">
              {attribute.roleModel}'s "{attribute.name}"
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {practice.isPublic && (
            <Share2 className="w-4 h-4 text-green-600" title="Shared publicly" />
          )}
        </div>
      </div>

      {/* Activity Preview */}
      <div className="space-y-3 mb-4">
        {practice.morningActivity && (
          <ActivityPreview 
            icon={Clock} 
            title="New Action" 
            content={practice.morningActivity}
          />
        )}
        {practice.contextualTrigger && (
          <ActivityPreview 
            icon={Bell} 
            title="In-the-Moment" 
            content={practice.contextualTrigger}
          />
        )}
        {practice.eveningReflection && (
          <ActivityPreview 
            icon={BookOpen} 
            title="Evening" 
            content={practice.eveningReflection}
          />
        )}
        {practice.weeklyPractice && (
          <ActivityPreview 
            icon={Star} 
            title="Weekly" 
            content={practice.weeklyPractice}
          />
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          practice.difficultyLevel === 'BEGINNER' 
            ? 'bg-green-100 text-green-800'
            : practice.difficultyLevel === 'INTERMEDIATE'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {practice.difficultyLevel}
        </span>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {practice.timeRequired}
        </span>
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
          {activityCount} activities
        </span>
      </div>

      {/* Life Context Tags */}
      {practice.lifeContext.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {practice.lifeContext.slice(0, 3).map(context => (
            <span key={context} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              {context}
            </span>
          ))}
          {practice.lifeContext.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              +{practice.lifeContext.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs text-gray-500">
          Created {new Date(practice.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button 
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit practice"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete practice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ActivityPreview({ icon: Icon, title, content }: { 
  icon: any, 
  title: string, 
  content: string 
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="text-xs font-medium text-gray-600">{title}:</span>
        <p className="text-sm text-gray-700 line-clamp-2 mt-1">{content}</p>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { 
  title: string, 
  value: number, 
  icon: string 
}) {
  return (
    <div className="bg-white rounded-lg p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}