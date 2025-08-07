/**
 * Clean up invalid ActivityPreference records that reference non-existent activities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanInvalidPreferences() {
  console.log('🧹 Cleaning invalid activity preferences...');
  
  try {
    // Get all activity preferences
    const preferences = await prisma.activityPreference.findMany({
      select: { id: true, activityId: true, activityTitle: true }
    });
    
    console.log(`📊 Found ${preferences.length} activity preferences`);
    
    // Get all valid activity IDs
    const activities = await prisma.activity.findMany({
      select: { id: true }
    });
    const validActivityIds = new Set(activities.map(a => a.id));
    console.log(`📊 Found ${validActivityIds.size} valid activities`);
    
    // Find invalid preferences
    const invalidPreferences = preferences.filter(p => !validActivityIds.has(p.activityId));
    console.log(`❌ Found ${invalidPreferences.length} invalid preferences:`);
    
    invalidPreferences.forEach(p => {
      console.log(`  - ${p.activityTitle} (ID: ${p.activityId})`);
    });
    
    if (invalidPreferences.length > 0) {
      // Delete invalid preferences
      const deleteResult = await prisma.activityPreference.deleteMany({
        where: {
          id: {
            in: invalidPreferences.map(p => p.id)
          }
        }
      });
      
      console.log(`🗑️ Deleted ${deleteResult.count} invalid preferences`);
    } else {
      console.log('✅ No invalid preferences found');
    }
    
    console.log('🎉 Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error cleaning preferences:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanInvalidPreferences()
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });