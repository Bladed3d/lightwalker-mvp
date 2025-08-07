#!/usr/bin/env ts-node
/**
 * Quick Fix: Restore Original Activity Images and Data
 * Reads from our export and restores images/data we accidentally overwrote
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Parse the original export CSV to get image data
function parseOriginalExport(): Map<string, any> {
  const csvPath = path.join(process.cwd(), 'activity-analysis-export', '2-database-activities.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Original export file not found:', csvPath)
    return new Map()
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const originalData = new Map()
  
  lines.slice(1).forEach(line => {
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
    const activity: any = {}
    
    headers.forEach((header, i) => {
      activity[header] = values[i] || ''
    })
    
    // Store by activity id for lookup
    if (activity.id) {
      originalData.set(activity.id, {
        id: activity.id,
        title: activity.title,
        icon: activity.icon,
        duration: activity.duration,
        points: parseInt(activity.points) || 30,
        difficulty: parseInt(activity.difficulty) || 2,
        description: activity.description,
        instructions: activity.instructions
      })
    }
  })
  
  return originalData
}

// Map our curated activity IDs to original database IDs
const activityMapping = new Map([
  // Our curated ID → Original database ID
  ['breakfast', 'breakfast'],
  ['dogs', 'dogs'],
  ['bath', 'bath'],
  ['hydrate', 'hydrate'],
  ['posture-check', 'posture-check'],
  ['quick-walk', 'quick-walk'],
  ['conflict-resolution', 'conflict-resolution'],
  ['creative-thinking', 'creative-thinking'],
  ['empathy-practice', 'empathy-practice'],
  ['gratitude-practice', 'gratitude-practice'],
  ['innovation-session', 'innovation-session'],
  ['inspire-others', 'inspire-others'],
  ['leadership-moment', 'leadership-moment'],
  ['life-changing-decision', 'life-changing-decision'],
  ['master-skill', 'master-skill'],
  ['mentoring', 'mentoring'],
  ['mindful-breathing', 'mindful-breathing'],
  ['problem-solving', 'problem-solving'],
  ['read', 'read'],
  ['skill-practice', 'skill-practice'],
  ['strategic-planning', 'strategic-planning'],
  // Philosophical activities that came from database duplicates
  ['focused-meditation', 'cmdzejed60004dxjys1hqvo4c'],
  ['edison-napping', 'cmdzejfgz000ldxjykigdsv5p'],
  ['deep-reflection', 'deep-reflection']
])

async function restoreActivityImages() {
  console.log('🔧 Starting image restoration...\n')
  
  try {
    const originalData = parseOriginalExport()
    console.log(`📊 Loaded ${originalData.size} original activities`)
    
    let restoredCount = 0
    
    for (const [curatedId, originalId] of activityMapping) {
      const originalActivity = originalData.get(originalId)
      
      if (!originalActivity) {
        console.log(`⚠️  No original data found for ${originalId}`)
        continue
      }
      
      try {
        // Only restore image, duration, points, difficulty - keep our category/description changes
        await prisma.activity.update({
          where: { id: curatedId },
          data: {
            icon: originalActivity.icon,
            duration: originalActivity.duration,
            points: originalActivity.points,
            difficulty: originalActivity.difficulty,
            // Keep original instructions if we don't have custom ones
            instructions: originalActivity.instructions || undefined
          }
        })
        
        console.log(`✅ Restored ${curatedId}: ${originalActivity.icon}`)
        restoredCount++
        
      } catch (error) {
        console.error(`❌ Failed to restore ${curatedId}:`, error)
      }
    }
    
    console.log(`\n🎉 Restoration complete!`)
    console.log(`📊 Restored images/data for ${restoredCount} activities`)
    
    // Show current state
    const activities = await prisma.activity.findMany({
      where: { isActive: true },
      select: { id: true, title: true, icon: true, category: true }
    })
    
    console.log(`\n📋 Current active activities:`)
    activities.forEach(activity => {
      const hasImage = activity.icon && !activity.icon.includes('🌟')
      console.log(`   ${hasImage ? '🖼️' : '❌'} ${activity.title} (${activity.category})`)
    })
    
  } catch (error) {
    console.error('❌ Restoration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreActivityImages()