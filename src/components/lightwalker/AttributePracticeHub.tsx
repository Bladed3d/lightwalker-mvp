'use client'

import { useState } from 'react'
import { Brain, Sparkles, Users, Plus, ChevronRight, Target, Clock, Star, TrendingUp, Bell, BookOpen } from 'lucide-react'
import PracticeBuilder from './PracticeBuilder'
import CommunityPracticeGallery from './CommunityPracticeGallery'

interface Attribute {
  id: string
  name: string
  description: string
  method: string
  benefit: string
  oppositeOf: string
  roleModel: string
  roleModelId: string
  subTraitCode: string
  imageUrl?: string
}

interface UserCharacter {
  id: string
  name: string
  attributes: Attribute[]
}

interface AttributePracticeHubProps {
  userCharacter: UserCharacter
  selectedAttribute?: Attribute
  onBack?: () => void
  onPracticeSaved?: (practice: any) => void
}

export default function AttributePracticeHub({ 
  userCharacter, 
  selectedAttribute: initialAttribute,
  onBack,
  onPracticeSaved
}: AttributePracticeHubProps) {
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(initialAttribute || null)
  const [currentView, setCurrentView] = useState<'selection' | 'hub' | 'builder' | 'gallery'>('selection')
  const [userPractices, setUserPractices] = useState<any[]>([])

  const handleSelectAttribute = (attribute: Attribute) => {
    setSelectedAttribute(attribute)
    setCurrentView('hub')
  }

  const handleCreatePractice = () => {
    if (selectedAttribute) {
      setCurrentView('builder')
    }
  }

  const handleSavePractice = (practice: any) => {
    // Here you would save to database
    console.log('Saving practice:', practice)
    const newPractice = { 
      ...practice, 
      id: Date.now().toString(), 
      subTraitCode: selectedAttribute?.subTraitCode,
      createdAt: new Date().toISOString()
    }
    setUserPractices([...userPractices, newPractice])
    setCurrentView('hub')
    
    // Notify parent component
    onPracticeSaved?.(newPractice)
    
    // Show success message
    alert(`Practice "${practice.title}" saved successfully! ${practice.isPublic ? 'It will be shared with the community.' : ''}`)
  }

  const handleAdoptPractice = (practice: any) => {
    // Here you would add to user's practices
    console.log('Adopting practice:', practice)
    alert('Practice adopted! You can now customize it in "My Practices"')
  }

  if (currentView === 'selection' && !initialAttribute) {
    return (
      <AttributeSelectionView
        userCharacter={userCharacter}
        onSelectAttribute={handleSelectAttribute}
        onBack={onBack}
      />
    )
  }

  if (currentView === 'builder' && selectedAttribute) {
    return (
      <PracticeBuilder
        attribute={selectedAttribute}
        onSave={handleSavePractice}
        onCancel={() => setCurrentView('hub')}
      />
    )
  }

  if (currentView === 'gallery' && selectedAttribute) {
    return (
      <>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => setCurrentView('hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to {selectedAttribute.name} Hub
          </button>
        </div>
        <CommunityPracticeGallery
          attributeCode={selectedAttribute.subTraitCode}
          roleModel={selectedAttribute.roleModel}
          onAdoptPractice={handleAdoptPractice}
          onCreatePractice={handleCreatePractice}
        />
      </>
    )
  }

  // Practice Hub View
  return selectedAttribute ? (
    <PracticeHubView
      attribute={selectedAttribute}
      userPractices={userPractices.filter(p => p.subTraitCode === selectedAttribute.subTraitCode)}
      onCreatePractice={handleCreatePractice}
      onBrowseCommunity={() => setCurrentView('gallery')}
      onBack={() => setCurrentView('selection')}
    />
  ) : null
}

// Attribute Selection View
function AttributeSelectionView({ 
  userCharacter, 
  onSelectAttribute,
  onBack 
}: {
  userCharacter: UserCharacter
  onSelectAttribute: (attr: Attribute) => void
  onBack?: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Practice Builder for {userCharacter.name}
        </h1>
        <p className="text-gray-600">
          Select an attribute to create or discover practices
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userCharacter.attributes.map((attribute) => (
          <AttributeCard
            key={attribute.id}
            attribute={attribute}
            onClick={() => onSelectAttribute(attribute)}
          />
        ))}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="mt-8 text-gray-600 hover:text-gray-900"
        >
          ← Back to Character Dashboard
        </button>
      )}
    </div>
  )
}

// Attribute Card Component
function AttributeCard({ 
  attribute, 
  onClick 
}: { 
  attribute: Attribute
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all hover:scale-[1.02] border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{attribute.name}</h3>
            <p className="text-sm text-gray-600">{attribute.roleModel}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <p className="text-gray-700 mb-3 line-clamp-2">{attribute.description}</p>

      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
        <p className="text-sm text-gray-700 italic line-clamp-2">"{attribute.method}"</p>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          0 practices
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-4 h-4" />
          Create first!
        </span>
      </div>
    </button>
  )
}

// Practice Hub View
function PracticeHubView({ 
  attribute, 
  userPractices,
  onCreatePractice,
  onBrowseCommunity,
  onBack
}: {
  attribute: Attribute
  userPractices: any[]
  onCreatePractice: () => void
  onBrowseCommunity: () => void
  onBack: () => void
}) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          ← Back to Attributes
        </button>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{attribute.name}</h1>
            <p className="text-gray-600 mb-1">{attribute.roleModel}'s Approach</p>
            <p className="text-gray-700">{attribute.description}</p>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Original Method</h3>
          <p className="text-gray-700 italic">"{attribute.method}"</p>
        </div>
      </div>

      {/* Create Practice CTA */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-1 rounded-xl mb-8">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Transform This Into Your Daily Practice
              </h2>
              <p className="text-gray-600">
                Create a personalized practice that fits your lifestyle
              </p>
            </div>
            <button
              onClick={onCreatePractice}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create My Practice
            </button>
          </div>
        </div>
      </div>

      {/* My Practices Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Practices</h2>
        {userPractices.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {userPractices.map((practice) => (
                <UserPracticeCard key={practice.id} practice={practice} />
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => alert('View All My Practices feature - would show all practices across all attributes')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All My Practices →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No practices yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first practice to start building this attribute
            </p>
            <button
              onClick={onCreatePractice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Practice
            </button>
          </div>
        )}
      </div>

      {/* Community Practices Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Community Practices</h2>
          <button
            onClick={onBrowseCommunity}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Discover How Others Practice {attribute.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Browse community-created practices and adapt them to your needs
          </p>
          <button
            onClick={onBrowseCommunity}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Community Gallery
          </button>
        </div>
      </div>
    </div>
  )
}

// User Practice Card
function UserPracticeCard({ practice }: { practice: any }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{practice.title}</h3>
        <div className="flex items-center gap-2">
          {practice.isPublic && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Shared
            </span>
          )}
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            {practice.difficultyLevel}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {practice.morningActivity && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-600 line-clamp-2">{practice.morningActivity}</p>
          </div>
        )}
        {practice.contextualTrigger && (
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-600 line-clamp-2">{practice.contextualTrigger}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{practice.timeRequired}</span>
        <button className="text-blue-600 hover:text-blue-800">
          Edit Practice →
        </button>
      </div>
    </div>
  )
}