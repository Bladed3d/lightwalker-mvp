#!/usr/bin/env ts-node
/**
 * Comprehensive Activity Export & Analysis Script
 * 
 * Exports all activities from database and philosophical CSV
 * Creates comparison matrices and analysis for curation
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ActivityData {
  id: string
  title: string
  description: string
  instructions?: string
  duration: string
  points: number
  difficulty: number
  category: string
  icon: string
  source: 'database' | 'philosophical'
  timesUsed?: number
  lastUsed?: Date | null
  customCategory?: string
  customDuration?: string
  customPoints?: number
  hasPreferences?: boolean
}

interface CategoryMapping {
  legacyCategory: string
  coreCategory: string
  activityCount: number
  examples: string[]
}

async function exportDatabaseActivities(): Promise<ActivityData[]> {
  console.log('📊 Exporting database activities...')
  
  const activities = await prisma.activity.findMany({
    where: { isActive: true },
    orderBy: { title: 'asc' }
  })

  // Also get activity preferences to see what's been customized
  const preferences = await prisma.activityPreference.findMany({
    where: { isActive: true },
    orderBy: { timesUsed: 'desc' }
  })

  const preferenceMap = new Map(preferences.map(p => [p.activityId, p]))

  return activities.map(activity => {
    const pref = preferenceMap.get(activity.id)
    
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description || '',
      instructions: activity.instructions || undefined,
      duration: activity.duration,
      points: activity.points,
      difficulty: activity.difficulty,
      category: activity.category,
      icon: activity.icon,
      source: 'database',
      timesUsed: pref?.timesUsed || 0,
      lastUsed: pref?.lastUsedAt || null,
      customCategory: pref?.customCategory || undefined,
      customDuration: pref?.customDuration || undefined,
      customPoints: pref?.customPoints || undefined,
      hasPreferences: !!pref
    }
  })
}

function parsePhilosophicalActivities(): ActivityData[] {
  console.log('📚 Parsing philosophical-activities.csv...')
  
  const csvPath = path.join(process.cwd(), 'philosophical-activities.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.log('⚠️ philosophical-activities.csv not found')
    return []
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const activity: any = {}
    
    headers.forEach((header, i) => {
      activity[header] = values[i] || ''
    })

    return {
      id: `phil-${index + 1}`,
      title: activity.activity_title || activity.title || `Activity ${index + 1}`,
      description: activity.philosophy || activity.description || '',
      instructions: activity.practice || activity.instructions || undefined,
      duration: activity.duration || '15 min',
      points: parseInt(activity.points) || 30,
      difficulty: parseInt(activity.difficulty) || 5,
      category: activity.category || 'mindfulness',
      icon: activity.icon || '🧘',
      source: 'philosophical' as const
    }
  })
}

function analyzeCategoryMapping(activities: ActivityData[]): CategoryMapping[] {
  console.log('🏷️ Analyzing category mappings...')
  
  const categoryStats = new Map<string, { count: number, examples: string[] }>()
  
  activities.forEach(activity => {
    const category = activity.customCategory || activity.category
    if (!categoryStats.has(category)) {
      categoryStats.set(category, { count: 0, examples: [] })
    }
    
    const stats = categoryStats.get(category)!
    stats.count++
    if (stats.examples.length < 5) {
      stats.examples.push(activity.title)
    }
  })

  // Define mapping to 7 core categories
  const coreMapping: Record<string, string> = {
    'mindfulness': 'mindfulness',
    'physical': 'physical', 
    'creativity': 'creativity',
    'creative': 'creativity',
    'communication': 'communication',
    'learning': 'learning',
    'growth': 'learning',
    'productivity': 'productivity',
    'decision-making': 'productivity',
    'relationships': 'relationships',
    'companionship': 'relationships',
    'social': 'relationships',
    'reflection': 'mindfulness',
    'self-care': 'physical',
    'nutrition': 'physical',
    'sleep': 'physical',
    'morning': 'physical',
    'work': 'productivity'
  }

  return Array.from(categoryStats.entries()).map(([legacyCategory, stats]) => ({
    legacyCategory,
    coreCategory: coreMapping[legacyCategory] || 'mindfulness',
    activityCount: stats.count,
    examples: stats.examples
  })).sort((a, b) => b.activityCount - a.activityCount)
}

function findDuplicates(activities: ActivityData[]): Array<{
  title1: string
  title2: string
  similarity: string
  suggestion: string
}> {
  console.log('🔍 Finding potential duplicates...')
  
  const duplicates: Array<{
    title1: string
    title2: string
    similarity: string
    suggestion: string
  }> = []

  // Check for obvious duplicates
  const titleWords = activities.map(a => ({
    activity: a,
    words: a.title.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  }))

  for (let i = 0; i < titleWords.length; i++) {
    for (let j = i + 1; j < titleWords.length; j++) {
      const a1 = titleWords[i]
      const a2 = titleWords[j]
      
      // Check for word overlap
      const commonWords = a1.words.filter(word => a2.words.includes(word))
      const overlapRatio = commonWords.length / Math.max(a1.words.length, a2.words.length)
      
      if (overlapRatio > 0.5 || 
          a1.activity.title.toLowerCase().includes(a2.activity.title.toLowerCase()) ||
          a2.activity.title.toLowerCase().includes(a1.activity.title.toLowerCase())) {
        
        duplicates.push({
          title1: a1.activity.title,
          title2: a2.activity.title,
          similarity: `${Math.round(overlapRatio * 100)}% word overlap`,
          suggestion: a1.activity.source === 'philosophical' ? `Keep: ${a1.activity.title}` : `Keep: ${a2.activity.title}`
        })
      }
    }
  }

  return duplicates.slice(0, 20) // Limit to top 20
}

function generateCSV(data: any[], filename: string): void {
  if (data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        const stringValue = value === null || value === undefined ? '' : String(value)
        // Escape commas and quotes
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue
      }).join(',')
    )
  ].join('\n')

  fs.writeFileSync(filename, csvContent)
  console.log(`✅ Exported ${data.length} records to ${filename}`)
}

async function main() {
  console.log('🚀 Starting comprehensive activity analysis...\n')

  try {
    // Export all data
    const dbActivities = await exportDatabaseActivities()
    const philActivities = parsePhilosophicalActivities()
    const allActivities = [...dbActivities, ...philActivities]

    console.log(`\n📊 SUMMARY:`)
    console.log(`Database activities: ${dbActivities.length}`)
    console.log(`Philosophical activities: ${philActivities.length}`)
    console.log(`Total activities: ${allActivities.length}`)

    // Generate analysis
    const categoryMappings = analyzeCategoryMapping(allActivities)
    const duplicates = findDuplicates(allActivities)

    // Export to CSV files
    const exportDir = 'activity-analysis-export'
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir)
    }

    generateCSV(allActivities, path.join(exportDir, '1-all-activities.csv'))
    generateCSV(dbActivities, path.join(exportDir, '2-database-activities.csv'))
    generateCSV(philActivities, path.join(exportDir, '3-philosophical-activities.csv'))
    generateCSV(categoryMappings, path.join(exportDir, '4-category-mapping-analysis.csv'))
    generateCSV(duplicates, path.join(exportDir, '5-potential-duplicates.csv'))

    // Generate summary report
    const summaryReport = `
LIGHTWALKER ACTIVITY ANALYSIS REPORT
Generated: ${new Date().toISOString()}

OVERVIEW:
- Database Activities: ${dbActivities.length}
- Philosophical Activities: ${philActivities.length}
- Total Activities: ${allActivities.length}
- Activities with User Preferences: ${dbActivities.filter(a => a.hasPreferences).length}
- Potential Duplicates Found: ${duplicates.length}

CATEGORY DISTRIBUTION:
${categoryMappings.map(cm => 
  `- ${cm.legacyCategory} → ${cm.coreCategory} (${cm.activityCount} activities)`
).join('\n')}

TOP DUPLICATES:
${duplicates.slice(0, 10).map(d => 
  `- "${d.title1}" vs "${d.title2}" (${d.similarity})`
).join('\n')}

FILES EXPORTED:
- 1-all-activities.csv: Complete activity listing
- 2-database-activities.csv: Current database activities
- 3-philosophical-activities.csv: Curated philosophical activities
- 4-category-mapping-analysis.csv: Category mapping analysis
- 5-potential-duplicates.csv: Duplicate detection results

RECOMMENDATIONS:
1. Review potential duplicates and merge/eliminate
2. Map all legacy categories to 7 core categories
3. Preserve philosophical activities (highest quality)
4. Enhance database activities with philosophy/instructions
5. Assign role models to final curated set
`

    fs.writeFileSync(path.join(exportDir, '0-ANALYSIS-SUMMARY.txt'), summaryReport)
    
    console.log(`\n✅ Analysis complete! Check the '${exportDir}' folder for all exports.`)
    console.log(`📄 Start with '0-ANALYSIS-SUMMARY.txt' for overview.`)

  } catch (error) {
    console.error('❌ Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()