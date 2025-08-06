/**
 * Database Seeding Script: Enhanced Activity System
 * 
 * This script sets up the database for the new enhanced activity system including:
 * - Activity Categories (Purpose, Mental Health, Physical, etc.)
 * - Enhanced activity tracking capabilities
 * - Life Skills progress tracking
 * - Learning loop functionality
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Enhanced Activity System database setup...')

  try {
    // 1. Create Activity Categories
    console.log('📁 Creating Activity Categories...')
    
    const categories = [
      {
        name: 'Purpose',
        description: 'Meaning, values, spiritual practices, life direction',
        icon: '🎯',
        sortOrder: 1
      },
      {
        name: 'Mental Health',
        description: 'Meditation, reflection, emotional regulation',
        icon: '🧠',
        sortOrder: 2
      },
      {
        name: 'Physical',
        description: 'Exercise, movement, health practices',
        icon: '💪',
        sortOrder: 3
      },
      {
        name: 'Relationships',
        description: 'Communication, social connection, family',
        icon: '❤️',
        sortOrder: 4
      },
      {
        name: 'Art & Creativity',
        description: 'Music, visual arts, writing, crafts, innovation',
        icon: '🎨',
        sortOrder: 5
      },
      {
        name: 'Learning',
        description: 'Study, skill development, intellectual growth',
        icon: '📚',
        sortOrder: 6
      },
      {
        name: 'Productivity',
        description: 'Life/work optimization, planning, organizing',
        icon: '⚡',
        sortOrder: 7
      }
    ]

    for (const category of categories) {
      const result = await prisma.activityCategory.upsert({
        where: { name: category.name },
        update: {
          description: category.description,
          icon: category.icon,
          sortOrder: category.sortOrder
        },
        create: category
      })
      console.log(`✅ Created category: ${result.name}`)
    }

    // 2. Update existing activity preferences to assign categories
    console.log('🔄 Assigning categories to existing activities...')
    
    // Get all categories for reference
    const categoryMap = await prisma.activityCategory.findMany()
    const categoryByName = Object.fromEntries(
      categoryMap.map(cat => [cat.name, cat.id])
    )

    // Update existing activities with default categories based on title/content
    const updates = [
      {
        condition: { activityTitle: { contains: 'meditat', mode: 'insensitive' as const } },
        categoryId: categoryByName['Mental Health']
      },
      {
        condition: { activityTitle: { contains: 'breath', mode: 'insensitive' as const } },
        categoryId: categoryByName['Mental Health']
      },
      {
        condition: { activityTitle: { contains: 'walk', mode: 'insensitive' as const } },
        categoryId: categoryByName['Physical']
      },
      {
        condition: { activityTitle: { contains: 'exercise', mode: 'insensitive' as const } },
        categoryId: categoryByName['Physical']
      },
      {
        condition: { activityTitle: { contains: 'communication', mode: 'insensitive' as const } },
        categoryId: categoryByName['Relationships']
      },
      {
        condition: { activityTitle: { contains: 'creative', mode: 'insensitive' as const } },
        categoryId: categoryByName['Art & Creativity']
      },
      {
        condition: { activityTitle: { contains: 'learn', mode: 'insensitive' as const } },
        categoryId: categoryByName['Learning']
      },
      {
        condition: { activityTitle: { contains: 'plan', mode: 'insensitive' as const } },
        categoryId: categoryByName['Productivity']
      }
    ]

    for (const update of updates) {
      const count = await prisma.activityPreference.updateMany({
        where: {
          AND: [
            update.condition,
            { categoryId: null }
          ]
        },
        data: {
          categoryId: update.categoryId
        }
      })
      console.log(`✅ Updated ${count.count} activities with category ${Object.keys(categoryByName).find(key => categoryByName[key] === update.categoryId)}`)
    }

    // 3. Set default category for remaining activities
    const remainingCount = await prisma.activityPreference.updateMany({
      where: { categoryId: null },
      data: { categoryId: categoryByName['Purpose'] } // Default to Purpose
    })
    console.log(`✅ Set default category for ${remainingCount.count} remaining activities`)

    // 4. Enable learning for meaningful activities
    console.log('🧠 Enabling learning loop for meaningful activities...')
    
    const learningEnabledCount = await prisma.activityPreference.updateMany({
      where: {
        OR: [
          { categoryId: categoryByName['Purpose'] },
          { categoryId: categoryByName['Mental Health'] },
          { categoryId: categoryByName['Relationships'] },
          { categoryId: categoryByName['Learning'] }
        ]
      },
      data: {
        learningEnabled: true
      }
    })
    console.log(`✅ Enabled learning loop for ${learningEnabledCount.count} meaningful activities`)

    console.log('🎉 Enhanced Activity System setup completed successfully!')
    
    // Display summary
    const totalCategories = await prisma.activityCategory.count()
    const totalActivities = await prisma.activityPreference.count()
    const learningActivities = await prisma.activityPreference.count({
      where: { learningEnabled: true }
    })
    
    console.log('\n📊 Setup Summary:')
    console.log(`   Categories created: ${totalCategories}`)
    console.log(`   Activities categorized: ${totalActivities}`)
    console.log(`   Learning-enabled activities: ${learningActivities}`)
    console.log('\n✅ Database is ready for enhanced activity features!')

  } catch (error) {
    console.error('❌ Error setting up Enhanced Activity System:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })