'use client'

import { useState, useEffect } from 'react'
import { Star, Users, Clock, Copy, Heart, MessageCircle, Filter, TrendingUp, Award, Eye, Search, Bell, BookOpen, AlertCircle } from 'lucide-react'

interface CommunityPractice {
  id: string
  title: string
  description: string
  creator: {
    name: string
    username: string
    totalPractices: number
    followersCount: number
  }
  attribute: {
    name: string
    roleModel: string
    subTraitCode: string
  }
  activities: {
    morningActivity?: string
    contextualTrigger?: string
    eveningReflection?: string
    weeklyPractice?: string
  }
  metadata: {
    difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    timeRequired: string
    lifeContext: string[]
  }
  stats: {
    adoptedByUsers: number
    averageRating: number
    totalRatings: number
    viewCount: number
    adaptations: number
  }
  safetyNotes?: string
  isVerified: boolean
  createdAt: string
}

interface CommunityPracticeGalleryProps {
  attributeCode?: string // Filter by specific attribute
  roleModel?: string // Filter by role model
  onAdoptPractice: (practice: CommunityPractice) => void
  onCreatePractice: () => void
}

export default function CommunityPracticeGallery({
  attributeCode,
  roleModel,
  onAdoptPractice,
  onCreatePractice
}: CommunityPracticeGalleryProps) {
  const [practices, setPractices] = useState<CommunityPractice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    sortBy: 'popular', // 'popular', 'newest', 'highest-rated', 'most-used'
    difficulty: 'all',
    timeRequired: 'all',
    lifeContext: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    const mockPractices: CommunityPractice[] = [
      {
        id: '1',
        title: "Gandhi's Phone Reminder Practice",
        description: "A simple but powerful way to remember non-violence in the heat of the moment",
        creator: {
          name: "Sarah K.",
          username: "sarahk_teacher",
          totalPractices: 12,
          followersCount: 1240
        },
        attribute: {
          name: "Nonviolently Resisting",
          roleModel: "Mahatma Gandhi",
          subTraitCode: "GW.01.ACT"
        },
        activities: {
          morningActivity: "Set phone reminder: 'WWGD - What Would Gandhi Do?' to appear before any difficult meetings",
          contextualTrigger: "When feeling anger rising, see the reminder and take 3 breaths while asking Gandhi's question",
          eveningReflection: "Review the day: Did I see my reminders? How did they help me respond with love instead of anger?",
        },
        metadata: {
          difficultyLevel: 'BEGINNER',
          timeRequired: '1-5 minutes',
          lifeContext: ['Work', 'Family', 'Relationships']
        },
        stats: {
          adoptedByUsers: 127,
          averageRating: 4.8,
          totalRatings: 89,
          viewCount: 1205,
          adaptations: 23
        },
        isVerified: true,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: "Gandhi Journal Practice",
        description: "Evening reflection practice that transforms daily conflicts into growth opportunities",
        creator: {
          name: "Mike Chen",
          username: "mikemanager",
          totalPractices: 8,
          followersCount: 890
        },
        attribute: {
          name: "Nonviolently Resisting",
          roleModel: "Mahatma Gandhi", 
          subTraitCode: "GW.01.ACT"
        },
        activities: {
          eveningReflection: "Each evening, write about one conflict from the day. Ask: 'How could I have handled this more like Gandhi?' Then write one specific thing to try tomorrow.",
          weeklyPractice: "Review the week's journal entries and identify your most common conflict patterns. Choose one to focus on improving next week."
        },
        metadata: {
          difficultyLevel: 'INTERMEDIATE',
          timeRequired: '10-15 minutes',
          lifeContext: ['Work', 'Personal Growth', 'Relationships']
        },
        stats: {
          adoptedByUsers: 89,
          averageRating: 4.6,
          totalRatings: 67,
          viewCount: 892,
          adaptations: 31
        },
        safetyNotes: "If journaling about conflicts brings up intense emotions, consider talking to a counselor or trusted friend.",
        isVerified: false,
        createdAt: '2024-01-20'
      },
      {
        id: '3',
        title: "Family Gandhi Rule",
        description: "Transform family arguments into opportunities for love and understanding",
        creator: {
          name: "Lisa M.",
          username: "lisamom3",
          totalPractices: 15,
          followersCount: 567
        },
        attribute: {
          name: "Nonviolently Resisting",
          roleModel: "Mahatma Gandhi",
          subTraitCode: "GW.01.ACT"
        },
        activities: {
          contextualTrigger: "Before any family argument, we say 'Gandhi Rule!' and ask together: 'How can we solve this with love instead of fighting?'",
          eveningReflection: "Family dinner discussion: 'How did we practice the Gandhi Rule today? What can we do better tomorrow?'"
        },
        metadata: {
          difficultyLevel: 'INTERMEDIATE',
          timeRequired: '5-10 minutes',
          lifeContext: ['Family', 'Relationships']
        },
        stats: {
          adoptedByUsers: 67,
          averageRating: 4.9,
          totalRatings: 45,
          viewCount: 634,
          adaptations: 18
        },
        isVerified: true,
        createdAt: '2024-01-25'
      }
    ]

    setTimeout(() => {
      setPractices(mockPractices)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredPractices = practices.filter(practice => {
    if (attributeCode && practice.attribute.subTraitCode !== attributeCode) return false
    if (roleModel && practice.attribute.roleModel !== roleModel) return false
    if (searchTerm && !practice.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !practice.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const sortedPractices = [...filteredPractices].sort((a, b) => {
    switch (filter.sortBy) {
      case 'popular':
        return b.stats.adoptedByUsers - a.stats.adoptedByUsers
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'highest-rated':
        return b.stats.averageRating - a.stats.averageRating
      case 'most-used':
        return b.stats.viewCount - a.stats.viewCount
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Practices</h1>
          <p className="text-gray-600">
            {attributeCode 
              ? `Discover how others practice "${practices[0]?.attribute.name}"` 
              : "Discover practices created by the community"}
          </p>
        </div>
        <button
          onClick={onCreatePractice}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
        >
          ✨ Create Practice
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search practices..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="most-used">Most Viewed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Difficulty:</span>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter(prev => ({ ...prev, difficulty: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {sortedPractices.length} practices found
          </div>
        </div>
      </div>

      {/* Practice Cards */}
      <div className="space-y-6">
        {sortedPractices.map(practice => (
          <PracticeCard
            key={practice.id}
            practice={practice}
            onAdopt={() => onAdoptPractice(practice)}
          />
        ))}
      </div>

      {sortedPractices.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No practices found</h3>
          <p className="text-gray-600 mb-4">
            Be the first to create a practice for this attribute!
          </p>
          <button
            onClick={onCreatePractice}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600"
          >
            Create First Practice
          </button>
        </div>
      )}
    </div>
  )
}

function PracticeCard({ practice, onAdopt }: { 
  practice: CommunityPractice, 
  onAdopt: () => void 
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [userRating, setUserRating] = useState(0)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{practice.title}</h3>
              {practice.isVerified && (
                <Award className="w-5 h-5 text-blue-500" title="Verified Practice" />
              )}
            </div>
            <p className="text-gray-600 mb-2">{practice.description}</p>
            <div className="text-sm text-gray-500">
              Based on {practice.attribute.roleModel}'s "{practice.attribute.name}"
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{practice.stats.averageRating.toFixed(1)}</span>
              <span className="text-gray-500">({practice.stats.totalRatings})</span>
            </div>
            <div className="text-sm text-gray-600">
              {practice.stats.adoptedByUsers} users
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {practice.creator.name.charAt(0)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">{practice.creator.name}</span>
            <span className="text-gray-500"> @{practice.creator.username}</span>
            <div className="text-xs text-gray-500">
              {practice.creator.totalPractices} practices • {practice.creator.followersCount} followers
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 text-xs rounded-full ${
            practice.metadata.difficultyLevel === 'BEGINNER' 
              ? 'bg-green-100 text-green-800'
              : practice.metadata.difficultyLevel === 'INTERMEDIATE'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {practice.metadata.difficultyLevel}
          </span>
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {practice.metadata.timeRequired}
          </span>
          {practice.metadata.lifeContext.map(context => (
            <span key={context} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
              {context}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {practice.stats.adoptedByUsers} adopted
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {practice.stats.viewCount} views
          </div>
          <div className="flex items-center gap-1">
            <Copy className="w-4 h-4" />
            {practice.stats.adaptations} adaptations
          </div>
        </div>
      </div>

      {/* Activities Preview */}
      {showDetails && (
        <div className="px-6 pb-4 border-t border-gray-100">
          <div className="mt-4 space-y-3">
            {practice.activities.morningActivity && (
              <ActivityItem 
                icon={Clock} 
                title="Morning" 
                content={practice.activities.morningActivity} 
              />
            )}
            {practice.activities.contextualTrigger && (
              <ActivityItem 
                icon={Bell} 
                title="In-the-Moment" 
                content={practice.activities.contextualTrigger} 
              />
            )}
            {practice.activities.eveningReflection && (
              <ActivityItem 
                icon={BookOpen} 
                title="Evening" 
                content={practice.activities.eveningReflection} 
              />
            )}
            {practice.activities.weeklyPractice && (
              <ActivityItem 
                icon={Star} 
                title="Weekly" 
                content={practice.activities.weeklyPractice} 
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
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`w-4 h-4 ${star <= userRating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onAdopt}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 text-sm font-medium"
            >
              Try This Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ icon: Icon, title, content }: { 
  icon: any, 
  title: string, 
  content: string 
}) {
  return (
    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-900 text-sm">{title}</span>
      </div>
      <p className="text-gray-700 text-sm">{content}</p>
    </div>
  )
}