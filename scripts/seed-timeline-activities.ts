const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

interface TimelineActivity {
  id: string
  title: string
  icon: string
  category: string
  points: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  duration: string
  difficulty: number
  description: string
  isSystemDefault: boolean
  createdAt?: Date
}

async function main() {
  console.log('🌱 Seeding timeline activities...')

  // Timeline activities from GamelikeTimeline.tsx - converting emojis to proper activity records
  const timelineActivities: TimelineActivity[] = [
    // Sleep & Rest Activities
    {
      id: 'night-rest',
      title: 'Night Rest',
      icon: '🌙',
      category: 'sleep',
      points: 5,
      rarity: 'common',
      duration: '30 min',
      difficulty: 1,
      description: 'Peaceful transition into nighttime rest',
      isSystemDefault: true
    },
    {
      id: 'deep-sleep',
      title: 'Deep Sleep',
      icon: '😴',
      category: 'sleep',
      points: 50,
      rarity: 'common',
      duration: '6 hours',
      difficulty: 1,
      description: 'Restorative deep sleep for full recovery',
      isSystemDefault: true
    },
    {
      id: 'prepare-sleep',
      title: 'Prepare Sleep',
      icon: '🛏️',
      category: 'sleep',
      points: 20,
      rarity: 'common',
      duration: '60 min',
      difficulty: 1,
      description: 'Wind down routine to prepare for quality sleep',
      isSystemDefault: true
    },

    // Morning Activities
    {
      id: 'wake',
      title: 'Wake',
      icon: '☀️',
      category: 'morning',
      points: 10,
      rarity: 'common',
      duration: '15 min',
      difficulty: 1,
      description: 'Energizing wake up and morning activation',
      isSystemDefault: true
    },
    {
      id: 'meditate-timeline',
      title: 'Meditate',
      icon: '🧘',
      category: 'mindfulness',
      points: 25,
      rarity: 'uncommon',
      duration: '30 min',
      difficulty: 2,
      description: 'Mindful meditation practice for inner peace',
      isSystemDefault: true
    },

    // Physical Activities  
    {
      id: 'run-timeline',
      title: 'Run',
      icon: '🏃',
      category: 'physical',
      points: 40,
      rarity: 'uncommon',
      duration: '45 min',
      difficulty: 3,
      description: 'Energizing run for cardiovascular health',
      isSystemDefault: true
    },
    {
      id: 'bath',
      title: 'Bath',
      icon: '🚿',
      category: 'self-care',
      points: 15,
      rarity: 'common',
      duration: '20 min',
      difficulty: 1,
      description: 'Refreshing bath or shower routine',
      isSystemDefault: true
    },
    {
      id: 'walk-timeline',
      title: 'Walk',
      icon: '🚶',
      category: 'physical',
      points: 20,
      rarity: 'common',
      duration: '30 min',
      difficulty: 1,
      description: 'Peaceful walk for movement and fresh air',
      isSystemDefault: true
    },
    {
      id: 'train',
      title: 'Train',
      icon: '💪',
      category: 'physical',
      points: 40,
      rarity: 'uncommon',
      duration: '45 min',
      difficulty: 3,
      description: 'Strength training and physical conditioning',
      isSystemDefault: true
    },

    // Nutrition Activities
    {
      id: 'breakfast',
      title: 'Breakfast',
      icon: '🍳',
      category: 'nutrition',
      points: 20,
      rarity: 'common',
      duration: '30 min',
      difficulty: 1,
      description: 'Nourishing breakfast to start the day',
      isSystemDefault: true
    },
    {
      id: 'lunch-timeline',
      title: 'Lunch',
      icon: '🥗',
      category: 'nutrition',
      points: 25,
      rarity: 'common',
      duration: '45 min',
      difficulty: 1,
      description: 'Healthy midday meal for sustained energy',
      isSystemDefault: true
    },
    {
      id: 'nourish',
      title: 'Nourish',
      icon: '🍽️',
      category: 'nutrition',
      points: 25,
      rarity: 'common',
      duration: '45 min',
      difficulty: 1,
      description: 'Mindful nourishing meal with whole foods',
      isSystemDefault: true
    },

    // Learning & Growth Activities
    {
      id: 'read-timeline',
      title: 'Read',
      icon: '📖',
      category: 'learning',
      points: 30,
      rarity: 'uncommon',
      duration: '40 min',
      difficulty: 2,
      description: 'Focused reading for knowledge and growth',
      isSystemDefault: true
    },
    {
      id: 'learn-timeline',
      title: 'Learn',
      icon: '📚',
      category: 'learning',
      points: 35,
      rarity: 'uncommon',
      duration: '60 min',
      difficulty: 2,
      description: 'Dedicated learning session for skill development',
      isSystemDefault: true
    },

    // Work & Productivity
    {
      id: 'deep-work',
      title: 'Deep Work',
      icon: '💻',
      category: 'productivity',
      points: 80,
      rarity: 'rare',
      duration: '120 min',
      difficulty: 4,
      description: 'Focused deep work session for complex tasks',
      isSystemDefault: true
    },
    {
      id: 'innovate',
      title: 'Innovate',
      icon: '💡',
      category: 'creativity',
      points: 65,
      rarity: 'rare',
      duration: '90 min',
      difficulty: 4,
      description: 'Creative innovation and problem-solving time',
      isSystemDefault: true
    },

    // Creative Activities
    {
      id: 'create-timeline',
      title: 'Create',
      icon: '🎨',
      category: 'creativity',
      points: 60,
      rarity: 'uncommon',
      duration: '90 min',
      difficulty: 3,
      description: 'Creative expression and artistic practice',
      isSystemDefault: true
    },

    // Social Activities
    {
      id: 'connect',
      title: 'Connect',
      icon: '👥',
      category: 'social',
      points: 35,
      rarity: 'uncommon',
      duration: '60 min',
      difficulty: 2,
      description: 'Meaningful social connection with others',
      isSystemDefault: true
    },
    {
      id: 'bond',
      title: 'Bond',
      icon: '👨‍👩‍👧',
      category: 'relationships',
      points: 50,
      rarity: 'uncommon',
      duration: '90 min',
      difficulty: 2,
      description: 'Quality bonding time with family',
      isSystemDefault: true
    },

    // Self-Care & Reflection
    {
      id: 'recharge',
      title: 'Recharge',
      icon: '☕',
      category: 'self-care',
      points: 10,
      rarity: 'common',
      duration: '15 min',
      difficulty: 1,
      description: 'Quick recharge break to restore energy',
      isSystemDefault: true
    },
    {
      id: 'reflect-timeline',
      title: 'Reflect',
      icon: '✍️',
      category: 'mindfulness',
      points: 20,
      rarity: 'common',
      duration: '30 min',
      difficulty: 2,
      description: 'Thoughtful reflection and journaling',
      isSystemDefault: true
    },
    {
      id: 'wind-down',
      title: 'Wind Down',
      icon: '🌅',
      category: 'self-care',
      points: 15,
      rarity: 'common',
      duration: '60 min',
      difficulty: 1,
      description: 'Gentle wind down routine for evening relaxation',
      isSystemDefault: true
    }
  ]

  // First, let's check if we need to create an Activity table in the schema
  // For now, we'll use ActivityPreference to store these as "system defaults"
  console.log('📝 Creating system default activities via ActivityPreference...')

  for (const activity of timelineActivities) {
    try {
      await prisma.activityPreference.upsert({
        where: { 
          // Use the compound unique constraint for session-based system defaults
          unique_session_activity_preference: {
            sessionId: 'system-default',
            activityId: activity.id
          }
        },
        update: {
          activityTitle: activity.title,
          customDuration: activity.duration,
          customPoints: activity.points,
          customDifficulty: activity.difficulty,
          customCategory: activity.category,
          customDescription: activity.description,
          customIcon: activity.icon, // This will be updated to JPG later
          // Mark as system default
          userId: null,
          sessionId: 'system-default',
          timesUsed: 0,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          activityId: activity.id,
          activityTitle: activity.title,
          customDuration: activity.duration,
          customPoints: activity.points,
          customDifficulty: activity.difficulty,
          customCategory: activity.category,
          customDescription: activity.description,
          customIcon: activity.icon, // This will be updated to JPG later
          // Mark as system default
          userId: null,
          sessionId: 'system-default',
          timesUsed: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Created/Updated: ${activity.title} (${activity.category})`)
    } catch (error) {
      console.error(`❌ Failed to create ${activity.title}:`, error)
    }
  }

  console.log(`\n🎉 Successfully seeded ${timelineActivities.length} timeline activities!`)
  console.log('\n📋 Activity Summary by Category:')
  
  const categories = timelineActivities.reduce((acc, activity) => {
    acc[activity.category] = (acc[activity.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count} activities`)
  })

  console.log('\n🎯 Next Steps:')
  console.log('1. Use QuickActionsPanel to replace emoji icons with JPG images')
  console.log('2. Update GamelikeTimeline.tsx to load activities from database')
  console.log('3. Remove hardcoded activity arrays from components')
  console.log('4. All activities will be manageable through the UI!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✅ Database connection closed')
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })