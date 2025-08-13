/**
 * Migration Script: Move Philosophy Data from ActivityPreference to Activity Table
 * 
 * This script moves philosophy content from user preferences to the base activity table
 * where it belongs as instructional content for all users.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePhilosophyData() {
  console.log('🚀 Starting philosophy data migration...');
  
  try {
    // Step 1: Find all ActivityPreferences with customDescription (philosophy content)
    const preferencesWithPhilosophy = await prisma.activityPreference.findMany({
      where: {
        customDescription: {
          not: null,
          not: ''
        }
      },
      select: {
        id: true,
        activityId: true,
        activityTitle: true,
        customDescription: true
      }
    });
    
    console.log(`📊 Found ${preferencesWithPhilosophy.length} preferences with philosophy content`);
    
    if (preferencesWithPhilosophy.length === 0) {
      console.log('✅ No philosophy data to migrate');
      return;
    }
    
    // Step 2: Group by activityId to handle duplicates
    const philosophyByActivity = new Map();
    
    preferencesWithPhilosophy.forEach(pref => {
      const activityId = pref.activityId;
      const philosophy = pref.customDescription;
      
      if (!philosophyByActivity.has(activityId)) {
        philosophyByActivity.set(activityId, {
          activityTitle: pref.activityTitle,
          philosophy: philosophy,
          preferenceIds: [pref.id]
        });
      } else {
        // If multiple users have philosophy for same activity, use the longest/most detailed one
        const existing = philosophyByActivity.get(activityId);
        if (philosophy.length > existing.philosophy.length) {
          existing.philosophy = philosophy;
        }
        existing.preferenceIds.push(pref.id);
      }
    });
    
    console.log(`🎯 Identified ${philosophyByActivity.size} unique activities with philosophy content`);
    
    // Step 3: Update Activity table with philosophy content
    let migrationResults = [];
    
    for (const [activityId, data] of philosophyByActivity) {
      try {
        // Update the activity with philosophy content
        const updatedActivity = await prisma.activity.update({
          where: { id: activityId },
          data: { philosophy: data.philosophy }
        });
        
        migrationResults.push({
          activityId,
          title: data.activityTitle,
          success: true,
          philosophy: data.philosophy.substring(0, 100) + (data.philosophy.length > 100 ? '...' : '')
        });
        
        console.log(`✅ Updated activity "${data.activityTitle}" with philosophy content`);
        
      } catch (error) {
        console.error(`❌ Failed to update activity ${activityId}:`, error.message);
        migrationResults.push({
          activityId,
          title: data.activityTitle,
          success: false,
          error: error.message
        });
      }
    }
    
    // Step 4: Report results
    const successful = migrationResults.filter(r => r.success);
    const failed = migrationResults.filter(r => !r.success);
    
    console.log('\n📋 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successful.length} activities`);
    console.log(`❌ Failed migrations: ${failed.length} activities`);
    
    if (successful.length > 0) {
      console.log('\n🎉 Successfully migrated philosophy content for:');
      successful.forEach(result => {
        console.log(`   • ${result.title}: "${result.philosophy}"`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n⚠️ Failed migrations:');
      failed.forEach(result => {
        console.log(`   • ${result.title}: ${result.error}`);
      });
    }
    
    // Step 5: Optional cleanup - Remove philosophy from ActivityPreferences
    console.log('\n🧹 Cleanup options:');
    console.log('After verifying the migration was successful, you can:');
    console.log('1. Clear customDescription from ActivityPreferences where it was philosophy content');
    console.log('2. Keep the data for now and manually verify each migration');
    
    const shouldCleanup = process.argv.includes('--cleanup');
    
    if (shouldCleanup) {
      console.log('🧹 Cleaning up migrated philosophy data from preferences...');
      
      for (const [activityId, data] of philosophyByActivity) {
        await prisma.activityPreference.updateMany({
          where: {
            id: { in: data.preferenceIds }
          },
          data: {
            customDescription: null
          }
        });
      }
      
      console.log('✅ Cleanup completed');
    } else {
      console.log('💡 To automatically cleanup after verification, run: node scripts/migrate-philosophy-data.js --cleanup');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migratePhilosophyData()
    .then(() => {
      console.log('🎉 Philosophy data migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migratePhilosophyData };