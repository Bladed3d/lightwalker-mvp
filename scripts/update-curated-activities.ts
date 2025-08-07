#!/usr/bin/env ts-node
/**
 * Update Database with Curated Activities
 * Implements user's curation decisions from interactive review
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const curatedActivities = [
  {
    id: '200-year-perspective',
    title: '200-Year Perspective Check',
    category: 'mindfulness',
    action: 'Daily message appears for 1 min quick meditation',
    keep: true
  },
  {
    id: 'ego-or-joy',
    title: 'Ego or Joy Choice',
    category: 'mindfulness',
    action: 'Daily message appears for 1 min quick meditation',
    keep: true
  },
  {
    id: 'focused-meditation',
    title: 'Focused Meditation Practice',
    category: 'mindfulness',
    action: 'Choose one focus (breath, deity, or true self). When mind wanders, gently return. Notice the magic of one-pointed focus.',
    keep: true
  },
  {
    id: 'permission-first',
    title: 'Permission First Protocol',
    category: 'communication',
    action: 'Daily message appears for 1 min quick meditation',
    keep: true
  },
  {
    id: 'truth-first',
    title: 'Truth First Protocol',
    category: 'mindfulness',
    action: 'Before speaking or acting, pause and ask \'Is this truth or ego speaking?\' Choose truth even when harder.',
    keep: true
  },
  {
    id: 'edison-napping',
    title: 'Edison Strategic Napping',
    category: 'creativity',
    action: 'Hold a small object while taking a 10-20 minute nap. When it drops and wakes you, immediately capture any insights.',
    keep: true
  },
  {
    id: 'ego-check-speaking',
    title: 'Ego Check Before Speaking',
    category: 'communication',
    action: 'Daily message of "Before speaking, ask \'What am I trying to accomplish?\' If it\'s ego-driven (proving superiority), choose silence."',
    keep: true
  },
  {
    id: 'deep-reflection',
    title: 'Deep Reflection',
    category: 'mindfulness',
    action: 'Take time to quietly contemplate your higher purpose - why are you here?',
    keep: true
  },
  {
    id: 'bath',
    title: 'Bath',
    category: 'physical',
    action: 'Relax and cleanse with a rejuvenating bath',
    keep: true
  },
  {
    id: 'breakfast',
    title: 'Breakfast',
    category: 'physical',
    action: 'Start your day with a nutritious breakfast',
    keep: true
  },
  {
    id: 'conflict-resolution',
    title: 'Conflict Resolution',
    category: 'communication',
    action: 'Live Solution',
    keep: true
  },
  {
    id: 'creative-thinking',
    title: 'Creative Thinking',
    category: 'productivity',
    action: 'Think of a problem or topic, then create solutions as if you were: 6 years old, 80 years old, Einstein, a friend\'s mother, deity, yourself 5 years from now.',
    keep: true
  },
  {
    id: 'dogs',
    title: 'Dogs',
    category: 'mindfulness',
    action: 'Dogs are people too. Enjoy dog therapy. They love you more honestly than most.',
    keep: true
  },
  {
    id: 'empathy-practice',
    title: 'Empathy Practice',
    category: 'communication',
    action: 'Listen deeply. Repeat and validate what they said. Supporting them in pain, cuts it in half. Supporting them in joy, doubles it.',
    keep: true
  },
  {
    id: 'gratitude-practice',
    title: 'Gratitude Practice',
    category: 'mindfulness',
    action: 'Think of 3 things you are grateful for today',
    keep: true
  },
  {
    id: 'hydrate',
    title: 'Hydrate',
    category: 'physical',
    action: 'Water enhances your brain and immune system',
    keep: true
  },
  {
    id: 'innovation-session',
    title: 'Innovation Session',
    category: 'productivity',
    action: 'Set aside uninterrupted time to create, imagine, pretend, and mentally play.',
    keep: true
  },
  {
    id: 'inspire-others',
    title: 'Inspire Others',
    category: 'relationships',
    action: 'Catch someone doing something good, going the extra mile, or contributing and give them recognition and validation.',
    keep: true
  },
  {
    id: 'leadership-moment',
    title: 'Leadership Moment',
    category: 'relationships',
    action: 'Do something you ask others to do that they may not like, leading by example.',
    keep: true
  },
  {
    id: 'life-changing-decision',
    title: 'Life-Changing Decision',
    category: 'mindfulness',
    action: 'You often put others first. This is the time to put yourself first and decide what decision could make the most impact to your happiness and life. Then do it.',
    keep: true
  },
  {
    id: 'master-skill',
    title: 'Master New Skill',
    category: 'learning',
    action: 'Learning is fun. It builds character and stretches the mind. Learn something new, different, or creative.',
    keep: true
  },
  {
    id: 'mentoring',
    title: 'Mentoring Others',
    category: 'productivity',
    action: 'You teach best that which you need to learn most. Take the time to share your talent, skills, and ideas with another.',
    keep: true
  },
  {
    id: 'mindful-breathing',
    title: 'Mindful Breathing',
    category: 'mindfulness',
    action: 'Sit quietly with back straight. Close your eyes. Focus on your breathing. Don\'t change it, just watch it.',
    keep: true
  },
  {
    id: 'posture-check',
    title: 'Posture Check',
    category: 'physical',
    action: 'Stand and stretch. Express gratitude toward your body.',
    keep: true
  },
  {
    id: 'problem-solving',
    title: 'Problem Solving',
    category: 'productivity',
    action: 'Write the challenge in detail. Simplify the description. Divide it into smaller processes or chunks. Identify what steps you can do and where others can help or perform better. Then take action.',
    keep: true
  },
  {
    id: 'quick-walk',
    title: 'Quick Walk',
    category: 'productivity',
    action: 'Physical activity can jolt the mind and rejuvenate the body for greater productivity.',
    keep: true
  },
  {
    id: 'read',
    title: 'Read',
    category: 'learning',
    action: 'Reading is how you gain new thoughts. You can ride on the brilliant minds of others. Then you can have your own brilliant thoughts.',
    keep: true
  },
  {
    id: 'skill-practice',
    title: 'Skill Practice',
    category: 'productivity',
    action: 'Make yourself more valuable by gaining a new skill or craft.',
    keep: true
  },
  {
    id: 'strategic-planning',
    title: 'Strategic Planning',
    category: 'productivity',
    action: 'Plan your approach to important goals',
    keep: true
  }
]

async function updateCuratedActivities() {
  console.log('🚀 Starting curated activities update...\n')
  
  try {
    // First, deactivate ALL existing activities
    console.log('🗑️ Deactivating all existing activities...')
    await prisma.activity.updateMany({
      data: { isActive: false }
    })
    
    // Create or update curated activities
    console.log('✨ Creating/updating curated activities...')
    
    for (const activity of curatedActivities) {
      try {
        await prisma.activity.upsert({
          where: { id: activity.id },
          update: {
            title: activity.title,
            description: activity.action,
            instructions: activity.action,
            category: activity.category,
            isActive: true,
            // Reasonable defaults
            duration: activity.action.includes('Daily message') ? '1 min' : '15 min',
            points: activity.action.includes('Daily message') ? 10 : 30,
            difficulty: 2,
            icon: '🌟',
            updatedAt: new Date()
          },
          create: {
            id: activity.id,
            title: activity.title,
            description: activity.action,
            instructions: activity.action,
            category: activity.category,
            duration: activity.action.includes('Daily message') ? '1 min' : '15 min',
            points: activity.action.includes('Daily message') ? 10 : 30,
            difficulty: 2,
            icon: '🌟',
            isActive: true
          }
        })
        
        console.log(`✅ ${activity.title} (${activity.category})`)
        
      } catch (error) {
        console.error(`❌ Failed to update ${activity.title}:`, error)
      }
    }
    
    // Get final count
    const finalCount = await prisma.activity.count({
      where: { isActive: true }
    })
    
    console.log(`\n🎉 Database update complete!`)
    console.log(`📊 Active activities: ${finalCount}`)
    console.log(`📋 Category breakdown:`)
    
    const categories = await prisma.activity.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true
    })
    
    categories.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat._count} activities`)
    })
    
  } catch (error) {
    console.error('❌ Update failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCuratedActivities()