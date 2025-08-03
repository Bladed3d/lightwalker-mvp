'use client'

import { useState } from 'react'
import AttributePracticeHub from './AttributePracticeHub'
import CommunityPracticeGallery from './CommunityPracticeGallery'
import MyPracticesGallery from './MyPracticesGallery'

// Demo component to showcase the Practice Builder system
export default function PracticeBuilderDemo() {
  const [currentView, setCurrentView] = useState<'character-hub' | 'community-gallery' | 'my-practices'>('character-hub')
  const [allUserPractices, setAllUserPractices] = useState<any[]>([])

  // Mock user character data - this would come from your database
  const mockUserCharacter = {
    id: 'user-123',
    name: 'My Lightwalker',
    attributes: [
      {
        id: 'gw-01-act',
        name: 'Nonviolently Resisting',
        description: 'I stand up to unfairness and injustice, but I do it without hurting anyone or being mean back to them.',
        method: "When facing unfairness, ask 'How can I resist this wrong without becoming wrong myself?'",
        benefit: 'Creates real change while keeping your moral strength and often winning over opponents',
        oppositeOf: 'Either fighting back with violence or just accepting injustice quietly',
        roleModel: 'Mahatma Gandhi',
        roleModelId: 'gandhi',
        subTraitCode: 'GW.01.ACT'
      },
      {
        id: 'ma-01-act',
        name: 'Wisely Teaching',
        description: 'I share what I\'ve learned from my experiences to help others avoid mistakes and find their strength.',
        method: "When someone faces a challenge you've overcome, share what you learned and how you grew",
        benefit: 'Multiplies positive impact by helping others learn from your experiences and wisdom',
        oppositeOf: 'Keeping your lessons to yourself or assuming others don\'t want to learn from you',
        roleModel: 'Maya Angelou',
        roleModelId: 'maya-angelou',
        subTraitCode: 'MA.01.ACT'
      },
      {
        id: 'mlk-01-act',
        name: 'Dreamingly Leading',
        description: 'I inspire others by painting a vivid picture of what\'s possible when we work together for justice.',
        method: "When facing problems, ask 'What would this look like if it was working perfectly?' and share that vision",
        benefit: 'Inspires people to work for positive change by helping them imagine a better future',
        oppositeOf: 'Only focusing on what\'s wrong without offering hope or vision for improvement',
        roleModel: 'Martin Luther King Jr.',
        roleModelId: 'mlk',
        subTraitCode: 'MLK.01.ACT'
      },
      {
        id: 'jc-01-act',
        name: 'Truthfully Compassionate',
        description: 'I speak honestly about problems while showing love and understanding for the person.',
        method: "Before addressing problems, ask 'How can I say this in a way that shows I care about them?'",
        benefit: 'Helps people change and grow by combining truth with safety and encouragement',
        oppositeOf: 'Either avoiding difficult conversations or speaking harshly without care for feelings',
        roleModel: 'Jesus',
        roleModelId: 'jesus',
        subTraitCode: 'JC.01.ACT'
      }
    ]
  }

  const handleAdoptPractice = (practice: any) => {
    console.log('Adopting practice:', practice)
    alert('Practice adopted! You can now customize it for your needs.')
  }

  const handleCreatePractice = () => {
    // Switch to character hub to select an attribute
    setCurrentView('character-hub')
    alert('Select an attribute from your character to create a practice for it!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Practice Builder Demo</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('character-hub')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'character-hub' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Character
              </button>
              <button
                onClick={() => setCurrentView('community-gallery')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'community-gallery' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Community Gallery
              </button>
              <button
                onClick={() => setCurrentView('my-practices')}
                className={`px-4 py-2 rounded-lg ${
                  currentView === 'my-practices' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Practices
              </button>
              <button
                onClick={handleCreatePractice}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600"
              >
                ✨ Create Practice
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="py-8">
        {currentView === 'character-hub' && (
          <AttributePracticeHub 
            userCharacter={mockUserCharacter}
            onPracticeSaved={(practice) => {
              setAllUserPractices(prev => [...prev, practice])
            }}
          />
        )}

        {currentView === 'community-gallery' && (
          <CommunityPracticeGallery
            onAdoptPractice={handleAdoptPractice}
            onCreatePractice={handleCreatePractice}
          />
        )}

        {currentView === 'my-practices' && (
          <MyPracticesGallery 
            practices={allUserPractices}
            userCharacter={mockUserCharacter}
            onCreatePractice={handleCreatePractice}
          />
        )}
      </main>

      {/* Feature Highlights */}
      <div className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Practice Builder Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Guided Creation"
              description="Step-by-step process helps you transform wisdom into daily practices"
              icon="🎯"
            />
            <FeatureCard
              title="Community Sharing"
              description="Share your practices and discover what works for others"
              icon="🤝"
            />
            <FeatureCard
              title="Smart Adaptation"
              description="Customize any practice to fit your lifestyle and preferences"
              icon="⚡"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon }: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}